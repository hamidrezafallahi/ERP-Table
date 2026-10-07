// application/handlers/rowCommandsHandler.ts

import { DomainError } from '../../domain/errors/DomainError';
import {
  RowAdded,
  RowRemoved,
  MinimumRowConstraintViolated,
} from '../../domain/events';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import {
  ColumnId,
  KeyValue,
  Pagination,
  RowId,
  RowState,
  RowStateEnum,
} from '../../domain/value-objects';
import { Table } from '../../domain/entities/Table';
import { Row } from '../../domain/entities/Row';
import {
  AddEmptyRowCommand,
  AddNewRowsCommand,
  DeleteRowCommand,
  DeleteRowsCommand,
  DuplicateRowCommand,
  PasteRowCommand,
  RestoreAddedRowCommand,
  RowReorderedCommand,
} from '../commands';
import { AuditLogger } from '../ports/AuditLogger';
import {
  isWindowedRepository,
  TableRepository,
  WindowedTableRepository,
} from '../ports/TableRepository';

/**
 * Append a row at the end of the full dataset (IndexedDB SoT), bump totalRows,
 * then load the last page into the RAM window so UI/pagination stay correct.
 *
 * Memory Iron Rule: max index + row count are computed with ONE streaming
 * cursor pass over IndexedDB (batch-bounded heap) — never a full getAllRows
 * hydration of the dataset.
 */
async function appendAtEndAndShowLastPage(
  repo: WindowedTableRepository,
  store: string,
  tableKey: string,
  table: Table,
  data?: KeyValue[],
): Promise<RowAdded> {
  let maxIndex = 0;
  let existingCount = 0;
  await repo.iterateRowRecords(store, tableKey, 'active', async records => {
    for (const rec of records) {
      existingCount += 1;
      // Same semantics as the former getAllRows reduce: cell 'index' value,
      // 0 when missing/non-numeric.
      const n = Number(rec.cells['index']?.value ?? 0);
      if (Number.isFinite(n) && n > maxIndex) maxIndex = n;
    }
  });
  const nextIndex = maxIndex + 1;

  // Meta may be stale (stuck at pageSize); trust the larger of meta vs real count
  const newTotal = Math.max(table.getPagination().totalRows, existingCount) + 1;
  const pageSize = Math.max(1, table.getPagination().pageSize);
  const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));

  const event = table.addNewRow(data, nextIndex);
  // Force correct totals/page (addNewRow may have used a stale base totalRows)
  table.setPagination(new Pagination(lastPage, pageSize, newTotal));

  await repo.save(store, table);

  const loaded = await repo.loadPage(store, tableKey, lastPage, pageSize);
  if (loaded) {
    // Ensure RAM window carries the corrected pagination after load
    if (
      loaded.getPagination().totalRows !== newTotal ||
      loaded.getPagination().page !== lastPage
    ) {
      loaded.setPagination(new Pagination(lastPage, pageSize, newTotal));
      await repo.save(store, loaded);
    }
  }

  return event;
}

/* ======================================================
   Add New Row
   ====================================================== */

export class AddNewRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: AddEmptyRowCommand, actor: Actor) {
    try {
      if (!command.tableKey) return null;
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canAddRow?.({ actor })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to add a new row',
          { actor }
        );
      }
      let event: RowAdded;
      if (isWindowedRepository(this.repo)) {
        event = await appendAtEndAndShowLastPage(
          this.repo,
          command.store,
          command.tableKey,
          table,
        );
      } else {
        event = table.addNewRow();
        await this.repo.save(command.store, table);
      }
      this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });
      return event;
    } catch (error) {

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
/* ======================================================
   Add New Rows
   ====================================================== */

export class AddNewRowsCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) {}

  async execute(command: AddNewRowsCommand, actor: Actor) {
    try {
      if (!command.tableKey) return null;
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canAddRow?.({ actor })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to add rows',
          { actor }
        );
      }
      let events: RowAdded[];
      if (isWindowedRepository(this.repo)) {
        // Memory Iron Rule: count existing rows via streaming cursor (heap = one
        // batch) instead of hydrating the full dataset with getAllRows.
        let existingCount = 0;
        await this.repo.iterateRowRecords(
          command.store,
          command.tableKey,
          'active',
          async records => {
            existingCount += records.length;
          },
        );
        events = table.addNewRows(command);
        const pageSize = Math.max(1, table.getPagination().pageSize);
        const newTotal = Math.max(
          table.getPagination().totalRows,
          existingCount + events.length,
        );
        const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
        table.setPagination(new Pagination(lastPage, pageSize, newTotal));
        await this.repo.save(command.store, table);
        await this.repo.loadPage(command.store, command.tableKey, lastPage, pageSize);
      } else {
        events = table.addNewRows(command);
        await this.repo.save(command.store, table);
      }

      events.forEach(event => {
        this.audit.log({
          type: 'INFORMATION',
          message: event.type,
          payload: event.rowId
        });
      });

      return events;

    } catch (error) {

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
      }

      return null;
    }
  }
}


