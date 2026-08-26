// application/handlers/cellCommandsHandler.ts

import {
  ColumnSchema,
  FieldType,
} from '../../bootstrap/type';
import { Table } from '../../domain/entities/Table';
import { DomainError } from '../../domain/errors/DomainError';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import {
  ColumnId,
  RowId,
  RowStateEnum,
} from '../../domain/value-objects';
import {
  ApplyDynamicProjectionCommand,
  ChangeCellDisplayValueCommand,
  ChangeCellValueCommand,
  SaveDescriptionCommand,
} from '../commands';
import { TableEvent } from '../events';
import { AuditLogger } from '../ports/AuditLogger';
import { RemoteApi } from '../ports/RemoteApi';
import { TableRepository } from '../ports/TableRepository';

type DynamicConfig = {
  columnMeta: Map<string, ColumnSchema>;
  remoteApi: RemoteApi;
};

/* ─── shared helper ──────────────────────────────────────────────── */

function logError(audit: AuditLogger, error: unknown, context?: string): void {
  if (error instanceof DomainError) {
    audit.log({
      type: error.code,
      message: error.message,
      payload: { details: error.details, context },
    });
  } else if (error instanceof Error) {
    audit.log({
      type: 'INVARIANT_VIOLATION',
      message: error.message,
      payload: { stack: error.stack, context },
    });
  } else {
    audit.log({
      type: 'INVARIANT_VIOLATION',
      message: 'Unexpected error',
      payload: { error, context },
    });
  }
}

/* ======================================================
   ChangeCellValueHandler
   ====================================================== */

