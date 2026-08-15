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
import {
  UITableController,
} from '@components/organisms/erp-table/infrastructure/ui/UITableController';

export type UseERPTableResult =
  | { ready: false }
  | {
    ready: true;
    controller: UITableController;
    rows: TableSnapShot;
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

  return {
    ready: true,
    controller,
    rows: rows ?? controller.getSnapShot('active') ?? { rows: [] },
  };
}
