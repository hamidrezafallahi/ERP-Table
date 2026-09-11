import type { VisibleRange } from '../../domain/value-objects/Viewport';
import { Viewport } from '../../domain/value-objects/Viewport';
import { SparseRowIndex } from '../../engine/SparseRowIndex';
import { ViewportCalculator } from '../../engine/ViewportCalculator';

export type VirtualWindowModel<T> = {
  readonly range: VisibleRange;
  readonly visibleItems: readonly T[];
  /** Absolute row indices matching visibleItems. */
  readonly absoluteIndices: readonly number[];
  readonly spacerTop: number;
  readonly spacerBottom: number;
  readonly totalHeight: number;
};

/**
 * Pure adapter helper: map items + viewport → render window.
 * No React / DOM — unit-testable in Node.
 */
export function buildVirtualWindow<T>(
  items: readonly T[],
  viewport: Viewport,
): VirtualWindowModel<T> {
  const range = ViewportCalculator.calculate(items.length, viewport);
  const visibleItems = ViewportCalculator.projectRows(items, range);
  const absoluteIndices = ViewportCalculator.indices(range);
  return {
    range,
    visibleItems,
    absoluteIndices,
    spacerTop: range.startOffset,
    spacerBottom: range.endOffset,
    totalHeight: range.totalHeight,
  };
}

/** Same window as `buildVirtualWindow`, from SparseRowIndex.projectVisible (O(window)). */
export function buildVirtualWindowFromSparse<T>(
  index: SparseRowIndex<T>,
  viewport: Viewport,
): VirtualWindowModel<T> {
  const range = ViewportCalculator.calculate(index.size, viewport);
  const visibleItems = index.projectVisible(range);
  const absoluteIndices = ViewportCalculator.indices(range);
  return {
    range,
    visibleItems,
    absoluteIndices,
    spacerTop: range.startOffset,
    spacerBottom: range.endOffset,
    totalHeight: range.totalHeight,
  };
}

export function isSparseRowIndex<T>(
  value: readonly T[] | SparseRowIndex<T>,
): value is SparseRowIndex<T> {
  return value instanceof SparseRowIndex;
}

export function buildVirtualWindowFromSource<T>(
  items: readonly T[] | SparseRowIndex<T>,
  viewport: Viewport,
): VirtualWindowModel<T> {
  return isSparseRowIndex(items)
    ? buildVirtualWindowFromSparse(items, viewport)
    : buildVirtualWindow(items, viewport);
}

export function viewportFromScroll(params: {
  scrollOffset: number;
  viewportSize: number;
  rowHeight: number;
  overscan?: number;
}): Viewport {
  return new Viewport(
    Math.max(0, params.scrollOffset),
    params.viewportSize,
    params.rowHeight,
    params.overscan ?? 2,
  );
}

/** Debounce-friendly equality for visible window identity. */
export function virtualWindowKey(range: VisibleRange): string {
  return `${range.startIndex}:${range.endIndex}:${range.totalHeight}`;
}