export class ChangeCellValueHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
    private readonly dynamic?: DynamicConfig,
  ) { }

  async execute(
    command: ChangeCellValueCommand,
    actor: Actor,
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      const rowId = new RowId(command.rowId);
      const columnId = new ColumnId(command.columnId);
      /* 1. schema existence */
      const schema = table.getColumnSchema(columnId);
      if (!schema) {
        throw new DomainError('COLUMN_NOT_FOUND', 'Column does not exist', {
          columnId: columnId.value,
        });
      }
      /* 2. editable policy */
      if (schema.editable === false) {
        throw new DomainError('NOT_EDITABLE', 'Cell is not editable', {
          rowId: rowId.value,
          columnId: columnId.value,
        });
      }
      /* 3. permission policy */
      if (
        !this.permissionPolicy.canChangeCell({
          actor,
          rowId: command.rowId,
          columnId: command.columnId,
        })
      ) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to change this cell',
          { actor, rowId: rowId.value, columnId: columnId.value },
        );
      }
      /* 4. type validation */
      const validated = this.validateCellValue(schema.fieldType, command.newValue);
      /* 5. domain mutation */
      const domainEvent = table.changeCell(rowId, columnId, validated.value);
      // Keep existing display unless a dedicated display-change command updates it.
      // Writing the raw value here wipes select labels (e.g. account title).
      if (!domainEvent) {
        throw new DomainError(
          'CELL_NOT_FOUND',
          'Cell not found or value not changed',
          { rowId: rowId.value, columnId: columnId.value },
        );
      }
      /* 6. application-level side effects */
      if (this.dynamic) {
        await this.applyComputedColumns({
          table,
          rowId,
          changedColumnId: columnId,
          remoteApi: this.dynamic.remoteApi,
        });
        await this.applyRemoteVisibilityRules({
          table,
          rowId,
          changedColumnId: columnId,
          newValue: command.newValue,
        });
        this.applyDynamicProjection({
          table,
          rowId,
          changedColumnId: columnId,
          validatedValue: command.newValue,
        });
      }

      /* 7. RowState management */
      const state = table
        .getRows()
        .find(r => r.id.value === rowId.value)
        ?.getCells()
        .get('RowState')
        ?.getValue();

      if (state === RowStateEnum.Unchanged) {
        table.changeCell(rowId, new ColumnId('RowState'), RowStateEnum.Modified);
        table.changeDisplay(rowId, new ColumnId('RowState'), RowStateEnum.Modified);
      }

      /* 8. persist */
      await this.repo.save(command.store, table);

      /* 9. output event */
      const out: TableEvent = {
        type: 'CELL_CHANGED',
        tableId: command.tableKey,
        rowId: domainEvent.rowId.value,
        columnId: domainEvent.columnId.value,
        newValue: domainEvent.newValue,
        previousValue: domainEvent.previousValue,
      };
      this.audit.log({ type: 'CELL_CHANGED', message: out.type, payload: out });
      return [out];

    } catch (e) {
      logError(this.audit, e, `ChangeCellValueHandler[${command.tableKey}:${command.rowId}:${command.columnId}]`);
      return [];
    }
  }

  /* ── helpers ─────────────────────────────────────────────────────── */

  private async applyRemoteVisibilityRules(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    newValue: unknown;
    /** When false (e.g. row activate / re-project), keep existing dependent cell values. */
    clearDependents?: boolean;
  }): Promise<void> {
    const {
      table,
      rowId,
      changedColumnId,
      newValue,
      clearDependents = true,
    } = input;

    const meta = this.dynamic?.columnMeta;
    if (!meta) return;
    const colKey = `${table.getActiveCollectionName() ?? 'default'}_${changedColumnId.value}`;
    const changedMeta = meta.get(colKey) ?? meta.get(changedColumnId.value);
    const resolveOn = changedMeta?.resolveOn;
    if (!resolveOn) return;
    if (resolveOn.fieldName !== changedColumnId.value) return;

    const row = table.getRows().find(r => r.id.value === rowId.value);
    if (!row) return;

    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue();
    }
    if (newValue == null || newValue === '') return;
    const params =
      typeof resolveOn.buildParams === 'function'
        ? resolveOn.buildParams(rowValues)
        : { value: newValue };
    const response = await this.dynamic!.remoteApi.request({
      endpoint: resolveOn.endpoint,
      params,
      method: 'POST',
    });

    resolveOn.getResponse?.(response, row);
    const flags: Record<string, boolean> = resolveOn.mapFlags?.(response) ?? {};

    const toShow: ColumnSchema[] = [];
    const visibilityCondition: Record<string, boolean> = {};

    meta.forEach(colCfg => {
      const v = colCfg.visibility;

      if (
        v?.kind === 'whenRemoteFlag' &&
        v.sourceFieldName === changedColumnId.value
      ) {
        const colId = new ColumnId(colCfg.fieldName);
        const schema = table.getColumnSchema(colId);
        const flagValue = flags[v.flag] ?? false;

        visibilityCondition[v.flag] = flagValue;

        if (flagValue && schema) {
          toShow.push({ ...schema, hidden: false });
        }
      }

      const dependency = colCfg.dynamicSource?.dependsOn;
      if (
        clearDependents &&
        dependency &&
        dependency.includes(changedColumnId.value) &&
        !Object.hasOwn(visibilityCondition, colCfg.fieldName) &&
        colCfg.visibility?.kind !== 'whenTableType' &&
        colCfg.visibility?.kind !== 'whenCollection'
      ) {
        const cell = row.getCell(colCfg.fieldName);
        cell?.changeValue(null);
        cell?.changeDisplay(null);
      }
    });

    if (toShow.length > 0) {
      table.addColumns(toShow);
    }

    row.setVisibilityCondition(visibilityCondition);
  }

  private async applyComputedColumns(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    remoteApi: RemoteApi;
  }): Promise<void> {
    const { table, rowId, changedColumnId, remoteApi } = input;
    const meta = this.dynamic!.columnMeta;

    const computedColumns = Array.from(meta.values()).filter(
      (c): c is ColumnSchema & {
        computed: NonNullable<ColumnSchema['computed']>;
      } => c.computed != null,
    );

    if (computedColumns.length === 0) return;

    const row = table.getRows().find(r => r.id.value === rowId.value);
    if (!row) return;

    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue();
    }

    const dependents = new Map<string, typeof computedColumns>();
    for (const col of computedColumns) {
      for (const dep of col.computed.dependsOn ?? []) {
        if (!dependents.has(dep)) dependents.set(dep, []);
        dependents.get(dep)!.push(col);
      }
    }

    const queue: string[] = [changedColumnId.value];
    const visited = new Set<string>();
    let safetyCounter = 0;
    const MAX = computedColumns.length + 1;

    while (queue.length > 0) {
      if (safetyCounter++ > MAX) {
        throw new Error('Computed cycle detected');
      }
      const source = queue.shift()!;
      const targets = dependents.get(source) ?? [];

      for (const colCfg of targets) {
        const targetField = colCfg.fieldName;
        const targetColId = new ColumnId(targetField);
        const schema = table.getColumnSchema(targetColId);
        if (!schema || !colCfg.computed) continue;

        const rawValue = colCfg.computed.compute(rowValues, remoteApi);
        const newValue = rawValue instanceof Promise ? await rawValue : rawValue;
        const validated = this.validateCellValue(schema.fieldType, newValue);

        if (validated.value instanceof Promise) {
          throw new Error(
            `Computed column "${targetField}" returned a Promise after validation`,
          );
        }

        const prev = rowValues[targetField];
        if (Object.is(prev, validated.value)) continue;

        table.changeCell(rowId, targetColId, validated.value);

        if (schema.displayFormat) {
          const validatedDisplay = this.validateCellValue(
            schema.fieldType,
            schema.displayFormat(newValue),
          );
          table.changeDisplay(rowId, targetColId, validatedDisplay.value);
        } else {
          table.changeDisplay(rowId, targetColId, validated.value);
        }

        rowValues[targetField] = validated.value;
        queue.push(targetField);
        visited.add(targetField);
      }
    }
  }

  private validateCellValue(type: FieldType, value: unknown) {
    switch (type) {
      case 'text':
      case 'description':
      case 'date':
        return typeof value === 'string'
          ? { ok: true as const, value }
          : { ok: false as const, error: { message: 'Expected string', details: { value } }, value };

      case 'static':
        return { ok: true as const, value };

      case 'checkbox':
        return typeof value === 'boolean'
          ? { ok: true as const, value }
          : { ok: false as const, error: { message: 'Expected boolean', details: { value } }, value };

      case 'number':
      case 'price':
      case 'select':
      case 'selectOption': {
        if (value === '' || value === undefined) {
          return { ok: true as const, value: value as any };
        }
        const n = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(n)
          ? { ok: true as const, value: n }
          : { ok: false as const, error: { message: 'Expected number', details: { value } }, value };
      }

      default:
        return { ok: false as const, error: { message: 'Unsupported type', details: { type, value } }, value };
    }
  }

  private applyDynamicProjection(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    validatedValue: unknown;
  }): void {
    const { table, changedColumnId, validatedValue } = input;
    this.dynamic!.columnMeta.forEach((colMeta, key) => {
      const col = table.getColumnSchema(new ColumnId(colMeta.fieldName));

      const depends = colMeta.dynamicSource?.dependsOn;
      if (depends?.includes(changedColumnId.value)) {
        const { dynamicSource } = colMeta;
        const { endpoint, dependsOn, ...restDynamic } = dynamicSource ?? {};
        const base = col ?? colMeta;
        table.setColumnSchema(new ColumnId(base.fieldName), {
          ...base,
          dynamicSelectFilterOption:
            base.dynamicSelectFilterOption ?? (() => true),
          dynamicSource: {
            endpoint: endpoint ?? '',
            ...restDynamic,
            dependOn: {
              fieldName: changedColumnId.value,
              value: validatedValue,
            },
          },
        });
      }

      if (
        colMeta.visibility?.kind === 'whenFieldTruthy' &&
        colMeta.visibility.fieldName === changedColumnId.value &&
        col
      ) {
        table.setColumnSchema(new ColumnId(colMeta.fieldName), col);
      }
    });
  }
}

