import type { CellChangedEvent } from '../../application/events';

export interface CellUndoEntry {
  readonly kind: 'CELL_CHANGED';
  readonly tableId: string;
  readonly rowId: number;
  readonly columnId: string;
  readonly newValue: unknown;
  readonly previousValue: unknown;
}

export type RowCellSnapshot = {
  readonly value: unknown;
  readonly display?: unknown;
  readonly originalValue?: unknown;
};

export interface RowAddedUndoEntry {
  readonly kind: 'ROW_ADDED';
  readonly tableId: string;
  readonly rowId: number;
  /** Captured at record time so redo can restore identity + values. */
  readonly cells: Readonly<Record<string, RowCellSnapshot>>;
  readonly collection?: string;
  readonly isSaveDescription?: boolean;
}

/**
 * Compensating entry for a delete:
 * - soft: Unchanged→Deleted (undo/redo = toggle ROW_DELETED)
 * - hard: Added row removed from map (undo = RESTORE_ADDED_ROW)
 */
export interface RowDeletedUndoEntry {
  readonly kind: 'ROW_DELETED';
  readonly tableId: string;
  readonly rowId: number;
  readonly mode: 'soft' | 'hard';
  readonly cells: Readonly<Record<string, RowCellSnapshot>>;
  readonly collection?: string;
  readonly isSaveDescription?: boolean;
}

export type AtomicUndoEntry =
  | CellUndoEntry
  | RowAddedUndoEntry
  | RowDeletedUndoEntry;

export interface UndoUnit {
  readonly correlationId?: string;
  readonly entries: AtomicUndoEntry[];
}

export type UndoDispatchCommand =
  | {
      type: 'CHANGE_CELL_VALUE';
      store: string;
      tableKey: string;
      rowId: number;
      columnId: string;
      newValue: unknown;
    }
  | {
      type: 'ROW_DELETED';
      store: string;
      tableKey: string;
      rowId: number;
    }
  | {
      type: 'RESTORE_ADDED_ROW';
      store: string;
      tableKey: string;
      rowId: number;
      cells: Readonly<Record<string, RowCellSnapshot>>;
      collection?: string;
      isSaveDescription?: boolean;
    };

export type CellUndoDispatch = (
  command: UndoDispatchCommand,
) => Promise<void>;

function isNoOpCell(entry: CellUndoEntry): boolean {
  return Object.is(entry.newValue, entry.previousValue);
}

/**
 * Compensating undo/redo stack for domain edits.
 * - CELL_CHANGED: restore previousValue / re-apply newValue
 * - ROW_ADDED: delete on undo; RESTORE_ADDED_ROW on redo
 * - ROW_DELETED soft: toggle ROW_DELETED; hard: RESTORE_ADDED_ROW / ROW_DELETED
 * - Same correlationId merges into one undo unit (paste / cut+paste)
 */
export class CellUndoStack {
  private undoEntries: UndoUnit[] = [];
  private redoEntries: UndoUnit[] = [];
  private applying: 'undo' | 'redo' | null = null;

  record(event: CellChangedEvent, correlationId?: string): void {
    if (this.applying) return;
    const entry: CellUndoEntry = {
      kind: 'CELL_CHANGED',
      tableId: event.tableId,
      rowId: event.rowId,
      columnId: event.columnId,
      newValue: event.newValue,
      previousValue: event.previousValue,
    };
    if (isNoOpCell(entry)) return;
    this.pushAtomic(entry, correlationId);
  }

  recordRowAdded(
    event: {
      tableId: string;
      rowId: number;
      cells?: Readonly<Record<string, RowCellSnapshot>>;
      collection?: string;
      isSaveDescription?: boolean;
    },
    correlationId?: string,
  ): void {
    if (this.applying) return;
    this.pushAtomic(
      {
        kind: 'ROW_ADDED',
        tableId: event.tableId,
        rowId: event.rowId,
        cells: event.cells ?? {},
        collection: event.collection,
        isSaveDescription: event.isSaveDescription,
      },
      correlationId,
    );
  }

  recordRowDeleted(
    event: {
      tableId: string;
      rowId: number;
      mode: 'soft' | 'hard';
      cells?: Readonly<Record<string, RowCellSnapshot>>;
      collection?: string;
      isSaveDescription?: boolean;
    },
    correlationId?: string,
  ): void {
    if (this.applying) return;
    if (event.mode === 'hard' && (!event.cells || Object.keys(event.cells).length === 0)) {
      // Cannot restore a hard-removed row without a snapshot.
      return;
    }
    this.pushAtomic(
      {
        kind: 'ROW_DELETED',
        tableId: event.tableId,
        rowId: event.rowId,
        mode: event.mode,
        cells: event.cells ?? {},
        collection: event.collection,
        isSaveDescription: event.isSaveDescription,
      },
      correlationId,
    );
  }

