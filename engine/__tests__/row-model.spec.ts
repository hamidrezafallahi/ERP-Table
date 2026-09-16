import { describe, expect, it } from 'vitest';

import { isServerRowModel, pageWindow } from '../dataOps/rowModel';

describe('PR-96 rowModel helpers', () => {
  it('isServerRowModel', () => {
    expect(isServerRowModel('clientSide')).toBe(false);
    expect(isServerRowModel(undefined)).toBe(false);
    expect(isServerRowModel('infinite')).toBe(true);
    expect(isServerRowModel('serverSide')).toBe(true);
  });

  it('pageWindow is half-open', () => {
    expect(pageWindow(1, 50)).toEqual({ startRow: 0, endRow: 50 });
    expect(pageWindow(2, 50)).toEqual({ startRow: 50, endRow: 100 });
  });
});