/* ======================================================
   ChangeCellDisplayValueHandler
   ====================================================== */

export class ChangeCellDisplayValueHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
  ) { }

  async execute(
    command: ChangeCellDisplayValueCommand,
    actor: Actor,
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      const rowId = new RowId(command.rowId);
      const columnId = new ColumnId(command.columnId);

      const schema = table.getColumnSchema(columnId);
      if (!schema) {
        throw new DomainError('COLUMN_NOT_FOUND', 'Column does not exist', {
          columnId: columnId.value,
        });
      }

      if (schema.editable === false) {
        throw new DomainError('NOT_EDITABLE', 'Cell is not editable', {
          rowId: rowId.value,
          columnId: columnId.value,
        });
      }

      if (
        !this.permissionPolicy.canChangeCell({
          actor,
          rowId: command.rowId,
          columnId: command.columnId,
        })
      ) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to change this cell',
          { actor, rowId: rowId.value, columnId: columnId.value },
        );
      }

      const domainEvent = table.changeDisplay(rowId, columnId, command.newValue);

      if (!domainEvent) {
        throw new DomainError(
          'CELL_NOT_FOUND',
          'Cell not found or value not changed',
          { rowId: rowId.value, columnId: columnId.value },
        );
      }

      await this.repo.save(command.store, table);

      const out: TableEvent = {
        type: 'CELL_DISPLAY_CHANGED',
        tableId: command.tableKey,
        rowId: domainEvent.rowId.value,
        columnId: domainEvent.columnId.value,
        newValue: domainEvent.newValue,
      };
      this.audit.log({ type: 'CELL_DISPLAY_CHANGED', message: out.type, payload: out });
      return [out];

    } catch (e) {
      logError(this.audit, e, `ChangeCellDisplayValueHandler[${command.tableKey}:${command.rowId}:${command.columnId}]`);
      return [];
    }
  }
}

