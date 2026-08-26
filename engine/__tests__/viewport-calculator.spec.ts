import { describe, expect, it } from 'vitest';

import { Viewport } from '../../domain/value-objects/Viewport';
import { ViewportCalculator } from '../ViewportCalculator';
import { SparseRowIndex } from '../SparseRowIndex';
import { checkBudget, runBenchmark } from '../../infrastructure/perf/benchmark';

describe('ViewportCalculator', () => {
  it('maps scrollOffset to a bounded visible window with overscan', () => {
    const viewport = new Viewport(400, 200, 40, 1);
    // scroll at row 10; viewport shows 5 rows; overscan ±1 → start 9, end 16
    const range = ViewportCalculator.calculate(1000, viewport);

    expect(range.startIndex).toBe(9);
    expect(range.endIndex).toBe(16);
    expect(range.visibleCount).toBe(7);
    expect(range.startOffset).toBe(9 * 40);
    expect(range.totalHeight).toBe(1000 * 40);
  });

  it('clamps to empty and full bounds', () => {
    expect(ViewportCalculator.calculate(0, new Viewport(0, 200, 40)).visibleCount).toBe(0);

    const top = ViewportCalculator.calculate(10, new Viewport(0, 200, 40, 0));
    expect(top.startIndex).toBe(0);
    expect(top.endIndex).toBe(5);

    const bottom = ViewportCalculator.calculate(10, new Viewport(10_000, 200, 40, 0));
    expect(bottom.endIndex).toBe(10);
    expect(bottom.startIndex).toBe(5);
  });

  it('projects only the window from a dense array', () => {
    const rows = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    const range = ViewportCalculator.calculate(100, new Viewport(0, 120, 40, 0));
    const visible = ViewportCalculator.projectRows(rows, range);
    expect(visible.map((r) => r.id)).toEqual([0, 1, 2]);
  });

  it('projects 100k sparse rows without materializing the full window list beyond N', () => {
    const TOTAL = 100_000;
    const index = new SparseRowIndex< { id: number; label: string }>();
    for (let i = 0; i < TOTAL; i += 1) {
      index.set(i, { id: i, label: `row-${i}` });
    }

    const viewport = new Viewport(40_000, 400, 40, 2); // ~row 1000
    const range = ViewportCalculator.calculate(TOTAL, viewport);
    expect(range.visibleCount).toBeLessThanOrEqual(20);

    const visible = index.projectVisible(range);

    expect(visible).toHaveLength(range.visibleCount);
    expect(visible[0].id).toBe(range.startIndex);
    expect(visible[visible.length - 1].id).toBe(range.endIndex - 1);
  });

  it('keeps 100k window projection under performance budget', async () => {
    const TOTAL = 100_000;
    const orderedIds = Array.from({ length: TOTAL }, (_, i) => i);
    const byId = new Map(orderedIds.map((id) => [id, { id }]));
    const viewport = new Viewport(80_000, 480, 40, 3);

    const sample = await runBenchmark('viewport100k', 20, () => {
      const range = ViewportCalculator.calculate(TOTAL, viewport);
      ViewportCalculator.projectByIndex(orderedIds, byId, range);
    });

    const checked = checkBudget(sample, {
      name: 'viewport100k',
      maxAvgMs: 5,
      maxMaxMs: 20,
    });
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
    expect(ViewportCalculator.calculate(TOTAL, viewport).visibleCount).toBeLessThan(30);
  });
});
