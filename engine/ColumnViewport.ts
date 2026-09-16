/**
 * Horizontal column window (PR-98).
 * Variable-width columns via cumulative widths + binary search.
 * Pinned columns are excluded from the scrollable slice (always rendered by the host).
 */

export type ColumnVisibleRange = {
  /** Inclusive start into the scrollable-widths array. */
  startIndex: number;
  /** Exclusive end into the scrollable-widths array. */
  endIndex: number;
  /** px before the first visible scrollable column. */
  spacerStart: number;
  /** px after the last visible scrollable column. */
  spacerEnd: number;
  totalScrollableWidth: number;
  visibleCount: number;
};

/** Prefix sums: `cum[i]` = sum(widths[0..i)). Length = widths.length + 1. */
export function buildCumulativeWidths(widths: readonly number[]): number[] {
  const cum = new Array<number>(widths.length + 1);
  cum[0] = 0;
  for (let i = 0; i < widths.length; i += 1) {
    const w = widths[i] ?? 0;
    cum[i + 1] = cum[i]! + (Number.isFinite(w) && w > 0 ? w : 0);
  }
  return cum;
}

/** First index `i` where `cum[i] > value` (cum is non-decreasing). */
export function upperBoundCumulative(cum: readonly number[], value: number): number {
  let lo = 0;
  let hi = cum.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((cum[mid] ?? 0) > value) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

/**
 * First scrollable column whose end exceeds `viewStart` (absolute px from table start).
 * `cum` is relative to the scrollable region (starts at 0).
 */
export function findStartColumnIndex(
  cum: readonly number[],
  viewStartInScrollable: number,
): number {
  if (cum.length <= 1) return 0;
  // first i where cum[i+1] > viewStart ⇔ upperBound(cum, viewStart) - 1, clamped
  const idx = upperBoundCumulative(cum, viewStartInScrollable) - 1;
  return Math.max(0, Math.min(cum.length - 2, idx));
}

/** First column index whose start is >= viewEnd (exclusive end). */
export function findEndColumnIndex(
  cum: readonly number[],
  viewEndInScrollable: number,
): number {
  if (cum.length <= 1) return 0;
  const idx = upperBoundCumulative(cum, viewEndInScrollable - Number.EPSILON);
  // upperBound returns first cum[i] > viewEnd-ε; we want first start >= viewEnd
  // If cum[i] is start of column i, first i with cum[i] >= viewEnd:
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((cum[mid] ?? 0) >= viewEndInScrollable) hi = mid;
    else lo = mid + 1;
  }
  return Math.max(0, Math.min(cum.length - 1, lo));
}

/**
 * @param scrollableWidths widths of non-pinned columns in document order
 * @param scrollOffset absolute scroll from table inline-start (px)
 * @param viewportSize visible width of the scrollport (px)
 * @param pinnedStartWidth total width of inline-start pinned columns (px)
 * @param overscan extra columns on each side
 * @param pinnedEndWidth total width of inline-end pinned columns (px)
 */
export function calculateColumnViewport(
  scrollableWidths: readonly number[],
  scrollOffset: number,
  viewportSize: number,
  pinnedStartWidth = 0,
  overscan = 1,
  pinnedEndWidth = 0,
): ColumnVisibleRange {
  const cum = buildCumulativeWidths(scrollableWidths);
  const totalScrollableWidth = cum[cum.length - 1] ?? 0;
  const n = scrollableWidths.length;

  if (n === 0 || viewportSize <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      spacerStart: 0,
      spacerEnd: 0,
      totalScrollableWidth,
      visibleCount: 0,
    };
  }

  const maxScroll = Math.max(
    0,
    pinnedStartWidth + totalScrollableWidth + pinnedEndWidth - viewportSize,
  );
  const clampedScroll = Math.min(Math.max(0, scrollOffset), maxScroll);
  const scrollableViewport = Math.max(
    0,
    viewportSize - pinnedStartWidth - pinnedEndWidth,
  );

  const relStart = Math.max(0, clampedScroll - pinnedStartWidth);
  const relEnd = relStart + scrollableViewport;

  let startIndex = findStartColumnIndex(cum, relStart);
  let endIndex = findEndColumnIndex(cum, relEnd);

  startIndex = Math.max(0, startIndex - overscan);
  endIndex = Math.min(n, endIndex + overscan);
  if (endIndex < startIndex) endIndex = startIndex;

  const spacerStart = cum[startIndex] ?? 0;
  const spacerEnd = Math.max(0, totalScrollableWidth - (cum[endIndex] ?? 0));

  return {
    startIndex,
    endIndex,
    spacerStart,
    spacerEnd,
    totalScrollableWidth,
    visibleCount: Math.max(0, endIndex - startIndex),
  };
}

export function projectColumnSlice<T>(
  items: readonly T[],
  range: ColumnVisibleRange,
): T[] {
  return items.slice(range.startIndex, range.endIndex);
}
