/**
 * Pure cell-range selection model (PR-104).
 * No React/DOM — keyboard/UI wiring lands in PR-105+.
 */

export type CellAddress = {
  /** 0-based index in the visible/sorted row list. */
  rowIndex: number;
  colId: string;
};

/** Inclusive rectangular range in UI row/column space. */
export type CellRange = {
  startRow: number;
  endRow: number;
  /** Column ids in document order (inclusive span). */
  colIds: readonly string[];
};

export type CellRangeSelection = {
  ranges: readonly CellRange[];
  anchor: CellAddress | null;
  focus: CellAddress | null;
};

export type CellRangeBounds = {
  rowCount: number;
  /** Visible/selectable columns in document order. */
  columnOrder: readonly string[];
};

export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

export function createEmptyCellRangeSelection(): CellRangeSelection {
  return { ranges: [], anchor: null, focus: null };
}

export function colIndex(
  colId: string,
  columnOrder: readonly string[],
): number {
  return columnOrder.indexOf(colId);
}

export function clampRowIndex(rowIndex: number, rowCount: number): number {
  if (rowCount <= 0) return 0;
  return Math.max(0, Math.min(rowCount - 1, rowIndex));
}

export function clampColIndex(colIndex: number, colCount: number): number {
  if (colCount <= 0) return 0;
  return Math.max(0, Math.min(colCount - 1, colIndex));
}

function columnSpan(
  colIds: readonly string[],
  columnOrder: readonly string[],
): { start: number; end: number } | null {
  if (colIds.length === 0 || columnOrder.length === 0) return null;
  let start = Infinity;
  let end = -Infinity;
  for (const id of colIds) {
    const idx = colIndex(id, columnOrder);
    if (idx < 0) continue;
    start = Math.min(start, idx);
    end = Math.max(end, idx);
  }
  if (!Number.isFinite(start) || end < 0) return null;
  return { start, end };
}

function colIdsFromSpan(
  start: number,
  end: number,
  columnOrder: readonly string[],
): readonly string[] {
  const from = Math.max(0, Math.min(start, end));
  const to = Math.min(columnOrder.length - 1, Math.max(start, end));
  if (columnOrder.length === 0 || from > to) return [];
  return columnOrder.slice(from, to + 1);
}

/**
 * Clamp rows/columns to bounds and sort `colIds` by `columnOrder`.
 */
export function normalizeCellRange(
  range: CellRange,
  bounds: CellRangeBounds,
): CellRange {
  const { rowCount, columnOrder } = bounds;
  if (rowCount <= 0 || columnOrder.length === 0) {
    return { startRow: 0, endRow: -1, colIds: [] };
  }

  const startRow = clampRowIndex(
    Math.min(range.startRow, range.endRow),
    rowCount,
  );
  const endRow = clampRowIndex(
    Math.max(range.startRow, range.endRow),
    rowCount,
  );

  const span = columnSpan(range.colIds, columnOrder);
  const colIds = span
    ? colIdsFromSpan(span.start, span.end, columnOrder)
    : colIdsFromSpan(0, columnOrder.length - 1, columnOrder);

  return { startRow, endRow, colIds };
}

export function rangeFromAnchorFocus(
  anchor: CellAddress,
  focus: CellAddress,
  bounds: CellRangeBounds,
): CellRange {
  const { rowCount, columnOrder } = bounds;
  const aCol = colIndex(anchor.colId, columnOrder);
  const fCol = colIndex(focus.colId, columnOrder);
  const safeACol = aCol >= 0 ? aCol : 0;
  const safeFCol = fCol >= 0 ? fCol : safeACol;

  return normalizeCellRange(
    {
      startRow: anchor.rowIndex,
      endRow: focus.rowIndex,
      colIds: colIdsFromSpan(safeACol, safeFCol, columnOrder),
    },
    { rowCount, columnOrder },
  );
}

export function isCellInRange(
  cell: CellAddress,
  range: CellRange,
): boolean {
  if (
    cell.rowIndex < range.startRow ||
    cell.rowIndex > range.endRow
  ) {
    return false;
  }
  return range.colIds.includes(cell.colId);
}

