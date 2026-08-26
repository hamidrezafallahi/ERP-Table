"use client";

import React, {
  type RefObject,
  useEffect,
  useRef,
} from 'react';

import type { GridSession } from '../../application/session/GridSession';
import { UITableController } from '../../infrastructure/ui/UITableController';
import type { UIRow } from '../type';
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
  const allRows = (controller.getAllUIRows() ?? []) as UIRow[];

  const sortedRows = [...allRows].sort(
    (a, b) =>
      (Number(a.cells['index']?.value) || 0) -
      (Number(b.cells['index']?.value) || 0),
  );

  const {
    visibleItems,
    absoluteIndices,
    spacerTop,
    spacerBottom,
    onScroll,
  } = useVirtualWindow(session, sortedRows, {
    rowHeight,
    overscan,
    initialViewportSize: viewportHeight,
  });

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

  const colSpan = Math.max(
    1,
    (table.columns ?? []).filter((c) => !c.hidden).length,
  );

  return (
    <tbody className="w-full min-w-0 overflow-x-auto" data-erp-virtual-body>
      {spacerTop > 0 ? (
        <tr aria-hidden data-erp-virtual-spacer="top">
          <td
            colSpan={colSpan}
            style={{
              height: spacerTop,
              padding: 0,
              border: 'none',
              lineHeight: 0,
            }}
          />
        </tr>
      ) : null}

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
          />
        );
      })}

      {spacerBottom > 0 ? (
        <tr aria-hidden data-erp-virtual-spacer="bottom">
          <td
            colSpan={colSpan}
            style={{
              height: spacerBottom,
              padding: 0,
              border: 'none',
              lineHeight: 0,
            }}
          />
        </tr>
      ) : null}
    </tbody>
  );
}
