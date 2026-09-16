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
  timeoutMs = 3000,
): Promise<void> {
  const start = Date.now();
  while (!pred()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitUntil timed out');
    }
    await new Promise((r) => setTimeout(r, 5));
  }
}

function makeLines(n: number): Line[] {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    name: `r${i + 1}`,
    amount: i + 1,
  }));
}

describe('PR-102 block cache server row model', () => {
  it('scroll fetches only the needed block; filter purge refetches', async () => {
    const all = makeLines(200);
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
          rows: all.slice(p.startRow, p.endRow),
          lastRow: all.length,
        };
      },
    };

    const { createGrid } = await import('../index');
    const grid = createGrid<Line>({
      rowModelType: 'infinite',
      datasource,
      cacheBlockSize: 50,
      maxBlocksInCache: 3,
      recordPerPage: 50,
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      getRowId: (row) => row.id,
    });
    await grid.ready;
    await waitUntil(() => calls.length >= 1);
    const initialCalls = calls.length;
    expect(calls[0]?.startRow).toBe(0);
    expect(calls[0]?.endRow).toBe(50);

    // Scroll into block 2 (rows 100–150).
    calls.length = 0;
    await grid.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 100 * 40,
      viewportSize: 400,
      rowHeight: 40,
      overscan: 0,
    });
    await waitUntil(() => calls.length >= 1);
    expect(calls.every((c) => c.startRow >= 100)).toBe(true);
    expect(calls.some((c) => c.startRow === 100 && c.endRow === 150)).toBe(
      true,
    );
    // Must not re-request block 0.
    expect(calls.some((c) => c.startRow === 0)).toBe(false);
    void initialCalls;

    // Filter change clears cache and refetches.
    calls.length = 0;
    grid.api.setFilterModel({
      name: { filterType: 'text', type: 'contains', filter: 'r1' },
    });
    await waitUntil(() => calls.length >= 1);
    expect(calls[0]?.filterModel).toMatchObject({
      name: { filterType: 'text', type: 'contains', filter: 'r1' },
    });
  });

  it('refreshServerSide purges cache and reloads', async () => {
    let generation = 0;
    const calls: number[] = [];
    const datasource: GridDatasource<Line> = {
      async getRows(p) {
        calls.push(generation);
        return {
          rows: [
            {
              id: `g${generation}-${p.startRow}`,
              name: `gen-${generation}`,
              amount: generation,
            },
          ],
          lastRow: 1,
        };
      },
    };

    const { createGrid } = await import('../index');
    const grid = createGrid<Line>({
      rowModelType: 'serverSide',
      datasource,
      cacheBlockSize: 10,
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      getRowId: (row) => row.id,
    });
    await grid.ready;
    await waitUntil(() => calls.length === 1);
    expect(grid.api.refreshServerSide).toBeTypeOf('function');

    generation = 1;
    await grid.api.refreshServerSide();
    await waitUntil(() => calls.length >= 2);
    expect(calls[calls.length - 1]).toBe(1);
  });

  it('LRU drops old blocks when maxBlocksInCache is exceeded', async () => {
    const all = makeLines(400);
    const starts: number[] = [];
    const datasource: GridDatasource<Line> = {
      async getRows(p) {
        starts.push(p.startRow);
        return { rows: all.slice(p.startRow, p.endRow), lastRow: all.length };
      },
    };

    const { createGrid } = await import('../index');
    const grid = createGrid<Line>({
      rowModelType: 'infinite',
      datasource,
      cacheBlockSize: 50,
      maxBlocksInCache: 2,
      columnDefs: [
        { field: 'name', type: 'text' },
        { field: 'amount', type: 'number' },
      ],
      getRowId: (row) => row.id,
    });
    await grid.ready;
    await waitUntil(() => starts.length >= 1);

    for (const offset of [0, 50, 100, 150]) {
      starts.length = 0;
      await grid.session.dispatchViewIntent({
        type: 'CHANGE_VIEWPORT',
        scrollOffset: offset * 40,
        viewportSize: 200,
        rowHeight: 40,
        overscan: 0,
      });
      await waitUntil(() => starts.length >= 1 || offset === 0);
    }

    // Returning to block 0 should refetch because LRU evicted it.
    starts.length = 0;
    await grid.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 0,
      viewportSize: 200,
      rowHeight: 40,
      overscan: 0,
    });
    await waitUntil(() => starts.includes(0));
    expect(starts).toContain(0);
  });
});
