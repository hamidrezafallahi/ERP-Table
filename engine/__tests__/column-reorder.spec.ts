import { describe, expect, it } from 'vitest';

import { resolveColumnReorder } from '../columnReorder';

const columns = [
  { fieldName: 'index', fieldType: 'index' },
  { fieldName: 'qty', fieldType: 'number' },
  { fieldName: 'price', fieldType: 'number' },
  { fieldName: 'date', fieldType: 'date' },
];

describe('resolveColumnReorder', () => {
  it('maps a header drop onto display-order indices', () => {
    expect(resolveColumnReorder(columns, 'date', 'price')).toEqual({
      sourceIndex: 3,
      destIndex: 2,
    });
    expect(resolveColumnReorder(columns, 'qty', 'date')).toEqual({
      sourceIndex: 1,
      destIndex: 3,
    });
  });

  it('rejects the pinned index column and no-ops', () => {
    expect(resolveColumnReorder(columns, 'index', 'price')).toBeNull();
    expect(resolveColumnReorder(columns, 'price', 'index')).toBeNull();
    expect(resolveColumnReorder(columns, 'price', 'price')).toBeNull();
    expect(resolveColumnReorder(columns, 'missing', 'price')).toBeNull();
  });
});
