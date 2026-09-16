import { describe, expect, it } from 'vitest';

import {
  addJalaliMonths,
  buildFillUpdates,
  detectFillSeries,
  extendSeriesValue,
} from '../selection/fillHandle';

describe('PR-108 fill handle (pure)', () => {
  it('detects numeric series 1,2,3', () => {
    expect(detectFillSeries(['1', '2', '3']).kind).toBe('number');
    expect(extendSeriesValue('number', ['1', '2', '3'], 1, 1)).toBe('4');
  });

  it('detects jalali month series', () => {
    expect(
      detectFillSeries(['1405/01/31', '1405/02/31']).kind,
    ).toBe('jalali');
    expect(
      extendSeriesValue('jalali', ['1405/01/31', '1405/02/31'], 1),
    ).toBe('1405/03/31');
  });

  it('addJalaliMonths advances one month', () => {
    expect(addJalaliMonths({ y: 1405, m: 1, d: 31 }, 1)).toEqual({
      y: 1405,
      m: 2,
      d: 31,
    });
  });

  it('copyOnly tiles source block', () => {
    const updates = buildFillUpdates({
      sourceRange: { startRow: 0, endRow: 0, colIds: ['name'] },
      extendToRowIndex: 2,
      extendToColIndex: 0,
      columnOrder: ['name'],
      getSourceText: () => 'A',
      copyOnly: true,
    });
    expect(updates).toEqual([
      { rowIndex: 1, colId: 'name', rawText: 'A' },
      { rowIndex: 2, colId: 'name', rawText: 'A' },
    ]);
  });

  it('extends numbers downward from a single seed cell', () => {
    const updates = buildFillUpdates({
      sourceRange: { startRow: 0, endRow: 0, colIds: ['n'] },
      extendToRowIndex: 3,
      extendToColIndex: 0,
      columnOrder: ['n'],
      getSourceText: () => '1',
      copyOnly: false,
    });
    expect(updates.map((u) => u.rawText)).toEqual(['2', '3', '4']);
  });

  it('copies plain text when no series is detected', () => {
    const updates = buildFillUpdates({
      sourceRange: { startRow: 0, endRow: 1, colIds: ['name'] },
      extendToRowIndex: 3,
      extendToColIndex: 0,
      columnOrder: ['name'],
      getSourceText: (r) => (r === 0 ? 'Ali' : 'Reza'),
      copyOnly: false,
    });
    expect(updates.map((u) => u.rawText)).toEqual(['Reza', 'Ali']);
  });
});
