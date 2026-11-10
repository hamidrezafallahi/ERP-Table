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

/** Page-window append (lazy module — only paged mode pays for it). */
async function appendAtEndAndShowLastPage(
  repo: WindowedTableRepository,
  store: string,
  tableKey: string,
  table: Table,
  data?: KeyValue[],
): Promise<RowAdded> {
  const mod = await import('./appendAtEnd');
  return mod.appendAtEndAndShowLastPage(repo, store, tableKey, table, data);
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
      let event: RowAdded;
      if (isWindowedRepository(this.repo)) {
        // Page-window: the RAM window is ONE page. Derive the clone's index
        // from the full dataset (one streaming pass) so it lands at the real
        // dataset end (paste) or right after the anchor row (pasteInsert),
        // and bump totalRows. The window itself is NOT reloaded here — the
        // engine reloads once after the whole paste unit, so later source
        // rows of a multi-row paste are still in RAM.
        const anchorIndex =
          command.placeAtRowId !== undefined
            ? Number(table.getRow(command.placeAtRowId)?.getCell('index')?.getValue())
            : undefined;
        let maxIndex = 0;
        let nextAfterAnchor: number | undefined;
        let existingCount = 0;
        await this.repo.iterateRowRecords(
          command.store,
          command.tableKey,
          'active',
          async records => {
            for (const rec of records) {
              existingCount += 1;
              const n = Number(rec.cells['index']?.value ?? 0);
              if (!Number.isFinite(n)) continue;
              if (n > maxIndex) maxIndex = n;
              if (
                anchorIndex !== undefined &&
                Number.isFinite(anchorIndex) &&
                n > anchorIndex &&
                (nextAfterAnchor === undefined || n < nextAfterAnchor)
              ) {
                nextAfterAnchor = n;
              }
            }
          },
        );
        let explicitIndex: number;
        if (anchorIndex !== undefined && Number.isFinite(anchorIndex)) {
          explicitIndex =
            nextAfterAnchor !== undefined
              ? (anchorIndex + nextAfterAnchor) / 2
              : anchorIndex + 1;
        } else {
          explicitIndex = maxIndex + 1;
        }
        event = table.addRow(command.sourceRowId, command.placeAtRowId, explicitIndex);
        const p = table.getPagination();
        const newTotal = Math.max(p.totalRows, existingCount) + 1;
        table.setPagination(new Pagination(p.page, p.pageSize, newTotal));
      } else {
        event = table.addRow(command.sourceRowId, command.placeAtRowId);
      }
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
          const pageSize = Math.max(1, p.pageSize);
          const newTotal = Math.max(0, p.totalRows - 1);
          const totalPages = Math.max(1, Math.ceil(newTotal / pageSize));
          // Last row of page >= 2 removed -> step back one page (page count shrinks)
          const page = Math.max(1, Math.min(p.page, totalPages));
          table.setPagination(new Pagination(page, pageSize, newTotal));
          await this.repo.save(command.store, table);
          // Refresh RAM window only when it has a gap: empty page -> previous
          // page; short page -> next row from the following page fills it.
          // (A window still >= pageSize — e.g. mid paste+cut — is left alone so
          // the remaining rows of that unit stay in RAM; the engine reloads.)
          const windowSize = table
            .getRows()
            .filter(r => r.collection === table.getActiveCollectionName()).length;
          if (windowSize < pageSize || page !== p.page) {
            await this.repo.loadPage(command.store, command.tableKey, page, pageSize);
          }
          this.audit.log({ type: 'INFORMATION', message: event.type, payload: event.rowId });
          return event;
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
      if (isWindowedRepository(this.repo)) {
        // Page-window: the row re-enters the dataset → bump totalRows. The
        // engine/session trims the RAM window after the undo/redo unit.
        const p = table.getPagination();
        table.setPagination(new Pagination(p.page, p.pageSize, p.totalRows + 1));
      }
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
