// hooks/useERPTable.ts
import {
  useEffect,
  useState,
} from 'react';

import { createERPTable } from '@components/organisms/erp-table/bootstrap';
import {
  CreateERPTableConfig,
} from '@components/organisms/erp-table/bootstrap/type';
import { TableSnapShot } from '@components/organisms/erp-table/engine/type';
import type {
  ChangelogEntry,
  ChangelogQuery,
} from '@components/organisms/erp-table/infrastructure/projections/ChangelogProjection';
import type {
  HistoryItem,
  HistoryQuery,
} from '@components/organisms/erp-table/infrastructure/history/HistoryPanelViewModel';
import {
  UITableController,
} from '@components/organisms/erp-table/infrastructure/ui/UITableController';

export type UseERPTableResult =
  | { ready: false }
  | {
    ready: true;
    controller: UITableController;
    rows: TableSnapShot;
    changelog: ChangelogEntry[];
    changelogCount: number;
    historyItems: HistoryItem[];
    historyItemCount: number;
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
  };

export function useERPTable(
  config: CreateERPTableConfig
): UseERPTableResult {
  const [controller, setController] =
  useState<UITableController | null>(null);
  const [rows, setRows] = useState<TableSnapShot | null>(null);
  const [, setViewVersion] = useState(0);

  // ---------- bootstrap ----------
  useEffect(() => {
    let cancelled = false;
    setController(null);
    setRows(null);

    createERPTable(config).then(({ controller: nextController }) => {
      if (!cancelled) setController(nextController);
    });

    return () => {
      cancelled = true;
    };
  }, [config.tableKey, config.columns]);

  // ---------- subscribe ----------
  useEffect(() => {
    if (!controller) return;

    let cancelled = false;

    const syncView = () => {
      if (cancelled) return;
      const snapshot = controller.getSnapShot('active');
      if (snapshot) setRows(snapshot);
      setViewVersion((v) => v + 1);
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
  }, [controller, config.store, config.tableKey]);

  if (!controller || !controller.getViewState()) {
    return { ready: false };
  }

  const resolvedRows =
    rows ?? controller.getSnapShot('active') ?? { rows: [] };
  const changelog = controller.getChangelog();
  const changelogCount = controller.getChangelogCount();
  const historyItems = controller.getHistoryItems();
  const historyItemCount = controller.getHistoryItemCount();

  return {
    ready: true,
    controller,
    rows: resolvedRows,
    changelog,
    changelogCount,
    historyItems,
    historyItemCount,
    getChangelog: (filter = {}) => controller.getChangelog(filter),
    getHistoryItems: (filter = {}) => controller.getHistoryItems(filter),
    subscribeChangelog: (cb, filter = {}) => controller.subscribeChangelog(cb, filter),
    subscribeHistoryItems: (cb, filter = {}) => controller.subscribeHistoryItems(cb, filter),
  };
}
