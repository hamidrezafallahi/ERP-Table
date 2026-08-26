"use client";

import React, { useCallback, useRef } from 'react';

import type { GridSession } from '../../application/session/GridSession';
import { useVirtualWindow } from './useVirtualWindow';

export type VirtualListProps<T> = {
  session: GridSession;
  items: readonly T[];
  /** Scrollport height in pixels. */
  height: number;
  rowHeight?: number;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  getItemKey?: (item: T, absoluteIndex: number) => string | number;
  renderItem: (item: T, absoluteIndex: number) => React.ReactNode;
};

/**
 * Thin React adapter for Core ViewportCalculator.
 * Renders spacers + absolute-positioned visible rows only.
 */
export function VirtualList<T>({
  session,
  items,
  height,
  rowHeight = 40,
  overscan = 2,
  className,
  style,
  getItemKey,
  renderItem,
}: VirtualListProps<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const {
    visibleItems,
    absoluteIndices,
    spacerTop,
    spacerBottom,
    totalHeight,
    onScroll,
  } = useVirtualWindow(session, items, {
    rowHeight,
    overscan,
    initialViewportSize: height,
  });

  // Keep session viewportSize aligned with the scrollport height.
  React.useEffect(() => {
    void session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: session.getViewport().scrollOffset,
      viewportSize: height,
      rowHeight,
      overscan,
    });
  }, [session, height, rowHeight, overscan]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const el = event.currentTarget;
      onScroll(el.scrollTop, el.clientHeight);
    },
    [onScroll],
  );

  return (
    <div
      ref={scrollerRef}
      data-erp-virtual-list
      className={className}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ height: spacerTop }} aria-hidden />
        {visibleItems.map((item, i) => {
          const absoluteIndex = absoluteIndices[i] ?? i;
          const key = getItemKey
            ? getItemKey(item, absoluteIndex)
            : absoluteIndex;
          return (
            <div
              key={key}
              data-erp-virtual-row={absoluteIndex}
              style={{
                height: rowHeight,
                boxSizing: 'border-box',
              }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
        <div style={{ height: spacerBottom }} aria-hidden />
      </div>
    </div>
  );
}
