import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

import {
  checkGridPerfBudget,
  hydratePerfGrid,
  measureGridPerformance,
  type GridPerfBudget,
} from '../perf/gridHarness';

function loadGridPerfBudget(): GridPerfBudget {
  const path = join(
    dirname(fileURLToPath(import.meta.url)),
    '../perf/grid-performance-budgets.json',
  );
  return JSON.parse(readFileSync(path, 'utf8')) as GridPerfBudget;
}

describe('PR-100 grid performance budget (100k hydrated)', () => {
  it('loads tunable budgets from JSON', () => {
    const budget = loadGridPerfBudget();
    expect(budget.rowCount).toBe(100_000);
    expect(budget.hydrateMaxMs).toBeGreaterThan(0);
    expect(budget.scroll1000MaxMs).toBeGreaterThan(0);
  });

  it(
    'hydrates 100k domain rows and stays under published budgets',
    async () => {
      const budget = loadGridPerfBudget();
      const { result, hydrateMs } = await hydratePerfGrid(budget);
      expect(result.session.getUiRowCount()).toBe(budget.rowCount);

      const sample = await measureGridPerformance(result, hydrateMs, budget);
      const checked = checkGridPerfBudget(sample, budget);

      // Surface numbers in CI logs for docs/WORKLOG copy-paste.
      console.log(
        JSON.stringify(
          {
            rowCount: sample.rowCount,
            hydrateMs: Math.round(sample.hydrateMs),
            firstWindowMs: Math.round(sample.firstWindowMs),
            scroll1000Ms: Math.round(sample.scroll1000Ms),
            edit100Ms: Math.round(sample.edit100Ms),
            sortMs: Math.round(sample.sortMs),
            filterMs: Math.round(sample.filterMs),
            visibleRowCount: sample.visibleRowCount,
          },
          null,
          2,
        ),
      );

      expect(checked.ok, checked.reasons.join('; ')).toBe(true);
      expect(sample.visibleRowCount).toBeGreaterThan(0);
      expect(sample.visibleRowCount).toBeLessThanOrEqual(20);
    },
    180_000,
  );
});
