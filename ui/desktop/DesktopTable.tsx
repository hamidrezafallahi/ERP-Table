"use client";

import React, { ReactNode, useEffect, useRef } from 'react';

import type { GridSession } from '../../application/session/GridSession';
import { UITableController } from '../../infrastructure/ui/UITableController';
import type { PluginHost } from '../../application/plugins/PluginHost';
import { useScrollToSearchMatch } from '../hooks/useScrollToSearchMatch';
import { IMultiSelectConfig } from '../type';
import { useERPTableTheme } from '../host';
import { ariaGridRowCount, gridCellDomId } from '../a11y/gridRoles';
import { GridLiveRegion } from '../a11y/GridLiveRegion';
import { ERPTableBody } from './ERPTableBody';
import { ERPTableFooter } from './ERPTableFooter';
import type { FooterRowDef } from './ERPTableFooter';
import { ERPTableHeader } from './ERPTableHeader';
import { ERPTablePinnedRows } from './ERPTablePinnedRows';
import { ERPTableVirtualBody } from './ERPTableVirtualBody';
import { GroupActionButtons } from './groupActionButtons';
import ERPTablePagination from './pagination';
import { resolveDesktopVirtualization } from './resolveDesktopVirtualization';
import { useERPTableLayout } from './useERPTableLayout';
import { ColumnWindowProvider } from '../virtual/columnWindow';
import {
  GridOverlays,
  type GridOverlayComponent,
} from '../overlays';

export interface DesktopTableProps<TRow = unknown> {
  controller: UITableController;
  tableKey: string;
  store: string;
  tableTitle?: ReactNode;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  /** Multi-row aggregation footer (PR-119). Used when `footer={true}`. */
  footerRows?: readonly FooterRowDef[];
  tableHeight?: number;
  multiSelectConfig?: IMultiSelectConfig;
  moreDetailComponent?: React.ComponentType<{ data: unknown }>;
  ready: boolean;
  /**
   * Desktop virtual scroll (GridSession viewport + visible window).
   * **On by default** when `session` is present (PR-97 / D17).
   * Pass `virtualization={false}` for classic pagination.
   * Pagination chrome is hidden while virtualization is on.
   */
  virtualization?: boolean;
  /** Used when virtualization is on (default). Ignored when `virtualization={false}`. */
  session?: GridSession;
  pluginHost?: PluginHost;
  /** Floating filter row under the header (PR-94). */
  floatingFilter?: boolean;
  /** Host-driven full-grid loading overlay (PR-103). */
  loading?: boolean;
  loadingOverlayComponent?: GridOverlayComponent;
  noRowsOverlayComponent?: GridOverlayComponent;
  /** Rows stuck under the header (PR-116). Not virtualized. */
  pinnedTopRowData?: readonly TRow[];
  /** Rows stuck above the footer (PR-116). Not virtualized. */
  pinnedBottomRowData?: readonly TRow[];
}

