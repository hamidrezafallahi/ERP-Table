import { describe, expect, it } from 'vitest';

import {
  applyAgg,
  ColumnAggIndex,
  toMinorUnits,
} from '../dataOps/aggregation';

describe('aggregation (PR-118)', () => {
  it('coerces to integer minor units (no float)', () => {
    expect(toMinorUnits(10.9)).toBe(10);
    expect(toMinorUnits('۱۲۳۴')).toBe(1234);
    expect(toMinorUnits('1,250')).toBe(1250);
    expect(toMinorUnits(null)).toBeNull();
  });

  it('applyAgg covers built-ins', () => {
    const values = [10, 20, 30, null, ''];
    expect(applyAgg('sum', values)).toBe(60);
    expect(applyAgg('avg', values)).toBe(20);
    expect(applyAgg('min', values)).toBe(10);
    expect(applyAgg('max', values)).toBe(30);
    expect(applyAgg('count', values)).toBe(3);
    expect(applyAgg('first', values)).toBe(10);
    expect(applyAgg('last', values)).toBe(30);
    expect(applyAgg((vals) => vals.length, values)).toBe(5);
  });

  it('sums 100k amounts without float drift', () => {
    const n = 100_000;
    const values = Array.from({ length: n }, (_, i) => 100 + (i % 7));
    const expected = values.reduce((a, b) => a + b, 0);
    const index = new ColumnAggIndex();
    index.rebuild([{ colId: 'amount', aggFunc: 'sum' }], () => values);
    expect(index.get('amount')).toBe(expected);
    expect(Number.isInteger(index.get('amount') as number)).toBe(true);
  });

  it('patches one cell in O(1) without full rebuild', () => {
    const values = [10, 20, 30];
    const index = new ColumnAggIndex();
    index.rebuild([{ colId: 'amount', aggFunc: 'sum' }], () => values);
    expect(index.get('amount')).toBe(60);
    const ok = index.patch('amount', 20, 25);
    expect(ok).toBe(true);
    expect(index.isDirty).toBe(false);
    expect(index.get('amount')).toBe(65);
  });

  it('avg patches sum/count incrementally', () => {
    const index = new ColumnAggIndex();
    index.rebuild([{ colId: 'x', aggFunc: 'avg' }], () => [2, 4, 6]);
    expect(index.get('x')).toBe(4);
    expect(index.patch('x', 6, 12)).toBe(true);
    expect(index.get('x')).toBe(6);
  });

  it('min/max request rebuild when extreme is removed', () => {
    const index = new ColumnAggIndex();
    index.rebuild([{ colId: 'x', aggFunc: 'min' }], () => [1, 5, 9]);
    expect(index.get('x')).toBe(1);
    expect(index.patch('x', 1, 3)).toBe(false);
    expect(index.isDirty).toBe(true);
  });
});
