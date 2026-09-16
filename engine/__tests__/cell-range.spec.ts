import { describe, expect, it } from 'vitest';

import {
  clickCell,
  createEmptyCellRangeSelection,
  ctrlClickCell,
  isCellInRange,
  mergeCellRanges,
  moveCellAddress,
  normalizeCellRange,
  rangeFromAnchorFocus,
  selectAllCellRanges,
  shiftArrowCell,
  shiftClickCell,
  type CellRangeBounds,
} from '../selection/cellRange';

const COLS = ['index', 'name', 'amount'] as const;

function bounds(rowCount = 5): CellRangeBounds {
  return { rowCount, columnOrder: [...COLS] };
}

describe('PR-104 cellRange model', () => {
  it('normalizes inverted rows and column order', () => {
    const normalized = normalizeCellRange(
      {
        startRow: 4,
        endRow: 1,
        colIds: ['amount', 'name'],
      },
      bounds(),
    );
    expect(normalized).toEqual({
      startRow: 1,
      endRow: 4,
      colIds: ['name', 'amount'],
    });
  });

  it('clamps range to grid bounds', () => {
    const normalized = normalizeCellRange(
      {
        startRow: -3,
        endRow: 99,
        colIds: ['missing', 'name'],
      },
      bounds(3),
    );
    expect(normalized.startRow).toBe(0);
    expect(normalized.endRow).toBe(2);
    expect(normalized.colIds).toEqual(['name']);
  });

  it('builds a rectangle from anchor and focus', () => {
    const range = rangeFromAnchorFocus(
      { rowIndex: 1, colId: 'name' },
      { rowIndex: 3, colId: 'amount' },
      bounds(),
    );
    expect(range).toEqual({
      startRow: 1,
      endRow: 3,
      colIds: ['name', 'amount'],
    });
    expect(
      isCellInRange({ rowIndex: 2, colId: 'name' }, range),
    ).toBe(true);
    expect(
      isCellInRange({ rowIndex: 0, colId: 'name' }, range),
    ).toBe(false);
  });

  it('merges overlapping ranges', () => {
    const merged = mergeCellRanges(
      [
        { startRow: 0, endRow: 1, colIds: ['name'] },
        { startRow: 1, endRow: 2, colIds: ['name', 'amount'] },
      ],
      COLS,
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual({
      startRow: 0,
      endRow: 2,
      colIds: ['name', 'amount'],
    });
  });

  it('keeps disjoint ranges separate', () => {
    const merged = mergeCellRanges(
      [
        { startRow: 0, endRow: 0, colIds: ['name'] },
        { startRow: 2, endRow: 2, colIds: ['amount'] },
      ],
      COLS,
    );
    expect(merged).toHaveLength(2);
  });

  it('plain click selects a single cell', () => {
    const next = clickCell(
      createEmptyCellRangeSelection(),
      { rowIndex: 2, colId: 'amount' },
      bounds(),
    );
    expect(next.ranges).toHaveLength(1);
    expect(next.anchor).toEqual({ rowIndex: 2, colId: 'amount' });
    expect(next.focus).toEqual(next.anchor);
    expect(next.ranges[0]).toEqual({
      startRow: 2,
      endRow: 2,
      colIds: ['amount'],
    });
  });

  it('shift+click extends from anchor', () => {
    let sel = clickCell(
      createEmptyCellRangeSelection(),
      { rowIndex: 1, colId: 'name' },
      bounds(),
    );
    sel = shiftClickCell(sel, { rowIndex: 3, colId: 'amount' }, bounds());
    expect(sel.ranges[0]).toEqual({
      startRow: 1,
      endRow: 3,
      colIds: ['name', 'amount'],
    });
    expect(sel.anchor).toEqual({ rowIndex: 1, colId: 'name' });
    expect(sel.focus).toEqual({ rowIndex: 3, colId: 'amount' });
  });

  it('ctrl+click adds another range', () => {
    let sel = clickCell(
      createEmptyCellRangeSelection(),
      { rowIndex: 0, colId: 'name' },
      bounds(),
    );
    sel = ctrlClickCell(sel, { rowIndex: 4, colId: 'amount' }, bounds());
    expect(sel.ranges).toHaveLength(2);
    expect(sel.ranges[1]).toEqual({
      startRow: 4,
      endRow: 4,
      colIds: ['amount'],
    });
  });

  it('shift+arrow expands from anchor to moved focus', () => {
    let sel = clickCell(
      createEmptyCellRangeSelection(),
      { rowIndex: 2, colId: 'name' },
      bounds(),
    );
    sel = shiftArrowCell(sel, 'down', bounds());
    expect(sel.focus).toEqual({ rowIndex: 3, colId: 'name' });
    expect(sel.ranges[0]).toEqual({
      startRow: 2,
      endRow: 3,
      colIds: ['name'],
    });

    sel = shiftArrowCell(sel, 'right', bounds());
    expect(sel.focus).toEqual({ rowIndex: 3, colId: 'amount' });
    expect(sel.ranges[0]).toEqual({
      startRow: 2,
      endRow: 3,
      colIds: ['name', 'amount'],
    });
  });

  it('moveCellAddress clamps at grid edges', () => {
    expect(
      moveCellAddress(
        { rowIndex: 0, colId: 'name' },
        'up',
        bounds(3),
      ),
    ).toEqual({ rowIndex: 0, colId: 'name' });
    expect(
      moveCellAddress(
        { rowIndex: 0, colId: 'index' },
        'left',
        bounds(3),
      ),
    ).toEqual({ rowIndex: 0, colId: 'index' });
  });

  it('ctrl+a selects the full grid', () => {
    const sel = selectAllCellRanges(bounds(4));
    expect(sel.ranges).toHaveLength(1);
    expect(sel.ranges[0]).toEqual({
      startRow: 0,
      endRow: 3,
      colIds: [...COLS],
    });
    expect(sel.anchor).toEqual({ rowIndex: 0, colId: 'index' });
    expect(sel.focus).toEqual({ rowIndex: 3, colId: 'amount' });
  });
});