/* ======================================================
   Paste Row (clipboard clone via AppService)
   ====================================================== */

export class PasteRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) {}

  async execute(command: PasteRowCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canAddRow?.({ actor })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to paste a row',
          { actor }
        );
      }
      const event = table.addRow(command.sourceRowId, command.placeAtRowId);
      await this.repo.save(command.store, table);
      this.audit.log({
        type: 'INFORMATION',
        message: event.type,
        payload: event.rowId,
      });
      return event;
    } catch (error) {
      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details,
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error },
        });
      }
      return null;
    }
  }
}

/* ======================================================
   Duplicate Row  → windowed: copy values + append at end + go to last page
   (page-window architecture cannot safely insert mid-dataset)
   ====================================================== */

export class DuplicateRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: DuplicateRowCommand, actor: Actor) {
    try {
      if (!command.tableKey) return null;
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canCopyRow?.({ actor, rowId: command.rowId })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to duplicate a row',
          { actor }
        );
      }
      if (!isWindowedRepository(this.repo)) {
        const event = table.duplicateRow(new RowId(command.rowId));
        await this.repo.save(command.store, table);
        this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });
        return event;
      }
      const source = table.getRow(command.rowId);
      if (!source) {
        throw new DomainError('ROW_NOT_FOUND', 'Source row not found', {
          rowId: command.rowId,
        });
      }

      const data: KeyValue[] = [];
      for (const [colId, cell] of source.getCells().entries()) {
        if (colId === 'index' || colId === 'RowState') continue;
        data.push({
          key: colId,
          value: cell.getValue(),
          display: cell.getDisplay(),
        });
      }

      const event = await appendAtEndAndShowLastPage(
        this.repo,
        command.store,
        command.tableKey,
        table,
        data,
      );
      this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });
      return event;
    } catch (error) {
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

/* ======================================================
   Delete Row
   ====================================================== */

export class DeleteRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: DeleteRowCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canDeleteRow?.({ actor, rowId: command.rowId })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to delete this row',
          { actor }
        );
      }
      const rowId = new RowId(command.rowId);
      const event = table.deleteRow(rowId);

      if (!event) {
        throw new DomainError(
          'ROW_NOT_FOUND',
          'Row not found or already deleted',
          { rowId: rowId.value }
        );
      }

      if (
        isWindowedRepository(this.repo) &&
        (event instanceof RowRemoved ||
          event instanceof MinimumRowConstraintViolated)
      ) {
        // Added rows are hard-removed from IndexedDB
        await this.repo.removeRows(command.store, command.tableKey, [command.rowId]);
        if (event instanceof RowRemoved) {
          const p = table.getPagination();
          table.setPagination(
            new Pagination(p.page, p.pageSize, Math.max(0, p.totalRows - 1)),
          );
        }
        // MinimumRowConstraintViolated: old Added gone, addNewRow already on table
      }

      await this.repo.save(command.store, table);
      this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });

      return event;
    } catch (error) {

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

/* ======================================================
   Delete Selected Rows (full dataset / IndexedDB SoT)
   ====================================================== */

export class DeleteRowsCommandHandler {
  constructor(
    private readonly repo: WindowedTableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy,
  ) { }

  /**
   * Bulk delete — never toggles restore:
   * - `Added` → hard-remove from IndexedDB
   * - otherwise → `rowState = Deleted` (soft; قابل برگرداندن با حذف تکی)
   * Already-`Deleted` rows stay deleted.
   */
  async execute(command: DeleteRowsCommand, actor: Actor) {
    try {
      const rowIds = command.rowIds ?? [];
      if (rowIds.length === 0) return null;

      for (const rowId of rowIds) {
        if (!this.permission.canDeleteRow?.({ actor, rowId })) {
          throw new DomainError(
            'FORBIDDEN',
            'Actor is not allowed to delete selected rows',
            { actor, rowId },
          );
        }
      }

      // Memory Iron Rule: streamed validity check (heap = one batch) — every
      // requested id must exist in the active collection's persisted records.
      const remainingWanted = new Set(rowIds);
      let foundAny = false;
      await this.repo.iterateRowRecords(
        command.store,
        command.tableKey,
        'active',
        async records => {
          for (const rec of records) {
            if (remainingWanted.delete(rec.rowId)) foundAny = true;
            if (remainingWanted.size === 0) return false; // early stop
          }
        },
      );
      if (!foundAny) {
        throw new DomainError('ROW_NOT_FOUND', 'No requested rows found', {
          tableKey: command.tableKey,
        });
      }
      // Ids absent from persisted records (e.g. unsaved RAM-only additions)
      // are skipped silently — the persisted delete cannot act on them.

      // Soft/hard delete applied DIRECTLY on IndexedDB records in one
      // readwrite transaction (cursor-based) — never getAllRows + replaceAll.
      // Added → hard-removed; others → rowState=Deleted on the record;
      // already-Deleted stay deleted (no restore on bulk delete).
      const { softDeleted, hardRemoved, remaining } =
        await this.repo.softDeleteRows(command.store, command.tableKey, rowIds);

      this.audit.log({
        type: 'INFORMATION',
        message: 'ROWS_DELETED',
        payload: {
          requested: rowIds.length,
          hardRemoved,
          softDeleted,
          remaining,
        },
      });

      return {
        removed: hardRemoved,
        softDeleted,
        remaining,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details,
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error },
        });
      }
      return null;
    }
  }
}

