"use client";
import React, {
  ReactNode,
  useEffect,
} from 'react';

import { useMediaQuery } from '@hooks/custom';

import { CreateERPTableConfig } from '../bootstrap/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import { DesktopTable } from './desktop/DesktopTable';
import { MobileTable } from './mobile/MobileTable';
import { IMultiSelectConfig } from './type';
import { useERPTable } from './useERPTable';

export interface ERPTableProps extends CreateERPTableConfig {
  onReady?: (controller: UITableController) => void;
  tableTitle?: string;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  activeCollection?: string;
  tableHeight?: number;
  multiSelectConfig: IMultiSelectConfig;
  moreDetailComponent?: React.ComponentType<{data: unknown}>;
}

export function ERPTable(props: ERPTableProps) {
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
    activeCollection,
    recordPerPage,
    multiSelectConfig,
    moreDetailComponent,
  } = props;

  const result = useERPTable({
    store,
    tableKey,
    activeCollection,
    columns,
    rows,
    actor,
    rowAccess,
    tableHeight,
    recordPerPage,
  });

  useEffect(() => {
    if (!result.ready) return;
    const {controller} = result;

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");
      if (button) {
        const {pageid, id} = button.dataset;
        if (tableKey === id || tableKey === pageid) {
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
      onReady?.(result.controller);
    }
  }, [result, onReady]);

  const {match: viewportMatch} = useMediaQuery("XLUP");
  const isMobile = viewportMatch === false;

  if (!result.ready) return null;

  const sharedProps = {
    controller: result.controller,
    tableKey,
    tableTitle,
    header,
    footer,
    multiSelectConfig,
  };

  return isMobile ? (
    <MobileTable {...sharedProps} />
  ) : (
    <DesktopTable
      {...sharedProps}
      store={store}
      tableHeight={tableHeight}
      moreDetailComponent={moreDetailComponent}
      ready={result.ready}
    />
  );
}
