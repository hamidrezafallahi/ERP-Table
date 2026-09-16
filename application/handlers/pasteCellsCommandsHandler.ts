import type { FieldType } from '../../bootstrap/type';
import { DomainError } from '../../domain/errors/DomainError';
import type { Actor, PermissionPolicy } from '../../domain/policies';
import {
  ColumnId,
  RowId,
  RowStateEnum,
} from '../../domain/value-objects';
import { coercePastedCellValue } from '../../engine/dataOps/cellValueCoercion';
import type { PasteCellsCommand } from '../commands';
import type { TableEvent } from '../events';
import type { AuditLogger } from '../ports/AuditLogger';
import type { TableRepository } from '../ports/TableRepository';

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

/**
 * Batch clipboard paste (PR-107): one repo save, many CELL_CHANGED events.
 */
export class PasteCellsCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permissionPolicy: PermissionPolicy,
  ) {}

  async execute(
    command: PasteCellsCommand,
    actor: Actor,
  ): Promise<TableEvent[]> {
    const table = await this.repo.getById(command.store, command.tableKey);
    const events: TableEvent[] = [];

    try {
      for (const update of command.updates) {
        const rowId = new RowId(update.rowId);
        const columnId = new ColumnId(update.columnId);
        const schema = table.getColumnSchema(columnId);
        if (!schema) continue;
        if (schema.editable === false || schema.fieldType === 'index') {
          continue;
        }
        if (
          !this.permissionPolicy.canChangeCell({
            actor,
            rowId: update.rowId,
            columnId: update.columnId,
          })
        ) {
          continue;
        }

        const coerced = coercePastedCellValue(
          schema.fieldType as FieldType,
          update.rawText,
        );
        if (!coerced.ok) continue;

        const validated = this.validateCellValue(schema.fieldType, coerced.value);
        if (!validated.ok) continue;

        const domainEvent = table.changeCell(rowId, columnId, validated.value);
        if (!domainEvent) continue;

        const state = table
          .getRows()
          .find((r) => r.id.value === rowId.value)
          ?.getCells()
          .get('RowState')
          ?.getValue();

        if (state === RowStateEnum.Unchanged) {
          table.changeCell(rowId, new ColumnId('RowState'), RowStateEnum.Modified);
          table.changeDisplay(rowId, new ColumnId('RowState'), RowStateEnum.Modified);
        }

        events.push({
          type: 'CELL_CHANGED',
          tableId: command.tableKey,
          rowId: domainEvent.rowId.value,
          columnId: domainEvent.columnId.value,
          newValue: domainEvent.newValue,
          previousValue: domainEvent.previousValue,
        });
      }

      if (events.length > 0) {
        await this.repo.save(command.store, table);
      }

      if (events.length > 0) {
        this.audit.log({
          type: 'INFORMATION',
          message: 'Batch clipboard paste',
          payload: { count: events.length },
        });
      }

      return events;
    } catch (e) {
      logError(this.audit, e, `PasteCellsCommandHandler[${command.tableKey}]`);
      return [];
    }
  }

  private validateCellValue(type: FieldType, value: unknown) {
    switch (type) {
      case 'text':
      case 'textArea':
      case 'description':
      case 'date':
        return typeof value === 'string'
          ? { ok: true as const, value }
          : { ok: false as const, value };
      case 'static':
        return { ok: true as const, value };
      case 'checkbox':
        return typeof value === 'boolean'
          ? { ok: true as const, value }
          : { ok: false as const, value };
      case 'number':
      case 'price':
      case 'select':
      case 'selectOption': {
        if (value === '' || value === undefined) {
          return { ok: true as const, value: '' };
        }
        const n = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(n)
          ? { ok: true as const, value: n }
          : { ok: false as const, value };
      }
      default:
        return { ok: false as const, value };
    }
  }
}