export function DesktopTable<TRow = unknown>({
  controller,
  tableKey,
  store,
  tableTitle,
  header,
  footer,
  footerRows,
  tableHeight,
  multiSelectConfig,
  moreDetailComponent,
  ready,
  virtualization,
  session,
  pluginHost,
  floatingFilter = false,
  loading = false,
  loadingOverlayComponent,
  noRowsOverlayComponent,
  pinnedTopRowData,
  pinnedBottomRowData,
}: DesktopTableProps<TRow>) {
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
  const pinnedTopCount = pinnedTopRowData?.length ?? 0;
  const pinnedBottomCount = pinnedBottomRowData?.length ?? 0;
  const hasFooter = Boolean(footer);
  const footerRowCount =
    typeof footer === 'boolean' && footer
      ? Math.max(1, footerRows?.length ?? 1)
      : hasFooter
        ? 1
        : 0;
  const activeDescendant = view?.activeCell
    ? gridCellDomId(tableKey, view.activeCell.rowId, view.activeCell.columnId)
    : undefined;
  /** Group rows use aria-expanded/aria-level — valid on treegrid, not grid (PR-123). */
  const isTreeGrid = Boolean(
    view?.rows?.some((r) => r.rowKind === 'group'),
  );

  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const thead = root.querySelector('thead');
    const tfoot = root.querySelector('tfoot');
    if (thead) {
      root.style.setProperty(
        '--erp-pinned-top-offset',
        `${thead.getBoundingClientRect().height}px`,
      );
    }
    if (tfoot) {
      root.style.setProperty(
        '--erp-pinned-bottom-offset',
        `${tfoot.getBoundingClientRect().height}px`,
      );
    } else {
      root.style.setProperty('--erp-pinned-bottom-offset', '0px');
    }
  }, [floatingFilter, pinnedTopCount, pinnedBottomCount, hasFooter, view?.columns]);

  return (
    <div
      ref={rootRef}
      className="flex flex-col w-full h-full transition-all duration-200 erp-table-desktop"
    >
      <GridLiveRegion controller={controller} />
      {tableTitle}
      <div
        ref={bodyRef}
        data-erp-table-scroll
        data-erp-table-key={tableKey}
        data-erp-virtualization={useVirtual ? 'on' : 'off'}
        className="overflow-auto [overflow-anchor:none] relative"
        style={{
          height: resolvedBodyHeight ?? '100%',
          width: 'auto',
          overflowAnchor: 'none',
        }}
      >
        <GridOverlays
          loading={loading}
          rowCount={dataRowCount}
          loadingOverlayComponent={loadingOverlayComponent}
          noRowsOverlayComponent={noRowsOverlayComponent}
        />
        <table
          className="min-w-max w-full"
          role={isTreeGrid ? 'treegrid' : 'grid'}
          tabIndex={0}
          aria-colcount={colCount || undefined}
          aria-rowcount={
            ariaGridRowCount(
              dataRowCount,
              footerRowCount,
              pinnedTopCount,
              pinnedBottomCount,
            ) || undefined
          }
          aria-activedescendant={activeDescendant}
          data-pdg-col-virt
          data-pdg-grid-focus=""
          onFocus={(e) => {
            if (e.target !== e.currentTarget) return;
            if (controller.getActiveCell()) return;
            const firstRow = view?.rows?.find((r) => r.rowKind !== 'group');
            const firstCol = (view?.columns ?? []).find(
              (c) => !c.hidden && c.fieldType !== 'index' && c.fieldName !== 'index',
            );
            if (firstRow && firstCol) {
              void controller.dispatch({
                type: 'UI_ACTIVE_CELL',
                rowId: firstRow.id,
                columnId: firstCol.fieldName,
              });
            }
          }}
        >
          <ColumnWindowProvider
            scrollRef={bodyRef}
            columns={view?.columns ?? []}
            columnWidths={view?.columnWidths}
            onViewportWidthChange={(w) => controller.setLayoutViewportWidth(w)}
          >
          <ERPTableHeader
            controller={controller}
            tableKey={tableKey}
            header={header}
            floatingFilter={floatingFilter}
          />
          {pinnedTopCount > 0 && pinnedTopRowData ? (
            <ERPTablePinnedRows
              side="top"
              rows={pinnedTopRowData}
              controller={controller}
              dataRowCount={dataRowCount}
              pinnedTopCount={pinnedTopCount}
            />
          ) : null}
          {useVirtual && session ? (
            <ERPTableVirtualBody
              controller={controller}
              session={session}
              tableKey={tableKey}
              scrollParentRef={bodyRef}
              viewportHeight={resolvedBodyHeight}
              rowHeight={rowHeight}
              moreDetailComponent={moreDetailComponent}
              pinnedTopCount={pinnedTopCount}
            />
          ) : (
            <ERPTableBody
              controller={controller}
              tableKey={tableKey}
              moreDetailComponent={moreDetailComponent}
              pinnedTopCount={pinnedTopCount}
            />
          )}
          {pinnedBottomCount > 0 && pinnedBottomRowData ? (
            <ERPTablePinnedRows
              side="bottom"
              rows={pinnedBottomRowData}
              controller={controller}
              dataRowCount={dataRowCount}
              pinnedTopCount={pinnedTopCount}
            />
          ) : null}
          {footer && (
            <ERPTableFooter
              controller={controller}
              footer={footer}
              footerRows={footerRows}
              dataRowCount={dataRowCount}
              pinnedTopCount={pinnedTopCount}
              pinnedBottomCount={pinnedBottomCount}
            />
          )}
          </ColumnWindowProvider>
        </table>
      </div>
      <div className="flex justify-between items-center gap-3 w-full shrink-0 erp-table-desktop__toolbar">
        <GroupActionButtons
          controller={controller}
          multiSelectConfig={multiSelectConfig}
          pluginHost={pluginHost}
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
