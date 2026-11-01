// adapters/ui/UITableController.ts

import { AuditLogger } from '../../application/ports/AuditLogger';
import type { RemoteApi } from '../../application/ports/RemoteApi';
import { Row } from '../../domain/entities/Row';
import {
  CollectionScope,
  Table,
} from '../../domain/entities/Table';
import { TableActions } from '../../domain/value-objects';
import { TableEngine } from '../../engine/tableEngine';
import type { FilterModel } from '../../engine/dataOps/filterModel';
import type { CellRange } from '../../engine/selection/cellRange';
import { MOBILE_PAGE_SIZE } from '../../engine/type';
import type {
  GridSearchState,
  MobileEditorState,
  MobileTableViewState,
  ValidationCallbackResult,
  ValidCell,
} from '../../engine/type';
import type {
  ChangelogEntry,
  ChangelogQuery,
} from '../projections/ChangelogProjection';
import type { ChangelogProjection } from '../projections/ChangelogProjection';
import type {
  HistoryItem,
  HistoryPanelViewModel,
  HistoryQuery,
} from '../history/HistoryPanelViewModel';
import type { CellUndoStack } from '../../application/undo/CellUndoStack';
import type { GridSession } from '../../application/session/GridSession';
import type {
  Connectivity,
  OfflineStatus,
  PendingChange,
} from '../../application/offline/OfflineStatus';
import type {
  ManualResolution,
  SyncConflict,
  SyncConflictPolicy,
  SyncPort,
  SyncResult,
} from '../../application/ports/SyncPort';
import type {
  PresencePeer,
  PresencePort,
} from '../../application/ports/PresencePort';
import { UIRow } from '../../ui/type';
import { UITableCommand } from './uiEvents';
import type { ColumnDef } from '../../domain/types/ColumnDef';
import type { GetRowId } from '../../infrastructure/rows/mapRowData';
import {
  DEFAULT_GRID_CLIPBOARD_OPTIONS,
  type GridClipboardRuntimeOptions,
  type PasteGridResult,
} from './gridClipboard';
import { applyFillHandleDrag } from './gridFillHandle';
import {
  autoSizeColumnWidths,
} from '../../engine/dataOps/columnAutoSize';
import { sizeColumnsToFitWidths } from '../../engine/dataOps/columnLayout';
import { isIndexColumn } from '../../engine/columnWidth';
import { createCanvasMeasureText } from './columnMeasure';

export class UITableController {
  private disposed = false;
  private layoutViewportWidth = 1024;
  private clipboardOptions: GridClipboardRuntimeOptions = {
    ...DEFAULT_GRID_CLIPBOARD_OPTIONS,
  };
  private syncPort?: SyncPort;
  private presencePort?: PresencePort;
  /** Set by releaseResources(); the first call's promise is reused (idempotent). */
  private releasePromise?: Promise<void>;
  private resourceTeardown?: () => void | Promise<void>;
  constructor(
    private readonly engine: TableEngine,
    private readonly store: string,
    private readonly tableKey: string,
    private readonly audit: AuditLogger,
    private readonly changelogProjection?: ChangelogProjection,
    private readonly historyPanelViewModel?: HistoryPanelViewModel,
    private readonly cellUndoStack?: CellUndoStack,
    private readonly session?: GridSession,
    private readonly remoteApi?: RemoteApi,
    private readonly offlineStatus?: OfflineStatus,
  ) {}

  getRemoteApi(): RemoteApi | undefined {
    return this.remoteApi;
  }

  getOfflineStatus(): OfflineStatus | undefined {
    return this.offlineStatus;
  }

  getSyncPort(): SyncPort | undefined {
    return this.syncPort;
  }

  setSyncPort(port: SyncPort | undefined): void {
    if (this.releasePromise) {
      port?.dispose?.();
      return;
    }
    this.syncPort = port;
  }

  getPresencePort(): PresencePort | undefined {
    return this.presencePort;
  }

  setPresencePort(port: PresencePort | undefined): void {
    if (this.releasePromise) {
      port?.dispose();
      return;
    }
    this.presencePort = port;
  }

  /**
   * Composition root hook: the callback that releases every resource the grid
   * created (subscriptions, projections, plugins, owned event store).
   * Run once by {@link releaseResources}.
   */
  setResourceTeardown(teardown: (() => void | Promise<void>) | undefined): void {
    this.resourceTeardown = teardown;
  }

  /** True once resources were released (via releaseResources or dispose). */
  isReleased(): boolean {
    return this.releasePromise !== undefined;
  }

  getPresencePeers(): readonly PresencePeer[] {
    return this.presencePort?.getPeers() ?? [];
  }

  subscribePresencePeers(
    cb: (peers: readonly PresencePeer[]) => void,
  ): () => void {
    if (this.isReleased()) return () => {};
    if (!this.presencePort) {
      cb([]);
      return () => {};
    }
    return this.presencePort.subscribe(cb);
  }

  /** Broadcast local active cell to peers (no-op without presence). */
  publishPresenceCell(rowId: number | null, columnId: string | null): void {
    this.presencePort?.setActiveCell(rowId, columnId);
  }

  getConnectivity(): Connectivity {
    return this.offlineStatus?.getConnectivity() ?? 'online';
  }