export function rangesOverlap(a: CellRange, b: CellRange): boolean {
  const rowOverlap =
    a.startRow <= b.endRow && b.startRow <= a.endRow;
  if (!rowOverlap) return false;

  const aCols = new Set(a.colIds);
  for (const col of b.colIds) {
    if (aCols.has(col)) return true;
  }
  return false;
}

function unionRange(a: CellRange, b: CellRange, columnOrder: readonly string[]): CellRange {
  const aSpan = columnSpan(a.colIds, columnOrder);
  const bSpan = columnSpan(b.colIds, columnOrder);
  const colStart = Math.min(aSpan?.start ?? 0, bSpan?.start ?? 0);
  const colEnd = Math.max(
    aSpan?.end ?? columnOrder.length - 1,
    bSpan?.end ?? columnOrder.length - 1,
  );
  return {
    startRow: Math.min(a.startRow, b.startRow),
    endRow: Math.max(a.endRow, b.endRow),
    colIds: colIdsFromSpan(colStart, colEnd, columnOrder),
  };
}

/**
 * Merge overlapping/adjacent rectangles into a minimal set.
 */
export function mergeCellRanges(
  ranges: readonly CellRange[],
  columnOrder: readonly string[],
): CellRange[] {
  if (ranges.length <= 1) return [...ranges];

  let merged: CellRange[] = ranges.map((r) => ({
    ...r,
    colIds: [...r.colIds],
  }));
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < merged.length; i += 1) {
      for (let j = i + 1; j < merged.length; j += 1) {
        if (rangesOverlap(merged[i], merged[j])) {
          const next = unionRange(merged[i], merged[j], columnOrder);
          merged = merged.filter((_, idx) => idx !== i && idx !== j);
          merged.push(next);
          changed = true;
          break outer;
        }
      }
    }
  }
  return merged;
}

export function moveCellAddress(
  cell: CellAddress,
  direction: ArrowDirection,
  bounds: CellRangeBounds,
): CellAddress {
  const { rowCount, columnOrder } = bounds;
  const colIdx = colIndex(cell.colId, columnOrder);
  const safeColIdx = colIdx >= 0 ? colIdx : 0;

  let nextRow = cell.rowIndex;
  let nextColIdx = safeColIdx;

  switch (direction) {
    case 'up':
      nextRow = cell.rowIndex - 1;
      break;
    case 'down':
      nextRow = cell.rowIndex + 1;
      break;
    case 'left':
      nextColIdx = safeColIdx - 1;
      break;
    case 'right':
      nextColIdx = safeColIdx + 1;
      break;
    default:
      break;
  }

  return {
    rowIndex: clampRowIndex(nextRow, rowCount),
    colId: columnOrder[clampColIndex(nextColIdx, columnOrder.length)] ?? cell.colId,
  };
}

function singleCellRange(cell: CellAddress, bounds: CellRangeBounds): CellRange {
  return normalizeCellRange(
    {
      startRow: cell.rowIndex,
      endRow: cell.rowIndex,
      colIds: [cell.colId],
    },
    bounds,
  );
}

function withPrimaryRange(
  selection: CellRangeSelection,
  range: CellRange,
  anchor: CellAddress,
  focus: CellAddress,
  keepOthers: boolean,
): CellRangeSelection {
  const ranges = keepOthers
    ? [...selection.ranges.slice(0, -1), range]
    : [range];
  return {
    ranges,
    anchor,
    focus,
  };
}

/** Plain click — single 1×1 range. */
export function clickCell(
  selection: CellRangeSelection,
  cell: CellAddress,
  bounds: CellRangeBounds,
): CellRangeSelection {
  const range = singleCellRange(cell, bounds);
  return {
    ranges: [range],
    anchor: cell,
    focus: cell,
  };
}

/** Shift+Click — extend from anchor to clicked cell (replace primary range). */
export function shiftClickCell(
  selection: CellRangeSelection,
  cell: CellAddress,
  bounds: CellRangeBounds,
): CellRangeSelection {
  const anchor = selection.anchor ?? selection.focus ?? cell;
  const range = rangeFromAnchorFocus(anchor, cell, bounds);
  return {
    ranges: [range],
    anchor,
    focus: cell,
  };
}

