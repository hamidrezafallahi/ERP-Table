import { describe, expect, it } from 'vitest';

import { checkBudget, runBenchmark } from '../../infrastructure/perf/benchmark';
import {
  applyFilter,
  collectUniqueFilterValues,
  normalizeFilterText,
  resolveBuiltinFilterKind,
  resolveFilterUi,
  type FilterAccessor,
  type FilterModel,
} from '../dataOps/filterModel';

type CellMap = Record<string, unknown>;

function makeAccessor(rows: Record<number, CellMap>): FilterAccessor {
  return {
    getValue: (rowId, colId) => rows[rowId]?.[colId],
  };
}

describe('PR-92 normalizeFilterText', () => {
  it('normalizes Persian/Arabic digits and Arabic ي/ك', () => {
    expect(normalizeFilterText('۱۲۳')).toBe('123');
    expect(normalizeFilterText('٤٥')).toBe('45');
    expect(normalizeFilterText('كتاب')).toBe('کتاب');
    expect(normalizeFilterText('علي')).toBe('علی');
  });
});

describe('PR-92 applyFilter text', () => {
  const rows = {
    1: { name: 'علی رضا' },
    2: { name: 'علي نژاد' },
    3: { name: 'کتاب' },
    4: { name: 'كتابخانه' },
    5: { name: '' },
    6: { name: null },
  };
  const ids = [1, 2, 3, 4, 5, 6];
  const acc = makeAccessor(rows);

  it('contains / notContains with ي/ك and digit normalize', () => {
    expect(
      applyFilter(ids, { name: { filterType: 'text', type: 'contains', filter: 'علي' } }, acc),
    ).toEqual([1, 2]);
    expect(
      applyFilter(
        ids,
        { name: { filterType: 'text', type: 'contains', filter: 'کتاب' } },
        acc,
      ),
    ).toEqual([3, 4]);
    expect(
      applyFilter(
        ids,
        { name: { filterType: 'text', type: 'notContains', filter: 'کتاب' } },
        acc,
      ),
    ).toEqual([1, 2, 5, 6]);
  });

  it('equals / startsWith / endsWith / blank / notBlank', () => {
    expect(
      applyFilter(
        ids,
        { name: { filterType: 'text', type: 'equals', filter: 'کتاب' } },
        acc,
      ),
    ).toEqual([3]);
    expect(
      applyFilter(
        ids,
        { name: { filterType: 'text', type: 'startsWith', filter: 'علی' } },
        acc,
      ),
    ).toEqual([1, 2]);
    expect(
      applyFilter(
        ids,
        { name: { filterType: 'text', type: 'endsWith', filter: 'ضا' } },
        acc,
      ),
    ).toEqual([1]);
    expect(
      applyFilter(ids, { name: { filterType: 'text', type: 'blank' } }, acc),
    ).toEqual([5, 6]);
    expect(
      applyFilter(ids, { name: { filterType: 'text', type: 'notBlank' } }, acc),
    ).toEqual([1, 2, 3, 4]);
  });
});

describe('PR-92 applyFilter number', () => {
  const rows = {
    1: { amount: 10 },
    2: { amount: '۲۰' },
    3: { amount: 30 },
    4: { amount: null },
    5: { amount: '' },
  };
  const ids = [1, 2, 3, 4, 5];
  const acc = makeAccessor(rows);

  it('supports = ≠ < ≤ > ≥ inRange blank (named and symbol ops)', () => {
    expect(
      applyFilter(
        ids,
        { amount: { filterType: 'number', type: '=', filter: 20 } },
        acc,
      ),
    ).toEqual([2]);
    expect(
      applyFilter(
        ids,
        { amount: { filterType: 'number', type: '≠', filter: 20 } },
        acc,
      ),
    ).toEqual([1, 3]);
    expect(
      applyFilter(
        ids,
        { amount: { filterType: 'number', type: '<', filter: 20 } },
        acc,
      ),
    ).toEqual([1]);
    expect(
      applyFilter(
        ids,
        { amount: { filterType: 'number', type: '≤', filter: 20 } },
        acc,
      ),
    ).toEqual([1, 2]);
    expect(
      applyFilter(
        ids,
        { amount: { filterType: 'number', type: '>', filter: 20 } },
        acc,
      ),
    ).toEqual([3]);
    expect(
      applyFilter(
        ids,
        { amount: { filterType: 'number', type: '≥', filter: 20 } },
        acc,
      ),
    ).toEqual([2, 3]);
    expect(
      applyFilter(
        ids,
        {
          amount: {
            filterType: 'number',
            type: 'inRange',
            filter: 10,
            filterTo: 20,
          },
        },
        acc,
      ),
    ).toEqual([1, 2]);
    expect(
      applyFilter(ids, { amount: { filterType: 'number', type: 'blank' } }, acc),
    ).toEqual([4, 5]);
  });
});

describe('PR-92 applyFilter date', () => {
  const d1 = Date.parse('2026-01-01T00:00:00Z');
  const d2 = Date.parse('2026-06-15T00:00:00Z');
  const d3 = Date.parse('2026-12-31T00:00:00Z');
  const rows = {
    1: { when: d1 },
    2: { when: new Date(d2) },
    3: { when: '2026-12-31' },
    4: { when: null },
  };
  const ids = [1, 2, 3, 4];
  const acc = makeAccessor(rows);

  it('equals / before / after / inRange / blank', () => {
    expect(
      applyFilter(
        ids,
        { when: { filterType: 'date', type: 'equals', dateFrom: d2 } },
        acc,
      ),
    ).toEqual([2]);
    expect(
      applyFilter(
        ids,
        { when: { filterType: 'date', type: 'before', dateFrom: d2 } },
        acc,
      ),
    ).toEqual([1]);
    expect(
      applyFilter(
        ids,
        { when: { filterType: 'date', type: 'after', dateFrom: d2 } },
        acc,
      ),
    ).toEqual([3]);
    expect(
      applyFilter(
        ids,
        {
          when: {
            filterType: 'date',
            type: 'inRange',
            dateFrom: d1,
            dateTo: d2,
          },
        },
        acc,
      ),
    ).toEqual([1, 2]);
    expect(
      applyFilter(ids, { when: { filterType: 'date', type: 'blank' } }, acc),
    ).toEqual([4]);
    expect(d3).toBeTypeOf('number');
  });
});

