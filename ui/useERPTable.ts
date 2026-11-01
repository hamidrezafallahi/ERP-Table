// hooks/useERPTable.ts
import {
  useEffect,
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
import type {
  CreateERPTableConfig,
  CreateGridResult,
} from '../bootstrap/type';
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
  const [eventStore, setEventStore] = useState<EventStore | null>(null);
  const [rows, setRows] = useState<TableSnapShot | null>(null);
  const [, setViewVersion] = useState(0);
  const [undoFlags, setUndoFlags] = useState({ canUndo: false, canRedo: false });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  // Page-window mode ('paged-idb'): an empty `tableKey` means "page left /
  // not mounted yet" — never build (or rebuild IndexedDB for) a grid then.
  const pagedIdb = config.persistence === 'paged-idb';
  const disabled = pagedIdb && !config.tableKey;
  // Latest config for the effect below (config identity changes every render;
  // only the listed deps rebuild the grid).
  const configRef = useRef(config);
  configRef.current = config;
  // Teardown of the previous grid. A new grid waits for it so the old one has
  // released its event store / IndexedDB connection before the next opens it.
  const teardownRef = useRef<Promise<void>>(Promise.resolve());

  // ---------- bootstrap + teardown ----------
  // The grid is created inside the effect (never in render / useMemo): render
  // is pure, StrictMode's mount→cleanup→mount creates exactly one grid (the
  // first run is cancelled before it builds), and every grid that was built is
  // released by its own cleanup.
  useEffect(() => {
    let cancelled = false;
    let built: CreateGridResult<TRow> | null = null;
    setController(null);
    setApi(null);
    setSession(null);
    setPluginHost(null);
    setEventStore(null);
    setRows(null);

    if (disabled) return undefined;

    const previous = teardownRef.current;
    void previous.then(() => {
      if (cancelled) return;
      const grid = createGrid<TRow>({ ...configRef.current, tableKey });
      built = grid;
      void grid.ready.then((result) => {
        if (cancelled) return;
        setController(result.controller);
        setApi(result.api);
        setSession(result.session);
        setPluginHost(result.pluginHost);
        setEventStore(result.eventStore);
      });
    });

    return () => {
      cancelled = true;
      const grid = built;
      if (!grid) {
        teardownRef.current = previous;
        return;
      }
      // Paged mode: dispose() = drop the RAM page window (IndexedDB stays the
      // source of truth) + release resources. Default event-sourced mode:
      // persisted data is left exactly as it is; only resources are released.
      // A failed assembly already cleaned up after itself (ready rejects).
      teardownRef.current = previous.then(() =>
        grid.ready.then(
          (result) =>
            pagedIdb
              ? result.controller.dispose()
              : result.controller.releaseResources(),
          () => undefined,
        ),
      );
    };
  }, [tableKey, disabled, pagedIdb, config.columns, config.columnDefs, config.store]);

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
      // Re-render only in page-window mode — never rebuild a row snapshot on
      // every keystroke; server save uses getFullSnapShot().
      if (!controller.isPagedWindow()) {
        const snapshot = controller.getSnapShot('active');
        if (snapshot) setRows(snapshot);
      }
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

  if (!eventStore || !controller || !api || !session || !pluginHost || !controller.getViewState()) {
    return { ready: false };
  }

  return {
    ready: true,
    controller,
    api,
    session,
    pluginHost,
    eventStore,
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
