import type { PluginHost } from '../../application/plugins/PluginHost';
import type { ColumnDef } from '../../domain/types/ColumnDef';
import { isIndexColumn, resolveColumnWidth } from '../../engine/columnWidth';
import type {
  ColumnPinnedState,
  ColumnStateItem,
} from '../../engine/dataOps/columnState';
import { sortModelFromColumnState } from '../../engine/dataOps/columnState';
import type { SortDirection, SortModel } from '../../engine/dataOps/sortModel';
import type { FilterModel } from '../../engine/dataOps/filterModel';
import type { CellRange } from '../../engine/selection/cellRange';
import type {
  ManualResolution,
  SyncConflict,
  SyncConflictPolicy,
  SyncResult,
} from '../../application/ports/SyncPort';
import type { PresencePeer } from '../../application/ports/PresencePort';
import type { GetRowId } from '../rows/mapRowData';
import type { UITableController } from './UITableController';

export type GridRowNode<TRow = unknown> = {
  id: string;
  rowId: number;
  data: TRow;
};

/** Column layout snapshot (PR-115). Includes pin + sort for persist/restore. */
export type GridColumnState = ColumnStateItem;

export type StartEditingCellParams = {
  rowId: string | number;
  colId: string;
};

export type ExportDataAsExcelOptions = {
  fileName?: string;
};

export type CreateGridApiInput<TRow = unknown> = {
  controller: UITableController;
  pluginHost: PluginHost;
  columnDefs?: ColumnDef<TRow>[];
  getRowId?: GetRowId<TRow>;
  /** Wired when `rowModelType` is infinite/serverSide (PR-102). */
  refreshServerSide?: () => Promise<void>;
};

/**
 * Imperative host API (PR-86). Thin adapter over `UITableController` +
 * `PluginHost`. Does not expose `dispatch` or the full controller surface.
 */
export type GridApi<TRow = unknown> = {
  getRowNode(id: string | number): GridRowNode<TRow> | undefined;
  setRowData(rowData: readonly TRow[]): void;
  refreshCells(): void;
  getSelectedRows(): TRow[];
  deselectAll(): Promise<void>;
  startEditingCell(params: StartEditingCellParams): Promise<void>;
  stopEditing(cancel?: boolean): void | Promise<void>;
  exportDataAsExcel(options?: ExportDataAsExcelOptions): Promise<void>;
  undo(): Promise<boolean>;
  redo(): Promise<boolean>;
  getColumnState(): GridColumnState[];
  applyColumnState(state: readonly GridColumnState[]): Promise<void>;
  setColumnVisible(colId: string, visible: boolean): void;
  /** Measure header + cell text off-DOM and resize columns (PR-112). */
  autoSizeColumns(colIds?: string[]): void;
  /** Scale column widths to fit the scrollport (PR-112). */
  sizeColumnsToFit(containerWidth?: number): void;
  getSortModel(): SortModel;
  setSortModel(sortModel: SortModel): void;
  getQuickFilter(): string;
  setQuickFilter(quickFilterText: string): void;
  getFilterModel(): FilterModel;
  setFilterModel(filterModel: FilterModel): void;
  /** Active row-group columns (PR-120). Only the first is used in 0.12.0. */
  getRowGroupColumns(): string[];
  setRowGroupColumns(columns: readonly string[]): void;
  setGroupDefaultExpanded(expanded: boolean): void;
  toggleRowGroup(groupKey: string): void;
  /** Purge server block cache and refetch (PR-102). */
  refreshServerSide(): Promise<void>;
  /** Current cell ranges in UI row/column space (PR-105). */
  getCellRanges(): readonly CellRange[];
  /** Append a normalized range (PR-105). */
  addCellRange(range: CellRange): void;
  /** Online / offline (PR-137). */
  getConnectivity(): 'online' | 'offline';
  /** Local data mutations not yet marked synced (PR-137). */
  getPendingChangeCount(): number;
  markPendingSynced(eventIds?: readonly string[]): void;
  /** Push/pull sync when `syncTransport` was configured (PR-138). */
  sync(): Promise<SyncResult | null>;
  setSyncPolicy(policy: SyncConflictPolicy): void;
  getSyncPolicy(): SyncConflictPolicy | undefined;
  getOpenSyncConflicts(): readonly SyncConflict[];
  resolveSyncConflict(
    conflictId: string,
    choice: ManualResolution,
  ): Promise<void>;
  /** Remote peers currently broadcasting a cell cursor (PR-139). */
  getPresencePeers(): readonly PresencePeer[];
};

