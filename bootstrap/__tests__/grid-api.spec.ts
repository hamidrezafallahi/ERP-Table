import { describe, expect, it, vi } from 'vitest';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

type Line = { id: string; name: string; amount: number };

const sample = {
  columnDefs: [
    { field: 'name', headerName: 'Name', type: 'text' as const },
    { field: 'amount', headerName: 'Amount', type: 'number' as const },
  ],
  rowData: [
    { id: 'sku-1', name: 'alpha', amount: 10 },
    { id: 'sku-2', name: 'beta', amount: 20 },
  ] satisfies Line[],
  getRowId: (row: Line) => row.id,
};

async function boot() {
  const { createGrid } = await import('../index');
  const grid = createGrid(sample);
  await grid.ready;
  return grid;
}

describe('PR-86 GridApi', () => {
  it('createGrid.ready fills api with every documented method', async () => {
    const grid = await boot();
    expect(grid.api).toBeDefined();
    for (const method of [
      'getRowNode',
      'setRowData',
      'refreshCells',
      'getSelectedRows',
      'deselectAll',
      'startEditingCell',
      'stopEditing',
      'exportDataAsExcel',
      'undo',
      'redo',
      'getColumnState',
      'applyColumnState',
      'setColumnVisible',
      'autoSizeColumns',
      'sizeColumnsToFit',
    ] as const) {
      expect(typeof grid.api[method], method).toBe('function');
    }
  });

  it('getRowNode resolves host getRowId and numeric rowId', async () => {
    const grid = await boot();
    const bySource = grid.api.getRowNode('sku-1');
    expect(bySource?.id).toBe('sku-1');
    expect(bySource?.data).toEqual(sample.rowData[0]);
    const byNumber = grid.api.getRowNode(bySource!.rowId);
    expect(byNumber?.id).toBe('sku-1');
    expect(grid.api.getRowNode('missing')).toBeUndefined();
  });

  it('setRowData replaces host rows without dropping the api', async () => {
    const grid = await boot();
    const next: Line[] = [{ id: 'sku-9', name: 'omega', amount: 99 }];
    grid.api.setRowData(next);
    expect(grid.api.getRowNode('sku-1')).toBeUndefined();
    expect(grid.api.getRowNode('sku-9')?.data).toEqual(next[0]);
  });

  it('refreshCells notifies view subscribers', async () => {
    const grid = await boot();
    let ticks = 0;
    grid.controller.subscribe(() => {
      ticks += 1;
    });
    grid.api.refreshCells();
    expect(ticks).toBeGreaterThan(0);
  });

  it('getSelectedRows returns host objects; deselectAll clears them', async () => {
    const grid = await boot();
    const rowId = grid.api.getRowNode('sku-1')!.rowId;
    await grid.engine.dispatch({
      type: 'ROW_SELECTION_TOGGLED',
      tableKey: grid.tableKey,
      rowId,
    });
    expect(grid.api.getSelectedRows()).toEqual([sample.rowData[0]]);
    await grid.api.deselectAll();
    expect(grid.api.getSelectedRows()).toEqual([]);
  });

  it('startEditingCell focuses the cell; stopEditing clears it', async () => {
    const grid = await boot();
    const rowId = grid.api.getRowNode('sku-1')!.rowId;
    await grid.api.startEditingCell({ rowId: 'sku-1', colId: 'name' });
    expect(grid.controller.getActiveCell()).toEqual({
      rowId,
      columnId: 'name',
    });
    expect(grid.engine.getCellEdit()?.columnId).toBe('name');
    await grid.api.stopEditing();
    expect(grid.controller.getActiveCell() ?? null).toBeFalsy();
    expect(grid.engine.getCellEdit()).toBeNull();
  });

  it('exportDataAsExcel publishes through pluginHost.requestExport', async () => {
    const grid = await boot();
    const spy = vi
      .spyOn(grid.pluginHost, 'requestExport')
      .mockResolvedValue(undefined);
    await grid.api.exportDataAsExcel({ fileName: 'lines.xlsx' });
    expect(spy).toHaveBeenCalledWith({
      format: 'xlsx',
      fileName: 'lines.xlsx',
    });
  });

  it('undo restores a cell edit; redo reapplies it', async () => {
    const grid = await boot();
    const rowId = grid.api.getRowNode('sku-1')!.rowId;
    await grid.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: grid.store,
      tableKey: grid.tableKey,
      rowId,
      columnId: 'name',
      newValue: 'gamma',
    });
    expect(grid.table.getRow(rowId)?.getCell('name')?.getValue()).toBe('gamma');
    expect(await grid.api.undo()).toBe(true);
    expect(grid.table.getRow(rowId)?.getCell('name')?.getValue()).toBe('alpha');
    expect(await grid.api.redo()).toBe(true);
    expect(grid.table.getRow(rowId)?.getCell('name')?.getValue()).toBe('gamma');
  });

  it('getColumnState lists colId / width / hide / order', async () => {
    const grid = await boot();
    const state = grid.api.getColumnState();
    const name = state.find((col) => col.colId === 'name');
    const amount = state.find((col) => col.colId === 'amount');
    expect(name).toMatchObject({ colId: 'name', hide: false });
    expect(name?.width).toBeGreaterThan(0);
    expect(amount?.order).toBeGreaterThan(name!.order);
  });

  it('applyColumnState writes width, hide, and reorders data columns', async () => {
    const grid = await boot();
    await grid.api.applyColumnState([
      { colId: 'amount', width: 280, hide: false, order: 0 },
      { colId: 'name', width: 200, hide: true, order: 1 },
    ]);
    const state = grid.api.getColumnState();
    expect(state.find((col) => col.colId === 'amount')?.width).toBe(280);
    expect(state.find((col) => col.colId === 'name')?.width).toBe(200);
    expect(state.find((col) => col.colId === 'name')?.hide).toBe(true);
    const movable = state
      .filter((col) => col.colId !== 'index')
      .map((col) => col.colId);
    expect(movable).toEqual(['amount', 'name']);
  });

  it('setColumnVisible toggles hide', async () => {
    const grid = await boot();
    grid.api.setColumnVisible('amount', false);
    expect(grid.api.getColumnState().find((c) => c.colId === 'amount')?.hide).toBe(
      true,
    );
    grid.api.setColumnVisible('amount', true);
    expect(grid.api.getColumnState().find((c) => c.colId === 'amount')?.hide).toBe(
      false,
    );
  });

  it('autoSizeColumns widens columns from cell content (PR-112)', async () => {
    const { createGrid } = await import('../index');
    const grid = createGrid({
      columnDefs: [{ field: 'note', headerName: 'یادداشت', type: 'text' as const }],
      rowData: [
        {
          id: '1',
          note: 'این یک متن فارسی بسیار طولانی برای auto-size است',
        },
      ],
      getRowId: (row: { id: string }) => row.id,
    });
    await grid.ready;
    const before = grid.api.getColumnState().find((c) => c.colId === 'note')?.width ?? 0;
    grid.api.autoSizeColumns(['note']);
    const after = grid.api.getColumnState().find((c) => c.colId === 'note')?.width ?? 0;
    expect(after).toBeGreaterThan(before);
    expect(after).toBeGreaterThan(200);
  });

  it('sizeColumnsToFit scales widths to container (PR-112)', async () => {
    const grid = await boot();
    grid.api.sizeColumnsToFit(600);
    const state = grid.api.getColumnState().filter((c) => c.colId !== 'index');
    const sum = state.reduce((total, col) => total + col.width, 0);
    expect(sum).toBe(600);
  });
});
