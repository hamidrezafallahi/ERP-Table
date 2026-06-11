// application/handlers/ChangeCellValueHandler.ts

import {
  FieldType,
  IDetailColumnConfig,
} from '../../bootstrap/type';
import { Table } from '../../domain/entities/Table';
import { DomainError } from '../../domain/errors/DomainError';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import {
  ColumnId,
  ColumnSchema,
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
  columnMeta: Map<string, IDetailColumnConfig>;
  remoteApi: RemoteApi;
};

export class ChangeCellValueHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
    private readonly dynamic?: DynamicConfig
  ) {
    // ---------- لاگ زمان ساخت ----------

  }

  async execute(
    command: ChangeCellValueCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {
      const rowId = new RowId(command.rowId);
      const columnId = new ColumnId(command.columnId);
      /* ---------- 1. schema existence ---------- */
      const schema = table.getColumnSchema(columnId);
      if (!schema) {
        throw new DomainError(
          'COLUMN_NOT_FOUND',
          'Column does not exist',
          { columnId: columnId.value }
        );
      }
      /* ---------- 2. editable policy ---------- */
      if (
        schema.editable === false
      ) {
        throw new DomainError(
          'NOT_EDITABLE',
          'Cell is not editable',
          { rowId: rowId.value, columnId: columnId.value }
        );
      }
      /* ---------- 3. permission policy ---------- */
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
          {
            actor,
            rowId: rowId.value,
            columnId: columnId.value,
          }
        );
      }

      /* ---------- 4. type validation ---------- */
      const validated = this.validateCellValue(
        schema.renderType,
        command.newValue
      );
      // if (!validated.ok) {
      //   throw new DomainError(
      //     'INVALID_VALUE',
      //     validated.error.message,
      //     validated.error.details
      //   );
      // }

      /* ---------- 5. domain mutation ---------- */
      const domainEvent = table.changeCell(
        rowId,
        columnId,
        validated.value
      );
      table.changeDisplay(
        rowId,
        columnId,
        validated.value
      );

      if (!domainEvent) {
        throw new DomainError(
          'CELL_NOT_FOUND',
          'Cell not found or value not changed',
          { rowId: rowId.value, columnId: columnId.value }
        );
      }

      /* ---------- 6. application-level side effects ---------- */

      if (this.dynamic) {
        // Phase 2: PURE computation
        await this.applyComputedColumns({
          table,
          rowId,
          changedColumnId: columnId,
          remoteApi: this.dynamic!.remoteApi,
        });

        // Phase 3: remote resolution
        await this.applyRemoteVisibilityRules({
          table,
          rowId,
          changedColumnId: columnId,
          newValue: command.newValue,
        });

        // Phase 4: projection
        this.applyDynamicProjection({
          table,
          rowId,
          changedColumnId: columnId,
          validatedValue: command.newValue,
        });
      }
      /* ---------- 7. RowState management ---------- */
      const state =
        table
          .getRows()
          .find(r => r.id.value === rowId.value)
          ?.getCells()
          .get('RowState')
          ?.getValue()
          ?.value;

      if (state === RowStateEnum.Unchanged) {
        table.changeCell(
          rowId,
          new ColumnId('RowState'),
          RowStateEnum.Modified
        );
        table.changeDisplay(
          rowId,
          new ColumnId('RowState'),
          RowStateEnum.Modified
        );
      }

      /* ---------- 8. persist ---------- */

      await this.repo.save(command.store, table);

      /* ---------- 9. output event ---------- */
      const out: TableEvent = {
        type: 'CELL_CHANGED',
        tableId: command.tableKey,
        rowId: domainEvent.rowId.value,
        columnId: domainEvent.columnId.value,
        newValue: domainEvent.newValue,
      };
      this.audit.log({ type: 'INFORMATION', message: out.type, payload: { out } });

      return [out];

    } catch (e: any) {
      const failed: TableEvent = {
        type: e,
        tableId: command.tableKey,
        reason: e?.message ?? 'Unknown error',
        details: e?.details ?? String(e),
      };
      this.audit.log({ type: failed.type, message: failed.type, payload: { failed } });
      return [failed];
    }
  }

  /* =====================================================
     helpers (application-layer only)
     ===================================================== */

  private async applyRemoteVisibilityRules(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    newValue: unknown;
  }) {
    const { table, rowId, changedColumnId, newValue } = input;
    const meta = this.dynamic.columnMeta;
    const changedMeta = meta.get(changedColumnId.value);
    const resolveOn = changedMeta?.resolveOn;
    if (!resolveOn) return;
    if (resolveOn.fieldName !== changedColumnId.value) return;
    const row = table.getRows().find((r: any) => r.id.value === rowId.value);
    if (!row) return;
    const rowValues: Record<string, any> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue().value;
    }
    if (newValue == null) {
      console.log("newValue is null return from here")
    }
    const params =
      typeof resolveOn.buildParams === 'function'
        ? resolveOn.buildParams(rowValues)
        : { value: newValue };
    const response = await this.dynamic!.remoteApi.request({
      endpoint: resolveOn.endpoint,
      params,
      method: 'POST',
    });
    resolveOn.getResponse?.(response, row)
    const flags: Record<string, boolean> =
      resolveOn.mapFlags?.(response) ?? {};

    const toShow: ColumnSchema[] = [];
    const visibilityCondition = new Object() as Record<string, boolean>;
    meta.forEach(colCfg => {
      const v = colCfg.visibility;
      if (
        v?.kind === 'whenRemoteFlag' &&
        v.sourceFieldName === changedColumnId.value
      ) {
        const colId = new ColumnId(colCfg.fieldName);
        const cell = row.getCell(colCfg.fieldName)
        cell.changeValue(null)
        cell.changeDisplay(null)
        const schema = table.getColumnSchema(colId);
        visibilityCondition[v.flag] = flags[v.flag] ?? false
        if (flags[v.flag]) {
          if (schema) {
            toShow.push({ ...schema, hidden: false });
          }
        }
      } else if (v?.kind === 'whenTableType') {
        const colId = new ColumnId(colCfg.fieldName);
        const schema = table.getColumnSchema(colId);
        const tableType = table.getActiveTableType()
        visibilityCondition[colId.value] = row.rowType === tableType
        if (row.rowType === tableType) {
          if (schema) {
            toShow.push({ ...schema, hidden: false });
          }
        }
      }
      const dependency = colCfg.dynamicSource?.dependsOn;
      if (dependency && dependency.length > 0 && !Object.hasOwn(visibilityCondition, colCfg.fieldName)) {
        const cell = row.getCell(colCfg.fieldName)
        cell.changeValue(null)
        cell.changeDisplay(null)
      }
    });
    if (toShow.length > 0) {
      table.addColumns(toShow);
    }
    row.setVisibilityCondition(visibilityCondition)
    //clean cells 
  }

  private async applyComputedColumns(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    remoteApi: RemoteApi;
  }) {
    const { table, rowId, changedColumnId, remoteApi } = input;
    const meta = this.dynamic!.columnMeta;

    const computedColumns = Array.from(meta.values())
      .filter(c => c.computed);

    if (computedColumns.length === 0) return;

    const row = table.getRows()
      .find((r: any) => r.id.value === rowId.value);

    if (!row) return;

    // snapshot row values
    const rowValues: Record<string, any> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue().value;
    }

    // dependency index
    const dependents = new Map<string, any[]>();
    for (const col of computedColumns) {
      for (const dep of col.computed.dependsOn ?? []) {
        if (!dependents.has(dep)) dependents.set(dep, []);
        dependents.get(dep)!.push(col);
      }
    }

    // propagation queue
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
        if (!schema) continue;

        let rawValue = colCfg.computed.compute(rowValues, remoteApi);
        const newValue = rawValue instanceof Promise ? await rawValue : rawValue;

        const validated = this.validateCellValue(schema.renderType, newValue);

        if (validated.value instanceof Promise) {
          throw new Error(
            `Computed column "${targetField}" returned a Promise after validation`
          );
        }


        const prev = rowValues[targetField];
        if (Object.is(prev, validated.value)) continue;

        table.changeCell(
          rowId,
          targetColId,
          validated.value
        );
        table.changeDisplay(
          rowId,
          targetColId,
          validated.value
        );

        if (schema.displayFormat) {
          const validatedDisplayValue = this.validateCellValue(
            schema.renderType,
            schema.displayFormat(newValue)
          );
          table.changeDisplay(
            rowId,
            targetColId,
            validatedDisplayValue.value
          );
        } else {
          table.changeDisplay(
            rowId,
            targetColId,
            validated.value
          );
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
          : { ok: false as const, error: { message: 'Expected string', details: { value } } };

      case 'static':
        return { ok: true as const, value };
      case 'checkbox':
        return typeof value === 'boolean'
          ? { ok: true as const, value }
          : { ok: false as const, error: { message: 'Expected boolean', details: { value } } };

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
          : { ok: false as const, error: { message: 'Expected number', details: { value } } };
      }

      default:
        return { ok: false as const, error: { message: 'Unsupported type', details: { type, value } } };
    }
  }

  private applyDynamicProjection(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    validatedValue: unknown;
  }) {
    const { table, changedColumnId, validatedValue } = input;
    this.dynamic!.columnMeta.forEach((colMeta, key) => {
      const col = table.getColumnSchema(new ColumnId(colMeta.fieldName))
      // dynamicSource projection
      const depends = colMeta.dynamicSource?.dependsOn;
      if (depends?.includes(changedColumnId.value)) {
        const { dynamicSource, ...rest } = colMeta;
        const { endpoint, dependsOn, ...restDynamic } = dynamicSource ?? {};
        table.setColumnSchema(
          new ColumnId(key),
          {
            id: rest.fieldName,
            title: rest.fieldCaption,
            renderType: rest.fieldType,
            ...col,
            dynamicValue: {
              endpoint,
              ...restDynamic,
              dependOn: { fieldName: changedColumnId.value, value: validatedValue },

            },
          }
        );
      }

      // visibility projection
      if (
        colMeta.visibility?.kind === 'whenFieldTruthy' &&
        colMeta.visibility.fieldName === changedColumnId.value
      ) {
        const { dynamicSource, ...rest } = colMeta;
        table.setColumnSchema(
          new ColumnId(key),
          {
            id: rest.fieldName,
            title: rest.fieldCaption,
            renderType: rest.fieldType,
            editable: rest.editable,
            ...col,
          }
        );
      }
    });
  }

}
export class ChangeCellDisplayValueHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
  ) {
    // ---------- لاگ زمان ساخت ----------

  }


  async execute(
    command: ChangeCellDisplayValueCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {

      const rowId = new RowId(command.rowId);
      const columnId = new ColumnId(command.columnId);
      /* ---------- 1. schema existence ---------- */
      const schema = table.getColumnSchema(columnId);
      if (!schema) {
        throw new DomainError(
          'COLUMN_NOT_FOUND',
          'Column does not exist',
          { columnId: columnId.value }
        );
      }
      /* ---------- 2. editable policy ---------- */
      if (
        schema.editable === false
      ) {
        throw new DomainError(
          'NOT_EDITABLE',
          'Cell is not editable',
          { rowId: rowId.value, columnId: columnId.value }
        );
      }
      /* ---------- 3. permission policy ---------- */
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
          {
            actor,
            rowId: rowId.value,
            columnId: columnId.value,
          }
        );
      }
      /* ---------- 5. domain mutation ---------- */
      const domainEvent = table.changeDisplay(
        rowId,
        columnId,
        command.newValue
      );

      if (!domainEvent) {
        throw new DomainError(
          'CELL_NOT_FOUND',
          'Cell not found or value not changed',
          { rowId: rowId.value, columnId: columnId.value }
        );
      }

      /* ---------- 6. application-level side effects ---------- */
      await this.repo.save(command.store, table);

      /* ---------- 9. output event ---------- */
      const out: TableEvent = {
        type: 'CELL_DISPLAY_CHANGED',
        tableId: command.tableKey,
        rowId: domainEvent.rowId.value,
        columnId: domainEvent.columnId.value,
        newValue: domainEvent.newValue,
      };

      this.audit.log({ type: 'INFORMATION', message: out.type, payload: { out } });
      return [out];

    } catch (error: any) {

      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error }
        });
      } return null
    }
  }




}

export class ApplyDynamicProjectionHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
    private readonly dynamic?: DynamicConfig
  ) {
    // ---------- لاگ زمان ساخت ----------

  }
  async execute(
    command: ApplyDynamicProjectionCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const { type, store, tableKey, rowId, columnId } = command
    const table = await this.repo.getById(store, tableKey);
    try {
      const rowId = new RowId(command.rowId);
      const columnId = new ColumnId(command.columnId);
      const colValue = table.getRow(rowId.value).getCell(columnId.value).getValue().value

      if (this.dynamic) {
        // Phase 2: PURE computation
        await this.applyComputedColumns({
          table,
          rowId,
          changedColumnId: columnId,
          remoteApi: this.dynamic!.remoteApi,
        });

        // Phase 3: remote resolution
        await this.applyRemoteVisibilityRules({
          table,
          rowId,
          changedColumnId: columnId,
          newValue: colValue,
        });

        // Phase 4: projection
        this.applyDynamicProjection({
          table,
          rowId,
          changedColumnId: columnId,
          validatedValue: colValue,
        });
      }
      /* ---------- 7. RowState management ---------- */
      const state =
        table
          .getRows()
          .find(r => r.id.value === rowId.value)
          ?.getCells()
          .get('RowState')
          ?.getValue()
          ?.value;

      if (state === RowStateEnum.Unchanged) {
        table.changeCell(
          rowId,
          new ColumnId('RowState'),
          RowStateEnum.Modified
        );
        table.changeDisplay(
          rowId,
          new ColumnId('RowState'),
          RowStateEnum.Modified
        );
      }

      /* ---------- 8. persist ---------- */
      await this.repo.save(command.store, table);

      /* ---------- 9. output event ---------- */
      const out: TableEvent = {
        type: 'CELL_CHANGED',
        tableId: command.tableKey,
        rowId: rowId.value,
        columnId: columnId.value,
        newValue: colValue,
      };
      this.audit.log({ type: 'INFORMATION', message: out.type, payload: { out } });

      return [out];

    } catch (e: any) {
      const failed: TableEvent = {
        type: e,
        tableId: command.tableKey,
        reason: e?.message ?? 'Unknown error',
        details: e?.details ?? String(e),
      };
      this.audit.log({ type: failed.type, message: failed.type, payload: { failed } });
      return [failed];
    }
  }

  /* =====================================================
     helpers (application-layer only)
     ===================================================== */

  private async applyRemoteVisibilityRules(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    newValue: unknown;
  }) {
    const { table, rowId, changedColumnId, newValue } = input;
    const meta = this.dynamic.columnMeta;
    const changedMeta = meta.get(changedColumnId.value);
    const resolveOn = changedMeta?.resolveOn;
    if (!resolveOn) return;
    if (resolveOn.fieldName !== changedColumnId.value) return;
    const row = table.getRows().find((r: any) => r.id.value === rowId.value);
    if (!row) return;
    const rowValues: Record<string, any> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue().value;
    }
    const params =
      typeof resolveOn.buildParams === 'function'
        ? resolveOn.buildParams(rowValues)
        : { value: newValue };
    const visibilityCondition: Record<string, boolean> = row.getVisibilityCondition()
    if (Object.keys(visibilityCondition).length > 0) {
      return;
    }
    const response = await this.dynamic!.remoteApi.request({
      endpoint: resolveOn.endpoint,
      params,
      method: 'POST',
    });
    resolveOn.getResponse?.(response, row)
    const flags: Record<string, boolean> =
      resolveOn.mapFlags?.(response) ?? {};

    const toShow: ColumnSchema[] = [];
    meta.forEach(colCfg => {

      const v = colCfg.visibility;
      if (
        v?.kind === 'whenRemoteFlag' &&
        v.sourceFieldName === changedColumnId.value
      ) {
        const colId = new ColumnId(colCfg.fieldName);
        const schema = table.getColumnSchema(colId);
        visibilityCondition[v.flag] = flags[v.flag]
        if (flags[v.flag]) {
          if (schema) {
            toShow.push({ ...schema, hidden: false });
          }
        }
      }
    });
    if (toShow.length > 0) {
      table.addColumns(toShow);
    }

    row.setVisibilityCondition(visibilityCondition)

  }

  private async applyComputedColumns(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    remoteApi: RemoteApi;
  }) {
    const { table, rowId, changedColumnId, remoteApi } = input;
    const meta = this.dynamic!.columnMeta;

    const computedColumns = Array.from(meta.values())
      .filter(c => c.computed);

    if (computedColumns.length === 0) return;

    const row = table.getRows()
      .find((r: any) => r.id.value === rowId.value);

    if (!row) return;

    // snapshot row values
    const rowValues: Record<string, any> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue().value;
    }

    // dependency index
    const dependents = new Map<string, any[]>();
    for (const col of computedColumns) {
      for (const dep of col.computed.dependsOn ?? []) {
        if (!dependents.has(dep)) dependents.set(dep, []);
        dependents.get(dep)!.push(col);
      }
    }

    // propagation queue
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
        if (!schema) continue;

        let rawValue = colCfg.computed.compute(rowValues, remoteApi);
        const newValue = rawValue instanceof Promise ? await rawValue : rawValue;

        const validated = this.validateCellValue(schema.renderType, newValue);

        if (validated.value instanceof Promise) {
          throw new Error(
            `Computed column "${targetField}" returned a Promise after validation`
          );
        }


        const prev = rowValues[targetField];
        if (Object.is(prev, validated.value)) continue;

        table.changeCell(
          rowId,
          targetColId,
          validated.value
        );
        table.changeDisplay(
          rowId,
          targetColId,
          validated.value
        );

        if (schema.displayFormat) {
          const validatedDisplayValue = this.validateCellValue(
            schema.renderType,
            schema.displayFormat(newValue)
          );
          table.changeDisplay(
            rowId,
            targetColId,
            validatedDisplayValue.value
          );
        } else {
          table.changeDisplay(
            rowId,
            targetColId,
            validated.value
          );
        }

        rowValues[targetField] = validated.value;
        queue.push(targetField);
        visited.add(targetField);
      }
    }
  }

  private validateCellValue(type: FieldType, value: unknown) {
    if (type === 'text' || type === 'date') {
      return typeof value === 'string'
        ? { ok: true as const, value }
        : {
          ok: false as const,
          error: { message: 'Expected string', details: { value } },
        };
    }
    if (type === 'static') {
      return { ok: true as const, value }
    }

    if (type === 'number' || type === 'selectOption') {
      if (value === '') {
        return { ok: true as const, value: '' as any };
      }

      const n =
        typeof value === 'number'
          ? value
          : typeof value === 'string'
            ? Number(value)
            : NaN;
      return Number.isFinite(n)
        ? { ok: true as const, value: n }
        : {
          ok: false as const,
          error: { message: 'Expected number', details: { value } },
        };
    }
    return {
      ok: false as const,
      error: { message: 'Unsupported type', details: { type, value } },
    };
  }
  private applyDynamicProjection(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
    validatedValue: unknown;
  }) {
    const { table, changedColumnId, validatedValue } = input;
    this.dynamic!.columnMeta.forEach((colMeta, key) => {
      const col = table.getColumnSchema(new ColumnId(colMeta.fieldName))
      // dynamicSource projection
      const depends = colMeta.dynamicSource?.dependsOn;
      if (depends?.includes(changedColumnId.value)) {
        const { dynamicSource, ...rest } = colMeta;
        const { endpoint, dependsOn, params, ...restDynamic } = dynamicSource ?? {};
        table.setColumnSchema(
          new ColumnId(key),
          {
            id: rest.fieldName,
            title: rest.fieldCaption,
            renderType: rest.fieldType,
            ...col,
            dynamicValue: {
              endpoint,
              dependsOn,
              ...restDynamic,
              dependOn: { fieldName: changedColumnId.value, value: validatedValue },
              ...params

            },
          }
        );
      }

      // visibility projection
      if (
        colMeta.visibility?.kind === 'whenFieldTruthy' &&
        colMeta.visibility.fieldName === changedColumnId.value
      ) {
        const { dynamicSource, ...rest } = colMeta;
        table.setColumnSchema(
          new ColumnId(key),
          {
            id: rest.fieldName,
            title: rest.fieldCaption,
            renderType: rest.fieldType,
            editable: rest.editable,
            ...col,
          }
        );
      }
    });
  }

}


export class SaveDescriptionHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
  ) {
    // ---------- لاگ زمان ساخت ----------

  }


  async execute(
    command: SaveDescriptionCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    try {

      const rowId = new RowId(command.rowId);
      const flag = command.flag

      const domainEvent = table.saveDescription(rowId, flag);

      if (!domainEvent) {
        throw new DomainError(
          'CELL_NOT_FOUND',
          'Cell not found or value not changed',
          { rowId: rowId.value, flag: flag }
        );
      }

      /* ---------- 6. application-level side effects ---------- */
      await this.repo.save(command.store, table);

      /* ---------- 9. output event ---------- */
      const out: TableEvent = {
        type: 'ROW_DESCRIPTION_SAVED',
        tableId: command.tableKey,
        rowId: domainEvent.rowId.value,
        description: command.flag
      };

      this.audit.log({ type: 'INFORMATION', message: out.type, payload: { out } });
      return [out];

    } catch (error: any) {

      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error }
        });
      } return null
    }
  }




}