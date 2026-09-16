import { describe, expect, it, vi } from 'vitest';

import {
  createCellEditSession,
  dirtyDraftColumns,
  isEditingCell,
  leavesEditSession,
  patchDraft,
  readDraft,
} from '../dataOps/cellEditSession';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

describe('PR-126 cellEditSession helpers', () => {
  it('patchDraft + dirtyDraftColumns track value/display diffs', () => {
    const session = createCellEditSession({
      rowId: 1,
      columnId: 'name',
      editType: 'cell',
      baseline: { name: { value: 'alpha', display: 'alpha' } },
    });
    expect(dirtyDraftColumns(session)).toEqual([]);
    const next = patchDraft(session, 'name', { value: 'beta' });
    expect(readDraft(next, 1, 'name')?.value).toBe('beta');
    expect(dirtyDraftColumns(next)).toEqual(['name']);
  });

  it('isEditingCell respects fullRow vs cell', () => {
    const cell = createCellEditSession({
      rowId: 1,
      columnId: 'name',
      editType: 'cell',
      baseline: { name: { value: 'a', display: 'a' } },
    });
    expect(isEditingCell(cell, 1, 'name')).toBe(true);
    expect(isEditingCell(cell, 1, 'amount')).toBe(false);

    const full = createCellEditSession({
      rowId: 1,
      columnId: 'name',
      editType: 'fullRow',
      baseline: {
        name: { value: 'a', display: 'a' },
        amount: { value: 1, display: 1 },
      },
    });
    expect(isEditingCell(full, 1, 'amount')).toBe(true);
    expect(leavesEditSession(full, 1, 'amount')).toBe(false);
    expect(leavesEditSession(full, 2, 'name')).toBe(true);
  });
});

describe('PR-126 edit cancel / commit vs EventStore', () => {
  it('type + Esc does not append; Enter commits one CELL_CHANGED', async () => {
    const { createGrid } = await import('../../bootstrap');
    const grid = createGrid({
      columnDefs: [{ field: 'name', headerName: 'Name', type: 'text' }],
      rowData: [{ name: 'alpha' }],
    });
    await grid.ready;

    const rowId = grid.table.getRows()[0]!.id.value;
    const streamId = `table:${grid.tableKey}`;
    const before = await grid.eventStore.read(streamId);

    grid.engine.startCellEdit(rowId, 'name');
    grid.engine.patchCellEdit(rowId, 'name', { value: 'beta' });
    expect(grid.engine.getEditDraft(rowId, 'name')?.value).toBe('beta');
    expect(grid.table.getRow(rowId)?.getCell('name')?.getValue()).toBe('alpha');

    grid.engine.cancelCellEdit();
    const afterCancel = await grid.eventStore.read(streamId);
    expect(afterCancel.length).toBe(before.length);
    expect(grid.table.getRow(rowId)?.getCell('name')?.getValue()).toBe('alpha');
    expect(grid.engine.getCellEdit()).toBeNull();

    grid.engine.startCellEdit(rowId, 'name');
    grid.engine.patchCellEdit(rowId, 'name', { value: 'gamma' });
    const writes = await grid.engine.commitCellEdit();
    expect(writes).toBe(1);
    expect(grid.table.getRow(rowId)?.getCell('name')?.getValue()).toBe('gamma');

    const afterCommit = await grid.eventStore.read(streamId);
    const cellEvents = afterCommit.filter((e) => e.type === 'CELL_CHANGED');
    const beforeCell = before.filter((e) => e.type === 'CELL_CHANGED');
    expect(cellEvents.length - beforeCell.length).toBe(1);
  });

  it('fullRow commit writes dirty columns and fires onRowValueChanged', async () => {
    const { createGrid } = await import('../../bootstrap');
    const { bindGridHostEvents } = await import('../../ui/host/bindGridHostEvents');
    const host = { name: 'alpha', amount: 10 };
    const grid = createGrid({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      rowData: [host],
      editType: 'fullRow',
    });
    await grid.ready;

    const onRowValueChanged = vi.fn();
    const unsub = bindGridHostEvents({
      eventStore: grid.eventStore,
      controller: grid.controller,
      tableKey: grid.tableKey,
      handlers: { onRowValueChanged },
    });

    const rowId = grid.table.getRows()[0]!.id.value;
    grid.engine.startCellEdit(rowId, 'name');
    expect(grid.engine.isEditingCell(rowId, 'amount')).toBe(true);
    grid.engine.patchCellEdit(rowId, 'name', { value: 'beta' });
    grid.engine.patchCellEdit(rowId, 'amount', { value: 20 });
    const writes = await grid.engine.commitCellEdit();
    expect(writes).toBe(2);
    expect(onRowValueChanged).toHaveBeenCalled();
    unsub();
  });
});
