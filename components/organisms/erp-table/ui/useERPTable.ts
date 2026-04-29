// hooks/useERPTable.ts
import {
  useEffect,
  useState,
} from 'react';

import {
  UITableController,
} from '@components/organisms/erp-table/adapters/ui/UITableController';
import { createERPTable } from '@components/organisms/erp-table/bootstrap';
import {
  CreateERPTableConfig,
} from '@components/organisms/erp-table/bootstrap/type';
import { TableSnapShot } from '@components/organisms/erp-table/engine/type';

export type UseERPTableResult =
  | { ready: false }
  | {
    ready: true;
    controller: UITableController;
    table: TableSnapShot;
  };

export function useERPTable(config: CreateERPTableConfig): UseERPTableResult {

  const [controller, setController] =
    useState<UITableController | null>(null);
  const [table, setTable] = useState<TableSnapShot | null>(null);
  // ---------- bootstrap ----------
  useEffect(() => {
  createERPTable(config).then(({ controller }) => {setController(controller)});
  }, [config.tableKey, config.columns]);

  // ---------- subscribe ----------
  useEffect(() => {
    if (!controller) return;
    const table = controller.getSnapShot()
    if (table) {
      setTable(table);
    }
    const unsubscribe = controller.subscribe(
      () => {
        setTable(controller.getSnapShot());
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [controller, config.store, config.tableKey]);
  if (!controller || !table) {
    return { ready: false };
  }
  return {
    ready: true,
    controller,
    table,
  };

}
