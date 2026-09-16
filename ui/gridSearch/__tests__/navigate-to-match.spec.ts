import { describe, expect, it, vi } from 'vitest';

import {
  computeVirtualScrollOffset,
  getSortedRowAbsoluteIndex,
  isVirtualScrollRoot,
  navigateToMatch,
  revealRow,
} from '../utils';

describe('grid search navigation helpers', () => {
  it('computeVirtualScrollOffset keeps row near top third of viewport', () => {
    expect(computeVirtualScrollOffset(0, 40, 400)).toBe(0);
    expect(computeVirtualScrollOffset(10, 40, 400)).toBe(10 * 40 - 80);
  });

  it('isVirtualScrollRoot reads data attribute', () => {
    const el = { dataset: { erpVirtualization: 'on' } } as unknown as HTMLElement;
    expect(isVirtualScrollRoot(el)).toBe(true);
    expect(isVirtualScrollRoot(null)).toBe(false);
  });

  it('getSortedRowAbsoluteIndex uses UI row index (PR-99)', () => {
    const order = new Map<number, number>([
      [1, 0],
      [2, 1],
    ]);
    const controller = {
      getUiRowAbsoluteIndex: (rowId: number) => order.get(rowId) ?? -1,
    } as any;

    expect(getSortedRowAbsoluteIndex(controller, 1)).toBe(0);
    expect(getSortedRowAbsoluteIndex(controller, 2)).toBe(1);
    expect(getSortedRowAbsoluteIndex(controller, 99)).toBe(-1);
  });

  it('revealRow uses CHANGE_VIEWPORT when virtual scroll root is active', async () => {
    const dispatchViewIntent = vi.fn().mockResolvedValue(undefined);
    const dispatch = vi.fn().mockResolvedValue(undefined);

    const scrollRoot = {
      dataset: { erpVirtualization: 'on' },
      scrollTop: 0,
    } as unknown as HTMLElement;

    const controller = {
      getViewState: () => ({
        pagination: { page: 1, pageSize: 10 },
      }),
      getTableKey: () => 't-virt',
      getSession: () => ({
        getViewport: () => ({
          scrollOffset: 0,
          viewportSize: 200,
          rowHeight: 40,
          overscan: 2,
        }),
        dispatchViewIntent,
      }),
      getUiRowAbsoluteIndex: (rowId: number) => rowId - 1,
      dispatch,
    } as any;

    vi.stubGlobal('document', {
      querySelector: () => scrollRoot,
    });

    await revealRow(controller, 20);

    expect(dispatchViewIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CHANGE_VIEWPORT',
        scrollOffset: expect.any(Number),
        rowHeight: 40,
      }),
    );
    expect(scrollRoot.scrollTop).toBeGreaterThan(0);
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CHANGE_PAGE' }),
    );

    vi.unstubAllGlobals();
  });

  it('navigateToMatch activates row after reveal', async () => {
    const dispatch = vi.fn().mockResolvedValue(undefined);
    const controller = {
      getViewState: () => ({
        pagination: { page: 1, pageSize: 10 },
      }),
      getTableKey: () => 't-page',
      getSession: () => undefined,
      getUiRowAbsoluteIndex: (rowId: number) => rowId - 1,
      dispatch,
    } as any;

    vi.stubGlobal('document', {
      querySelector: () => null,
    });

    await navigateToMatch(controller, { rowId: 15, columnId: 'name' });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'CHANGE_PAGE',
      page: 2,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UI_ACTIVE_ROW',
      rowId: 15,
    });

    vi.unstubAllGlobals();
  });
});
