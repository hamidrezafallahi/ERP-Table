"use client";
import React, {
  ReactNode,
  useEffect,
} from 'react';

import { injectERPTableStyles } from './styles/injectStyles';
import { CreateERPTableConfig } from '../bootstrap/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import {
  ERPTableHostProvider,
  useMediaQuery,
  type ERPTableLocale,
  type ERPTableMessages,
  type ERPTableToastKind,
} from './host';
import { DesktopTable } from './desktop/DesktopTable';
import { MobileTable } from './mobile/MobileTable';
import { IMultiSelectConfig } from './type';
import { useERPTable } from './useERPTable';

export interface ERPTableProps extends CreateERPTableConfig {
  onReady?: (controller: UITableController) => void;
  tableTitle?: ReactNode;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  activeCollection?: string;
  tableHeight?: number;
  multiSelectConfig: IMultiSelectConfig;
  moreDetailComponent?: React.ComponentType<{data: unknown}>;
  /**
   * Desktop virtual scroll. Default **false** to match ERP pagination.
   * Pass true to enable GridSession virtualization.
   */
  virtualization?: boolean;
  locale?: ERPTableLocale;
  direction?: 'rtl' | 'ltr';
  messages?: Partial<ERPTableMessages>;
  onToast?: (kind: ERPTableToastKind, message: string, detail?: unknown) => void;
}

export function ERPTable(props: ERPTableProps) {
  injectERPTableStyles();
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
    virtualization,
    remoteApi,
    locale = 'fa',
    direction,
    messages,
    onToast,
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
    remoteApi,
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
        target.closest(".ant-select") ||
        target.closest(".erp-table-select")
      ) {
        if (
          e.code === "ArrowUp" ||
          e.code === "ArrowDown" ||
          e.code === "Enter" ||
          e.code === "NumpadEnter"
        ) {
          return;
        }
      }
      const activeRow = controller.getActiveRow();
      const activeCell = controller.getActiveCell();
      controller.dispatch({
        type: "KEY_DOWN",
        event: e,
        ctx: {
          activeRowId: activeRow,
          tableKey,
          activeColumnId: activeCell?.columnId ?? null,
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

  const table = isMobile ? (
    <MobileTable {...sharedProps} />
  ) : (
    <DesktopTable
      {...sharedProps}
      store={store}
      tableHeight={tableHeight}
      moreDetailComponent={moreDetailComponent}
      ready={result.ready}
      virtualization={virtualization}
      session={result.session}
    />
  );

  return (
    <ERPTableHostProvider
      locale={locale}
      direction={direction ?? (locale === 'fa' ? 'rtl' : 'ltr')}
      messages={messages}
      onToast={onToast}
      remoteApi={remoteApi ?? result.controller.getRemoteApi()}
    >
      <div className="erp-table" dir={direction ?? (locale === 'fa' ? 'rtl' : 'ltr')} data-erp-table>
        {table}
      </div>
    </ERPTableHostProvider>
  );
}
