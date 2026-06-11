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

export function useERPTable(config: CreateERPTableConfig): UseERPTableResult {

  const [controller, setController] =
    useState<UITableController | null>(null);
  const [rows, setRows] = useState<TableSnapShot | null>(null);
  // ---------- bootstrap ----------
  useEffect(() => {
  createERPTable(config).then(({ controller }) => {setController(controller)});
  }, [config.tableKey, config.columns]);

  // ---------- subscribe ----------
  useEffect(() => {
    if (!controller) return;
    const table = controller.getSnapShot()
    if (table) {
      setRows(table);
    }
    const unsubscribe = controller.subscribe(
      () => {
        setRows(controller.getSnapShot());
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [controller, config.store, config.tableKey]);
  if (!controller || !rows) {
    return { ready: false };
  }
  return {
    ready: true,
    controller,
    rows,
  };

}
