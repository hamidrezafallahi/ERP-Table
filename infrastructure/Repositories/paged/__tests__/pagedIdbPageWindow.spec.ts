// Page-window ('paged-idb') must never render more than `pageSize` rows:
// paste / pasteInsert / cut / undo grow the RAM window only transiently —
// the engine reloads one page afterwards. Removing the last row of page ≥ 2
// steps back one page instead of re-adding an empty row.

import { describe, expect, it } from 'vitest';

import './fakeIndexedDb';
import { createGrid } from '../../../../bootstrap';
import type { ColumnSchema, RowInput } from '../../../../bootstrap/type';
import { RowStateEnum } from '../../../../domain/value-objects';

const COLUMNS: ColumnSchema[] = [
  { fieldName: 'index', fieldCaption: '#', fieldType: 'index', editable: false, visibility: { kind: 'always' } },
  { fieldName: 'Title', fieldCaption: 'Title', fieldType: 'text', visibility: { kind: 'always' } },
];

function seed(count: number, state = RowStateEnum.Unchanged): RowInput[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    values: { index: i + 1, Title: `row ${i + 1}`, RowState: state },
  }));
}

async function open(tableKey: string, count: number, state?: RowStateEnum) {
  const grid = createGrid({
    persistence: 'paged-idb',
    store: 'pagedWindowStore',
    tableKey,
    columns: COLUMNS,
    rows: seed(count, state),
    recordPerPage: 10,
  });
  await grid.ready;
  return grid;
}

async function select(grid: Awaited<ReturnType<typeof open>>, ids: number[]) {
  for (const rowId of ids) {
    await grid.engine.dispatch({ type: 'ROW_SELECTION_TOGGLED', tableKey: grid.tableKey, rowId });
  }
}

async function action(grid: Awaited<ReturnType<typeof open>>, a: 'copy' | 'cut' | 'paste' | 'pasteInsert') {
  await grid.engine.dispatch({ type: 'SET_TABLE_ACTION', store: grid.store, tableKey: grid.tableKey, action: a });
}

describe('paged-idb page window size', () => {
  it('paste of 2 rows on a full page keeps <= pageSize rows and goes to the last page', async () => {
    const grid = await open('pw-paste', 10);
    await select(grid, [1, 2]);
    await action(grid, 'copy');
    await action(grid, 'paste');

    const view = grid.controller.getViewState()!;
    expect(view.pagination.totalRows).toBe(12);
    expect(view.pagination.totalPages).toBe(2);
    expect(view.pagination.page).toBe(2);
    expect(view.rows).toHaveLength(2);
    expect(grid.controller.getSnapShot('active')?.rows).toHaveLength(2);
  });

  it('pasteInsert of 2 rows on a full page keeps the page at pageSize rows', async () => {
    const grid = await open('pw-insert', 10);
    await grid.engine.dispatch({ type: 'ACTIVE_ROW', store: grid.store, tableKey: grid.tableKey, rowId: 3 } as any);
    await select(grid, [1, 2]);
    await action(grid, 'copy');
    await action(grid, 'pasteInsert');

    const view = grid.controller.getViewState()!;
    expect(view.pagination.totalRows).toBe(12);
    expect(view.pagination.page).toBe(1);
    expect(view.rows).toHaveLength(10);
  });

  it('cut + paste of 2 rows does not leave extra rows on the page', async () => {
    const grid = await open('pw-cut', 10);
    await select(grid, [1, 2]);
    await action(grid, 'cut');
    await action(grid, 'paste');

    const view = grid.controller.getViewState()!;
    expect(view.rows.length).toBeLessThanOrEqual(10);
    expect(grid.controller.getSnapShot('active')!.rows.length).toBeLessThanOrEqual(10);
  });

  it('removing the only Added row of page 2 steps back to page 1 (no new row)', async () => {
    const grid = await open('pw-del', 11, RowStateEnum.Added);
    await grid.engine.dispatch({ type: 'CHANGE_PAGE', store: grid.store, tableKey: grid.tableKey, page: 2 });
    expect(grid.controller.getViewState()!.rows).toHaveLength(1);

    await grid.engine.dispatch({ type: 'ROW_DELETED', store: grid.store, tableKey: grid.tableKey, rowId: 11 });

    const view = grid.controller.getViewState()!;
    expect(view.pagination.page).toBe(1);
    expect(view.pagination.totalPages).toBe(1);
    expect(view.pagination.totalRows).toBe(10);
    expect(view.rows).toHaveLength(10);
  });
});