  recordMany(
    entries: AtomicUndoEntry[],
    correlationId?: string,
  ): void {
    if (this.applying) return;
    const filtered = entries.filter((e) =>
      e.kind === 'CELL_CHANGED' ? !isNoOpCell(e) : true,
    );
    if (filtered.length === 0) return;

    if (
      correlationId &&
      this.undoEntries.length > 0 &&
      this.undoEntries[this.undoEntries.length - 1].correlationId ===
        correlationId
    ) {
      this.undoEntries[this.undoEntries.length - 1].entries.push(...filtered);
      this.redoEntries = [];
      return;
    }

    this.undoEntries.push({ correlationId, entries: filtered });
    this.redoEntries = [];
  }

  canUndo(): boolean {
    return this.undoEntries.length > 0;
  }

  canRedo(): boolean {
    return this.redoEntries.length > 0;
  }

  undoDepth(): number {
    return this.undoEntries.length;
  }

  redoDepth(): number {
    return this.redoEntries.length;
  }

  async undo(
    store: string,
    dispatch: CellUndoDispatch,
  ): Promise<boolean> {
    const unit = this.undoEntries.pop();
    if (!unit) return false;

    this.applying = 'undo';
    try {
      for (let i = unit.entries.length - 1; i >= 0; i -= 1) {
        await this.applyCompensating(store, unit.entries[i], dispatch);
      }
      this.redoEntries.push(unit);
      return true;
    } finally {
      this.applying = null;
    }
  }

  async redo(
    store: string,
    dispatch: CellUndoDispatch,
  ): Promise<boolean> {
    const unit = this.redoEntries.pop();
    if (!unit) return false;

    this.applying = 'redo';
    try {
      for (const entry of unit.entries) {
        await this.applyForward(store, entry, dispatch);
      }
      this.undoEntries.push(unit);
      return true;
    } finally {
      this.applying = null;
    }
  }

  clear(): void {
    this.undoEntries = [];
    this.redoEntries = [];
    this.applying = null;
  }

  private pushAtomic(
    entry: AtomicUndoEntry,
    correlationId?: string,
  ): void {
    if (
      correlationId &&
      this.undoEntries.length > 0 &&
      this.undoEntries[this.undoEntries.length - 1].correlationId ===
        correlationId
    ) {
      this.undoEntries[this.undoEntries.length - 1].entries.push(entry);
      this.redoEntries = [];
      return;
    }

    this.undoEntries.push({ correlationId, entries: [entry] });
    this.redoEntries = [];
  }

  private async applyCompensating(
    store: string,
    entry: AtomicUndoEntry,
    dispatch: CellUndoDispatch,
  ): Promise<void> {
    if (entry.kind === 'CELL_CHANGED') {
      await dispatch({
        type: 'CHANGE_CELL_VALUE',
        store,
        tableKey: entry.tableId,
        rowId: entry.rowId,
        columnId: entry.columnId,
        newValue: entry.previousValue,
      });
      return;
    }

    if (entry.kind === 'ROW_ADDED') {
      await dispatch({
        type: 'ROW_DELETED',
        store,
        tableKey: entry.tableId,
        rowId: entry.rowId,
      });
      return;
    }

    // ROW_DELETED undo: restore source
    if (entry.mode === 'soft') {
      // Domain toggles Deleted → Unchanged/Modified
      await dispatch({
        type: 'ROW_DELETED',
        store,
        tableKey: entry.tableId,
        rowId: entry.rowId,
      });
      return;
    }

    await dispatch({
      type: 'RESTORE_ADDED_ROW',
      store,
      tableKey: entry.tableId,
      rowId: entry.rowId,
      cells: entry.cells,
      collection: entry.collection,
      isSaveDescription: entry.isSaveDescription,
    });
  }

  private async applyForward(
    store: string,
    entry: AtomicUndoEntry,
    dispatch: CellUndoDispatch,
  ): Promise<void> {
    if (entry.kind === 'CELL_CHANGED') {
      await dispatch({
        type: 'CHANGE_CELL_VALUE',
        store,
        tableKey: entry.tableId,
        rowId: entry.rowId,
        columnId: entry.columnId,
        newValue: entry.newValue,
      });
      return;
    }

    if (entry.kind === 'ROW_ADDED') {
      await dispatch({
        type: 'RESTORE_ADDED_ROW',
        store,
        tableKey: entry.tableId,
        rowId: entry.rowId,
        cells: entry.cells,
        collection: entry.collection,
        isSaveDescription: entry.isSaveDescription,
      });
      return;
    }

    // ROW_DELETED redo: delete again
    await dispatch({
      type: 'ROW_DELETED',
      store,
      tableKey: entry.tableId,
      rowId: entry.rowId,
    });
  }
}
