import { describe, expect, it, vi } from 'vitest';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

import {
  checkGridMemoryBudget,
  DEFAULT_GRID_MEMORY_BUDGET,
  measureGridMemory,
} from '../perf/memoryHarness';

const nodeHeapSampler = {
  heapUsed: () => process.memoryUsage().heapUsed,
  tryGc: () => {
    const g = (globalThis as { gc?: () => void }).gc;
    if (typeof g === 'function') g();
  },
};

describe('PR-101 grid memory budget (100k × 20)', () => {
  it(
    'keeps heap delta under 300 MB after hydrating 100k × 20 domain rows',
    async () => {
      const budget = DEFAULT_GRID_MEMORY_BUDGET;
      const sample = await measureGridMemory(budget, nodeHeapSampler);
      const checked = checkGridMemoryBudget(sample, budget);

      console.log(
        JSON.stringify(
          {
            rowCount: sample.rowCount,
            columnCount: sample.columnCount,
            avgCellsPerRow: Math.round(sample.avgCellsPerRow * 100) / 100,
            heapDeltaMb: Math.round(sample.heapDeltaMb * 10) / 10,
            heapBeforeMb: Math.round(sample.heapBeforeBytes / 1024 / 1024),
            heapAfterMb: Math.round(sample.heapAfterBytes / 1024 / 1024),
            budgetMb: budget.maxHeapDeltaBytes / 1024 / 1024,
            ok: checked.ok,
            reasons: checked.reasons,
          },
          null,
          2,
        ),
      );

      expect(sample.rowCount).toBe(budget.rowCount);
      expect(sample.avgCellsPerRow).toBeLessThanOrEqual(1.05);
      expect(checked.ok, checked.reasons.join('; ')).toBe(true);
    },
    180_000,
  );
});
