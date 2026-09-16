// hooks/useERPTable.ts
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { GridSession } from '../application/session/GridSession';
import type { PluginHost } from '../application/plugins/PluginHost';
import type { EventStore } from '../application/ports/EventStore';
import { createGrid } from '../bootstrap';
import {
  createGridTableKey,
  DEFAULT_MEMORY_STORE,
  isPersistentStore,
} from '../bootstrap/defaults';
import type { CreateERPTableConfig } from '../bootstrap/type';
import { flattenColDefOrGroup } from '../infrastructure/columns/flattenColumnDefs';
import type { TableSnapShot } from '../engine/type';
import type {
  HistoryItem,
  HistoryQuery,
} from '../infrastructure/history/HistoryPanelViewModel';
import type {
  ChangelogEntry,
  ChangelogQuery,
} from '../infrastructure/projections/ChangelogProjection';
import type { GridApi } from '../infrastructure/ui/createGridApi';
import {
  UITableController,
} from '../infrastructure/ui/UITableController';

export type UseGridResult<TRow = unknown> =
  | { ready: false }
  | {
    ready: true;
    controller: UITableController;
    api: GridApi<TRow>;
    session: GridSession;
    pluginHost: PluginHost;
    eventStore: EventStore;
    store: string;
    tableKey: string;
    rows: TableSnapShot;
    changelog: ChangelogEntry[];
    changelogCount: number;
    historyItems: HistoryItem[];
    historyItemCount: number;
    canUndo: boolean;
    canRedo: boolean;
    getChangelog: (
      filter?: Omit<ChangelogQuery, 'tableId'>
    ) => ChangelogEntry[];
    getHistoryItems: (
      filter?: Omit<HistoryQuery, 'tableId'>
    ) => HistoryItem[];
    subscribeChangelog: (
      cb: (entries: ChangelogEntry[]) => void,
      filter?: Omit<ChangelogQuery, 'tableId'>
    ) => () => void;
    subscribeHistoryItems: (
      cb: (items: HistoryItem[]) => void,
      filter?: Omit<HistoryQuery, 'tableId'>
    ) => () => void;
    subscribeSelected: GridSession['subscribeSelected'];
    getViewport: GridSession['getViewport'];
    getVisibleRange: GridSession['getVisibleRange'];
    projectVisibleRows: GridSession['projectVisibleRows'];
    getUiRowCount: GridSession['getUiRowCount'];
    projectVisibleUiRows: GridSession['projectVisibleUiRows'];
    changeViewport: (input: {
      scrollOffset: number;
      viewportSize?: number;
      rowHeight?: number;
      overscan?: number;
    }) => Promise<void>;
    undo: () => Promise<boolean>;
    redo: () => Promise<boolean>;
  };

/** @deprecated Use {@link UseGridResult}. Removed in 1.0.0. */
export type UseERPTableResult<TRow = unknown> = UseGridResult<TRow>;