/* ======================================================
   SaveDescriptionHandler
   ====================================================== */

export class SaveDescriptionHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
  ) { }

  async execute(
    command: SaveDescriptionCommand,
    actor: Actor,
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      const rowId = new RowId(command.rowId);
      const domainEvent = table.saveDescription(rowId, command.flag);

      if (!domainEvent) {
        throw new DomainError(
          'CELL_NOT_FOUND',
          'Cell not found or value not changed',
          { rowId: rowId.value, flag: command.flag },
        );
      }

      await this.repo.save(command.store, table);

      const out: TableEvent = {
        type: 'ROW_DESCRIPTION_SAVED',
        tableId: command.tableKey,
        rowId: domainEvent.rowId.value,
        description: command.flag,
      };
      this.audit.log({ type: 'INFORMATION', message: out.type, payload: out });
      return [out];

    } catch (e) {
      logError(this.audit, e, `SaveDescriptionHandler[${command.tableKey}:${command.rowId}]`);
      return [];
    }
  }
}

/* ======================================================
   ApplyDynamicProjectionHandler
   ====================================================== */

export class ApplyDynamicProjectionHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
    private readonly dynamic?: DynamicConfig,
  ) { }

  async execute(
    command: ApplyDynamicProjectionCommand,
    actor: Actor,
  ): Promise<TableEvent[]> {
    const { store, tableKey, rowId, columnId } = command;
    const table = await this.repo.getById(store, tableKey);

    try {
      const row = table.getRow(rowId);
      if (!row) {
        throw new DomainError('ROW_NOT_FOUND', `Row ${rowId} not found`, { rowId });
      }

      const cell = row.getCell(columnId);
      if (!cell) {
        throw new DomainError('CELL_NOT_FOUND', `Cell ${columnId} not found`, { columnId });
      }

      const colValue = cell.getValue();
      const previousValue = colValue;
      const newRowId = new RowId(rowId);
      const newColumnId = new ColumnId(columnId);

      if (this.dynamic) {
        await this.applyComputedColumns({
          table,
          rowId: newRowId,
          changedColumnId: newColumnId,
          remoteApi: this.dynamic.remoteApi,
        });
        await this.applyRemoteVisibilityRules({
          table,
          rowId: newRowId,
          changedColumnId: newColumnId,
          newValue: colValue,
          clearDependents: false,
        });
        this.applyDynamicProjection({
          table,
          rowId: newRowId,
          changedColumnId: newColumnId,
          validatedValue: colValue,
        });
      }

      /* RowState management */
      const state = table
        .getRows()
        .find(r => r.id.value === newRowId.value)
        ?.getCells()
        .get('RowState')
        ?.getValue();

      if (state === RowStateEnum.Unchanged) {
        table.changeCell(newRowId, new ColumnId('RowState'), RowStateEnum.Modified);
        table.changeDisplay(newRowId, new ColumnId('RowState'), RowStateEnum.Modified);
      }

      await this.repo.save(store, table);

      const out: TableEvent = {
        type: 'CELL_CHANGED',
        tableId: tableKey,
        rowId: newRowId.value,
        columnId: newColumnId.value,
        newValue: colValue,
        previousValue,
      };
      this.audit.log({ type: 'CELL_CHANGED', message: out.type, payload: out });
      return [out];

    } catch (e) {
      logError(this.audit, e, `ApplyDynamicProjectionHandler[${tableKey}:${rowId}:${columnId}]`);
      return [];
    }
  }

  /* ── helpers (identical to ChangeCellValueHandler) ───────────────── */

  private async applyRemoteVisibilityRules(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    newValue: unknown;
    /** When false (e.g. row activate / re-project), keep existing dependent cell values. */
    clearDependents?: boolean;
  }): Promise<void> {
    const {
      table,
      rowId,
      changedColumnId,
      newValue,
      clearDependents = true,
    } = input;
    const meta = this.dynamic?.columnMeta;
    if (!meta) return;

    const colKey = `${table.getActiveCollectionName() ?? 'default'}_${changedColumnId.value}`;
    const changedMeta = meta.get(colKey) ?? meta.get(changedColumnId.value);
    const resolveOn = changedMeta?.resolveOn;
    if (!resolveOn) return;
    if (resolveOn.fieldName !== changedColumnId.value) return;

    const row = table.getRows().find(r => r.id.value === rowId.value);
    if (!row) return;

    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue();
    }

    if (newValue == null || newValue === '') return;

    const params =
      typeof resolveOn.buildParams === 'function'
        ? resolveOn.buildParams(rowValues)
        : { value: newValue };
    const response = await this.dynamic!.remoteApi.request({
      endpoint: resolveOn.endpoint,
      params,
      method: 'POST',
    });

    resolveOn.getResponse?.(response, row);
    const flags: Record<string, boolean> = resolveOn.mapFlags?.(response) ?? {};

    const toShow: ColumnSchema[] = [];
    const visibilityCondition: Record<string, boolean> = {};

    meta.forEach(colCfg => {
      const v = colCfg.visibility;

      if (
        v?.kind === 'whenRemoteFlag' &&
        v.sourceFieldName === changedColumnId.value
      ) {
        const schema = table.getColumnSchema(new ColumnId(colCfg.fieldName));
        const flagValue = flags[v.flag] ?? false;
        visibilityCondition[v.flag] = flagValue;
        if (flagValue && schema) {
          toShow.push({ ...schema, hidden: false });
        }
      }

      const dependency = colCfg.dynamicSource?.dependsOn;
      if (
        clearDependents &&
        dependency &&
        dependency.includes(changedColumnId.value) &&
        !Object.hasOwn(visibilityCondition, colCfg.fieldName) &&
        colCfg.visibility?.kind !== 'whenTableType' &&
        colCfg.visibility?.kind !== 'whenCollection'
      ) {
        const cell = row.getCell(colCfg.fieldName);
        cell?.changeValue(null);
        cell?.changeDisplay(null);
      }
    });

    if (toShow.length > 0) {
      table.addColumns(toShow);
    }
    row.setVisibilityCondition(visibilityCondition);
  }

  private async applyComputedColumns(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    remoteApi: RemoteApi;
  }): Promise<void> {
    const { table, rowId, changedColumnId, remoteApi } = input;
    const meta = this.dynamic!.columnMeta;

    const computedColumns = Array.from(meta.values()).filter(
      (c): c is ColumnSchema & {
        computed: NonNullable<ColumnSchema['computed']>;
      } => c.computed != null,
    );

    if (computedColumns.length === 0) return;

    const row = table.getRows().find(r => r.id.value === rowId.value);
    if (!row) return;

    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue();
    }

    const dependents = new Map<string, typeof computedColumns>();
    for (const col of computedColumns) {
      for (const dep of col.computed.dependsOn ?? []) {
        if (!dependents.has(dep)) dependents.set(dep, []);
        dependents.get(dep)!.push(col);
      }
    }

    const queue: string[] = [changedColumnId.value];
    const visited = new Set<string>();
    let safetyCounter = 0;
    const MAX = computedColumns.length + 1;

    while (queue.length > 0) {
      if (safetyCounter++ > MAX) throw new Error('Computed cycle detected');
      const source = queue.shift()!;
      const targets = dependents.get(source) ?? [];

      for (const colCfg of targets) {
        const targetField = colCfg.fieldName;
        const targetColId = new ColumnId(targetField);
        const schema = table.getColumnSchema(targetColId);
        if (!schema || !colCfg.computed) continue;

        const rawValue = colCfg.computed.compute(rowValues, remoteApi);
        const newValue = rawValue instanceof Promise ? await rawValue : rawValue;
        const validated = this.validateCellValue(schema.fieldType, newValue);

        if (validated.value instanceof Promise) {
          throw new Error(`Computed column "${targetField}" returned a Promise after validation`);
        }

        const prev = rowValues[targetField];
        if (Object.is(prev, validated.value)) continue;

        table.changeCell(rowId, targetColId, validated.value);

        if (schema.displayFormat) {
          const validatedDisplay = this.validateCellValue(
            schema.fieldType,
            schema.displayFormat(newValue),
          );
          table.changeDisplay(rowId, targetColId, validatedDisplay.value);
        } else {
          table.changeDisplay(rowId, targetColId, validated.value);
        }

        rowValues[targetField] = validated.value;
        queue.push(targetField);
        visited.add(targetField);
      }
    }
  }

  private validateCellValue(type: FieldType, value: unknown) {
    switch (type) {
      case 'text':
      case 'description':
      case 'date':
        return typeof value === 'string'
          ? { ok: true as const, value }
          : { ok: false as const, error: { message: 'Expected string', details: { value } }, value };

      case 'static':
        return { ok: true as const, value };

      case 'checkbox':
        return typeof value === 'boolean'
          ? { ok: true as const, value }
          : { ok: false as const, error: { message: 'Expected boolean', details: { value } }, value };

      case 'number':
      case 'price':
      case 'select':
      case 'selectOption': {
        if (value === '' || value === undefined) return { ok: true as const, value: value as any };
        const n = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(n)
          ? { ok: true as const, value: n }
          : { ok: false as const, error: { message: 'Expected number', details: { value } }, value };
      }

      default:
        return { ok: false as const, error: { message: 'Unsupported type', details: { type, value } }, value };
    }
  }

  private applyDynamicProjection(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    validatedValue: unknown;
  }): void {
    const { table, changedColumnId, validatedValue } = input;
    this.dynamic!.columnMeta.forEach((colMeta, key) => {
      const col = table.getColumnSchema(new ColumnId(colMeta.fieldName));

      const depends = colMeta.dynamicSource?.dependsOn;
      if (depends?.includes(changedColumnId.value)) {
        const { dynamicSource } = colMeta;
        const { endpoint, dependsOn, ...restDynamic } = dynamicSource ?? {};
        const base = col ?? colMeta;
        table.setColumnSchema(new ColumnId(base.fieldName), {
          ...base,
          dynamicSelectFilterOption:
            base.dynamicSelectFilterOption ?? (() => true),
          dynamicSource: {
            endpoint: endpoint ?? '',
            ...restDynamic,
            dependOn: {
              fieldName: changedColumnId.value,
              value: validatedValue,
            },
          },
        });
      }

      if (
        colMeta.visibility?.kind === 'whenFieldTruthy' &&
        colMeta.visibility.fieldName === changedColumnId.value &&
        col
      ) {
        table.setColumnSchema(new ColumnId(colMeta.fieldName), col);
      }
    });
  }
}