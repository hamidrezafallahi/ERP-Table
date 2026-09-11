// hooks/useERPTable.ts
import {
  useEffect,
  useState,
} from 'react';

import type { GridSession } from '../application/session/GridSession';
import type { PluginHost } from '../application/plugins/PluginHost';
import { createERPTable } from '../bootstrap';
import type { CreateERPTableConfig } from '../bootstrap/type';
import type { TableSnapShot } from '../engine/type';
import type {
  HistoryItem,
  HistoryQuery,
} from '../infrastructure/history/HistoryPanelViewModel';
import type {
  ChangelogEntry,
  ChangelogQuery,
} from '../infrastructure/projections/ChangelogProjection';
import {
  UITableController,
} from '../infrastructure/ui/UITableController';

export type UseERPTableResult =
  | { ready: false }
  | {
    ready: true;
    controller: UITableController;
    session: GridSession;
    pluginHost: PluginHost;
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

export function useERPTable(
  config: CreateERPTableConfig
): UseERPTableResult {
  const [controller, setController] =
    useState<UITableController | null>(null);
  const [session, setSession] = useState<GridSession | null>(null);
  const [pluginHost, setPluginHost] = useState<PluginHost | null>(null);
  const [rows, setRows] = useState<TableSnapShot | null>(null);
  const [, setViewVersion] = useState(0);
  const [undoFlags, setUndoFlags] = useState({ canUndo: false, canRedo: false });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  // ---------- bootstrap ----------
  useEffect(() => {
    let cancelled = false;
    setController(null);
    setSession(null);
    setPluginHost(null);
    setRows(null);

    createERPTable(config).then((result: Awaited<ReturnType<typeof createERPTable>>) => {
      if (!cancelled) {
        setController(result.controller);
        setSession(result.session);
        setPluginHost(result.pluginHost);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [config.tableKey, config.columns]);

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

  if (!controller || !session || !pluginHost || !controller.getViewState()) {
    return { ready: false };
  }

  return {
    ready: true,
    controller,
    session,
    pluginHost,
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