  getPendingChangeCount(): number {
    return this.offlineStatus?.getPendingCount() ?? 0;
  }

  getPendingChanges(): readonly PendingChange[] {
    return this.offlineStatus?.getPendingChanges() ?? [];
  }

  markPendingSynced(eventIds?: readonly string[]): void {
    this.offlineStatus?.markSynced(eventIds);
  }

  subscribeConnectivity(cb: (state: Connectivity) => void): () => void {
    if (this.isReleased()) return () => {};
    if (!this.offlineStatus) {
      cb('online');
      return () => {};
    }
    return this.offlineStatus.subscribeConnectivity(cb);
  }

  subscribePendingChanges(
    cb: (items: readonly PendingChange[]) => void,
  ): () => void {
    if (this.isReleased()) return () => {};
    if (!this.offlineStatus) {
      cb([]);
      return () => {};
    }
    return this.offlineStatus.subscribePending(cb);
  }

  getSyncPolicy(): SyncConflictPolicy | undefined {
    return this.syncPort?.getPolicy();
  }

  setSyncPolicy(policy: SyncConflictPolicy): void {
    this.syncPort?.setPolicy(policy);
  }

  getOpenSyncConflicts(): readonly SyncConflict[] {
    return this.syncPort?.getOpenConflicts() ?? [];
  }

  subscribeSyncConflicts(
    cb: (conflicts: readonly SyncConflict[]) => void,
  ): () => void {
    if (this.isReleased()) return () => {};
    if (!this.syncPort) {
      cb([]);
      return () => {};
    }
    return this.syncPort.subscribeConflicts(cb);
  }

  async syncNow(): Promise<SyncResult | null> {
    if (this.isReleased() || !this.syncPort) return null;
    return this.syncPort.sync();
  }

  async resolveSyncConflict(
    conflictId: string,
    choice: ManualResolution,
  ): Promise<void> {
    if (this.isReleased()) return;
    await this.syncPort?.resolveConflict(conflictId, choice);
  }

