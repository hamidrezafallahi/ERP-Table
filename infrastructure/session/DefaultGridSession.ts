import type { AuditLogger } from '../../application/ports/AuditLogger';
import type { CellUndoStack } from '../../application/undo/CellUndoStack';
import type { GridSession } from '../../application/session/GridSession';
import type { ViewIntent } from '../../application/session/ViewIntent';
import type { CollectionScope } from '../../domain/entities/Table';
import { Viewport } from '../../domain/value-objects/Viewport';
import type { VisibleRange } from '../../domain/value-objects/Viewport';
import type { TableEngine } from '../../engine/tableEngine';
import type { TableSnapShot } from '../../engine/type';
import { ViewportCalculator } from '../../engine/ViewportCalculator';
import type {
  ChangelogEntry,
  ChangelogProjection,
  ChangelogQuery,
} from '../projections/ChangelogProjection';
import type {
  HistoryItem,
  HistoryPanelViewModel,
  HistoryQuery,
} from '../history/HistoryPanelViewModel';
import { UITableKeyboardHandler } from '../ui/UITableKeyboardHandler';

export type CreateGridSessionDeps = {
  engine: TableEngine;
  store: string;
  tableKey: string;
  audit: AuditLogger;
  changelogProjection?: ChangelogProjection;
  historyPanelViewModel?: HistoryPanelViewModel;
  cellUndoStack?: CellUndoStack;
  /** Initial virtual viewport; defaults to 400px × 40px rows. */
  initialViewport?: Viewport;
};

export class DefaultGridSession implements GridSession {
  private readonly keyboard: UITableKeyboardHandler;
  private viewport: Viewport;
  private readonly viewportListeners = new Set<() => void>();

  constructor(private readonly deps: CreateGridSessionDeps) {
    this.viewport =
      deps.initialViewport ?? new Viewport(0, 400, 40, 2);
    this.keyboard = new UITableKeyboardHandler(
      deps.engine,
      deps.audit,
      (intent) => this.dispatchViewIntent(intent),
    );
  }

  get store(): string {
    return this.deps.store;
  }

  get tableKey(): string {
    return this.deps.tableKey;
  }

  getEngine(): TableEngine {
    return this.deps.engine;
  }

  attachCopyCells(handler: () => Promise<boolean>): void {
    this.keyboard.setCopyCells(handler);
  }

  attachPasteCells(handler: () => Promise<boolean>): void {
    this.keyboard.setPasteCells(handler);
  }

  attachCutCells(handler: () => Promise<boolean>): void {
    this.keyboard.setCutCells(handler);
  }