function rowKey(row: { sourceId?: string; id: { value: number } }): string {
  return row.sourceId ?? String(row.id.value);
}

export function createGridApi<TRow = unknown>(
  input: CreateGridApiInput<TRow>,
): GridApi<TRow> {
  const { controller, pluginHost } = input;
  const columnDefs = input.columnDefs;
  const getRowId = input.getRowId;

  const findRow = (id: string | number) => {
    const key = String(id);
    const rows = controller.getAllRows() ?? [];
    return rows.find(
      (row) => row.sourceId === key || String(row.id.value) === key,
    );
  };

  const api: GridApi<TRow> = {
    getRowNode(id) {
      const row = findRow(id);
      if (!row) return undefined;
      return {
        id: rowKey(row),
        rowId: row.id.value,
        data: row.data as TRow,
      };
    },

    setRowData(rowData) {
      controller.applyHostRowData(rowData, columnDefs, getRowId);
    },

    refreshCells() {
      controller.refreshView();
    },

    getSelectedRows() {
      const selected = controller.getSelectedRows() ?? {};
      const rows = controller.getAllRows() ?? [];
      return Object.keys(selected)
        .map(Number)
        .filter((id) => Number.isFinite(id) && Boolean(selected[id]))
        .map((id) => rows.find((row) => row.id.value === id)?.data)
        .filter((data): data is TRow => data !== undefined);
    },

    async deselectAll() {
      await controller.dispatch({ type: 'CLEAR_ROW_SELECTION' });
    },

    async startEditingCell(params) {
      const node = api.getRowNode(params.rowId);
      if (!node) return;
      await controller.dispatch({
        type: 'UI_ACTIVE_CELL',
        rowId: node.rowId,
        columnId: params.colId,
      });
      controller.startCellEdit(node.rowId, params.colId);
    },

    async stopEditing(cancel?: boolean) {
      if (cancel) {
        controller.cancelCellEdit();
        await controller.clearActiveCell(true);
        return;
      }
      await controller.commitCellEdit();
      await controller.clearActiveCell();
    },

    async exportDataAsExcel(options) {
      await pluginHost.requestExport({
        format: 'xlsx',
        fileName: options?.fileName,
      });
    },

    undo() {
      return controller.undo();
    },

    redo() {
      return controller.redo();
    },

    getColumnState() {
      const view = controller.getViewState();
      const widths = view?.columnWidths ?? {};
      const columns = view?.columns ?? [];
      const sortModel = view?.sortModel ?? [];
      return columns.map((col, index) => {
        const sortIdx = sortModel.findIndex((s) => s.colId === col.fieldName);
        const pinned = (col.columnDef?.pinned ?? null) as ColumnPinnedState;
        const item: GridColumnState = {
          colId: col.fieldName,
          hide: Boolean(col.hidden),
          width: resolveColumnWidth(col, widths),
          order: col.order ?? index,
          pinned,
          sort: sortIdx >= 0 ? (sortModel[sortIdx]!.sort as SortDirection) : null,
          sortIndex: sortIdx >= 0 ? sortIdx : null,
        };
        return item;
      });
    },

    async applyColumnState(state) {
      for (const item of state) {
        if (typeof item.width === 'number' && Number.isFinite(item.width)) {
          await controller.dispatch({
            type: 'UI_RESIZE_COLUMN',
            columnId: item.colId,
            width: item.width,
          });
        }
        if (typeof item.hide === 'boolean') {
          await controller.dispatch({
            type: 'UI_SET_COLUMN_VISIBLE',
            columnId: item.colId,
            visible: !item.hide,
          });
        }
        if ('pinned' in item) {
          const pinned =
            item.pinned === 'start' || item.pinned === 'end'
              ? item.pinned
              : null;
          controller.setColumnPinned(item.colId, pinned);
        }
      }

      const desiredMovable = state
        .map((item) => item.colId)
        .filter((colId) => {
          if (isIndexColumn({ fieldName: colId })) return false;
          return api.getColumnState().some((col) => col.colId === colId);
        });
      if (desiredMovable.length >= 2) {
        for (let i = 0; i < desiredMovable.length; i += 1) {
          const now = api.getColumnState();
          const from = now.findIndex((col) => col.colId === desiredMovable[i]);
          const dest = now
            .map((col, idx) => ({ col, idx }))
            .filter(({ col }) => !isIndexColumn({ fieldName: col.colId }))[i]
            ?.idx;
          if (from < 0 || dest === undefined || from === dest) continue;
          await controller.dispatch({
            type: 'COLUMN_REORDERED',
            sourceIndex: from,
            destIndex: dest,
          });
        }
      }

      const nextSort = sortModelFromColumnState(state);
      const currentSort = api.getSortModel();
      const sortChanged =
        nextSort.length !== currentSort.length ||
        nextSort.some(
          (item, i) =>
            item.colId !== currentSort[i]?.colId ||
            item.sort !== currentSort[i]?.sort,
        );
      if (sortChanged) {
        api.setSortModel(nextSort);
      }
    },

    setColumnVisible(colId, visible) {
      controller.setColumnVisible(colId, visible);
    },

    autoSizeColumns(colIds) {
      controller.autoSizeColumns(colIds);
    },

    sizeColumnsToFit(containerWidth) {
      controller.sizeColumnsToFit(containerWidth);
    },

    getSortModel() {
      return controller.getViewState()?.sortModel ?? [];
    },

    setSortModel(sortModel) {
      controller.setSortModel(sortModel);
    },

    getQuickFilter() {
      return controller.getQuickFilterText();
    },

    setQuickFilter(quickFilterText) {
      controller.setQuickFilterText(quickFilterText);
    },

    getFilterModel() {
      return controller.getFilterModel();
    },

    setFilterModel(filterModel) {
      controller.setFilterModel(filterModel);
    },

    getRowGroupColumns() {
      return controller.getRowGroupColumns();
    },

    setRowGroupColumns(columns) {
      controller.setRowGroupColumns(columns);
    },

    setGroupDefaultExpanded(expanded) {
      controller.setGroupDefaultExpanded(expanded);
    },

    toggleRowGroup(groupKey) {
      controller.toggleRowGroup(groupKey);
    },

    async refreshServerSide() {
      await input.refreshServerSide?.();
    },

    getCellRanges() {
      return controller.getCellRanges();
    },

    addCellRange(range) {
      controller.addCellRange(range);
    },

    getConnectivity() {
      return controller.getConnectivity();
    },

    getPendingChangeCount() {
      return controller.getPendingChangeCount();
    },

    markPendingSynced(eventIds) {
      controller.markPendingSynced(eventIds);
    },

    async sync() {
      return controller.syncNow();
    },

    setSyncPolicy(policy) {
      controller.setSyncPolicy(policy);
    },

    getSyncPolicy() {
      return controller.getSyncPolicy();
    },

    getOpenSyncConflicts() {
      return controller.getOpenSyncConflicts();
    },

    async resolveSyncConflict(conflictId, choice) {
      await controller.resolveSyncConflict(conflictId, choice);
    },

    getPresencePeers() {
      return controller.getPresencePeers();
    },
  };

  return api;
}
