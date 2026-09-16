import { describe, expect, it } from 'vitest';

import { checkBudget, runBenchmark } from '../../infrastructure/perf/benchmark';
import {
  applyQuickFilter,
  buildQuickFilterBlob,
  normalizeQuickFilterText,
  QuickFilterIndex,
} from '../dataOps/quickFilter';

describe('PR-93 QuickFilterIndex (pure)', () => {
  it('normalizes digits and Arabic ي/ك', () => {
    expect(normalizeQuickFilterText('علي ۱۲')).toBe('علی 12');
    expect(buildQuickFilterBlob(['كتاب', null, '۱'])).toBe('کتاب 1');
  });

  it('filters rows by substring AND of whitespace parts', () => {
    const index = new QuickFilterIndex();
    index.setRow(1, ['علی رضا']);
    index.setRow(2, ['علی نژاد']);
    index.setRow(3, ['کتاب']);
    expect(index.filter([1, 2, 3], 'علی')).toEqual([1, 2]);
    expect(index.filter([1, 2, 3], 'علی رضا')).toEqual([1]);
    expect(index.filter([1, 2, 3], '')).toEqual([1, 2, 3]);
    expect(applyQuickFilter([3, 1], 'کتاب', index)).toEqual([3]);
  });

  it('incremental setRow / removeRow updates without full rebuild', () => {
    const index = new QuickFilterIndex();
    index.setRow(1, ['alpha']);
    index.setRow(2, ['beta']);
    expect(index.filter([1, 2], 'alpha')).toEqual([1]);
    index.setRow(1, ['gamma']);
    expect(index.filter([1, 2], 'alpha')).toEqual([]);
    expect(index.filter([1, 2], 'gamma')).toEqual([1]);
    index.removeRow(2);
    expect(index.filter([1, 2], 'beta')).toEqual([]);
  });

  it('types 10 characters on 50k cached rows under budget', async () => {
    const n = 50_000;
    const ids = Array.from({ length: n }, (_, i) => i);
    const index = new QuickFilterIndex();
    for (let i = 0; i < n; i += 1) {
      index.setRow(i, [`row-${i}`, `sku-${(i * 17) % 997}`]);
    }
    const sample = await runBenchmark('quickFilterType10x50k', 3, () => {
      let q = '';
      for (const ch of 'sku-12') {
        q += ch;
        index.filter(ids, q);
      }
      // pad to 10 keystrokes as in the verify brief
      for (const ch of '3456') {
        q += ch;
        index.filter(ids, q);
      }
    });
    const checked = checkBudget(sample, {
      name: 'quickFilterType10x50k',
      // Headroom for CI variance when the 100k grid harness runs in the same suite (PR-100).
      maxAvgMs: 400,
      maxMaxMs: 900,
    });
    expect(checked.ok, checked.reasons.join('; ')).toBe(true);
    const hit = index.filter(ids, 'sku-12');
    expect(hit.length).toBeGreaterThan(0);
    expect(hit.every((id) => index.getBlob(id).includes('sku-12'))).toBe(true);
  });
});
