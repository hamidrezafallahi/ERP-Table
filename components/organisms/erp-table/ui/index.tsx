// ui/erp-table/ERPTable.tsx
"use client";
import React, {
  ReactNode,
  useEffect,
} from 'react';

import { useTranslations } from 'next-intl';

import { CreateERPTableConfig } from '../bootstrap/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import { ERPTableBody } from './ERPTableBody';
import { ERPTableHeader } from './ERPTableHeader';
import { GroupActionButtons } from './groupActionButtons';
import ERPTablePagination from './pagination';
import { IMultiSelectConfig } from './type';
import { useERPTable } from './useERPTable';

export interface ERPTableProps<
  TMoreDetail = unknown,
> extends CreateERPTableConfig {
  onReady?: (controller: UITableController) => void;
  tableTitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  tableType?: string;
  tableHeight: number;
  multiSelectConfig: IMultiSelectConfig;
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
    tableTitle,
    header,
    footer,
    tableHeight,
    tableType,
    recordPerPage,
    multiSelectConfig,
    moreDetailComponent: MoreDetailComponent,
  } = props;
  const result = useERPTable({
    store,
    tableKey,
    tableType,
    columns,
    rows,
    actor,
    rowAccess,
    tableHeight,
    recordPerPage,
  });
  const t = useTranslations();
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
      const target = e.target as HTMLElement;

      if (
        target.closest(".ant-select") &&
        (e.code === "ArrowUp" ||
          e.code === "ArrowDown" ||
          e.code === "Enter" ||
          e.code === "NumpadEnter")
      ) {
        return;
      }

      const activeRow = controller.getActiveRow();
      const activeCell = controller.getActiveCell();
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
      onReady?.(controller);
    }
  }, [result.ready]);
 if (!result.ready) return null;
  const { controller } = result;
  return (
    <div className="flex flex-col w-full h-full transition-all duration-200">
      {tableTitle}
      <div
        className={`overflow-auto `}
        style={{
          height: tableHeight ?? "100%",
          // width: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
          width: "auto",
        }}
      >
        <table className="w-full border-collapse">
          <ERPTableHeader
            controller={controller}
            tableKey={tableKey}
            header={header}
          />
          <ERPTableBody
            controller={controller}
            tableKey={tableKey}
            moreDetailComponent={MoreDetailComponent}
          />
        </table>
      </div>
      <div className="flex justify-between items-center gap-3 w-full">
        <GroupActionButtons controller={controller}  multiSelectConfig={multiSelectConfig}/>
        
        <ERPTablePagination
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
