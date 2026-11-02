// Host parity of cell editing with the arianERP (newFront) table:
// - nothing the user typed is ever lost by a save / export / dispose,
// - `paged-idb` grids write every change at once (legacy contract),
// - Enter walks to the next cell and adds a row past the last one.

import { describe, expect, it, vi } from 'vitest';

import '../../infrastructure/Repositories/paged/__tests__/fakeIndexedDb';
import { createGrid } from '../../bootstrap';
import type { ColumnSchema, CreateGridConfig, RowInput } from '../../bootstrap/type';
import { RowStateEnum } from '../../domain/value-objects';

const COLUMNS: ColumnSchema[] = [
  { fieldName: 'index', fieldCaption: '#', fieldType: 'index', editable: false, visibility: { kind: 'always' } },
  { fieldName: 'Title', fieldCaption: 'Title', fieldType: 'text', visibility: { kind: 'always' } },
  { fieldName: 'Bed', fieldCaption: 'Bed', fieldType: 'price', visibility: { kind: 'always' } },
  {
    fieldName: 'Net',
    fieldCaption: 'Net',
    fieldType: 'price',
    visibility: { kind: 'always' },
    computed: {
      dependsOn: ['Bed'],
      compute: async (row) => (Number(row.Bed) || 0) * 2,
    },
  },
];

const seed = (count: number): RowInput[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    values: { index: i + 1, Title: `row ${i + 1}`, Bed: 10, Net: 20, RowState: RowStateEnum.Unchanged },
  }));

let keySeq = 0;
async function open(config: Partial<CreateGridConfig> = {}, rows = 3) {
  keySeq += 1;
  const grid = createGrid({
    persistence: 'paged-idb',
    store: 'parityStore',
    tableKey: `parity-${keySeq}`,
    columns: COLUMNS,
    rows: seed(rows),
    recordPerPage: 10,
    ...config,
  });
  await grid.ready;
  return grid;
}

const snapshotCell = async (
  grid: Awaited<ReturnType<typeof open>>,
  rowId: number,
  columnId: string,
) => {
  const snap = await grid.controller.getFullSnapShot('all');
  return snap?.rows.find((r) => r.id === rowId)?.cells[columnId];
};

const key = (code: string, extra: Record<string, unknown> = {}) =>
  ({
    code,
    key: code,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    target: null,
    preventDefault() {},
    stopPropagation() {},
    ...extra,
  }) as unknown as KeyboardEvent;

const pressKey = (
  grid: Awaited<ReturnType<typeof open>>,
  code: string,
  extra: Record<string, unknown> = {},
) => {
  const active = grid.controller.getActiveCell();
  return grid.controller.dispatch({
    type: 'KEY_DOWN',
    event: key(code, extra),
    ctx: {
      activeRowId: active?.rowId ?? null,
      tableKey: grid.tableKey,
      activeColumnId: active?.columnId ?? null,
    },
  });
};

describe("paged-idb: immediate commit (legacy write-per-change)", () => {
  it('a typed value is in the table, the snapshot and computed columns at once', async () => {
    const grid = await open();
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Bed' });
    expect(grid.controller.isEditingCell(1, 'Bed')).toBe(true);

    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Bed', value: 75 });

    // Still editing — the user never left the cell (Save clicked from the editor).
    expect(grid.controller.isEditingCell(1, 'Bed')).toBe(true);
    expect(grid.controller.getRowView(1)?.cells.Bed?.value).toBe(75);
    expect(grid.controller.getRowView(1)?.cells.Net?.value).toBe(150);
    expect(await snapshotCell(grid, 1, 'Bed')).toBe(75);
    expect(await snapshotCell(grid, 1, 'Net')).toBe(150);
  });

  it('Esc ends editing and keeps the typed value', async () => {
    const grid = await open();
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'typed' });
    await pressKey(grid, 'Escape');
    expect(grid.controller.isEditingCell(1, 'Title')).toBe(false);
    expect(await snapshotCell(grid, 1, 'Title')).toBe('typed');
  });

  it('rapid keystrokes land in order; one undo reverts the whole edit', async () => {
    const grid = await open();
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 2, columnId: 'Title' });
    for (const value of ['a', 'ab', 'abc', 'abcd']) {
      void grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 2, columnId: 'Title', value });
    }
    expect(await snapshotCell(grid, 2, 'Title')).toBe('abcd');
    // Leave the cell, then undo once.
    await pressKey(grid, 'Escape');
    expect(await grid.controller.undo()).toBe(true);
    await vi.waitFor(() => expect(grid.controller.getRowView(2)?.cells.Title?.value).toBe('row 2'));
  });

  it('cellEditCommit overrides the paged default', async () => {
    const grid = await open({ cellEditCommit: 'deferred' });
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'draft' });
    expect(grid.table.getRow(1)?.getCell('Title')?.getValue()).toBe('row 1');
    expect(grid.controller.getEditDraft(1, 'Title')?.value).toBe('draft');
  });
});

