import { describe, expect, it, vi } from 'vitest';
import { bindGridHostEvents } from '../../ui/host/bindGridHostEvents';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

describe('PR-85 ERPTable host events (runtime)', () => {
  it('cell edit fires exactly one onCellValueChanged with the verify payload', async () => {
    const { createGrid } = await import('../index');
    const host = { name: 'alpha' };
    const grid = createGrid({
      columnDefs: [{ field: 'name', headerName: 'Name', type: 'text' }],
      rowData: [host],
      getRowId: (_row, index) => String(index + 1),
    });
    await grid.ready;

    const onCellValueChanged = vi.fn();
    const onRowValueChanged = vi.fn();
    const unsub = bindGridHostEvents({
      eventStore: grid.eventStore,
      controller: grid.controller,
      tableKey: grid.tableKey,
      handlers: { onCellValueChanged, onRowValueChanged },
    });

    const rowId = grid.table.getRows()[0]?.id.value;
    expect(rowId).toBeDefined();
    await grid.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: grid.store,
      tableKey: grid.tableKey,
      rowId: rowId!,
      columnId: 'name',
      newValue: 'beta',
    });

    expect(onCellValueChanged).toHaveBeenCalledTimes(1);
    expect(onCellValueChanged.mock.calls[0]?.[0]).toEqual({
      oldValue: 'alpha',
      newValue: 'beta',
      colId: 'name',
      rowId,
      data: host,
    });
    expect(onRowValueChanged).toHaveBeenCalledTimes(1);
    unsub();
  });

  it('ROW_SELECTION_TOGGLED fires onSelectionChanged from the view store', async () => {
    const { createGrid } = await import('../index');
    const host = { name: 'alpha' };
    const grid = createGrid({
      columnDefs: [{ field: 'name', headerName: 'Name', type: 'text' }],
      rowData: [host],
      getRowId: (_row, index) => String(index + 1),
    });
    await grid.ready;

    const onSelectionChanged = vi.fn();
    const unsub = bindGridHostEvents({
      eventStore: grid.eventStore,
      controller: grid.controller,
      tableKey: grid.tableKey,
      handlers: { onSelectionChanged },
    });

    const rowId = grid.table.getRows()[0]?.id.value;
    await grid.engine.dispatch({
      type: 'ROW_SELECTION_TOGGLED',
      tableKey: grid.tableKey,
      rowId: rowId!,
    });

    expect(onSelectionChanged).toHaveBeenCalledTimes(1);
    expect(onSelectionChanged.mock.calls[0]?.[0]).toEqual({
      selectedRowIds: [rowId],
      selectedRows: [host],
    });
    unsub();
  });

  it('ACTIVE_CELL fires onCellFocused', async () => {
    const { createGrid } = await import('../index');
    const grid = createGrid({
      columnDefs: [{ field: 'name', headerName: 'Name', type: 'text' }],
      rowData: [{ name: 'alpha' }],
    });
    await grid.ready;

    const onCellFocused = vi.fn();
    const unsub = bindGridHostEvents({
      eventStore: grid.eventStore,
      controller: grid.controller,
      tableKey: grid.tableKey,
      handlers: { onCellFocused },
    });

    const rowId = grid.table.getRows()[0]?.id.value;
    await grid.engine.dispatch({
      type: 'ACTIVE_CELL',
      tableKey: grid.tableKey,
      rowId: rowId!,
      columnId: 'name',
    });

    expect(onCellFocused).toHaveBeenCalledTimes(1);
    expect(onCellFocused.mock.calls[0]?.[0]).toEqual({
      rowId,
      colId: 'name',
    });
    unsub();
  });
});
