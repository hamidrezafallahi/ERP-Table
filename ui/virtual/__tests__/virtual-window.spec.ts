import { describe, expect, it } from 'vitest';

import { Viewport } from '../../../domain/value-objects/Viewport';
import {
  buildVirtualWindow,
  viewportFromScroll,
  virtualWindowKey,
} from '../virtualWindow';

describe('virtualWindow adapter helpers', () => {
  it('builds a window with spacers matching Core VisibleRange', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    const model = buildVirtualWindow(items, new Viewport(400, 200, 40, 0));

    expect(model.range.startIndex).toBe(10);
    expect(model.range.endIndex).toBe(15);
    expect(model.visibleItems.map((r) => r.id)).toEqual([10, 11, 12, 13, 14]);
    expect(model.absoluteIndices).toEqual([10, 11, 12, 13, 14]);
    expect(model.spacerTop).toBe(400);
    expect(model.totalHeight).toBe(4000);
    expect(model.spacerBottom).toBe(4000 - 15 * 40);
  });

  it('keeps rendered count far below total for large lists', () => {
    const items = Array.from({ length: 50_000 }, (_, i) => i);
    const model = buildVirtualWindow(items, new Viewport(20_000, 400, 40, 2));
    expect(model.visibleItems.length).toBe(model.range.visibleCount);
    expect(model.visibleItems.length).toBeLessThan(20);
    expect(model.visibleItems.length / items.length).toBeLessThan(0.001);
  });

  it('viewportFromScroll clamps negative offsets', () => {
    const vp = viewportFromScroll({
      scrollOffset: -10,
      viewportSize: 300,
      rowHeight: 40,
    });
    expect(vp.scrollOffset).toBe(0);
    expect(vp.viewportSize).toBe(300);
  });

  it('virtualWindowKey changes when the window moves', () => {
    const a = buildVirtualWindow([1, 2, 3, 4, 5], new Viewport(0, 80, 40, 0));
    const b = buildVirtualWindow([1, 2, 3, 4, 5], new Viewport(80, 80, 40, 0));
    expect(virtualWindowKey(a.range)).not.toBe(virtualWindowKey(b.range));
  });
});
