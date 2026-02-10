// hooks/useERPTable.ts
import {
  useEffect,
  useState,
} from 'react';

import {
  UITableController,
} from '@components/organisms/erp-table/adapters/ui/UITableController';
import { createERPTable } from '@components/organisms/erp-table/bootstrap';
import { TableSnapShot } from '@components/organisms/erp-table/engine/type';

export type UseERPTableResult =
  | { ready: false }
  | {
    ready: true;
    controller: UITableController;
    table: TableSnapShot;
  };

export function useERPTable(config: {
  store: string;
  tableKey: string;
  columns: any[];
  rows: Array<{ id: number; values?: Record<string, unknown> }>;
  actor: any;
}): UseERPTableResult {
  const [controller, setController] =
    useState<UITableController | null>(null);
  const [table, setTable] = useState<TableSnapShot | null>(null);
  // ---------- bootstrap ----------
  useEffect(() => {
    let mounted = true;
    createERPTable(config).then(({ controller }) => {
      if (mounted) {
        setController(controller);
      } else {
        controller.dispose();
      }
    });

    return () => {
      mounted = false;
    };
  }, [config.tableKey,config.columns]);

  // ---------- subscribe ----------
  useEffect(() => {
    if (!controller) return;
    const table = controller.getSnapShot(config.tableKey)
    if (table) {
      setTable(table);
    }
    const unsubscribe = controller.subscribe(
      config.tableKey,
      () => {
        setTable(controller.getSnapShot(config.tableKey));
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [controller,config.store, config.tableKey]);
  if (!controller || !table) {
    return { ready: false };
  }
  return {
    ready: true,
    controller,
    table,
  };

}
