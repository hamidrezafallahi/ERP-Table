import { describe, expect, it } from 'vitest';

import type { FieldType } from '../../domain/types/ColumnSchema';
import { checkBudget, runBenchmark } from '../../infrastructure/perf/benchmark';
import {
  applySort,
  INDEX_COL_ID,
  isBlankSortValue,
  normalizeDigits,
  type SortAccessor,
} from '../dataOps/sortModel';

type CellMap = Record<string, unknown>;

function makeAccessor(
  rows: Record<number, CellMap>,
  options?: {
    types?: Record<string, FieldType>;
    comparators?: Record<string, (a: unknown, b: unknown) => number>;
  },
): SortAccessor {
  return {
    getValue: (rowId, colId) => rows[rowId]?.[colId],
    getFieldType: (colId) => options?.types?.[colId],
    getComparator: (colId) => options?.comparators?.[colId],
  };
}

describe('PR-89 applySort', () => {
  it('normalizes Persian and Arabic-Indic digits', () => {
    expect(normalizeDigits('۱۲۳')).toBe('123');
    expect(normalizeDigits('٤٥')).toBe('45');
    expect(isBlankSortValue(null)).toBe(true);
    expect(isBlankSortValue('')).toBe(true);
    expect(isBlankSortValue(0)).toBe(false);
  });

  it('sorts by index when the model is empty (document order)', () => {
    const rows = {
      10: { index: 2, name: 'b' },
      11: { index: 0, name: 'c' },
      12: { index: 1, name: 'a' },
    };
    const ids = applySort([10, 11, 12], [], makeAccessor(rows));
    expect(ids).toEqual([11, 12, 10]);
  });

  it('does not mutate the input array', () => {
    const input = [3, 1, 2];
    const rows = {
      1: { index: 1 },
      2: { index: 2 },
      3: { index: 3 },
    };
    applySort(input, [{ colId: INDEX_COL_ID, sort: 'desc' }], makeAccessor(rows));
    expect(input).toEqual([3, 1, 2]);
  });

  it('keeps equal keys in original order (stable)', () => {
    const rows = {
      1: { index: 1, name: 'same' },
      2: { index: 1, name: 'same' },
      3: { index: 1, name: 'same' },
    };
    const ids = applySort(
      [3, 1, 2],
      [{ colId: 'name', sort: 'asc' }],
      makeAccessor(rows, { types: { name: 'text' } }),
    );
    expect(ids).toEqual([3, 1, 2]);
  });

  it('applies multi-sort in model order then index', () => {
    const rows = {
      1: { index: 1, dept: 'a', amount: 20 },
      2: { index: 2, dept: 'a', amount: 10 },
      3: { index: 3, dept: 'b', amount: 5 },
      4: { index: 4, dept: 'a', amount: 10 },
    };
    const ids = applySort(
      [4, 3, 2, 1],
      [
        { colId: 'dept', sort: 'asc' },
        { colId: 'amount', sort: 'desc' },
      ],
      makeAccessor(rows, { types: { dept: 'text', amount: 'number' } }),
    );
    expect(ids).toEqual([1, 2, 4, 3]);
  });

  it('puts null and blank last in both directions', () => {
    const rows = {
      1: { index: 1, amount: null },
      2: { index: 2, amount: 2 },
      3: { index: 3, amount: '' },
      4: { index: 4, amount: 1 },
    };
    const acc = makeAccessor(rows, { types: { amount: 'number' } });
    expect(applySort([1, 2, 3, 4], [{ colId: 'amount', sort: 'asc' }], acc)).toEqual(
      [4, 2, 1, 3],
    );
    expect(applySort([1, 2, 3, 4], [{ colId: 'amount', sort: 'desc' }], acc)).toEqual(
      [2, 4, 1, 3],
    );
  });

  it('collates Persian letters آ < ا < ب', () => {
    const rows = {
      1: { index: 1, name: 'ب' },
      2: { index: 2, name: 'آ' },
      3: { index: 3, name: 'ا' },
    };
    const ids = applySort(
      [1, 2, 3],
      [{ colId: 'name', sort: 'asc' }],
      makeAccessor(rows, { types: { name: 'text' } }),
    );
    expect(ids.map((id) => rows[id]?.name)).toEqual(['آ', 'ا', 'ب']);
  });

  it('sorts number/price with Persian digits', () => {
    const rows = {
      1: { index: 1, amount: '۱۲' },
      2: { index: 2, amount: '۳' },
      3: { index: 3, amount: 8 },
    };
    const ids = applySort(
      [1, 2, 3],
      [{ colId: 'amount', sort: 'asc' }],
      makeAccessor(rows, { types: { amount: 'price' } }),
    );
    expect(ids).toEqual([2, 3, 1]);
  });

  it('sorts jalali date strings as yyyymmdd', () => {
    const rows = {
      1: { index: 1, date: '1404/02/01' },
      2: { index: 2, date: '1403-12-29' },
      3: { index: 3, date: '1404-01-15' },
    };
    const ids = applySort(
      [1, 2, 3],
      [{ colId: 'date', sort: 'asc' }],
      makeAccessor(rows, { types: { date: 'date' } }),
    );
    expect(ids).toEqual([2, 3, 1]);
  });

  it('sorts checkbox false before true', () => {
    const rows = {
      1: { index: 1, ok: true },
      2: { index: 2, ok: false },
    };
    expect(
      applySort(
        [1, 2],
        [{ colId: 'ok', sort: 'asc' }],
        makeAccessor(rows, { types: { ok: 'checkbox' } }),
      ),
    ).toEqual([2, 1]);
  });

  it('uses ColumnDef.comparator when provided', () => {
    const rows = {
      1: { index: 1, name: 'aa' },
      2: { index: 2, name: 'b' },
    };
    const ids = applySort(
      [1, 2],
      [{ colId: 'name', sort: 'asc' }],
      makeAccessor(rows, {
        types: { name: 'text' },
        comparators: {
          name: (a, b) => String(a).length - String(b).length,
        },
      }),
    );
    expect(ids).toEqual([2, 1]);
  });

  it('sorts 100k rows under budget', async () => {
    const n = 100_000;
    const ids = Array.from({ length: n }, (_, i) => i);
    const amounts = Float64Array.from({ length: n }, (_, i) => (i * 17) % n);
    const acc: SortAccessor = {
      getValue: (rowId, colId) =>
        colId === INDEX_COL_ID ? rowId : amounts[rowId],
      getFieldType: (colId) => (colId === 'amount' ? 'number' : 'index'),
    };
    const sample = await runBenchmark('applySort100k', 5, () => {
      applySort(ids, [{ colId: 'amount', sort: 'asc' }], acc);
    });
    const checked = checkBudget(sample, {
      name: 'applySort100k',
      maxAvgMs: 200,
      maxMaxMs: 500,
    });
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
    const sorted = applySort(ids, [{ colId: 'amount', sort: 'asc' }], acc);
    expect(sorted).toHaveLength(n);
    for (let i = 1; i < 50; i += 1) {
      const prev = amounts[sorted[i - 1]!]!;
      const next = amounts[sorted[i]!]!;
      expect(prev).toBeLessThanOrEqual(next);
    }
  });
});
