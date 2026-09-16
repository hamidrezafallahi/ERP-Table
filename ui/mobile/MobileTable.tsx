"use client";

import React, {
  ReactNode,
  useEffect,
  useRef,
} from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import type { PluginHost } from '../../application/plugins/PluginHost';
import { ERPTableFooter } from '../desktop/ERPTableFooter';
import { jsonEqual, useControllerSelector } from '../hooks/useEngineSelector';
import { useScrollToSearchMatch } from '../hooks/useScrollToSearchMatch';
import { IMultiSelectConfig } from '../type';
import { ariaGridRowCount, gridCellDomId } from '../a11y/gridRoles';
import { GridLiveRegion } from '../a11y/GridLiveRegion';
import { MobileActionButtons } from './MobileActionButtons';
import { MobileLoadMoreButton } from './MobileLoadMoreButton';
import { MobileRowFormModal } from './MobileRowFormModal';
import { MobileTableBody } from './MobileTableBody';
import { MobileTableHeader } from './MobileTableHeader';
import { useScrollAfterMobileAdd } from './useScrollAfterMobileAdd';
import { scrollToTableEnd } from './scrollToTableEnd';
import {
  GridOverlays,
  type GridOverlayComponent,
} from '../overlays';

export interface MobileTableProps {
  controller: UITableController;
  tableKey: string;
  tableTitle?: ReactNode;
  header?: ReactNode;
  footer?: boolean | ReactNode;
  multiSelectConfig?: IMultiSelectConfig;
  pluginHost?: PluginHost;
  loading?: boolean;
  loadingOverlayComponent?: GridOverlayComponent;
  noRowsOverlayComponent?: GridOverlayComponent;
}

export function MobileTable({
  controller,
  tableKey,
  tableTitle,
  header,
  footer,
  multiSelectConfig,
  pluginHost,
  loading = false,
  loadingOverlayComponent,
  noRowsOverlayComponent,
}: MobileTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileView =controller.getMobileViewState();
  const mobileEditor = mobileView?.mobileEditor ?? null;
  useEffect(() => {
    controller.resetMobileVisibleRows();
  }, [controller, tableKey]);

  useScrollToSearchMatch(scrollRef, controller);
  useScrollAfterMobileAdd(scrollRef, controller, () =>
    controller.revealAllMobileRows(),
  );

  if (!mobileView) return null;

  const viewState = controller.getViewState();
  const activeDescendant = viewState?.activeCell
    ? gridCellDomId(
        tableKey,
        viewState.activeCell.rowId,
        viewState.activeCell.columnId,
      )
    : undefined;

  return (
    <>
      <GridLiveRegion controller={controller} />
      <div className="flex flex-col w-full transition-all duration-200">
        <div className="flex items-center gap-2 bg-main-white px-1 py-2 border-gray-gray5 border-b w-full shrink-0">
          <div className="shrink-0">{tableTitle}</div>
          <div className="flex items-center ms-auto">
            <MobileActionButtons
              controller={controller}
              multiSelectConfig={multiSelectConfig}
              pluginHost={pluginHost}
            />
          </div>
        </div>

        <div
          ref={scrollRef}
          data-erp-table-scroll
          className="hidden-show-scrollBar overflow-x-auto [overflow-anchor:none] relative"
          style={{ overflowAnchor: 'none', minHeight: 160 }}
        >
          <GridOverlays
            loading={loading}
            rowCount={mobileView.totalRows}
            loadingOverlayComponent={loadingOverlayComponent}
            noRowsOverlayComponent={noRowsOverlayComponent}
          />
          <table
            className="min-w-max"
            role="grid"
            tabIndex={0}
            aria-colcount={
              mobileView.columns.filter((c) => !c.hidden).length || undefined
            }
            aria-rowcount={
              ariaGridRowCount(mobileView.totalRows, Boolean(footer)) ||
              undefined
            }
            aria-activedescendant={activeDescendant}
            data-pdg-grid-focus=""
            onFocus={(e) => {
              if (e.target !== e.currentTarget) return;
              if (controller.getActiveCell()) return;
              const firstRow = mobileView.rows[0];
              const firstCol = mobileView.columns.find(
                (c) =>
                  !c.hidden &&
                  c.fieldType !== 'index' &&
                  c.fieldName !== 'index',
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
            <MobileTableHeader controller={controller} header={header} />
            <MobileTableBody
              controller={controller}
              tableKey={tableKey}
              rows={mobileView.rows}
              columns={mobileView.columns}
            />
            {footer && (
              <ERPTableFooter
                controller={controller}
                footer={footer}
                dataRowCount={mobileView.totalRows}
              />
            )}
          </table>
        </div>

        {mobileView.hasMore && (
          <MobileLoadMoreButton
            onClick={
              
              async () =>{
                await controller.loadMoreMobileRows()
                scrollToTableEnd(scrollRef.current)
              } 


            }
            visibleCount={mobileView.visibleCount}
            totalRows={mobileView.totalRows}
          />
        )}
      </div>

      {mobileEditor && (
        <MobileRowFormModal
          controller={controller}
          tableKey={tableKey}
          editor={mobileEditor}
          onClose={() => {
            void controller.dispatch({ type: 'UI_CLOSE_MOBILE_EDITOR' });
          }}
        />
      )}
    </>
  );
}
