// hooks/useERPTable.ts
import {
  useEffect,
  useReducer,
  useState,
} from 'react';

import {
  UITableController,
} from '@components/organisms/erp-table/adapters/ui/UITableController';
import {
  createERPTable,
} from '@components/organisms/erp-table/bootstrap/createERPTable';
import { TableSnapShot } from '@components/organisms/erp-table/engine/type';

export type UseERPTableResult =
  | { ready: false }
  | {
      ready: true;
      controller: UITableController;
      table: TableSnapShot;
    };

export function useERPTable(config: {
  tableId: string;
  columns: any[];
  rows: Array<{ id: number; values?: Record<string, unknown> }>;
  actor: any;
}): UseERPTableResult {
  const [controller, setController] =
    useState<UITableController | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  // ---------- bootstrap ----------
  useEffect(() => {
    let mounted = true;

    createERPTable({
      tableId: config.tableId,
      columns: config.columns,
      rows: config.rows,
      actor: config.actor,
    }).then(({ controller }) => {
      if (mounted) {
        setController(controller);
      }
    });

    return () => {
      mounted = false;
    };
  }, [config.tableId, config.columns, config.rows, config.actor]);

  // ---------- subscribe ----------
  useEffect(() => {
    if (!controller) return;

    const unsubscribe = controller.subscribe(
      config.tableId,
      forceUpdate
    );

    return unsubscribe;
  }, [controller, config.tableId]);

  if (!controller) {
    return { ready: false };
  }

  const table = controller.getSnapShot(config.tableId);

  return {
    ready: true,
    controller,
    table,
  };
}
