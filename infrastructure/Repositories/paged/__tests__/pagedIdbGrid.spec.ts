// End-to-end probe of `createGrid({ persistence: 'paged-idb' })`:
// IndexedDB holds every row, RAM holds one page window, and paging / add /
// delete-selected / select-all / streamed totals all go through IndexedDB.

import { describe, expect, it } from 'vitest';

import './fakeIndexedDb';
import { createGrid } from '../../../../bootstrap';
import type { ColumnSchema, RowInput } from '../../../../bootstrap/type';
import { RowStateEnum } from '../../../../domain/value-objects';

const COLUMNS: ColumnSchema[] = [
  {
    fieldName: 'index',
    fieldCaption: '#',
    fieldType: 'index',
    editable: false,
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'Title',
    fieldCaption: 'Title',
    fieldType: 'text',
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'Amount',
    fieldCaption: 'Amount',
    fieldType: 'price',
    visibility: { kind: 'always' },
  },
];

function seed(count: number): RowInput[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    values: {
      index: i + 1,
      Title: `row ${i + 1}`,
      Amount: 10,
      RowState: RowStateEnum.Unchanged,
    },
  }));
}

async function open(tableKey: string, count = 25) {
  const grid = createGrid({
    persistence: 'paged-idb',
    store: 'pagedItgStore',
    tableKey,
    columns: COLUMNS,
    rows: seed(count),
    recordPerPage: 10,
  });
  await grid.ready;
  return grid;
}

describe("createGrid({ persistence: 'paged-idb' })", () => {
  it('requires a store and a tableKey', async () => {
    const noStore = createGrid({ persistence: 'paged-idb', tableKey: 'k' });
    await expect(noStore.ready).rejects.toThrow(/store/);
    const noKey = createGrid({ persistence: 'paged-idb', store: 's' });
    await expect(noKey.ready).rejects.toThrow(/tableKey/);
  });

  it('keeps ONE page in RAM and reports the full total', async () => {
    const grid = await open('itg-window');
    expect(grid.controller.isPagedWindow()).toBe(true);

    const view = grid.controller.getViewState()!;
    expect(view.rows).toHaveLength(10);
    expect(view.pagination.totalRows).toBe(25);
    expect(view.pagination.totalPages).toBe(3);
    // Only the window lives in heap
    expect(grid.table.getRows()).toHaveLength(10);
  });

  it('CHANGE_PAGE swaps the window from IndexedDB', async () => {
    const grid = await open('itg-page');
    await grid.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: grid.store,
      tableKey: grid.tableKey,
      page: 3,
    });
    const view = grid.controller.getViewState()!;
    expect(view.pagination.page).toBe(3);
    expect(view.rows.map((r) => r.id)).toEqual([21, 22, 23, 24, 25]);
  });

  it('ADD_EMPTY_ROW appends at the end and jumps to the last page', async () => {
    const grid = await open('itg-add');
    await grid.engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      store: grid.store,
      tableKey: grid.tableKey,
    });
    const view = grid.controller.getViewState()!;
    expect(view.pagination.totalRows).toBe(26);
    expect(view.pagination.page).toBe(3);
    expect(view.rows).toHaveLength(6);
  });

  it('select-all uses IndexedDB ids; delete-selected soft-deletes across pages', async () => {
    const grid = await open('itg-delete');
    await grid.engine.dispatch({
      type: 'TOGGLE_SELECT_ALL_ROWS',
      store: grid.store,
      tableKey: grid.tableKey,
    });
    expect(Object.keys(grid.engine.getSelectedRows() ?? {})).toHaveLength(25);

    await grid.engine.dispatch({
      type: 'ROWS_DELETED',
      store: grid.store,
      tableKey: grid.tableKey,
    });

    const snapshot = await grid.controller.getFullSnapShot('all');
    const states = new Set(snapshot?.rows.map((r) => r.rowState));
    // Persisted (Unchanged) rows are soft-deleted, never silently dropped.
    expect(states).toEqual(new Set([RowStateEnum.Deleted]));
    expect(snapshot?.rows).toHaveLength(25);
  });

  it('getFullSnapShot / subscribeColumn cover rows outside the RAM window', async () => {
    const grid = await open('itg-full');
    const full = await grid.controller.getFullSnapShot('active');
    expect(full?.rows).toHaveLength(25);
    expect(grid.controller.getSnapShot('active')?.rows).toHaveLength(10);

    const total = await new Promise<number>((resolve) => {
      const off = grid.controller.subscribeColumn<number>(
        'Amount',
        'active',
        (sum, item) => sum + (Number(item.value) || 0),
        0,
        (sum) => {
          off?.();
          resolve(sum);
        },
      );
    });
    expect(total).toBe(250);
  });
});
