// application/TableAppService.ts

import {
  Actor,
  ApplicationTableCommand,
} from './commands';
import { CellChangedEvent, TableEvent } from './events';
import {
  ApplyDynamicProjectionHandler,
  ApplyRowVisibilityHandler,
  ChangeCellDisplayValueHandler,
  ChangeCellValueHandler,
  SaveDescriptionHandler,
} from './handlers/cellCommandsHandler';
import { PasteCellsCommandHandler } from './handlers/pasteCellsCommandsHandler';
import {
  AddNewRowCommandHandler,
  AddNewRowsCommandHandler,
  DeleteRowCommandHandler,
  DeleteRowsCommandHandler,
  DuplicateRowCommandHandler,
  PasteRowCommandHandler,
  ReorderRowCommandHandler,
  RestoreAddedRowCommandHandler,
} from './handlers/rowCommandsHandler';
import {
  ChangePageCommandHandler,
  ChangePageSizeCommandHandler,
  ReorderColumnCommandHandler,
  SetActiveCollectionCommandHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from './handlers/tableCommandHandler';
import type { EventStore } from './ports/EventStore';
import type { TableRepository } from './ports/TableRepository';
import type { GridEvent } from '../domain/types/GridEvent';
import type { CellUndoStack, RowCellSnapshot } from './undo/CellUndoStack';

export class TableAppService {
  private eventStore?: EventStore;
  private undoStack?: CellUndoStack;
  private repo?: TableRepository;
  private snapshotStrategy?: {
    onAppend(streamId: string, tableId: string, appendedCount: number): Promise<void>;
  };

  constructor(
    private readonly changeCellValue: ChangeCellValueHandler,
    private readonly changeCellDisplayValue: ChangeCellDisplayValueHandler,
    private readonly saveDescription: SaveDescriptionHandler,
    private readonly addEmptyRow: AddNewRowCommandHandler,
    private readonly addNewRows: AddNewRowsCommandHandler,
    private readonly duplicateRow: DuplicateRowCommandHandler,
    private readonly deleteRow: DeleteRowCommandHandler,
    private readonly reorderRow: ReorderRowCommandHandler,
    private readonly setPageSize: ChangePageSizeCommandHandler,
    private readonly setPage: ChangePageCommandHandler,
    private readonly setActiveCollection: SetActiveCollectionCommandHandler,
    private readonly deleteTable: DeleteTableCommandHandler,
    private readonly resetTable: ResetTableCommandHandler,
    private readonly applyDynamicProjection: ApplyDynamicProjectionHandler,
    private readonly pasteCells: PasteCellsCommandHandler,
    private readonly restoreAddedRow?: RestoreAddedRowCommandHandler,
    private readonly pasteRow?: PasteRowCommandHandler,
    private readonly reorderColumn?: ReorderColumnCommandHandler,
    /** Page-window (paged-idb) mode only. */
    private readonly applyRowVisibility?: ApplyRowVisibilityHandler,
    private readonly deleteRows?: DeleteRowsCommandHandler,
  ) {}

  setEventStore(eventStore: EventStore): void {
    this.eventStore = eventStore;
  }

  setSnapshotStrategy(strategy: {
    onAppend(streamId: string, tableId: string, appendedCount: number): Promise<void>;
  }): void {
    this.snapshotStrategy = strategy;
  }

  setUndoStack(undoStack: CellUndoStack): void {
    this.undoStack = undoStack;
  }

  setRepository(repo: TableRepository): void {
    this.repo = repo;
  }

  async execute(command: ApplicationTableCommand, actor: Actor) {
    const correlationId =
      (command as { correlationId?: string }).correlationId ??
      this.createCorrelationId();

    const preDeleteSnapshot =
      command.type === 'ROW_DELETED'
        ? await this.captureRowSnapshot(
            command.store,
            command.tableKey,
            command.rowId,
          )
        : undefined;

    const result = await this.dispatch(command, actor);
    if (result) {
      await this.recordUndoableEvents(
        command,
        result,
        correlationId,
        preDeleteSnapshot,
      );
    }
    if (this.eventStore && result) {
      await this.appendToEventStore(command, result, correlationId);
      await this.recordSnapshot(command, result);
    }
    return result;
  }

  private dispatch(command: ApplicationTableCommand, actor: Actor) {
    switch (command.type) {
      case 'CHANGE_CELL_VALUE':
        return this.changeCellValue.execute(command, actor);
      case 'SAVE_DESCRIPTION':
        return this.saveDescription.execute(command, actor);
      case 'APPLY_DYNAMIC_PROJECTION':
        return this.applyDynamicProjection.execute(command, actor);
      case 'APPLY_ROW_VISIBILITY':
        if (!this.applyRowVisibility) return [];
        return this.applyRowVisibility.execute(command, actor);
      case 'CHANGE_CELL_DISPLAY_VALUE':
        return this.changeCellDisplayValue.execute(command, actor);
      case 'ADD_EMPTY_ROW':
        return this.addEmptyRow.execute(command, actor);
      case 'ADD_NEW_ROWS':
        return this.addNewRows.execute(command, actor);
      case 'DUPLICATE_ROW':
        return this.duplicateRow.execute(command, actor);
      case 'PASTE_ROW':
        if (!this.pasteRow) {
          throw new Error('PASTE_ROW handler is not configured');
        }
        return this.pasteRow.execute(command, actor);
      case 'PASTE_CELLS':
        return this.pasteCells.execute(command, actor);
      case 'ROW_DELETED':
        return this.deleteRow.execute(command, actor);
      case 'RESTORE_ADDED_ROW':
        if (!this.restoreAddedRow) {
          throw new Error('RESTORE_ADDED_ROW handler is not configured');
        }
        return this.restoreAddedRow.execute(command, actor);
      case 'ROWS_DELETED':
        if (!this.deleteRows) {
          throw new Error('ROWS_DELETED handler is not configured');
        }
        return this.deleteRows.execute(command, actor);
      case 'TABLE_RESET':
        return this.resetTable.execute(command, actor);
      case 'TABLE_DELETED':
        return this.deleteTable.execute(command, actor);
      case 'ROW_REORDERED':
        return this.reorderRow.execute(command, actor);
      case 'COLUMN_REORDERED':
        if (!this.reorderColumn) {
          throw new Error('COLUMN_REORDERED handler is not configured');
        }
        return this.reorderColumn.execute(command, actor);
      case 'CHANGE_PAGE_SIZE':
        return this.setPageSize.execute(command, actor);
      case 'CHANGE_PAGE':
        return this.setPage.execute(command, actor);
      case 'SET_ACTIVE_COLLECTION':
        return this.setActiveCollection.execute(command, actor);
      default:
        throw new Error(`Unhandled command: ${JSON.stringify(command)}`);
    }
  }

  private async recordUndoableEvents(
    command: ApplicationTableCommand,
    result: TableEvent[] | TableEvent | null | unknown,
    correlationId: string,
    preDeleteSnapshot?: {
      cells: Record<string, RowCellSnapshot>;
      collection: string;
      isSaveDescription: boolean;
    },
  ): Promise<void> {
    if (!this.undoStack) return;

    const events = this.normalizeResult(result);
    if (events.length === 0) return;

    const fallbackTableId = (command as { tableKey?: string }).tableKey ?? '';
    const store = (command as { store?: string }).store ?? '';

    for (const evt of events) {
      if (evt.type === 'CELL_CHANGED' && 'previousValue' in evt) {
        const cellEvt = evt as CellChangedEvent;
        this.undoStack.record(
          {
            ...cellEvt,
            tableId: cellEvt.tableId || fallbackTableId,
          },
          correlationId,
        );
        continue;
      }

      if (evt.type === 'ROW_ADDED' || evt.type === 'NEW_ROW_ADDED') {
        const rowId = this.resolveRowId((evt as { rowId?: unknown }).rowId);
        const tableId = evt.tableId || fallbackTableId;
        if (rowId == null || !tableId) continue;
        const snapshot = await this.captureRowSnapshot(store, tableId, rowId);
        this.undoStack.recordRowAdded(
          {
            tableId,
            rowId,
            cells: snapshot?.cells,
            collection: snapshot?.collection,
            isSaveDescription: snapshot?.isSaveDescription,
          },
          correlationId,
        );
        continue;
      }

      if (evt.type === 'ROW_DELETED' || evt.type === 'NEW_ROW_REMOVED') {
        const rowId = this.resolveRowId((evt as { rowId?: unknown }).rowId);
        const tableId = evt.tableId || fallbackTableId;
        if (rowId == null || !tableId) continue;
        const mode = evt.type === 'NEW_ROW_REMOVED' ? 'hard' : 'soft';
        this.undoStack.recordRowDeleted(
          {
            tableId,
            rowId,
            mode,
            cells: preDeleteSnapshot?.cells,
            collection: preDeleteSnapshot?.collection,
            isSaveDescription: preDeleteSnapshot?.isSaveDescription,
          },
          correlationId,
        );
      }
    }
  }

  private async captureRowSnapshot(
    store: string,
    tableId: string,
    rowId: number,
  ): Promise<
    | {
        cells: Record<string, RowCellSnapshot>;
        collection: string;
        isSaveDescription: boolean;
      }
    | undefined
  > {
    if (!this.repo || !store) return undefined;
    try {
      const table = await this.repo.getById(store, tableId);
      const row = table.getRow(rowId);
      if (!row) return undefined;
      const cells: Record<string, RowCellSnapshot> = {};
      for (const [key, cell] of row.getCells().entries()) {
        cells[key] = {
          value: cell.getValue(),
          display: cell.getDisplay(),
          originalValue: cell.getOriginalValue().value,
        };
      }
      return {
        cells,
        collection: row.getCollection(),
        isSaveDescription: row.isSaveDescription,
      };
    } catch {
      return undefined;
    }
  }

  private async appendToEventStore(
    command: ApplicationTableCommand,
    result: TableEvent[] | TableEvent | null | unknown,
    correlationId: string,
  ): Promise<void> {
    if (!this.eventStore) return;

    const events = this.normalizeResult(result);
    if (events.length === 0) return;

    const tableId = command.tableKey ?? '';
    const streamId = `table:${tableId}`;

    const gridEvents: GridEvent[] = events.map((evt) => ({
      eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: evt.type,
      tableId: evt.tableId ?? tableId,
      streamId,
      version: 0,
      occurredAt: Date.now(),
      actorId: 'system',
      correlationId,
      payload: this.toGridPayload(evt, tableId),
    }));

    await this.eventStore.append(streamId, gridEvents, -1);
  }

  private async recordSnapshot(
    command: ApplicationTableCommand,
    result: TableEvent[] | TableEvent | null | unknown,
  ): Promise<void> {
    if (!this.snapshotStrategy) return;
    const events = this.normalizeResult(result);
    if (events.length === 0) return;
    const tableId = (command as { tableKey?: string }).tableKey ?? '';
    if (!tableId) return;
    await this.snapshotStrategy.onAppend(`table:${tableId}`, tableId, events.length);
  }

  private normalizeResult(result: unknown): TableEvent[] {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (typeof result === 'object' && result !== null && 'type' in result) {
      return [result as TableEvent];
    }
    return [];
  }

  private resolveRowId(rowId: unknown): number | null {
    if (typeof rowId === 'number' && Number.isFinite(rowId)) return rowId;
    if (typeof rowId === 'string' && rowId.trim() !== '') {
      const parsed = Number(rowId);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (
      typeof rowId === 'object' &&
      rowId !== null &&
      'value' in rowId &&
      typeof (rowId as { value: unknown }).value === 'number'
    ) {
      return (rowId as { value: number }).value;
    }
    return null;
  }

  private toGridPayload(evt: TableEvent, fallbackTableId: string): unknown {
    if (evt.type === 'ROW_ADDED' || evt.type === 'NEW_ROW_ADDED') {
      const rowId = this.resolveRowId((evt as { rowId?: unknown }).rowId);
      return {
        type: evt.type,
        tableId: evt.tableId ?? fallbackTableId,
        rowId: rowId ?? String((evt as { rowId?: unknown }).rowId ?? ''),
      };
    }
    return evt;
  }

  private createCorrelationId(): string {
    return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
