// ui/erp-table/ERPTable.tsx
"use client";
import React, {
  ReactNode,
  useEffect,
} from 'react';

import { shallowEqual } from 'react-redux';

import {
  useFullScreen,
  useMediaQuery,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';

import { CreateERPTableConfig } from '../bootstrap/type';
import { ERPTableBody } from './ERPTableBody';
import { ERPTableHeader } from './ERPTableHeader';
import { GroupActionButtons } from './groupActionButtons';
import ERPTablePagination from './pagination';
import { useERPTable } from './useERPTable';

export type ERPTableApi = {
  getSnapshot: () => unknown;
  subscribeColumn: <T = unknown>(
    columnId: string,
    cb: (values: T[]) => void,
  ) => () => void;
  // validation: () => (cb: ValidationCallback) => void;
  addNewRows: () => void;
};
export interface ERPTableProps<
  TMoreDetail = unknown,
> extends CreateERPTableConfig<TMoreDetail> {
  onReady?: (api: ERPTableApi) => void;
  tableTitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  tableHeight: number;
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
    recordPerPage,
    moreDetailComponent: MoreDetailComponent,
  } = props;
  const toggleFullScreen = useFullScreen();
  const { match } = useMediaQuery("XLUP");
  const { match: xXlMatch } = useMediaQuery("XXLUP");

  const { menuBarIsOpen, actionBarIsOpen } = useAppSelector((state) => {
    const menuBarIsOpen = !state.withPersist.config.fullScreen;
    const actionBarIsOpen = !state.withoutPersist.container.minimize;
    return { menuBarIsOpen, actionBarIsOpen };
  }, shallowEqual);
  const result = useERPTable({
    store,
    tableKey,
    columns,
    rows,
    actor,
    rowAccess,
    tableHeight,
    recordPerPage,
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
      onReady?.({
        getSnapshot: () => controller.getSnapShot(),
        addNewRows: () => {}, // controller.addNewRows(tableKey,[])},
        // validation: () => controller.validation(),
        subscribeColumn: (columnId, cb) =>
          controller.subscribeColumn(columnId, cb),
      });
    }
  }, [result.ready]);
  if (!result.ready) return null;
  const { controller } = result;
  const getMenuWidth = () => {
    if (!menuBarIsOpen) return 0;
    return xXlMatch ? 280 : 260;
  };
  const getActionWidth = () => {
    if (!actionBarIsOpen) return 100;
    return xXlMatch ? 310 : 145;
  };
  const menuSideWidth = getMenuWidth();
  const actionSideWidth = getActionWidth();
  const maxWidth =
    typeof window !== "undefined"
      ? window.innerWidth - (menuSideWidth + actionSideWidth)
      : "100%";
  return (
    <div className="flex flex-col w-full h-full transition-all duration-200">
      {tableTitle}
      <div
        className={`overflow-auto `}
        style={{
          height: tableHeight ?? "100%",
          width: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
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
        <GroupActionButtons controller={controller} />
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