  /** Apply a remote cell value (used by SyncPort; dual-writes via engine). */
  async applySyncedCellValue(
    rowId: number,
    columnId: string,
    value: unknown,
  ): Promise<void> {
    await this.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
      columnId,
      newValue: value,
    });
  }

  configureClipboard(options: Partial<GridClipboardRuntimeOptions>): void {
    this.clipboardOptions = { ...this.clipboardOptions, ...options };
  }

  getClipboardOptions(): GridClipboardRuntimeOptions {
    return this.clipboardOptions;
  }

  async applyFillHandleDrag(
    extendTo: { rowIndex: number; colIndex: number },
    copyOnly: boolean,
  ): Promise<PasteGridResult> {
    return applyFillHandleDrag(
      this.engine,
      this.store,
      this.tableKey,
      extendTo,
      copyOnly,
      this.clipboardOptions,
    );
  }

  // ─── private dispatch helpers ───────────────────────────────────────

  private safe<T>(fn: () => T, context: string): T | null {
    try {
      return fn();
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: `UITableController error in ${context}`,
        payload: { error, tableKey: this.tableKey },
      });
      return null;
    }
  }

  private changePageSize(pageSize: number): void {
    this.engine.dispatch({ type: 'CHANGE_PAGE_SIZE', store: this.store, tableKey: this.tableKey, pageSize });
  }

  private changePage(page: number): void {
    this.engine.dispatch({ type: 'CHANGE_PAGE', store: this.store, tableKey: this.tableKey, page });
  }

  private onCellChange(rowId: number, columnId: string, value: unknown): void {
    if (this.engine.isEditingCell(rowId, columnId)) {
      this.engine.patchCellEdit(rowId, columnId, { value });
      return;
    }
    // No session (e.g. programmatic / custom cell before activate): write through.
    this.engine.dispatch({ type: 'CHANGE_CELL_VALUE', store: this.store, tableKey: this.tableKey, rowId, columnId, newValue: value });
  }

  private onDescriptionSave(rowId: number, flag: boolean): void {
    this.engine.dispatch({ type: 'SAVE_DESCRIPTION', store: this.store, tableKey: this.tableKey, rowId, flag });
  }

  private onCellDisplayChange(rowId: number, columnId: string, value: string): void {
    if (this.engine.isEditingCell(rowId, columnId)) {
      this.engine.patchCellEdit(rowId, columnId, { display: value });
      return;
    }
    this.engine.dispatch({ type: 'CHANGE_CELL_DISPLAY_VALUE', store: this.store, tableKey: this.tableKey, rowId, columnId, newValue: value });
  }

  private setActiveCell(rowId: number, columnId: string): void {
    const prev = this.engine.getActiveCell();
    if (prev?.rowId === rowId && prev?.columnId === columnId) {
      if (
        this.engine.getCellEditOptions().singleClickEdit &&
        !this.engine.getCellEdit()
      ) {
        this.engine.startCellEdit(rowId, columnId);
      }
      this.publishPresenceCell(rowId, columnId);
      return;
    }
    if (prev?.rowId !== rowId) {
      // سطر عوض شد: شروط visibility ریموتِ سطر تازه‌فعال‌شده دوباره گرفته می‌شود
      // (در حالت ویرایش سطری که مقدار تعیین‌کننده دارد visibilityCondition می‌سازد).
      void this.engine.dispatch({
        type: 'APPLY_ROW_VISIBILITY',
        store: this.store,
        tableKey: this.tableKey,
        rowId,
      });
    }
    this.engine.dispatch({ type: 'ACTIVE_CELL', tableKey: this.tableKey, rowId, columnId });
    this.publishPresenceCell(rowId, columnId);
  }

  private setActiveRow(rowId: number): void {
    this.engine.dispatch({ type: 'ACTIVE_ROW', store: this.store, tableKey: this.tableKey, rowId });
  }

  private moveActiveCellVertical(rowId: number, columnId: string, direction: 'up' | 'down'): void {
    this.engine.dispatch({ type: 'MOVE_ACTIVE_CELL_VERTICAL', store: this.store, tableKey: this.tableKey, rowId, columnId, direction });
  }

  private reorderRow(draggedRowId: number, droppedRowId: number, position: 'before' | 'after'): void {
    this.engine.dispatch({ type: 'ROW_REORDERED', store: this.store, tableKey: this.tableKey, draggedRowId, droppedRowId, position });
  }

  private reorderColumns(sourceIndex: number, destIndex: number): void {
    this.engine.dispatch({
      type: 'COLUMN_REORDERED',
      store: this.store,
      tableKey: this.tableKey,
      sourceIndex,
      destIndex,
    });
  }

  private async addEmptyRow(): Promise<void> {
    await this.engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      store: this.store,
      tableKey: this.tableKey,
      autoActivate: true,
    });
  }

  private async openMobileAddEditor(): Promise<void> {
    await this.addEmptyRow();
    const rowId = this.engine.getActiveRow();
    if (rowId != null) {
      this.setMobileEditor({ mode: 'add', rowId });
    }
  }

  private addNewRows(cmd: { rows: { key: string; value: unknown; display: unknown }[][]; detailFieldKey: string }): void {
    this.engine.dispatch({ type: 'ADD_NEW_ROWS', store: this.store, tableKey: this.tableKey, rows: cmd.rows, detailFieldKey: cmd.detailFieldKey });
  }

  private duplicateRow(rowId: number): void {
    this.engine.dispatch({ type: 'DUPLICATE_ROW', store: this.store, tableKey: this.tableKey, rowId });
  }

  private deleteRow(rowId: number): void {
    this.engine.dispatch({ type: 'ROW_DELETED', store: this.store, tableKey: this.tableKey, rowId });
  }

  private deleteRows(): void {
    this.engine.dispatch({ type: 'ROWS_DELETED', store: this.store, tableKey: this.tableKey });
  }

  private deleteTable(): void {
    this.engine.dispatch({ type: 'TABLE_DELETED', store: this.store, tableKey: this.tableKey });
  }

  private async registerTable(table: Table): Promise<void> {
    await this.engine.dispatch({
      type: 'TABLE_REGISTERED',
      store: this.store,
      tableKey: this.tableKey,
      table,
    });
  }

  private async toggleRowExpanded(rowId: number): Promise<void> {
    await this.engine.dispatch({ type: 'ROW_EXPAND_TOGGLED', tableKey: this.tableKey, rowId });
  }

  private async toggleRowSelect(): Promise<void> {
    await this.engine.dispatch({
      type: 'TOGGLE_SELECT_ALL_ROWS',
      store: this.store,
      tableKey: this.tableKey,
    });
  }

  private async togglePageRowSelect(): Promise<void> {
    await this.engine.dispatch({ type: 'TOGGLE_SELECT_PAGE_ROWS', tableKey: this.tableKey });
  }

  private async clearRowSelection(): Promise<void> {
    await this.engine.dispatch({ type: 'CLEAR_ROW_SELECTION', tableKey: this.tableKey });
  }

  private selectFromActiveToLast(activeRowId: number): void {
    if (activeRowId == null) return;
    this.engine.dispatch({ type: 'SELECT_FROM_ACTIVE_TO_LAST', tableKey: this.tableKey, anchorRowId: activeRowId });
  }

  private activateFirstEditableCell(rowId: number): void {
    this.engine.dispatch({ type: 'ACTIVATE_FIRST_CELL', tableKey: this.tableKey, rowId });
  }

  private moveToNextCell(rowId: number, columnId: string, direction: 'next' | 'prev' = 'next'): void {
    this.engine.dispatch({ type: 'MOVE_ACTIVE_CELL', store: this.store, tableKey: this.tableKey, rowId, columnId, direction });
  }

  private async setTableAction(action: TableActions): Promise<void> {
    await this.engine.dispatch({ type: 'SET_TABLE_ACTION', store: this.store, tableKey: this.tableKey, action });
  }

  private async setActiveCollection(activeCollection: string): Promise<void> {
    await this.engine.dispatch({ type: 'SET_ACTIVE_COLLECTION', store: this.store, tableKey: this.tableKey, activeCollection });
  }

  private setGridSearch(search: GridSearchState): void {
    this.engine.dispatch({ type: 'SET_GRID_SEARCH', tableKey: this.tableKey, search });
  }

  private setMobileEditor(editor: MobileEditorState): void {
    this.engine.dispatch({ type: 'SET_MOBILE_EDITOR', tableKey: this.tableKey, editor });
  }

  private resizeColumn(columnId: string, width: number): void {
    this.engine.dispatch({ type: 'RESIZE_COLUMN', tableKey: this.tableKey, columnId, width });
  }

  setColumnVisible(columnId: string, visible: boolean): void {
    this.engine.dispatch({
      type: 'SET_COLUMN_VISIBLE',
      tableKey: this.tableKey,
      columnId,
      visible,
    });
  }

  setLayoutViewportWidth(width: number): void {
    if (Number.isFinite(width) && width > 0) {
      this.layoutViewportWidth = width;
    }
  }

  getLayoutViewportWidth(): number {
    return this.layoutViewportWidth;
  }

  /** Measure header + cell text off-DOM and resize columns (PR-112). */
  autoSizeColumns(colIds?: string[]): void {
    const view = this.getViewState();
    if (!view) return;
    const measure = createCanvasMeasureText();
    const visible = view.columns.filter((c) => !c.hidden);
    const targets = colIds?.length
      ? visible.filter((c) => colIds.includes(c.fieldName))
      : visible.filter((c) => !isIndexColumn(c));
    const widths = autoSizeColumnWidths(targets, view.rows, measure, colIds);
    for (const [columnId, width] of Object.entries(widths)) {
      this.resizeColumn(columnId, width);
    }
  }

  setColumnPinned(columnId: string, pinned: 'start' | 'end' | null): void {
    this.engine.dispatch({
      type: 'SET_COLUMN_PIN',
      tableKey: this.tableKey,
      columnId,
      pinned,
    });
  }

  toggleColumnGroup(groupId: string): void {
    this.engine.dispatch({
      type: 'TOGGLE_COLUMN_GROUP',
      tableKey: this.tableKey,
      groupId,
    });
  }

  /** Scale column widths to fit the last known scrollport width (PR-112). */
  sizeColumnsToFit(containerWidth?: number): void {
    const view = this.getViewState();
    if (!view) return;
    const width = containerWidth ?? this.layoutViewportWidth;
    const widths = sizeColumnsToFitWidths(view.columns, view.columnWidths, width);
    for (const [columnId, w] of Object.entries(widths)) {
      this.resizeColumn(columnId, w);
    }
  }

  /** Session-only sort (PR-90). Empty model restores document `index` order. */
  setSortModel(
    sortModel: readonly { colId: string; sort: 'asc' | 'desc' }[],
  ): void {
    this.safe(
      () =>
        this.engine.dispatch({
          type: 'SET_SORT_MODEL',
          tableKey: this.tableKey,
          sortModel,
        }),
      'setSortModel',
    );
  }

  /** Session-only quick filter (PR-93). Empty string shows all rows. */
  setQuickFilterText(quickFilterText: string): void {
    this.safe(
      () =>
        this.engine.dispatch({
          type: 'SET_QUICK_FILTER_TEXT',
          tableKey: this.tableKey,
          quickFilterText,
        }),
      'setQuickFilterText',
    );
  }

  getQuickFilterText(): string {
    return this.safe(
      () => this.engine.getViewState()?.quickFilterText ?? '',
      'getQuickFilterText',
    ) ?? '';
  }

  /** Session-only column filter model (PR-94). */
  setFilterModel(filterModel: FilterModel): void {
    this.safe(
      () =>
        this.engine.dispatch({
          type: 'SET_FILTER_MODEL',
          tableKey: this.tableKey,
          filterModel,
        }),
      'setFilterModel',
    );
  }

  /** Session-only row grouping (PR-120). Only the first column is active. */
  setRowGroupColumns(columns: readonly string[]): void {
    this.safe(
      () =>
        this.engine.dispatch({
          type: 'SET_ROW_GROUP_COLUMNS',
          tableKey: this.tableKey,
          columns,
        }),
      'setRowGroupColumns',
    );
  }

  getRowGroupColumns(): string[] {
    return (
      this.safe(
        () => this.engine.getViewState()?.rowGroupColumns ?? [],
        'getRowGroupColumns',
      ) ?? []
    );
  }

  setGroupDefaultExpanded(expanded: boolean): void {
    this.safe(
      () =>
        this.engine.dispatch({
          type: 'SET_GROUP_DEFAULT_EXPANDED',
          tableKey: this.tableKey,
          expanded,
        }),
      'setGroupDefaultExpanded',
    );
  }

  toggleRowGroup(groupKey: string): void {
    this.safe(
      () =>
        this.engine.dispatch({
          type: 'TOGGLE_ROW_GROUP',
          tableKey: this.tableKey,
          groupKey,
        }),
      'toggleRowGroup',
    );
  }

  getFilterModel(): FilterModel {
    return (
      this.safe(
        () => this.engine.getViewState()?.filterModel ?? {},
        'getFilterModel',
      ) ?? {}
    );
  }

  // ─── public read API ────────────────────────────────────────────────

  getViewState() {
    return this.safe(() => this.engine.getViewState(), 'getViewState');
  }

  applyHostRowData<TRow>(
    rowData: readonly TRow[],
    columnDefs?: ColumnDef<TRow>[],
    getRowId?: GetRowId<TRow>,
  ): void {
    this.safe(
      () => this.engine.applyHostRowData(rowData, columnDefs, getRowId),
      'applyHostRowData',
    );
  }

  getMobileViewState(): MobileTableViewState | null | undefined {
    return this.safe(
      () => this.engine.getMobileViewState(),
      'getMobileViewState',
    );
  }

  getRowView(rowId: number): UIRow | null {
    return this.safe(() => this.engine.getRowView(rowId), 'getRowView');
  }

  getAllRows(): Row[] | null {
    return this.safe(() => this.engine.getAllRows(), 'getAllRows');
  }

  getAllUIRows() {
    return this.safe(() => this.engine.getAllUIRows(), 'getAllUIRows');
  }

  getUiRowAbsoluteIndex(rowId: number): number {
    return this.safe(
      () => this.engine.getUiRowAbsoluteIndex(rowId),
      'getUiRowAbsoluteIndex',
    ) ?? -1;
  }

  findColumnSearchMatches(columnId: string, query: string) {
    return (
      this.safe(
        () => this.engine.findColumnSearchMatches(columnId, query),
        'findColumnSearchMatches',
      ) ?? []
    );
  }

  getColumnTotals(): Record<string, number> {
    return this.safe(() => this.engine.getColumnTotals(), 'getColumnTotals') ?? {};
  }

  getColumnAggs(): Record<string, unknown> {
    return this.safe(() => this.engine.getColumnAggs(), 'getColumnAggs') ?? {};
  }

  getColumnAggValue(
    columnId: string,
    overrideAgg?: import('../../domain/types/ColumnDef').AggFunc,
  ): unknown {
    return this.safe(
      () => this.engine.getColumnAggValue(columnId, overrideAgg),
      'getColumnAggValue',
    );
  }

  subscribeColumnTotals(cb: (totals: Record<string, number>) => void) {
    return this.safe(() => this.engine.subscribeColumnTotals(cb), 'subscribeColumnTotals');
  }

  subscribeColumnAggs(cb: (aggs: Record<string, unknown>) => void) {
    return this.safe(() => this.engine.subscribeColumnAggs(cb), 'subscribeColumnAggs');
  }

  getSnapShot(collectionScope?: CollectionScope) {
    return this.safe(() => this.engine.getSnapShot(collectionScope ?? "active"), 'getSnapShot');
  }

  /** True in persistence 'paged-idb' mode (RAM holds one page window). */
  isPagedWindow(): boolean {
    return this.engine.isPagedWindow();
  }

  /** Full IndexedDB snapshot for server save / export. */
  async getFullSnapShot(collectionScope?: CollectionScope) {
    try {
      return await this.engine.getFullSnapShot(
        this.store,
        collectionScope ?? 'active',
      );
    } catch (e) {
      this.audit.log({
        type: 'ERROR',
        message: 'getFullSnapShot failed',
        payload: e,
      });
      return null;
    }
  }

  /**
   * Stream serialized row records from IndexedDB in bounded batches (no full
   * load). Heap holds one batch at a time. Return false from onBatch to stop.
   */
  async iterateRowsFromDb(
    collectionScope: CollectionScope,
    onBatch: (
      records: {
        rowId: number;
        collection: string;
        sortIndex: number;
        rowState: string;
        cells: Record<string, { value: unknown; originalValue: unknown; display: unknown }>;
      }[],
      ordinalBase: number,
    ) => Promise<boolean | void>,
    batchSize?: number,
  ): Promise<void> {
    try {
      await this.engine.iterateRowsFromDb(
        this.store,
        collectionScope,
        onBatch,
        batchSize,
      );
    } catch (e) {
      this.audit.log({
        type: 'ERROR',
        message: 'iterateRowsFromDb failed',
        payload: e,
      });
    }
  }

  getCell(rowId: number, columnId: string) {
    return this.safe(() => this.engine.getCell(rowId, columnId), 'getCell');
  }

  getChangelog(filter: Omit<ChangelogQuery, 'tableId'> = {}): ChangelogEntry[] {
    if (!this.changelogProjection) return [];
    return this.safe(
      () => this.changelogProjection!.query({ tableId: this.tableKey, ...filter }),
      'getChangelog',
    ) ?? [];
  }

  getChangelogCount(filter: Omit<ChangelogQuery, 'tableId'> = {}): number {
    if (!this.changelogProjection) return 0;
    return this.safe(
      () => this.changelogProjection!.count({ tableId: this.tableKey, ...filter }),
      'getChangelogCount',
    ) ?? 0;
  }

  subscribeChangelog(
    cb: (entries: ChangelogEntry[]) => void,
    filter: Omit<ChangelogQuery, 'tableId'> = {},
  ): () => void {
    if (!this.changelogProjection || this.isReleased()) return () => {};
    return this.safe(
      () => this.changelogProjection!.subscribe(cb, { tableId: this.tableKey, ...filter }),
      'subscribeChangelog',
    ) ?? (() => {});
  }

  getHistoryItems(filter: Omit<HistoryQuery, 'tableId'> = {}): HistoryItem[] {
    if (!this.historyPanelViewModel) return [];
    return this.safe(
      () => this.historyPanelViewModel!.query({ tableId: this.tableKey, ...filter }),
      'getHistoryItems',
    ) ?? [];
  }

  getHistoryItemCount(filter: Omit<HistoryQuery, 'tableId'> = {}): number {
    if (!this.historyPanelViewModel) return 0;
    return this.safe(
      () => this.historyPanelViewModel!.count({ tableId: this.tableKey, ...filter }),
      'getHistoryItemCount',
    ) ?? 0;
  }

  subscribeHistoryItems(
    cb: (items: HistoryItem[]) => void,
    filter: Omit<HistoryQuery, 'tableId'> = {},
  ): () => void {
    if (!this.historyPanelViewModel || this.isReleased()) return () => {};
    return this.safe(
      () => this.historyPanelViewModel!.subscribe(cb, { tableId: this.tableKey, ...filter }),
      'subscribeHistoryItems',
    ) ?? (() => {});
  }

  canUndo(): boolean {
    return this.cellUndoStack?.canUndo() ?? false;
  }

  canRedo(): boolean {
    return this.cellUndoStack?.canRedo() ?? false;
  }

  async undo(): Promise<boolean> {
    if (!this.cellUndoStack) return false;
    try {
      return await this.cellUndoStack.undo(this.store, (command) =>
        this.engine.dispatch(command),
      );
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: 'UITableController.undo failed',
        payload: { error, tableKey: this.tableKey },
      });
      return false;
    }
  }

  async redo(): Promise<boolean> {
    if (!this.cellUndoStack) return false;
    try {
      return await this.cellUndoStack.redo(this.store, (command) =>
        this.engine.dispatch(command),
      );
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: 'UITableController.redo failed',
        payload: { error, tableKey: this.tableKey },
      });
      return false;
    }
  }

  getActiveRow() {
    return this.safe(() => this.engine.getActiveRow(), 'getActiveRow');
  }

  getSelectedRows(): Record<number, boolean> | null | undefined {
    return this.safe(() => this.engine.getSelectedRows(), 'getSelectedRows');
  }

  getActiveCell() {
    return this.safe(() => this.engine.getActiveCell(), 'getActiveCell');
  }

  refreshView(): void {
    this.safe(() => this.engine.refreshView(), 'refreshView');
  }

  clearActiveCell(cancel?: boolean): Promise<void> {
    return (
      this.safe(
        () => this.engine.clearActiveCell({ cancel: cancel === true }),
        'clearActiveCell',
      ) ?? Promise.resolve()
    );
  }

  startCellEdit(rowId: number, columnId: string): void {
    this.safe(() => this.engine.startCellEdit(rowId, columnId), 'startCellEdit');
  }

  cancelCellEdit(): void {
    this.safe(() => this.engine.cancelCellEdit(), 'cancelCellEdit');
  }

  commitCellEdit(): Promise<number> {
    return (
      this.safe(() => this.engine.commitCellEdit(), 'commitCellEdit') ??
      Promise.resolve(0)
    );
  }

  getEditDraft(rowId: number, columnId: string) {
    return this.safe(
      () => this.engine.getEditDraft(rowId, columnId),
      'getEditDraft',
    );
  }

  isEditingCell(rowId: number, columnId: string) {
    return (
      this.safe(
        () => this.engine.isEditingCell(rowId, columnId),
        'isEditingCell',
      ) ?? false
    );
  }
  getMobileEditor(){
    return this.safe(() => this.engine.getMobileEditor(), 'getMobileEditor');
  }

  resetMobileVisibleRows(size: number = MOBILE_PAGE_SIZE): void {
    this.changePageSize(size);
  }

  loadMoreMobileRows(step: number = MOBILE_PAGE_SIZE): void {
    const mobileView = this.getMobileViewState();
    if (!mobileView) return;
    const nextPageSize = Math.min(
      mobileView.totalRows,
      mobileView.pageSize + step,
    );
    if (nextPageSize !== mobileView.pageSize) {
      this.changePageSize(nextPageSize);
    }
  }

  revealAllMobileRows(minSize: number = MOBILE_PAGE_SIZE): void {
    const mobileView = this.getMobileViewState();
    if (!mobileView) return;
    const nextPageSize = Math.max(minSize, mobileView.totalRows);
    if (nextPageSize !== mobileView.pageSize) {
      this.changePageSize(nextPageSize);
    }
  }

  isActiveCell(rowId: number, columnId: string) {
    return this.safe(() => this.engine.isActiveCell(rowId, columnId), 'isActiveCell');
  }

  isActiveRow(rowId: number) {
    return this.safe(() => this.engine.isActiveRow(rowId), 'isActiveRow');
  }

  isSelectedRow(rowId: number) {
    return this.safe(() => this.engine.isSelectedRow(rowId), 'isSelectedRow');
  }

  isCutRow(rowId: number) {
    return this.safe(() => this.engine.isCutRow(rowId), 'isCutRow');
  }

  subscribe(cb: () => void) {
    return this.safe(() => this.engine.subscribe(cb), 'subscribe');
  }

  subscribeSelected<TSelected>(
    selector: () => TSelected,
    listener: (selected: TSelected) => void,
    isEqual: (a: TSelected, b: TSelected) => boolean = Object.is,
  ): () => void {
    if (this.session) {
      return this.session.subscribeSelected(selector, listener, isEqual);
    }
    return (
      this.safe(
        () => this.engine.subscribeSelected(selector, listener, isEqual),
        'subscribeSelected',
      ) ?? (() => {})
    );
  }

  getSession(): GridSession | undefined {
    return this.session;
  }

  getTableKey(): string {
    return this.tableKey;
  }

  /**
   * Streamed column subscription (Memory Iron Rule compliant): every row's
   * {id, rowNum, value} is folded into  via  (heap = one batch,
   * never the full dataset);  fires only when the column data changed.
   *
   * Legacy form  (cb receives the
   * item array) is still supported.
   */
  subscribeColumn<T>(
    columnId: string,
    collections: CollectionScope,
    reducer: (acc: T, item: { id: number; rowNum: unknown; value: unknown }) => T,
    seed: T,
    cb: (acc: T) => void,
  ): (() => void) | null;
  subscribeColumn<T>(
    columnId: string,
    collections: CollectionScope,
    cb: (values: Array<{ id: number; rowNum: unknown; value: T }>) => void,
  ): (() => void) | null;
  subscribeColumn(
    columnId: string,
    collections: CollectionScope,
    ...rest: unknown[]
  ): (() => void) | null {
    if (rest.length === 1 && typeof rest[0] === 'function') {
      const legacyCb = rest[0] as (
        values: Array<{ id: number; rowNum: unknown; value: unknown }>,
      ) => void;
      return this.engine.subscribeColumn<
        Array<{ id: number; rowNum: unknown; value: unknown }>
      >(
        columnId,
        collections,
        (acc, item) => {
          acc.push(item);
          return acc;
        },
        [] as Array<{ id: number; rowNum: unknown; value: unknown }>,
        legacyCb,
        this.store,
      );
    }
    const [reducer, seed, cb] = rest as [
      (acc: unknown, item: { id: number; rowNum: unknown; value: unknown }) => unknown,
      unknown,
      (acc: unknown) => void,
    ];
    return this.engine.subscribeColumn(
      columnId,
      collections,
      reducer,
      seed,
      cb,
      this.store,
    );
  }
  validation: () => (callback: (result: ValidationCallbackResult) => void) => void = () => (callback) => {
    this.engine.validation((result) => {
      callback(result);
    });
  }
  isValidCell(rowId: number, columnId: string): ValidCell | null {
    try {
      return this.engine.isValidCell(rowId, columnId);
    } catch {
      return null;
    }
  }

  // ─── row interactions ────────────────────────────────────────────────

  onRowClick(rowId: number, modifiers: { ctrlKey: boolean; shiftKey: boolean }): void {
    if (modifiers.shiftKey) {
      this.engine.dispatch({ type: 'ROW_RANGE_SELECTED', tableKey: this.tableKey, rowId });
    } else if (modifiers.ctrlKey) {
      this.engine.dispatch({ type: 'ROW_SELECTION_TOGGLED', tableKey: this.tableKey, rowId });
    } else {
      this.engine.dispatch({ type: 'ACTIVE_ROW', store: this.store, tableKey: this.tableKey, rowId });
    }
  }

  onRowSelect(rowId: number): void {
    this.engine.dispatch({ type: 'ROW_SELECTION_TOGGLED', tableKey: this.tableKey, rowId });
  }

  getCellRanges() {
    return this.engine.getCellRanges();
  }

  addCellRange(range: CellRange): void {
    this.engine.addCellRange(range);
  }

  // ─── lifecycle ───────────────────────────────────────────────────────

  /**
   * Full dispose: `TABLE_DISPOSED` (windowed repo: drop the RAM page window,
   * other repos: `repo.delete` — unchanged data semantics) followed by
   * {@link releaseResources}. Idempotent; the promise settles once teardown
   * finished and never rejects.
   */
  dispose(): Promise<void> {
    if (this.disposed) return this.releasePromise ?? this.releaseResources();
    this.disposed = true;
    this.presencePort?.dispose();
    this.presencePort = undefined;
    const dispatched = this.engine
      .dispatch({ type: 'TABLE_DISPOSED', store: this.store, tableKey: this.tableKey })
      .catch((error: unknown) => {
        this.audit.log({
          type: 'ERROR',
          message: 'UITableController.dispose: TABLE_DISPOSED failed',
          payload: { error, tableKey: this.tableKey },
        });
      });
    return dispatched.then(() => this.releaseResources());
  }

  /**
   * Resource-only teardown: stops subscriptions, projections, sync, presence,
   * plugins, server row model and closes an event store the grid opened.
   * Does NOT dispatch `TABLE_DISPOSED` — persisted table data is untouched.
   * Idempotent (same promise on every call); never rejects.
   */
  releaseResources(): Promise<void> {
    if (!this.releasePromise) {
      this.releasePromise = this.runResourceTeardown();
    }
    return this.releasePromise;
  }

  private async runResourceTeardown(): Promise<void> {
    const fail = (what: string, error: unknown): void => {
      this.audit.log({
        type: 'ERROR',
        message: `UITableController.releaseResources: ${what} failed`,
        payload: { error, tableKey: this.tableKey },
      });
    };
    // Detach ports first so nothing re-enters them during teardown.
    const presence = this.presencePort;
    const sync = this.syncPort;
    this.presencePort = undefined;
    this.syncPort = undefined;
    try {
      presence?.dispose();
    } catch (error) {
      fail('presence dispose', error);
    }
    try {
      sync?.dispose?.();
    } catch (error) {
      fail('sync dispose', error);
    }
    try {
      await this.resourceTeardown?.();
    } catch (error) {
      fail('teardown', error);
    }
  }

  // ─── main dispatch ───────────────────────────────────────────────────

  async dispatch(command: UITableCommand): Promise<void> {
    if (this.disposed) return;
    try {
      await this.dispatchInternal(command);
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: `UITableController.dispatch failed for command "${command.type}"`,
        payload: { error, tableKey: this.tableKey, command },
      });
    }
  }

  private async dispatchInternal(command: UITableCommand): Promise<void> {
    switch (command.type) {
      case 'CHANGE_PAGE_SIZE':
        this.changePageSize(command.pageSize);
        return;
      case 'CHANGE_PAGE':
        this.changePage(command.page);
        return;
      case 'UI_CELL_CHANGE':
        this.onCellChange(command.rowId, command.columnId, command.value);
        return;
      case 'UI_DESCRIPTION_SAVE':
        this.onDescriptionSave(command.rowId, command.flag);
        return;
      case 'UI_CELL_CHANGE_DISPLAY':
        this.onCellDisplayChange(command.rowId, command.columnId, command.value);
        return;
      case 'ADD_EMPTY_ROW':
        await this.addEmptyRow();
        return;
      case 'ADD_NEW_ROWS':
        this.addNewRows(command);
        return;
      case 'DUPLICATE_ROW':
        this.duplicateRow(command.rowId);
        return;
      case 'ROW_DELETED':
        this.deleteRow(command.rowId);
        return;
      case 'UI_DELETE_SELECTED_ROW':
        this.deleteRows();
        return;
      case 'TABLE_DELETED':
        this.deleteTable();
        return;
      case 'TOGGLE_ROW_EXPANDED':
        await this.toggleRowExpanded(command.rowId);
        return;
      case 'ROW_REORDERED':
        this.reorderRow(command.draggedRowId, command.droppedRowId, command.position);
        return;
      case 'COLUMN_REORDERED':
        this.reorderColumns(command.sourceIndex, command.destIndex);
        return;
      case 'TABLE_REGISTERED':
        await this.registerTable(command.table);
        return;
      case 'UI_ACTIVE_FIRST_CELL':
        this.activateFirstEditableCell(command.rowId);
        return;
      case 'UI_ACTIVE_CELL':
        this.engine.handleCellRangePointer(command.rowId, command.columnId, {
          shiftKey: Boolean(command.shiftKey),
          ctrlKey: Boolean(command.ctrlKey),
        });
        this.setActiveCell(command.rowId, command.columnId);
        return;
      case 'UI_MOVE_ACTIVE_CELL':
        this.moveToNextCell(command.rowId, command.columnId, command.direction);
        return;
      case 'UI_MOVE_ACTIVE_CELL_VERTICAL':
        this.moveActiveCellVertical(command.rowId, command.columnId, command.direction);
        return;
      case 'UI_ACTIVE_ROW':
        this.setActiveRow(command.rowId);
        return;
      case 'KEY_DOWN':
        if (this.session) {
          await this.session.handleKeydown(command.event, command.ctx);
        }
        return;
      case 'TOGGLE_ROW_SELECTED':
        await this.toggleRowSelect();
        return;
      case 'ROW_SELECTED':
        await this.toggleRowSelect();
        return;
      case 'TOGGLE_PAGE_ROW_SELECTED':
        await this.togglePageRowSelect();
        return;
      case 'CLEAR_ROW_SELECTION':
        await this.clearRowSelection();
        return;
      case 'UI_ACTION_TABLE':
        await this.setTableAction(command.action);
        return;
      case 'UI_CHANGE_ACTIVE_COLLECTION':
        await this.setActiveCollection(command.activeCollection);
        return;
      case 'UI_SET_GRID_SEARCH':
        this.setGridSearch(command.search);
        return;
      case 'UI_CLEAR_GRID_SEARCH':
        this.setGridSearch(null);
        return;
      case 'UI_OPEN_MOBILE_ADD':
        await this.openMobileAddEditor();
        return;
      case 'UI_OPEN_MOBILE_EDIT':
        this.setActiveRow(command.rowId);
        this.setMobileEditor({ mode: 'edit', rowId: command.rowId });
        return;
      case 'UI_CLOSE_MOBILE_EDITOR':
        this.setMobileEditor(null);
        return;
      case 'UI_RESIZE_COLUMN':
        this.resizeColumn(command.columnId, command.width);
        return;
      case 'UI_SET_COLUMN_VISIBLE':
        this.setColumnVisible(command.columnId, command.visible);
        return;
      case 'UI_SET_SORT_MODEL':
        this.setSortModel(command.sortModel);
        return;
      case 'UI_SET_QUICK_FILTER_TEXT':
        this.setQuickFilterText(command.quickFilterText);
        return;
      case 'UI_SET_FILTER_MODEL':
        this.setFilterModel(command.filterModel);
        return;
      case 'UI_SET_ROW_GROUP_COLUMNS':
        this.setRowGroupColumns(command.columns);
        return;
      case 'UI_SET_GROUP_DEFAULT_EXPANDED':
        this.setGroupDefaultExpanded(command.expanded);
        return;
      case 'UI_TOGGLE_ROW_GROUP':
        this.toggleRowGroup(command.groupKey);
        return;
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  }
}