import {
  isCellInRange,
  type CellAddress,
  type CellRange,
} from './cellRange';

export type CellRangeEdgeFlags = {
  inRange: boolean;
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
};

const EMPTY_FLAGS: CellRangeEdgeFlags = {
  inRange: false,
  top: false,
  bottom: false,
  left: false,
  right: false,
};

/** Which edges of a cell should show range chrome (PR-105). */
export function resolveCellRangePresentation(
  cell: CellAddress,
  ranges: readonly CellRange[],
): CellRangeEdgeFlags {
  if (ranges.length === 0) return EMPTY_FLAGS;

  const flags: CellRangeEdgeFlags = { ...EMPTY_FLAGS, inRange: false };

  for (const range of ranges) {
    if (!isCellInRange(cell, range)) continue;
    flags.inRange = true;
    if (cell.rowIndex === range.startRow) flags.top = true;
    if (cell.rowIndex === range.endRow) flags.bottom = true;
    if (range.colIds.length > 0) {
      if (cell.colId === range.colIds[0]) flags.left = true;
      if (cell.colId === range.colIds[range.colIds.length - 1]) {
        flags.right = true;
      }
    }
  }

  return flags;
}

export function cellRangeEdgeAttr(
  flags: CellRangeEdgeFlags,
): string | undefined {
  if (!flags.inRange) return undefined;
  const parts: string[] = [];
  if (flags.top) parts.push('top');
  if (flags.bottom) parts.push('bottom');
  if (flags.left) parts.push('left');
  if (flags.right) parts.push('right');
  return parts.length > 0 ? parts.join(' ') : undefined;
}

export function cellRangeClassName(flags: CellRangeEdgeFlags): string {
  if (!flags.inRange) return '';
  return 'pdg-cell-range';
}
