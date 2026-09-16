import { describe, expect, it } from 'vitest';

import {
  BlockCache,
  assembleBlockWindow,
  blockIndexForRow,
  blockRange,
  blocksCovering,
} from '../dataOps/blockCache';

describe('PR-102 BlockCache', () => {
  it('maps rows to block indices and ranges', () => {
    expect(blockIndexForRow(0, 100)).toBe(0);
    expect(blockIndexForRow(99, 100)).toBe(0);
    expect(blockIndexForRow(100, 100)).toBe(1);
    expect(blockRange(2, 50)).toEqual({ startRow: 100, endRow: 150 });
    expect(blocksCovering(0, 100, 100)).toEqual([0]);
    expect(blocksCovering(50, 150, 100)).toEqual([0, 1]);
  });

  it('evicts least-recently-used blocks', () => {
    const cache = new BlockCache<number>(2);
    cache.set(0, [0]);
    cache.set(1, [1]);
    cache.get(0); // touch 0 so 1 is older
    cache.set(2, [2]);
    expect(cache.has(1)).toBe(false);
    expect(cache.has(0)).toBe(true);
    expect(cache.has(2)).toBe(true);
    expect(cache.size).toBe(2);
  });

  it('assembles a window with placeholders for missing blocks', () => {
    const cache = new BlockCache<{ id: number }>(10);
    cache.set(0, [{ id: 0 }, { id: 1 }]);
    const { rows, loadingIndices } = assembleBlockWindow(
      cache,
      0,
      4,
      2,
      (i) => ({ id: -i }),
    );
    expect(rows.map((r) => r.id)).toEqual([0, 1, -2, -3]);
    expect(loadingIndices).toEqual([2, 3]);
  });
});
