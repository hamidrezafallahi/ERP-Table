import { describe, expect, it } from 'vitest';

import {
  buildGroupedFlatIndex,
  groupRowId,
  isGroupRowId,
  normalizeGroupKey,
  resolveActiveGroupField,
} from '../dataOps/rowGrouping';
import { createGrid } from '../../bootstrap';

describe('rowGrouping pure (PR-120)', () => {
  it('resolveActiveGroupField takes only the first entry', () => {
    expect(resolveActiveGroupField(null)).toBeNull();
    expect(resolveActiveGroupField('')).toBeNull();
    expect(resolveActiveGroupField('category')).toBe('category');
    expect(resolveActiveGroupField(['category', 'region'])).toBe('category');
    expect(resolveActiveGroupField(['', 'region'])).toBe('region');
  });

  it('groupRowId is stable, negative, and non-zero', () => {
    const a = groupRowId('category', 'A');
    const b = groupRowId('category', 'A');
    const c = groupRowId('category', 'B');
    expect(a).toBe(b);
    expect(a).toBeLessThan(0);
    expect(a).not.toBe(0);
    expect(a).not.toBe(c);
    expect(isGroupRowId(a)).toBe(true);
    expect(isGroupRowId(1)).toBe(false);
  });

  it('builds flat group + leaf order with sums', () => {
    const values: Record<number, { cat: string; amount: number }> = {
      1: { cat: 'food', amount: 10 },
      2: { cat: 'tool', amount: 5 },
      3: { cat: 'food', amount: 20 },
    };
    const { nodes, orderedIds } = buildGroupedFlatIndex({
      orderedLeafIds: [1, 2, 3],
      groupField: 'cat',
      getGroupValue: (id) => values[id]!.cat,
      defaultExpanded: true,
      aggregateColumns: [{ colId: 'amount', aggFunc: 'sum' }],
      getCellValue: (id, col) =>
        col === 'amount' ? values[id]!.amount : undefined,
    });
    expect(nodes.filter((n) => n.kind === 'group')).toHaveLength(2);
    const food = nodes.find(
      (n) => n.kind === 'group' && n.key === 'food',
    );
    expect(food?.kind).toBe('group');
    if (food?.kind === 'group') {
      expect(food.aggregates.amount).toBe(30);
      expect(food.childRowIds).toEqual([1, 3]);
    }
    expect(orderedIds[0]).toBeLessThan(0);
    expect(orderedIds).toContain(1);
    expect(orderedIds).toContain(2);
    expect(orderedIds).toContain(3);
  });

  it('collapsed groups omit leaves', () => {
    const { orderedIds, nodes } = buildGroupedFlatIndex({
      orderedLeafIds: [1, 2],
      groupField: 'cat',
      getGroupValue: (id) => (id === 1 ? 'a' : 'b'),
      defaultExpanded: false,
    });
    expect(nodes.every((n) => n.kind === 'group')).toBe(true);
    expect(orderedIds).toHaveLength(2);
    expect(orderedIds.every(isGroupRowId)).toBe(true);
  });

  it('normalizeGroupKey maps blank', () => {
    expect(normalizeGroupKey(null)).toBe('(blank)');
    expect(normalizeGroupKey('')).toBe('(blank)');
    expect(normalizeGroupKey('x')).toBe('x');
  });
});

type Row = {
  id: string;
  category: string;
  name: string;
  amount: number;
};

describe('PR-120 groupBy engine wiring', () => {
  it('groups by category with per-group sum', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'category', headerName: 'نوع کالا', type: 'text' },
        { field: 'name', headerName: 'Name', type: 'text' },
        {
          field: 'amount',
          headerName: 'Amount',
          type: 'number',
          aggFunc: 'sum',
        },
      ],
      rowData: [
        { id: '1', category: 'food', name: 'apple', amount: 10 },
        { id: '2', category: 'tool', name: 'hammer', amount: 5 },
        { id: '3', category: 'food', name: 'bread', amount: 20 },
      ],
      getRowId: (r) => r.id,
      groupBy: 'category',
      groupDefaultExpanded: true,
    });
    await grid.ready;

    const ui = grid.engine.getAllUIRows();
    expect(ui).toBeTruthy();
    const kinds = ui!.map((r) => r.rowKind ?? 'leaf');
    expect(kinds.filter((k) => k === 'group')).toHaveLength(2);
    expect(kinds.filter((k) => k === 'leaf')).toHaveLength(3);

    const foodGroup = ui!.find(
      (r) => r.rowKind === 'group' && r.groupKey === 'food',
    );
    expect(foodGroup?.cells.amount?.value).toBe(30);
    expect(foodGroup?.groupChildCount).toBe(2);
    expect(foodGroup?.groupExpanded).toBe(true);

    expect(grid.api.getRowGroupColumns()).toEqual(['category']);
  });

  it('toggle collapses and expands a group', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'category', headerName: 'Cat', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number', aggFunc: 'sum' },
      ],
      rowData: [
        { id: '1', category: 'a', name: 'x', amount: 1 },
        { id: '2', category: 'a', name: 'y', amount: 2 },
        { id: '3', category: 'b', name: 'z', amount: 3 },
      ],
      getRowId: (r) => r.id,
      groupBy: 'category',
    });
    await grid.ready;

    expect(grid.engine.getUiRowCount()).toBe(5); // 2 groups + 3 leaves
    grid.api.toggleRowGroup('a');
    expect(grid.engine.getUiRowCount()).toBe(3); // group a + group b + leaf b
    grid.api.toggleRowGroup('a');
    expect(grid.engine.getUiRowCount()).toBe(5);
  });

  it('groups 100k rows under budget', async () => {
    const n = 100_000;
    const rowData: Row[] = Array.from({ length: n }, (_, i) => ({
      id: String(i),
      category: `c${i % 50}`,
      name: `n${i}`,
      amount: 1 + (i % 9),
    }));
    const t0 = performance.now();
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'category', headerName: 'Cat', type: 'text' },
        { field: 'name', headerName: 'Name', type: 'text' },
        {
          field: 'amount',
          headerName: 'Amount',
          type: 'number',
          aggFunc: 'sum',
        },
      ],
      rowData,
      getRowId: (r) => r.id,
      groupBy: 'category',
      groupDefaultExpanded: false,
    });
    await grid.ready;
    const count = grid.engine.getUiRowCount();
    const ms = performance.now() - t0;
    expect(count).toBe(50); // collapsed: one row per group
    expect(ms).toBeLessThan(15_000);
  });
});
