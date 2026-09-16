import { describe, expect, it } from 'vitest';

import {
  createEmptyCellRangeSelection,
  extendCellRangeToEdge,
  jumpCellAddress,
  rangeFromAnchorFocus,
  type CellRangeBounds,
} from '../selection/cellRange';

const COLS = ['index', 'name', 'amount'] as const;

function bounds(rowCount = 5): CellRangeBounds {
  return { rowCount, columnOrder: [...COLS] };
}

describe('PR-109 keyboard navigation (pure)', () => {
  it('Home/End jump within row', () => {
    const cell = { rowIndex: 2, colId: 'amount' };
    expect(jumpCellAddress(cell, 'rowStart', bounds())).toEqual({
      rowIndex: 2,
      colId: 'index',
    });
    expect(jumpCellAddress(cell, 'rowEnd', bounds())).toEqual({
      rowIndex: 2,
      colId: 'amount',
    });
  });

  it('Ctrl+Home / Ctrl+End jump to grid corners', () => {
    const cell = { rowIndex: 2, colId: 'name' };
    expect(jumpCellAddress(cell, 'gridFirst', bounds())).toEqual({
      rowIndex: 0,
      colId: 'index',
    });
    expect(jumpCellAddress(cell, 'gridLast', bounds())).toEqual({
      rowIndex: 4,
      colId: 'amount',
    });
  });

  it('Ctrl+Shift+Arrow extends range to edge', () => {
    const selection = {
      ...createEmptyCellRangeSelection(),
      anchor: { rowIndex: 2, colId: 'name' },
      focus: { rowIndex: 2, colId: 'name' },
      ranges: [
        rangeFromAnchorFocus(
          { rowIndex: 2, colId: 'name' },
          { rowIndex: 2, colId: 'name' },
          bounds(),
        ),
      ],
    };

    const down = extendCellRangeToEdge(selection, 'down', bounds());
    expect(down.focus).toEqual({ rowIndex: 4, colId: 'name' });
    expect(down.ranges[0]?.endRow).toBe(4);

    const right = extendCellRangeToEdge(selection, 'right', bounds());
    expect(right.focus).toEqual({ rowIndex: 2, colId: 'amount' });
  });
});
