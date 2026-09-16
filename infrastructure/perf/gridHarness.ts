/**
 * Grid-scale performance harness (PR-100).
 * Hydrates 100k domain rows via createGrid, then measures engine ops
 * (window, scroll, edits, sort, filter) — not React DOM mount.
 */
import type { TableRepository } from '../../application/ports/TableRepository';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import type { RemoteApi } from '../../application/ports/RemoteApi';
import type { Table } from '../../domain/entities/Table';
import type { CreateERPTableResult } from '../../bootstrap/type';
import { InMemoryEventStore } from '../eventStore/InMemoryEventStore';

export type GridPerfBudget = {
  readonly rowCount: number;
  readonly columnCount: number;
  readonly hydrateMaxMs: number;
  readonly firstWindowMaxMs: number;
  readonly scroll1000MaxMs: number;
  readonly edit100MaxMs: number;
  readonly sortMaxMs: number;
  readonly filterMaxMs: number;
};

export type GridPerfSample = {
  readonly rowCount: number;
  readonly hydrateMs: number;
  readonly firstWindowMs: number;
  readonly scroll1000Ms: number;
  readonly edit100Ms: number;
  readonly sortMs: number;
  readonly filterMs: number;
  readonly visibleRowCount: number;
};

export type GridPerfCheck = {
  readonly sample: GridPerfSample;
  readonly budget: GridPerfBudget;
  readonly ok: boolean;
  readonly reasons: string[];
};

class MemoryTableRepository implements TableRepository {
  private tables = new Map<string, Table>();
  private key(store: string, tableKey: string) {
    return `${store}:${tableKey}`;
  }
  async getById(store: string, tableKey: string) {
    const table = this.tables.get(this.key(store, tableKey));
    if (!table) throw new Error('missing');
    return table;
  }
  async save(store: string, table: Table) {
    this.tables.set(this.key(store, table.id), table);
  }
  async delete(store: string, tableKey: string) {
    this.tables.delete(this.key(store, tableKey));
  }
  async resetTable(store: string, tableKey: string) {
    this.tables.delete(this.key(store, tableKey));
  }
  async exists(store: string, tableKey: string) {
    return this.tables.has(this.key(store, tableKey));
  }
}

class SilentAuditLogger implements AuditLogger {
  log(): void {}
  error(): void {}
  warn(): void {}
  info(): void {}
}

const noopRemoteApi: RemoteApi = {
  request: async <TResponse>() => null as TResponse,
};

export function buildPerfRowData(
  rowCount: number,
  columnCount: number,
): Array<Record<string, string | number>> {
  const rows: Array<Record<string, string | number>> = [];
  for (let i = 0; i < rowCount; i += 1) {
    const row: Record<string, string | number> = {
      id: i + 1,
      name: `r${i + 1}`,
      amount: i % 1000,
    };
    for (let c = 3; c < columnCount; c += 1) {
      row[`c${c}`] = i % (c + 7);
    }
    rows.push(row);
  }
  return rows;
}

export function buildPerfColumnDefs(columnCount: number) {
  const defs: Array<{
    field: string;
    headerName: string;
    type: 'text' | 'number';
  }> = [
    { field: 'name', headerName: 'Name', type: 'text' },
    { field: 'amount', headerName: 'Amount', type: 'number' },
  ];
  for (let c = 3; c < columnCount; c += 1) {
    defs.push({
      field: `c${c}`,
      headerName: `C${c}`,
      type: 'number',
    });
  }
  return defs;
}

export async function hydratePerfGrid(
  budget: GridPerfBudget,
): Promise<{ result: CreateERPTableResult; hydrateMs: number }> {
  const { createGrid } = await import('../../bootstrap');
  const rowData = buildPerfRowData(budget.rowCount, budget.columnCount);
  const columnDefs = buildPerfColumnDefs(budget.columnCount);
  const t0 = performance.now();
  const grid = createGrid({
    store: `perf-${Date.now()}`,
    tableKey: `table-perf-${Date.now()}`,
    actor: { userId: 'perf', roles: ['admin'] },
    repo: new MemoryTableRepository(),
    audit: new SilentAuditLogger(),
    eventStore: new InMemoryEventStore(),
    remoteApi: noopRemoteApi,
    columnDefs,
    rowData,
    getRowId: (row) => String((row as { id: number }).id),
  });
  const result = await grid.ready;
  const hydrateMs = performance.now() - t0;
  return { result, hydrateMs };
}

