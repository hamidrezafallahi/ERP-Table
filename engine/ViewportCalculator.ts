import { Viewport, type VisibleRange } from '../domain/value-objects/Viewport';
import {
  calculateColumnViewport,
  projectColumnSlice,
  type ColumnVisibleRange,
} from './ColumnViewport';

export type { ColumnVisibleRange } from './ColumnViewport';
export {
  buildCumulativeWidths,
  calculateColumnViewport,
  projectColumnSlice,
} from './ColumnViewport';

/**
 * Pure virtual-window calculator — no DOM / window / document.
 * Vertical: totalRows + Viewport → VisibleRange.
 * Horizontal (PR-98): scrollable widths + scroll → ColumnVisibleRange.
 */
export class ViewportCalculator {
  static calculate(totalRows: number, viewport: Viewport): VisibleRange {
    const safeTotal = Math.max(0, Math.floor(totalRows));
    const { scrollOffset, viewportSize, rowHeight, overscan } = viewport;
    const totalHeight = safeTotal * rowHeight;

    if (safeTotal === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        startOffset: 0,
        endOffset: 0,
        totalHeight: 0,
        visibleCount: 0,
      };
    }

    const maxOffset = Math.max(0, totalHeight - viewportSize);
    const clampedScroll = Math.min(scrollOffset, maxOffset);

    const rawStart = Math.floor(clampedScroll / rowHeight);
    const rawEnd = Math.ceil((clampedScroll + viewportSize) / rowHeight);

    const startIndex = Math.max(0, rawStart - overscan);
    const endIndex = Math.min(safeTotal, rawEnd + overscan);

    return {
      startIndex,
      endIndex,
      startOffset: startIndex * rowHeight,
      endOffset: Math.max(0, totalHeight - endIndex * rowHeight),
      totalHeight,
      visibleCount: Math.max(0, endIndex - startIndex),
    };
  }

  /** Contiguous index list for the visible window. */
  static indices(range: VisibleRange): number[] {
    const out: number[] = [];
    for (let i = range.startIndex; i < range.endIndex; i += 1) {
      out.push(i);
    }
    return out;
  }

  /** Slice a dense array by VisibleRange (O(window), not O(n)). */
  static projectRows<T>(rows: readonly T[], range: VisibleRange): T[] {
    return rows.slice(range.startIndex, range.endIndex);
  }

  /**
   * Project from sparse structure: ordered id list + Map by id.
   * Suitable for 100k+ tables without materializing full UI rows.
   */
  static projectByIndex<T>(
    orderedIds: readonly number[],
    byId: ReadonlyMap<number, T>,
    range: VisibleRange,
  ): T[] {
    const out: T[] = [];
    const end = Math.min(range.endIndex, orderedIds.length);
    for (let i = range.startIndex; i < end; i += 1) {
      const id = orderedIds[i];
      const row = byId.get(id);
      if (row !== undefined) out.push(row);
    }
    return out;
  }

  /** Horizontal column window (PR-98). */
  static calculateColumns(
    scrollableWidths: readonly number[],
    scrollOffset: number,
    viewportSize: number,
    pinnedStartWidth = 0,
    overscan = 1,
    pinnedEndWidth = 0,
  ): ColumnVisibleRange {
    return calculateColumnViewport(
      scrollableWidths,
      scrollOffset,
      viewportSize,
      pinnedStartWidth,
      overscan,
      pinnedEndWidth,
    );
  }

  static projectColumns<T>(
    items: readonly T[],
    range: ColumnVisibleRange,
  ): T[] {
    return projectColumnSlice(items, range);
  }
}
