import { describe, expect, it } from 'vitest';

import {
  buildCumulativeWidths,
  calculateColumnViewport,
  projectColumnSlice,
} from '../ColumnViewport';
import { ViewportCalculator } from '../ViewportCalculator';
import { checkBudget, runBenchmark } from '../../infrastructure/perf/benchmark';

describe('PR-98 ColumnViewport', () => {
  it('builds cumulative widths and projects a mid-window slice', () => {
    const widths = [100, 100, 100, 100, 100];
    const cum = buildCumulativeWidths(widths);
    expect(cum).toEqual([0, 100, 200, 300, 400, 500]);

    // pinned 50; viewport 200; scroll so we see around cols 1-3 of scrollable
    const range = calculateColumnViewport(widths, 150, 200, 50, 0);
    expect(range.startIndex).toBeGreaterThanOrEqual(0);
    expect(range.endIndex).toBeLessThanOrEqual(5);
    expect(range.visibleCount).toBeLessThan(5);
    expect(range.spacerStart + range.spacerEnd + (range.endIndex - range.startIndex) * 100).toBe(
      500,
    );

    const labels = ['a', 'b', 'c', 'd', 'e'];
    const slice = projectColumnSlice(labels, range);
    expect(slice.length).toBe(range.visibleCount);
  });

  it('always covers the viewport; overscan expands the window', () => {
    const widths = Array.from({ length: 50 }, () => 120);
    const without = calculateColumnViewport(widths, 600, 360, 168, 0);
    const withOverscan = calculateColumnViewport(widths, 600, 360, 168, 2);
    expect(withOverscan.startIndex).toBeLessThanOrEqual(without.startIndex);
    expect(withOverscan.endIndex).toBeGreaterThanOrEqual(without.endIndex);
    expect(withOverscan.visibleCount).toBeLessThan(25);
  });

  it('200 equal columns → visible window under 25 with typical viewport', () => {
    const widths = Array.from({ length: 200 }, () => 144);
    const range = ViewportCalculator.calculateColumns(widths, 0, 800, 168, 1);
    expect(range.visibleCount).toBeLessThan(25);
    expect(range.startIndex).toBe(0);
    expect(range.spacerStart).toBe(0);
    expect(range.spacerEnd).toBeGreaterThan(0);
  });

  it('keeps pin width out of the scrollable slice math', () => {
    const widths = [100, 100, 100];
    // scroll still at start — only first columns
    const range = calculateColumnViewport(widths, 0, 250, 168, 0);
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBeGreaterThan(0);
  });

  it('reserves inline-end pin width from the scrollable viewport (PR-110)', () => {
    const widths = Array.from({ length: 20 }, () => 100);
    const withoutEnd = calculateColumnViewport(widths, 0, 500, 100, 0, 0);
    const withEnd = calculateColumnViewport(widths, 0, 500, 100, 0, 120);
    expect(withEnd.visibleCount).toBeLessThanOrEqual(withoutEnd.visibleCount);
  });

  it('200-column window calc stays under budget', async () => {
    const widths = Array.from({ length: 200 }, () => 144);
    const sample = await runBenchmark('columnViewport200', 50, () => {
      ViewportCalculator.calculateColumns(widths, 5_000, 900, 168, 2);
    });
    const checked = checkBudget(sample, {
      name: 'columnViewport200',
      maxAvgMs: 2,
      maxMaxMs: 10,
    });
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
  });
});