export async function measureGridPerformance(
  result: CreateERPTableResult,
  hydrateMs: number,
  _budget: GridPerfBudget,
): Promise<GridPerfSample> {
  const { session, engine, store, tableKey } = result;
  const hydratedRowCount = session.getUiRowCount();

  const tWindow = performance.now();
  await session.dispatchViewIntent({
    type: 'CHANGE_VIEWPORT',
    scrollOffset: 0,
    viewportSize: 400,
    rowHeight: 40,
    overscan: 2,
  });
  const visible = session.projectVisibleUiRows();
  const firstWindowMs = performance.now() - tWindow;

  const tScroll = performance.now();
  for (let step = 0; step < 1000; step += 1) {
    await session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: step * 40,
      viewportSize: 400,
      rowHeight: 40,
      overscan: 2,
    });
    session.projectVisibleUiRows();
  }
  const scroll1000Ms = performance.now() - tScroll;

  const ordered = engine.getUiRowIndex().getOrderedIds();
  const editIds = ordered.slice(0, 100);
  const tEdit = performance.now();
  for (const rowId of editIds) {
    await engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store,
      tableKey,
      rowId,
      columnId: 'amount',
      newValue: (Number(engine.getCell(rowId, 'amount')?.getValue()) || 0) + 1,
    });
  }
  const edit100Ms = performance.now() - tEdit;

  const tSort = performance.now();
  result.api.setSortModel([{ colId: 'amount', sort: 'desc' }]);
  void engine.getUiRowIndex().size;
  session.projectVisibleUiRows();
  const sortMs = performance.now() - tSort;

  const tFilter = performance.now();
  result.api.setFilterModel({
    name: { filterType: 'text', type: 'contains', filter: 'r1' },
  });
  void engine.getUiRowIndex().size;
  session.projectVisibleUiRows();
  const filterMs = performance.now() - tFilter;

  return {
    rowCount: hydratedRowCount,
    hydrateMs,
    firstWindowMs,
    scroll1000Ms,
    edit100Ms,
    sortMs,
    filterMs,
    visibleRowCount: visible.length,
  };
}

export function checkGridPerfBudget(
  sample: GridPerfSample,
  budget: GridPerfBudget,
): GridPerfCheck {
  const reasons: string[] = [];
  if (sample.rowCount < budget.rowCount) {
    reasons.push(
      `rowCount ${sample.rowCount} < required ${budget.rowCount}`,
    );
  }
  const checks: Array<[keyof GridPerfSample, keyof GridPerfBudget, string]> = [
    ['hydrateMs', 'hydrateMaxMs', 'hydrate'],
    ['firstWindowMs', 'firstWindowMaxMs', 'firstWindow'],
    ['scroll1000Ms', 'scroll1000MaxMs', 'scroll1000'],
    ['edit100Ms', 'edit100MaxMs', 'edit100'],
    ['sortMs', 'sortMaxMs', 'sort'],
    ['filterMs', 'filterMaxMs', 'filter'],
  ];
  for (const [sampleKey, budgetKey, label] of checks) {
    const value = sample[sampleKey] as number;
    const limit = budget[budgetKey] as number;
    if (value > limit) {
      reasons.push(
        `${label} ${value.toFixed(1)}ms exceeds budget ${limit}ms`,
      );
    }
  }
  return {
    sample,
    budget,
    ok: reasons.length === 0,
    reasons,
  };
}

/** One-shot: hydrate + measure + check. */
export async function runGridPerfSuite(
  budget: GridPerfBudget,
): Promise<GridPerfCheck> {
  const { result, hydrateMs } = await hydratePerfGrid(budget);
  const sample = await measureGridPerformance(result, hydrateMs, budget);
  return checkGridPerfBudget(sample, budget);
}
