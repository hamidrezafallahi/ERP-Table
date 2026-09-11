"use client";

import React, {
  type RefObject,
  useEffect,
  useRef,
} from 'react';

import type { GridSession } from '../../application/session/GridSession';
import { columnSizeStyle } from '../../engine/columnWidth';
import { UITableController } from '../../infrastructure/ui/UITableController';
import type { UIRow } from '../type';
import { indexPinClassName, indexPinDataAttr } from '../columnPin';
import { useVirtualWindow } from '../virtual/useVirtualWindow';
import { ERPTableRow } from './eRPTableRow';

const DEFAULT_ROW_HEIGHT = 40;

type Props = {
  controller: UITableController;
  session: GridSession;
  tableKey: string;
  scrollParentRef: RefObject<HTMLDivElement | null>;
  viewportHeight: number;
  rowHeight?: number;
  overscan?: number;
  moreDetailComponent?: React.ComponentType<{ data: unknown }>;
};

/**
 * Table-native virtual body: same ERPTableRow as pagination path,
 * but only the visible window (via GridSession viewport) is mounted.
 */
export function ERPTableVirtualBody({
  controller,
  session,
  tableKey,
  scrollParentRef,
  viewportHeight,
  rowHeight = DEFAULT_ROW_HEIGHT,
  overscan = 2,
  moreDetailComponent: MoreDetailComponent,
}: Props) {
  const table = controller.getViewState();
  const dragRowId = useRef<number | null>(null);
  const uiRowIndex = session.getEngine().getUiRowIndex();

  const {
    visibleItems: visibleIds,
    absoluteIndices,
    spacerTop,
    spacerBottom,
    onScroll,
  } = useVirtualWindow(session, uiRowIndex, {
    rowHeight,
    overscan,
    initialViewportSize: viewportHeight,
  });

  const visibleItems = visibleIds
    .map((id) => controller.getRowView(id))
    .filter((row): row is UIRow => row != null);

  useEffect(() => {
    void session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: session.getViewport().scrollOffset,
      viewportSize: viewportHeight,
      rowHeight,
      overscan,
    });
  }, [session, viewportHeight, rowHeight, overscan]);

  useEffect(() => {
    const el = scrollParentRef.current;
    if (!el) return;

    const handleScroll = () => {
      onScroll(el.scrollTop, el.clientHeight);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollParentRef, onScroll]);

  if (!table) return null;

  const visibleColumns = (table.columns ?? []).filter((c) => !c.hidden);
  const spacerStyle = {
    height: 0,
    padding: 0,
    border: 'none',
    lineHeight: 0,
  } as const;

  const renderSpacer = (kind: 'top' | 'bottom', height: number) => {
    if (height <= 0) return null;
    return (
      <tr aria-hidden role="presentation" data-erp-virtual-spacer={kind}>
        {visibleColumns.map((c) => (
          <td
            key={c.fieldName}
            role="presentation"
            className={indexPinClassName(c)}
            data-erp-col-pin={indexPinDataAttr(c)}
            style={{
              ...spacerStyle,
              height,
              ...columnSizeStyle(c, table.columnWidths),
            }}
          />
        ))}
      </tr>
    );
  };

  return (
    <tbody className="w-full min-w-0 overflow-x-auto" data-erp-virtual-body role="rowgroup">
      {renderSpacer('top', spacerTop)}

      {visibleItems.map((row, i) => {
        const absoluteIndex = absoluteIndices[i] ?? i;
        return (
          <ERPTableRow
            key={row.id}
            row={row}
            stripeIndex={absoluteIndex}
            index={absoluteIndex}
            table={table}
            controller={controller}
            tableKey={tableKey}
            draggedRowIdRef={dragRowId}
            moreDetailComponent={MoreDetailComponent}
            isSelected={!!table.selectedRows?.[row.id]}
            isActive={!!controller.isActiveRow(row.id)}
            isCut={!!controller.isCutRow(row.id)}
          />
        );
      })}

      {renderSpacer('bottom', spacerBottom)}
    </tbody>
  );
}
