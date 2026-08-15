"use client";

import React, { ReactNode, useRef } from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { useScrollToSearchMatch } from '../hooks/useScrollToSearchMatch';
import { IMultiSelectConfig } from '../type';
import { ERPTableBody } from './ERPTableBody';
import { ERPTableFooter } from './ERPTableFooter';
import { ERPTableHeader } from './ERPTableHeader';
import { GroupActionButtons } from './groupActionButtons';
import ERPTablePagination from './pagination';
import { useERPTableLayout } from './useERPTableLayout';

export interface DesktopTableProps {
  controller: UITableController;
  tableKey: string;
  store: string;
  tableTitle?: ReactNode;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  tableHeight?: number;
  multiSelectConfig: IMultiSelectConfig;
  moreDetailComponent?: React.ComponentType<{ data: unknown }>;
  ready: boolean;
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
}: DesktopTableProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { bodyHeight } = useERPTableLayout({
    rootRef,
    bodyRef,
    controller,
    tableHeight,
    ready,
  });
  const resolvedBodyHeight = tableHeight ?? bodyHeight;

  useScrollToSearchMatch(bodyRef, controller);

  return (
    <div
      ref={rootRef}
      className="flex flex-col w-full h-full transition-all duration-200"
    >
        {tableTitle}
        <div
          ref={bodyRef}
          data-erp-table-scroll
          className="overflow-auto [overflow-anchor:none]"
          style={{ height: resolvedBodyHeight ?? "100%", width: "auto", overflowAnchor: 'none' }}
        >
          <table className="border-collapse min-w-max w-full">
            <ERPTableHeader
              controller={controller}
              tableKey={tableKey}
              header={header}
            />
            <ERPTableBody
              controller={controller}
              tableKey={tableKey}
              moreDetailComponent={moreDetailComponent}
            />
            {footer && (
              <ERPTableFooter controller={controller} footer={footer} />
            )}
          </table>
        </div>
        <div className="flex justify-between items-center gap-3 w-full shrink-0">
          <GroupActionButtons
            controller={controller}
            multiSelectConfig={multiSelectConfig}
          />
          <ERPTablePagination
            controller={controller}
            store={store}
            tableKey={tableKey}
          />
        </div>
      </div>
  );
}
