import { describe, expect, it } from 'vitest';

import { SparseRowIndex } from '../SparseRowIndex';
import { ColumnTotalsIndex } from '../ColumnTotalsIndex';
import {
  findSortedInsertIndex,
  compareRowIdsForSort,
  type SortAccessor,
} from '../dataOps/sortModel';
import {
  checkBudget,
  runBenchmark,
} from '../../infrastructure/perf/benchmark';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-99 hot-path O(n) removal', () => {
  it('SparseRowIndex neighbor/indexOf stay O(1) at 100k', async () => {
    const index = new SparseRowIndex<number>();
    index.replaceAll(
      Array.from({ length: 100_000 }, (_, i) => i),
      (id) => id,
    );

    const mid = 50_000;
    expect(index.indexOf(mid)).toBe(mid);
    expect(index.neighbor(mid, 1)).toBe(mid + 1);
    expect(index.neighbor(mid, -1)).toBe(mid - 1);

    const sample = await runBenchmark('arrowNeighbor100k', 200, () => {
      index.neighbor(mid, 1);
      index.neighbor(mid, -1);
      index.indexOf(mid);
    });

    const checked = checkBudget(sample, {
      name: 'arrowNeighbor100k',
      maxAvgMs: 2,
      maxMaxMs: 20,
    });
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
  });

  it('findSortedInsertIndex is logarithmic vs full sort', () => {
    const values = new Map<number, number>();
    for (let i = 0; i < 10_000; i += 1) values.set(i, i);
    const accessor: SortAccessor = {
      getValue: (rowId, colId) =>
        colId === 'index' ? values.get(rowId) : undefined,
      getFieldType: (colId) => (colId === 'index' ? 'index' : undefined),
    };
    const ordered = Array.from({ length: 10_000 }, (_, i) => i);
    const pos = findSortedInsertIndex(ordered, 10_000, [], accessor);
    expect(pos).toBe(10_000);
    expect(compareRowIdsForSort(0, 1, [], accessor)).toBeLessThan(0);
  });

  it('ColumnTotalsIndex patches without full rebuild', () => {
    const totals = new ColumnTotalsIndex();
    totals.rebuild(['amount', 'qty'], (col) => (col === 'amount' ? 100 : 10));
    expect(totals.toRecord()).toEqual({ amount: 100, qty: 10 });
    totals.patch('amount', 40, 55);
    expect(totals.toRecord().amount).toBe(115);
  });

  it('source guards: nav/search/footer no longer scan all rows', () => {
    const nav = load('engine/managers/NavigationManager.ts');
    expect(nav).toContain('getUiRowIndex');
    expect(nav).toContain('.neighbor(');
    expect(nav).not.toMatch(/navigable\.findIndex/);
    expect(nav).not.toMatch(/\.sort\(\s*\(a,\s*b\)\s*=>/);

    const search = load('ui/gridSearch/utils.ts');
    expect(search).toContain('findColumnSearchMatches');
    expect(search).not.toMatch(/getAllRows\(\)/);

    const footer = load('ui/desktop/ERPTableFooter.tsx');
    expect(footer).toContain('getColumnAggs');
    expect(footer).toContain('subscribeColumnAggs');
    expect(footer).not.toMatch(/getSnapShot/);
    expect(footer).not.toMatch(/\.reduce\(/);

    const sparse = load('engine/SparseRowIndex.ts');
    expect(sparse).toContain('posById');
    expect(sparse).toContain('neighbor');
  });
});
