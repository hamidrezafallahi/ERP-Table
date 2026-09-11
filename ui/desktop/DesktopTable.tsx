"use client";

import React, { ReactNode, useRef } from 'react';

import type { GridSession } from '../../application/session/GridSession';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { useScrollToSearchMatch } from '../hooks/useScrollToSearchMatch';
import { IMultiSelectConfig } from '../type';
import { useERPTableTheme } from '../host';
import { ariaGridRowCount } from '../a11y/gridRoles';
import { ERPTableBody } from './ERPTableBody';
import { ERPTableFooter } from './ERPTableFooter';
import { ERPTableHeader } from './ERPTableHeader';
import { ERPTableVirtualBody } from './ERPTableVirtualBody';
import { GroupActionButtons } from './groupActionButtons';
import ERPTablePagination from './pagination';
import { resolveDesktopVirtualization } from './resolveDesktopVirtualization';
import { useERPTableLayout } from './useERPTableLayout';

export interface DesktopTableProps {
  controller: UITableController;
  tableKey: string;
  store: string;
  tableTitle?: ReactNode;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  tableHeight?: number;
  multiSelectConfig?: IMultiSelectConfig;
  moreDetailComponent?: React.ComponentType<{ data: unknown }>;
  ready: boolean;
  /**
   * Desktop virtual scroll (GridSession viewport + visible window).
   * Default true when `session` is present; pass false for classic pagination.
   */
  virtualization?: boolean;
  /** Used when virtualization is enabled (default). */
  session?: GridSession;
}

export function DesktopTable({
  controller,
  tableKey,
  store,
  tableTitle,
  header,
  footer,
  tableHeight,
  multiSelectConfig,
  moreDetailComponent,
  ready,
  virtualization,
  session,
}: DesktopTableProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const useVirtual = resolveDesktopVirtualization(virtualization, session);
  const rowHeight = useERPTableTheme().params.rowHeight;

  const { bodyHeight } = useERPTableLayout({
    rootRef,
    bodyRef,
    controller,
    tableHeight,
    ready,
    syncPageSize: !useVirtual,
    rowHeight,
  });
  const resolvedBodyHeight = tableHeight ?? bodyHeight ?? 400;

  useScrollToSearchMatch(bodyRef, controller);

  const view = controller.getViewState();
  const colCount = (view?.columns ?? []).filter((c) => !c.hidden).length;
  const dataRowCount = useVirtual && session
    ? session.getUiRowCount()
    : view?.pagination.totalRows ?? 0;
  const hasFooter = Boolean(footer);

  return (
    <div
      ref={rootRef}
      className="flex flex-col w-full h-full transition-all duration-200 erp-table-desktop"
    >
      {tableTitle}
      <div
        ref={bodyRef}
        data-erp-table-scroll
        data-erp-table-key={tableKey}
        data-erp-virtualization={useVirtual ? 'on' : 'off'}
        className="overflow-auto [overflow-anchor:none]"
        style={{
          height: resolvedBodyHeight ?? '100%',
          width: 'auto',
          overflowAnchor: 'none',
        }}
      >
        <table
          className="min-w-max w-full"
          role="grid"
          aria-colcount={colCount || undefined}
          aria-rowcount={ariaGridRowCount(dataRowCount, hasFooter) || undefined}
        >
          <ERPTableHeader
            controller={controller}
            tableKey={tableKey}
            header={header}
          />
          {useVirtual && session ? (
            <ERPTableVirtualBody
              controller={controller}
              session={session}
              tableKey={tableKey}
              scrollParentRef={bodyRef}
              viewportHeight={resolvedBodyHeight}
              rowHeight={rowHeight}
              moreDetailComponent={moreDetailComponent}
            />
          ) : (
            <ERPTableBody
              controller={controller}
              tableKey={tableKey}
              moreDetailComponent={moreDetailComponent}
            />
          )}
          {footer && (
            <ERPTableFooter
              controller={controller}
              footer={footer}
              dataRowCount={dataRowCount}
            />
          )}
        </table>
      </div>
      <div className="flex justify-between items-center gap-3 w-full shrink-0 erp-table-desktop__toolbar">
        <GroupActionButtons
          controller={controller}
          multiSelectConfig={multiSelectConfig}
        />
        {!useVirtual ? (
          <ERPTablePagination
            controller={controller}
            store={store}
            tableKey={tableKey}
          />
        ) : (
          <div
            className="text-xs text-neutral-500 px-2"
            data-erp-virtual-row-count
          >
            {session?.getUiRowCount() ?? 0} rows
          </div>
        )}
      </div>
    </div>
  );
}