describe('deferred commit: durable reads flush the open edit', () => {
  it('getFullSnapShot / iterateRowsFromDb contain the draft and keep the editor open', async () => {
    const grid = await open({ cellEditCommit: 'deferred' });
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'EDITED' });

    expect(await snapshotCell(grid, 1, 'Title')).toBe('EDITED');
    expect(grid.controller.isEditingCell(1, 'Title')).toBe(true);

    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'EDITED-2' });
    let streamed: unknown;
    await grid.controller.iterateRowsFromDb('all', async (records) => {
      streamed = records.find((r) => r.rowId === 1)?.cells.Title?.value ?? streamed;
    });
    expect(streamed).toBe('EDITED-2');
  });

  it('the event-sourced grid flushes too (default deferred)', async () => {
    const grid = createGrid({
      columnDefs: [{ field: 'name', headerName: 'Name', type: 'text' }],
      rowData: [{ name: 'alpha' }],
    });
    await grid.ready;
    const rowId = grid.table.getRows()[0]!.id.value;
    grid.engine.startCellEdit(rowId, 'name');
    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId, columnId: 'name', value: 'beta' });
    expect(grid.table.getRow(rowId)?.getCell('name')?.getValue()).toBe('alpha');
    const snap = await grid.controller.getFullSnapShot('all');
    expect(snap?.rows[0]?.cells.name).toBe('beta');
  });

  it('dispose() commits the open edit before dropping the page window', async () => {
    const config: Partial<CreateGridConfig> = { cellEditCommit: 'deferred', tableKey: 'parity-dispose' };
    const first = await open(config);
    await first.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 3, columnId: 'Title' });
    await first.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 3, columnId: 'Title', value: 'kept' });
    await first.controller.dispose();

    const reopened = await open(config);
    expect(reopened.controller.getRowView(3)?.cells.Title?.value).toBe('kept');
  });

  it('clearing a value (undefined) is committed', async () => {
    const grid = await open({ cellEditCommit: 'deferred' });
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: undefined });
    expect(grid.controller.getEditDraft(1, 'Title')).toEqual({ value: undefined, display: expect.anything() });
    await grid.controller.commitCellEdit();
    expect(grid.table.getRow(1)?.getCell('Title')?.getValue()).toBeUndefined();
  });
});

describe('Enter navigation', () => {
  it("default 'nextCell': next column, next row, then a new row past the last one", async () => {
    const grid = await open({}, 2);
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });

    await pressKey(grid, 'Enter');
    expect(grid.controller.getActiveCell()).toEqual({ rowId: 1, columnId: 'Bed' });

    await pressKey(grid, 'Enter', { shiftKey: true });
    expect(grid.controller.getActiveCell()).toEqual({ rowId: 1, columnId: 'Title' });

    // `Net` is computed (read-only): `Bed` is the last editable cell of a row.
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Bed' });
    await pressKey(grid, 'Enter');
    expect(grid.controller.getActiveCell()).toEqual({ rowId: 2, columnId: 'Title' });

    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 2, columnId: 'Bed' });
    await pressKey(grid, 'Enter');
    await vi.waitFor(() => expect(grid.controller.getViewState()?.pagination.totalRows).toBe(3));
    const active = grid.controller.getActiveCell();
    expect(active?.columnId).toBe('Title');
    expect(active?.rowId).not.toBe(1);
    expect(active?.rowId).not.toBe(2);
  });

  it("'down' keeps the spreadsheet behaviour", async () => {
    const grid = await open({ enterNavigation: 'down' });
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await pressKey(grid, 'Enter');
    expect(grid.controller.getActiveCell()).toEqual({ rowId: 2, columnId: 'Title' });
  });

  it('Enter commits a deferred draft before moving', async () => {
    const grid = await open({ cellEditCommit: 'deferred' });
    await grid.controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'entered' });
    await pressKey(grid, 'Enter');
    expect(grid.table.getRow(1)?.getCell('Title')?.getValue()).toBe('entered');
  });
});
