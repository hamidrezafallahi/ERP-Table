import { describe, expect, it } from 'vitest';

import {
  countPinnedRows,
  readPinnedRowCellValue,
} from '../dataOps/pinnedRows';
import type { ColumnSchema } from '../../domain/types/ColumnSchema';

describe('pinnedRows (PR-116)', () => {
  const amountCol = {
    fieldName: 'amount',
    fieldCaption: 'Amount',
    fieldType: 'number',
  } as ColumnSchema;
  const indexCol = {
    fieldName: 'index',
    fieldCaption: '#',
    fieldType: 'index',
  } as ColumnSchema;

  it('reads host field values', () => {
    expect(readPinnedRowCellValue({ amount: 42, name: 'x' }, amountCol)).toBe(
      42,
    );
  });

  it('skips index column', () => {
    expect(readPinnedRowCellValue({ index: 1 }, indexCol)).toBeNull();
  });

  it('counts top and bottom arrays', () => {
    expect(countPinnedRows([{ a: 1 }], [{ b: 2 }, { b: 3 }])).toEqual({
      top: 1,
      bottom: 2,
    });
    expect(countPinnedRows(undefined, null)).toEqual({ top: 0, bottom: 0 });
  });
});