  async dispatchViewIntent(intent: ViewIntent): Promise<void> {
    const { engine, store, tableKey, cellUndoStack } = this.deps;

    switch (intent.type) {
      case 'ADD_EMPTY_ROW':
        await engine.dispatch({
          type: 'ADD_EMPTY_ROW',
          store,
          tableKey,
          autoActivate: intent.autoActivate ?? true,
        });
        return;
      case 'DUPLICATE_ROW':
        await engine.dispatch({
          type: 'DUPLICATE_ROW',
          store,
          tableKey,
          rowId: intent.rowId,
        });
        return;
      case 'DELETE_ROW':
        await engine.dispatch({
          type: 'ROW_DELETED',
          store,
          tableKey,
          rowId: intent.rowId,
        });
        return;
      case 'TOGGLE_ROW_SELECTION':
        await engine.dispatch({
          type: 'ROW_SELECTION_TOGGLED',
          tableKey,
          rowId: intent.rowId,
        });
        return;
      case 'SELECT_FROM_ACTIVE_TO_LAST':
        await engine.dispatch({
          type: 'SELECT_FROM_ACTIVE_TO_LAST',
          tableKey,
          anchorRowId: intent.anchorRowId,
        });
        return;
      case 'ACTIVATE_FIRST_CELL':
        await engine.dispatch({
          type: 'ACTIVATE_FIRST_CELL',
          tableKey,
          rowId: intent.rowId,
        });
        return;
      case 'MOVE_ACTIVE_CELL':
        await engine.dispatch({
          type: 'MOVE_ACTIVE_CELL',
          store,
          tableKey,
          rowId: intent.rowId,
          columnId: intent.columnId,
          direction: intent.direction,
        });
        engine.syncCellRangeToActiveCell();
        return;
      case 'MOVE_ACTIVE_CELL_VERTICAL':
        await engine.dispatch({
          type: 'MOVE_ACTIVE_CELL_VERTICAL',
          store,
          tableKey,
          rowId: intent.rowId,
          columnId: intent.columnId,
          direction: intent.direction,
        });
        engine.syncCellRangeToActiveCell();
        return;
      case 'EXTEND_CELL_RANGE':
        engine.extendCellRangeArrow(intent.direction);
        return;
      case 'EXTEND_CELL_RANGE_TO_EDGE':
        engine.extendCellRangeToEdge(intent.direction);
        return;
      case 'JUMP_ACTIVE_CELL_ROW_EDGE':
        engine.jumpActiveCellRowEdge(intent.edge);
        return;
      case 'JUMP_ACTIVE_CELL_GRID':
        engine.jumpActiveCellGridCorner(intent.corner);
        return;
      case 'SELECT_ALL_CELLS':
        engine.selectAllCells();
        return;
      case 'MOVE_VERTICAL_SELECTED_ROWS':
        await engine.dispatch({
          type: 'MOVE_VERTICAL_SELECTED_ROWS',
          tableKey,
          direction: intent.direction,
        });
        return;
      case 'MOVE_VERTICAL_ACTIVE_ROW':
        await engine.dispatch({
          type: 'MOVE_VERTICAL_ACTIVE_ROW',
          tableKey,
          direction: intent.direction,
        });
        return;
      case 'COLLAPSE_ALL_ROWS':
        await engine.dispatch({ type: 'COLLAPSE_ALL_ROWS', tableKey });
        return;
      case 'CHANGE_PAGE':
        await engine.dispatch({
          type: 'CHANGE_PAGE',
          store,
          tableKey,
          page: intent.page,
        });
        return;
      case 'CHANGE_PAGE_SIZE':
        await engine.dispatch({
          type: 'CHANGE_PAGE_SIZE',
          store,
          tableKey,
          pageSize: intent.pageSize,
        });
        return;
      case 'SET_TABLE_ACTION':
        await engine.dispatch({
          type: 'SET_TABLE_ACTION',
          store,
          tableKey,
          action: intent.action,
        });
        return;
      case 'SET_GRID_SEARCH':
        await engine.dispatch({
          type: 'SET_GRID_SEARCH',
          tableKey,
          search: intent.search,
        });
        return;
      case 'SET_MOBILE_EDITOR':
        await engine.dispatch({
          type: 'SET_MOBILE_EDITOR',
          tableKey,
          editor: intent.editor,
        });
        return;
      case 'CHANGE_VIEWPORT': {
        const next = new Viewport(
          intent.scrollOffset,
          intent.viewportSize ?? this.viewport.viewportSize,
          intent.rowHeight ?? this.viewport.rowHeight,
          intent.overscan ?? this.viewport.overscan,
        );
        if (!this.viewport.equals(next)) {
          this.viewport = next;
          this.notifyViewportListeners();
        }
        return;
      }
      case 'UNDO':
        if (!cellUndoStack) return;
        await cellUndoStack.undo(store, (command) => engine.dispatch(command));
        await engine.syncPageWindow(store, tableKey);
        return;
      case 'REDO':
        if (!cellUndoStack) return;
        await cellUndoStack.redo(store, (command) => engine.dispatch(command));
        await engine.syncPageWindow(store, tableKey);
        return;
      default: {
        const _exhaustive: never = intent;
        return _exhaustive;
      }
    }
  }

  async handleKeydown(
    event: KeyboardEvent,
    ctx: { activeRowId: number | null; activeColumnId: string | null },
  ): Promise<void> {
    await this.keyboard.handle(event, ctx);
  }

  getSnapShot(collectionScope: CollectionScope = 'active'): TableSnapShot | null {
    return this.deps.engine.getSnapShot(collectionScope);
  }

  getViewState() {
    return this.deps.engine.getViewState();
  }

  subscribe(cb: () => void): () => void {
    return this.deps.engine.subscribe(cb) ?? (() => {});
  }