/* ======================================================
   Restore Added Row (redo identity)
   ====================================================== */

export class RestoreAddedRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) {}

  async execute(command: RestoreAddedRowCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission.canAddRow?.({ actor })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to restore an added row',
          { actor }
        );
      }
      const event = table.restoreAddedRow({
        rowId: command.rowId,
        cells: command.cells,
        collection: command.collection,
        isSaveDescription: command.isSaveDescription,
      });
      await this.repo.save(command.store, table);
      this.audit.log({
        type: 'INFORMATION',
        message: event.type,
        payload: event.rowId,
      });
      return event;
    } catch (error) {
      if (error instanceof DomainError) {
        this.audit.log({
          type: error.code,
          message: error.message,
          payload: error.details,
        });
      } else {
        this.audit.log({
          type: 'INVARIANT_VIOLATION',
          message: 'Unexpected error',
          payload: { error },
        });
      }
      return null;
    }
  }
}

/* ======================================================
   Reorder Row
   ====================================================== */

export class ReorderRowCommandHandler {
  constructor(
    private readonly repo: TableRepository,
    private readonly audit: AuditLogger,
    private readonly permission: PermissionPolicy
  ) { }

  async execute(command: RowReorderedCommand, actor: Actor) {
    try {
      const table = await this.repo.getById(command.store, command.tableKey);
      if (!this.permission?.canReorderRow?.({ actor, rowId: command.draggedRowId })) {
        throw new DomainError(
          'FORBIDDEN',
          'Actor is not allowed to reorder this row',
          { actor }
        );
      }
      const draggedRowId = new RowId(command.draggedRowId);
      const droppedRowId = new RowId(command.droppedRowId);
      const event = table.reorderRows(draggedRowId.value, droppedRowId.value, command.position);
      if (!event) {
        throw new DomainError(
          'DRAG_OR_DROP_ROW_NOT_FOUND',
          `Drag row num is ${draggedRowId.value} && drop row num is ${droppedRowId.value} `,
          { draggedRowId: draggedRowId.value, droppedRowId: droppedRowId.value }
        );
      }

      await this.repo.save(command.store, table);
      return event;

    } catch (error) {

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