describe('PR-92 applyFilter set / boolean / custom / join', () => {
  const rows = {
    1: { wh: 'A', ok: true, n: 1 },
    2: { wh: 'B', ok: false, n: 2 },
    3: { wh: 'A', ok: true, n: 3 },
    4: { wh: 'C', ok: false, n: 4 },
  };
  const ids = [1, 2, 3, 4];
  const acc = makeAccessor(rows);

  it('set in / notIn and unique value count helper', () => {
    expect(
      applyFilter(
        ids,
        { wh: { filterType: 'set', type: 'in', values: ['A', 'C'] } },
        acc,
      ),
    ).toEqual([1, 3, 4]);
    expect(
      applyFilter(
        ids,
        { wh: { filterType: 'set', type: 'notIn', values: ['A'] } },
        acc,
      ),
    ).toEqual([2, 4]);
    expect(collectUniqueFilterValues(ids, 'wh', acc)).toEqual(['A', 'B', 'C']);
  });

  it('boolean true / false / any', () => {
    expect(
      applyFilter(ids, { ok: { filterType: 'boolean', type: 'true' } }, acc),
    ).toEqual([1, 3]);
    expect(
      applyFilter(ids, { ok: { filterType: 'boolean', type: 'false' } }, acc),
    ).toEqual([2, 4]);
    expect(
      applyFilter(ids, { ok: { filterType: 'boolean', type: 'any' } }, acc),
    ).toEqual([1, 2, 3, 4]);
  });

  it('customFilter predicate', () => {
    expect(
      applyFilter(
        ids,
        {
          n: {
            filterType: 'custom',
            customFilter: (value) => Number(value) % 2 === 0,
          },
        },
        acc,
      ),
    ).toEqual([2, 4]);
  });

  it('AND / OR at column level; columns AND together', () => {
    const model: FilterModel = {
      wh: {
        operator: 'OR',
        conditions: [
          { filterType: 'text', type: 'equals', filter: 'A' },
          { filterType: 'text', type: 'equals', filter: 'B' },
        ],
      },
      ok: { filterType: 'boolean', type: 'true' },
    };
    expect(applyFilter(ids, model, acc)).toEqual([1, 3]);

    expect(
      applyFilter(
        ids,
        {
          n: {
            operator: 'AND',
            conditions: [
              { filterType: 'number', type: '>=', filter: 2 },
              { filterType: 'number', type: '<=', filter: 3 },
            ],
          },
        },
        acc,
      ),
    ).toEqual([2, 3]);
  });

  it('does not mutate input; empty model keeps all', () => {
    const input = [4, 1, 2];
    const out = applyFilter(input, {}, acc);
    expect(out).toEqual([4, 1, 2]);
    expect(out).not.toBe(input);
    expect(applyFilter(input, null, acc)).toEqual([4, 1, 2]);
  });
});

describe('PR-92 applyFilter 100k budget', () => {
  it('filters 100k rows under budget', async () => {
    const n = 100_000;
    const ids = Array.from({ length: n }, (_, i) => i);
    const amounts = Float64Array.from({ length: n }, (_, i) => (i * 17) % 1000);
    const acc: FilterAccessor = {
      getValue: (rowId) => amounts[rowId],
    };
    const model: FilterModel = {
      amount: {
        filterType: 'number',
        type: 'inRange',
        filter: 100,
        filterTo: 200,
      },
    };
    const sample = await runBenchmark('applyFilter100k', 5, () => {
      applyFilter(ids, model, acc);
    });
    const checked = checkBudget(sample, {
      name: 'applyFilter100k',
      maxAvgMs: 120,
      maxMaxMs: 400,
    });
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
    const filtered = applyFilter(ids, model, acc);
    expect(filtered.length).toBeGreaterThan(0);
    for (const id of filtered.slice(0, 50)) {
      const v = amounts[id]!;
      expect(v).toBeGreaterThanOrEqual(100);
      expect(v).toBeLessThanOrEqual(200);
    }
  });
});

describe('PR-95 resolveFilterUi custom registry keys', () => {
  it('returns custom mode for free-string and { type, params }', () => {
    expect(
      resolveFilterUi({
        fieldName: 'Bed',
        fieldType: 'price',
        columnDef: { filter: 'roundAmount' },
      }),
    ).toEqual({ mode: 'custom', name: 'roundAmount' });

    expect(
      resolveFilterUi({
        fieldName: 'Bed',
        fieldType: 'price',
        columnDef: { filter: { type: 'roundAmount', params: { step: 1e6 } } },
      }),
    ).toEqual({
      mode: 'custom',
      name: 'roundAmount',
      params: { step: 1e6 },
    });

    expect(
      resolveBuiltinFilterKind({
        fieldName: 'Bed',
        fieldType: 'price',
        columnDef: { filter: 'roundAmount' },
      }),
    ).toBeNull();

    expect(
      resolveFilterUi({
        fieldName: 'name',
        fieldType: 'text',
        columnDef: { filter: 'text' },
      }),
    ).toEqual({ mode: 'builtin', kind: 'text' });
  });
});