  subscribeSelected<TSelected>(
    selector: () => TSelected,
    listener: (selected: TSelected) => void,
    isEqual: (a: TSelected, b: TSelected) => boolean = Object.is,
  ): () => void {
    let current = selector();
    const onChange = () => {
      const next = selector();
      if (!isEqual(current, next)) {
        current = next;
        listener(next);
      }
    };
    const unsubEngine = this.deps.engine.subscribe(onChange) ?? (() => {});
    this.viewportListeners.add(onChange);
    return () => {
      unsubEngine();
      this.viewportListeners.delete(onChange);
    };
  }

  getViewport(): Viewport {
    return this.viewport;
  }

  subscribeViewport(listener: () => void): () => void {
    this.viewportListeners.add(listener);
    return () => {
      this.viewportListeners.delete(listener);
    };
  }

  getVisibleRange(totalRows?: number): VisibleRange {
    const count = totalRows ?? this.deps.engine.getUiRowCount();
    return ViewportCalculator.calculate(count, this.viewport);
  }

  projectVisibleRows<T>(rows: readonly T[], totalRows?: number): T[] {
    const range = this.getVisibleRange(totalRows ?? rows.length);
    return ViewportCalculator.projectRows(rows, range);
  }

  getUiRowCount(): number {
    return this.deps.engine.getUiRowCount();
  }

  projectVisibleUiRows(): NonNullable<ReturnType<TableEngine['getRowView']>>[] {
    return this.deps.engine.projectVisibleUiRows(this.getVisibleRange());
  }

  private notifyViewportListeners(): void {
    for (const listener of this.viewportListeners) listener();
  }

  canUndo(): boolean {
    return this.deps.cellUndoStack?.canUndo() ?? false;
  }

  canRedo(): boolean {
    return this.deps.cellUndoStack?.canRedo() ?? false;
  }

  async undo(): Promise<boolean> {
    if (!this.deps.cellUndoStack) return false;
    const ok = await this.deps.cellUndoStack.undo(this.deps.store, (command) =>
      this.deps.engine.dispatch(command),
    );
    await this.deps.engine.syncPageWindow(this.deps.store, this.deps.tableKey);
    return ok;
  }

  async redo(): Promise<boolean> {
    if (!this.deps.cellUndoStack) return false;
    const ok = await this.deps.cellUndoStack.redo(this.deps.store, (command) =>
      this.deps.engine.dispatch(command),
    );
    await this.deps.engine.syncPageWindow(this.deps.store, this.deps.tableKey);
    return ok;
  }

  getChangelog(filter: Omit<ChangelogQuery, 'tableId'> = {}): ChangelogEntry[] {
    if (!this.deps.changelogProjection) return [];
    return this.deps.changelogProjection.query({
      tableId: this.deps.tableKey,
      ...filter,
    });
  }

  getChangelogCount(filter: Omit<ChangelogQuery, 'tableId'> = {}): number {
    if (!this.deps.changelogProjection) return 0;
    return this.deps.changelogProjection.count({
      tableId: this.deps.tableKey,
      ...filter,
    });
  }

  subscribeChangelog(
    cb: (entries: ChangelogEntry[]) => void,
    filter: Omit<ChangelogQuery, 'tableId'> = {},
  ): () => void {
    if (!this.deps.changelogProjection) return () => {};
    return this.deps.changelogProjection.subscribe(cb, {
      tableId: this.deps.tableKey,
      ...filter,
    });
  }

  getHistoryItems(filter: Omit<HistoryQuery, 'tableId'> = {}): HistoryItem[] {
    if (!this.deps.historyPanelViewModel) return [];
    return this.deps.historyPanelViewModel.query({
      tableId: this.deps.tableKey,
      ...filter,
    });
  }

  getHistoryItemCount(filter: Omit<HistoryQuery, 'tableId'> = {}): number {
    if (!this.deps.historyPanelViewModel) return 0;
    return this.deps.historyPanelViewModel.count({
      tableId: this.deps.tableKey,
      ...filter,
    });
  }

  subscribeHistoryItems(
    cb: (items: HistoryItem[]) => void,
    filter: Omit<HistoryQuery, 'tableId'> = {},
  ): () => void {
    if (!this.deps.historyPanelViewModel) return () => {};
    return this.deps.historyPanelViewModel.subscribe(cb, {
      tableId: this.deps.tableKey,
      ...filter,
    });
  }
}
