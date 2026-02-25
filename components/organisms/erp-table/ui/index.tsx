// ui/erp-table/ERPTable.tsx
"use client";
import React, {
  ReactNode,
  useEffect,
} from 'react';

import { useFullScreen } from '@hooks/custom';

import { CreateERPTableConfig } from '../bootstrap/type';
import { AddNewRowButton } from './addNewRowButton';
import { ERPTableBody } from './ERPTableBody';
import { ERPTableHeader } from './ERPTableHeader';
import ERPTablePagination from './pagination';
import { useERPTable } from './useERPTable';

export type ERPTableApi = {
  getSnapshot: () => unknown;
  subscribeColumn: <T = unknown>(
    columnId: string,
    cb: (values: T[]) => void,
  ) => () => void;
  addNewRows: () => void;
};
export interface ERPTableProps<
  TMoreDetail = unknown,
> extends CreateERPTableConfig<TMoreDetail> {
  onReady?: (api: ERPTableApi) => void;
  header?: ReactNode;
  footer?: ReactNode;
  tableHeight:number
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (page: number, pageSize: number) => void;
  moreDetailComponent?: React.ComponentType<{ data: TMoreDetail }>;
}
export function ERPTable<TMoreDetail = unknown>(
  props: ERPTableProps<TMoreDetail>,
) {
  const {
    columns,
    rowAccess,
    rows,
    actor,
    store,
    tableKey,
    onReady,
    header,
    footer,
    onPageChange,
    onPageSizeChange,
    page,
    pageSize,
    totalRecords,
    tableHeight,
    moreDetailComponent: MoreDetailComponent,
  } = props;
  const toggleFullScreen = useFullScreen();
  const result = useERPTable({
    store,
    tableKey,
    columns,
    rows,
    actor,
    rowAccess,
    page,
    pageSize,
    totalRecords
  });

  // ---------- keyboard handler ----------
  useEffect(() => {
    if (!result.ready) return;
    const { controller } = result;

    const clickHandler = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");
      if (button) {
        const { pageid, id } = button.dataset;
        if (tableKey === id || tableKey === pageid) {
          console.log("حذف جدول از دیتابیس");
          controller.dispose();
        }
      }
    };
    const handler = (e: KeyboardEvent) => {
      const activeRow = controller.getActiveRow(tableKey);
      const activeCell = controller.getActiveCell(tableKey);
      controller.dispatch({
        type: "KEY_DOWN",
        event: e,
        ctx: {
          activeRowId: activeRow,
          tableKey,
          activeColumnId: activeCell?.columnId,
        },
      });
    };
    window.addEventListener("keydown", handler, true);
    window.addEventListener("click", clickHandler, true);
    return () => {
      window.removeEventListener("click", clickHandler, true);
      window.removeEventListener("keydown", handler, true);
    };
  }, [result.ready, tableKey, result]);
  useEffect(() => {
    if (result.ready) {
      const { controller } = result;
      onReady?.({
        getSnapshot: () => controller.getSnapShot(tableKey),
        addNewRows: () => {}, // controller.addNewRows(tableKey,[])},
        subscribeColumn: (columnId, cb) =>
          controller.subscribeColumn(columnId, cb),
      });
    }
  }, [result.ready]);
  if (!result.ready) return null;
  const { controller } = result;
  return (
    <div className="flex flex-col w-full h-full">
      {header}
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: tableHeight ?? "100%" }}
      >
        <table className="w-full border-collapse table-fixed">
          <ERPTableHeader controller={controller} tableKey={tableKey} />
          <ERPTableBody
            controller={controller}
            tableKey={tableKey}
            moreDetailComponent={MoreDetailComponent}
          />
        </table>
      </div>

      {/* Pagination و دکمه‌ها همیشه زیر */}
      <div className="flex justify-between items-center gap-3 mt-2 w-full">
        <AddNewRowButton controller={controller} />
        <ERPTablePagination
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          controller={controller}
          store={store}
          tableKey={tableKey}
        />
      </div>

      {/* footer دلخواه */}
      {footer}
    </div>
  );
}
