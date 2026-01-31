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
  CellValue,
  ColumnId,
  ColumnSchema,
  RowId,
  RowStateEnum,
} from '../../domain/value-objects';
import { ChangeCellValueCommand } from '../commands';
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
  ) { }

  async execute(
    command: ChangeCellValueCommand,
    actor: Actor
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.tableId);

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
          rowId,
          columnId,
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

      if (!validated.ok) {
        throw new DomainError(
          'INVALID_VALUE',
          validated.error.message,
          validated.error.details
        );
      }

      /* ---------- 5. domain mutation ---------- */
      const domainEvent = table.changeCell(
        rowId,
        columnId,
        new CellValue(validated.value)
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
        this.applyComputedColumns({
          table,
          rowId,
          changedColumnId: columnId,
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
          new CellValue(RowStateEnum.Modified)
        );
      }

      /* ---------- 8. persist ---------- */

      await this.repo.save(table);

      /* ---------- 9. output event ---------- */
      const out: TableEvent = {
        type: 'CELL_CHANGED',
        tableId: command.tableId,
        rowId: domainEvent.rowId.value,
        columnId: domainEvent.columnId.value,
        newValue: domainEvent.newValue.value,
      };

      this.audit.log(out);
      return [out];

    } catch (e: any) {
      const failed: TableEvent = {
        type: 'VALIDATION_FAILED',
        tableId: command.tableId,
        reason: e?.message ?? 'Unknown error',
        details: e?.details ?? String(e),
      };

      this.audit.log(failed);
      return [failed];
    }
  }

  /* =====================================================
     helpers (application-layer only)
     ===================================================== */

  private async applyRemoteVisibilityRules(input: {
    table: any;
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

    const response = await this.dynamic!.remoteApi.request({
      endpoint: resolveOn.endpoint,
      params,
      method: 'POST',
    });

    const flags: Record<string, boolean> =
      resolveOn.mapFlags?.(response) ?? {};

    const toShow: ColumnSchema[] = [];

    meta.forEach(colCfg => {
      const v = colCfg.visibility;
      if (
        v?.kind === 'whenFlag' &&
        v.sourceFieldName === changedColumnId.value
      ) {
        if (flags[v.flag]) {
          const colId = new ColumnId(colCfg.fieldName);
          const schema = table.getColumnSchema(colId);
          if (schema) {
            toShow.push({ ...schema, hidden: false });
          }
        }
      }
    });

    if (toShow.length > 0) {
      table.addColumns(toShow);
    }
  }

  private applyComputedColumns(input: {
    table: Table;
    rowId: RowId;
    changedColumnId: ColumnId;
  }) {
    const { table, rowId, changedColumnId } = input;
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
        const newValue = colCfg.computed.compute(rowValues);
        const validated = this.validateCellValue(
          schema.renderType,
          newValue
        );
        if (!validated.ok) continue;
        const prev = rowValues[targetField];
        if (Object.is(prev, validated.value)) continue;

        table.changeCell(
          rowId,
          targetColId,
          new CellValue(validated.value)
        );
        if (schema.displayFormat) {
          const validatedDisplayValue = this.validateCellValue(
            schema.renderType,
            schema.displayFormat(newValue)
          );
          table.changeDisplay(
            rowId,
            targetColId,
            new CellValue(validatedDisplayValue.value)
          );

        } else {
          table.changeDisplay(
            rowId,
            targetColId,
            new CellValue(validated.value)
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
