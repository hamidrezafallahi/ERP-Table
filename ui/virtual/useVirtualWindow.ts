import { useEffect, useState } from 'react';

import type { GridSession } from '../../application/session/GridSession';
import { Viewport } from '../../domain/value-objects/Viewport';
import { structuralEqual } from '../../engine/equality';
import {
  buildVirtualWindowFromSource,
  isSparseRowIndex,
  type VirtualWindowModel,
  virtualWindowKey,
} from './virtualWindow';
import type { SparseRowIndex } from '../../engine/SparseRowIndex';

export type UseVirtualWindowResult<T> = VirtualWindowModel<T> & {
  readonly onScroll: (scrollTop: number, clientHeight?: number) => void;
};

/**
 * Syncs GridSession viewport with a scrollable container and returns
 * only the visible item window for rendering.
 */
export function useVirtualWindow<T>(
  session: GridSession | null | undefined,
  items: readonly T[] | SparseRowIndex<T>,
  options?: {
    rowHeight?: number;
    overscan?: number;
    initialViewportSize?: number;
  },
): UseVirtualWindowResult<T> {
  const rowHeight = options?.rowHeight ?? 40;
  const overscan = options?.overscan ?? 2;
  const initialViewportSize = options?.initialViewportSize ?? 400;

  const [windowModel, setWindowModel] = useState<VirtualWindowModel<T>>(() =>
    buildVirtualWindowFromSource(
      items,
      session?.getViewport() ??
        new Viewport(0, initialViewportSize, rowHeight, overscan),
    ),
  );

  useEffect(() => {
    if (!session) {
      setWindowModel(
        buildVirtualWindowFromSource(
          items,
          new Viewport(0, initialViewportSize, rowHeight, overscan),
        ),
      );
      return;
    }

    const sync = () => {
      const next = buildVirtualWindowFromSource(items, session.getViewport());
      setWindowModel((prev) =>
        virtualWindowKey(prev.range) === virtualWindowKey(next.range) &&
        prev.visibleItems.length === next.visibleItems.length &&
        prev.visibleItems.every((item, i) => Object.is(item, next.visibleItems[i]))
          ? prev
          : next,
      );
    };

    sync();

    return session.subscribeSelected(
      () => {
        const vp = session.getViewport();
        const itemCount = isSparseRowIndex(items)
          ? session.getUiRowCount()
          : items.length;
        return {
          scrollOffset: vp.scrollOffset,
          viewportSize: vp.viewportSize,
          rowHeight: vp.rowHeight,
          overscan: vp.overscan,
          itemCount,
        };
      },
      sync,
      structuralEqual,
    );
  }, [session, items, rowHeight, overscan, initialViewportSize]);

  const onScroll = (scrollTop: number, clientHeight?: number) => {
    if (!session) return;
    void session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: Math.max(0, scrollTop),
      viewportSize: clientHeight,
      rowHeight,
      overscan,
    });
  };

  return {
    ...windowModel,
    onScroll,
  };
}