export function useGrid<TRow = unknown>(
  config: CreateERPTableConfig<TRow>
): UseGridResult<TRow> {
  const generatedKeyRef = useRef<string | undefined>(undefined);
  if (config.tableKey) {
    generatedKeyRef.current = config.tableKey;
  } else if (!generatedKeyRef.current) {
    generatedKeyRef.current = createGridTableKey();
  }
  const tableKey = generatedKeyRef.current;

  const [controller, setController] =
    useState<UITableController | null>(null);
  const [api, setApi] = useState<GridApi<TRow> | null>(null);
  const [session, setSession] = useState<GridSession | null>(null);
  const [pluginHost, setPluginHost] = useState<PluginHost | null>(null);
  const [rows, setRows] = useState<TableSnapShot | null>(null);
  const [, setViewVersion] = useState(0);
  const [undoFlags, setUndoFlags] = useState({ canUndo: false, canRedo: false });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  const grid = useMemo(
    () => createGrid({ ...config, tableKey }),
    [tableKey, config.columns, config.columnDefs, config.store],
  );

  // ---------- bootstrap ----------
  useEffect(() => {
    let cancelled = false;
    setController(null);
    setApi(null);
    setSession(null);
    setPluginHost(null);
    setRows(null);

    void grid.ready.then((result) => {
      if (!cancelled) {
        setController(result.controller);
        setApi(result.api);
        setSession(result.session);
        setPluginHost(result.pluginHost);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [grid]);

  useEffect(() => {
    if (!controller || config.rowData === undefined) return;
    controller.applyHostRowData(
      config.rowData,
      config.columnDefs,
      config.getRowId,
    );
  }, [controller, config.rowData, config.columnDefs, config.getRowId]);

  useEffect(() => {
    if (!controller || !config.columnDefs) return;
    for (const def of flattenColDefOrGroup(config.columnDefs)) {
      if (def.hide === undefined) continue;
      const colId =
        typeof def.colId === 'string' && def.colId.length > 0
          ? def.colId
          : typeof def.field === 'string'
            ? def.field
            : null;
      if (!colId) continue;
      controller.setColumnVisible(colId, !def.hide);
    }
  }, [controller, config.columnDefs]);

  useEffect(() => {
    if (!controller || config.quickFilterText === undefined) return;
    controller.setQuickFilterText(config.quickFilterText);
  }, [controller, config.quickFilterText]);

  useEffect(() => {
    if (!controller || config.groupBy === undefined) return;
    const cols =
      typeof config.groupBy === 'string'
        ? [config.groupBy]
        : [...config.groupBy];
    controller.setRowGroupColumns(cols);
  }, [controller, config.groupBy]);

  useEffect(() => {
    if (!controller || config.groupDefaultExpanded === undefined) return;
    controller.setGroupDefaultExpanded(config.groupDefaultExpanded);
  }, [controller, config.groupDefaultExpanded]);

  // Snapshot equality skips selection / active-row / expand because those live
  // on view state, not TableSnapShot. Bump viewVersion on every store tick so
  // checkboxes and toolbar counts re-render (same as the ERP host hook).
  useEffect(() => {
    if (!controller) return;

    let cancelled = false;
    const syncView = () => {
      if (cancelled) return;
      const snapshot = controller.getSnapShot('active');
      if (snapshot) setRows(snapshot);
      setViewVersion((version) => version + 1);
    };

    syncView();
    const unsubscribe = controller.subscribe(syncView);

    if (!unsubscribe) {
      const retryTimer = window.setTimeout(syncView, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(retryTimer);
      };
    }

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [controller]);

  // ---------- selector: undo flags (independent of row snapshot) ----------
  useEffect(() => {
    if (!controller) return;

    const readFlags = () => ({
      canUndo: controller.canUndo(),
      canRedo: controller.canRedo(),
    });

    setUndoFlags(readFlags());

    return controller.subscribeSelected(
      readFlags,
      setUndoFlags,
      (a: { canUndo: boolean; canRedo: boolean }, b: { canUndo: boolean; canRedo: boolean }) =>
        a.canUndo === b.canUndo && a.canRedo === b.canRedo,
    );
  }, [controller]);

  // ---------- history / changelog: dedicated projection subscriptions ----------
  useEffect(() => {
    if (!controller) return;
    setHistoryItems(controller.getHistoryItems());
    setChangelog(controller.getChangelog());
    const unsubHistory = controller.subscribeHistoryItems(setHistoryItems);
    const unsubChangelog = controller.subscribeChangelog(setChangelog);
    return () => {
      unsubHistory();
      unsubChangelog();
    };
  }, [controller]);

  if (!controller || !api || !session || !pluginHost || !controller.getViewState()) {
    return { ready: false };
  }

  return {
    ready: true,
    controller,
    api,
    session,
    pluginHost,
    eventStore: grid.eventStore,
    store: isPersistentStore(config.store) ? config.store : DEFAULT_MEMORY_STORE,
    tableKey,
    rows: rows ?? (controller.getSnapShot('active') as TableSnapShot),
    changelog,
    changelogCount: changelog.length,
    historyItems,
    historyItemCount: historyItems.length,
    canUndo: undoFlags.canUndo,
    canRedo: undoFlags.canRedo,
    getChangelog: (filter) => controller.getChangelog(filter),
    getHistoryItems: (filter) => controller.getHistoryItems(filter),
    subscribeChangelog: (cb, filter) =>
      controller.subscribeChangelog(cb, filter),
    subscribeHistoryItems: (cb, filter) =>
      controller.subscribeHistoryItems(cb, filter),
    subscribeSelected: ((selector, listener, isEqual) =>
      controller.subscribeSelected(selector, listener, isEqual)) as GridSession['subscribeSelected'],
    getViewport: () => session.getViewport(),
    getVisibleRange: (totalRows?: number) => session.getVisibleRange(totalRows),
    projectVisibleRows: <T,>(rows: T[], totalRows?: number) =>
      session.projectVisibleRows(rows, totalRows),
    getUiRowCount: () => session.getUiRowCount(),
    projectVisibleUiRows: () => session.projectVisibleUiRows(),
    changeViewport: (input: {
      scrollOffset: number;
      viewportSize?: number;
      rowHeight?: number;
      overscan?: number;
    }) =>
      session.dispatchViewIntent({ type: 'CHANGE_VIEWPORT', ...input }),
    undo: () => controller.undo(),
    redo: () => controller.redo(),
  };
}

/** @deprecated Use {@link useGrid}. Removed in 1.0.0. */
export const useERPTable = useGrid;
