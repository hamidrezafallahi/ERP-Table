import { describe, expect, it, vi } from 'vitest';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

type Line = { id: string; name: string; amount: number };

import type {
  GridDatasource,
  GridDatasourceGetRowsParams,
} from '../../application/ports/GridDatasource';

async function waitUntil(
  pred: () => boolean,
  timeoutMs = 2000,
): Promise<void> {
  const start = Date.now();
  while (!pred()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitUntil timed out');
    }
    await new Promise((r) => setTimeout(r, 5));
  }
}

describe('PR-96 server / infinite datasource', () => {
  it('sort change fires exactly one getRows with the new sortModel', async () => {
    const calls: GridDatasourceGetRowsParams[] = [];
    const datasource: GridDatasource<Line> = {
      async getRows(p) {
        calls.push({
          startRow: p.startRow,
          endRow: p.endRow,
          sortModel: [...p.sortModel],
          filterModel: { ...p.filterModel },
        });
        return {
          rows: [
            { id: 'a', name: 'alpha', amount: 1 },
            { id: 'b', name: 'beta', amount: 2 },
          ],
          lastRow: 2,
        };
      },
    };

    const { createGrid } = await import('../index');
    const grid = createGrid<Line>({
      rowModelType: 'infinite',
      datasource,
      recordPerPage: 10,
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      getRowId: (row) => row.id,
    });
    await grid.ready;
    await waitUntil(() => calls.length === 1);
    expect(calls[0]?.sortModel).toEqual([]);
    expect(calls[0]?.startRow).toBe(0);
    expect(calls[0]?.endRow).toBe(10);

    calls.length = 0;
    grid.api.setSortModel([{ colId: 'name', sort: 'asc' }]);
    await waitUntil(() => calls.length === 1);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.sortModel).toEqual([{ colId: 'name', sort: 'asc' }]);
    expect(calls[0]?.startRow).toBe(0);
    expect(calls[0]?.endRow).toBe(10);
  });

  it('does not apply local sort when rowModelType is infinite', async () => {
    const datasource: GridDatasource<Line> = {
      async getRows() {
        // Deliberately reverse of asc name order
        return {
          rows: [
            { id: 'b', name: 'beta', amount: 2 },
            { id: 'a', name: 'alpha', amount: 1 },
          ],
          lastRow: 2,
        };
      },
    };

    const { createGrid } = await import('../index');
    const grid = createGrid<Line>({
      rowModelType: 'infinite',
      datasource,
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      getRowId: (row) => row.id,
    });
    await grid.ready;
    grid.api.setSortModel([{ colId: 'name', sort: 'asc' }]);
    // Wait for applied host rows (lazy cells — read via api / cells).
    await waitUntil(() => {
      const rows = grid.controller.getViewState()?.rows ?? [];
      return rows.length === 2 && rows[0]?.cells.name?.value != null;
    });

    const names = (grid.controller.getViewState()?.rows ?? []).map(
      (r) => r.cells.name?.value,
    );
    // Server order preserved (beta then alpha), not client asc (alpha then beta).
    expect(names).toEqual(['beta', 'alpha']);
  });
});