/** Ctrl+Click — add a new 1×1 range; anchor/focus move to the new cell. */
export function ctrlClickCell(
  selection: CellRangeSelection,
  cell: CellAddress,
  bounds: CellRangeBounds,
): CellRangeSelection {
  const range = singleCellRange(cell, bounds);
  return {
    ranges: [...selection.ranges, range],
    anchor: cell,
    focus: cell,
  };
}

/** Shift+Arrow — extend primary range from anchor to moved focus. */
export function shiftArrowCell(
  selection: CellRangeSelection,
  direction: ArrowDirection,
  bounds: CellRangeBounds,
): CellRangeSelection {
  const focus = selection.focus ?? selection.anchor;
  if (!focus) return selection;

  const anchor = selection.anchor ?? focus;
  const nextFocus = moveCellAddress(focus, direction, bounds);
  const range = rangeFromAnchorFocus(anchor, nextFocus, bounds);

  const keepOthers = selection.ranges.length > 1;
  return withPrimaryRange(selection, range, anchor, nextFocus, keepOthers);
}

/** Jump focus to the row edge (first/last column) or grid corner. */
export function jumpCellAddress(
  cell: CellAddress,
  target: 'rowStart' | 'rowEnd' | 'gridFirst' | 'gridLast',
  bounds: CellRangeBounds,
): CellAddress {
  const { rowCount, columnOrder } = bounds;
  if (rowCount <= 0 || columnOrder.length === 0) return cell;

  switch (target) {
    case 'rowStart':
      return { rowIndex: cell.rowIndex, colId: columnOrder[0] };
    case 'rowEnd':
      return {
        rowIndex: cell.rowIndex,
        colId: columnOrder[columnOrder.length - 1],
      };
    case 'gridFirst':
      return { rowIndex: 0, colId: columnOrder[0] };
    case 'gridLast':
      return {
        rowIndex: rowCount - 1,
        colId: columnOrder[columnOrder.length - 1],
      };
    default:
      return cell;
  }
}

/** Ctrl+Shift+Arrow — extend primary range from anchor to the grid edge. */
export function extendCellRangeToEdge(
  selection: CellRangeSelection,
  direction: ArrowDirection,
  bounds: CellRangeBounds,
): CellRangeSelection {
  const anchor = selection.anchor ?? selection.focus;
  if (!anchor) return selection;

  const focus = selection.focus ?? anchor;
  let edgeFocus: CellAddress;

  switch (direction) {
    case 'up':
      edgeFocus = { rowIndex: 0, colId: focus.colId };
      break;
    case 'down':
      edgeFocus = {
        rowIndex: Math.max(0, bounds.rowCount - 1),
        colId: focus.colId,
      };
      break;
    case 'left':
      edgeFocus = {
        rowIndex: focus.rowIndex,
        colId: bounds.columnOrder[0] ?? focus.colId,
      };
      break;
    case 'right':
      edgeFocus = {
        rowIndex: focus.rowIndex,
        colId:
          bounds.columnOrder[bounds.columnOrder.length - 1] ?? focus.colId,
      };
      break;
    default:
      edgeFocus = focus;
  }

  const range = rangeFromAnchorFocus(anchor, edgeFocus, bounds);
  const keepOthers = selection.ranges.length > 1;
  return withPrimaryRange(selection, range, anchor, edgeFocus, keepOthers);
}

/** Ctrl+A — one range over the full grid body. */
export function selectAllCellRanges(
  bounds: CellRangeBounds,
): CellRangeSelection {
  const { rowCount, columnOrder } = bounds;
  if (rowCount <= 0 || columnOrder.length === 0) {
    return createEmptyCellRangeSelection();
  }

  const range = normalizeCellRange(
    {
      startRow: 0,
      endRow: rowCount - 1,
      colIds: [...columnOrder],
    },
    bounds,
  );

  const anchor: CellAddress = {
    rowIndex: 0,
    colId: columnOrder[0],
  };
  const focus: CellAddress = {
    rowIndex: rowCount - 1,
    colId: columnOrder[columnOrder.length - 1],
  };

  return { ranges: [range], anchor, focus };
}
