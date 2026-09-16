import { describe, expect, it, vi } from 'vitest';

import type { AuditLogger } from '../../application/ports/AuditLogger';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

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

const columns = [
  {
    fieldName: 'index',
    fieldCaption: '#',
    fieldType: 'index' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
  {
    fieldName: 'name',
    fieldCaption: 'Name',
    fieldType: 'text' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
  {
    fieldName: 'amount',
    fieldCaption: 'Amount',
    fieldType: 'number' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
];

async function createFixture() {
  const { createERPTable } = await import('../../bootstrap');
  return createERPTable({
    store: 'store-sort-90',
    tableKey: 'table-sort-90',
    actor: { userId: 'u1', roles: ['admin'] },
    tableType: 'default',
    activeCollection: 'default',
    repo: new MemoryTableRepository(),
    audit: new SilentAuditLogger(),
    remoteApi: { request: async () => null },
    columns,
    rows: [
      { id: 1, collection: 'default', values: { index: 1, name: 'c', amount: 30 } },
      { id: 2, collection: 'default', values: { index: 2, name: 'a', amount: 10 } },
      { id: 3, collection: 'default', values: { index: 3, name: 'b', amount: 20 } },
    ],
  });
}

describe('PR-90 SET_SORT_MODEL → SparseRowIndex / getAllUIRows', () => {
  it('empty sortModel keeps document index order', async () => {
    const result = await createFixture();
    const ids = result.engine.getAllUIRows()?.map((row) => row.id);
    expect(ids).toEqual([1, 2, 3]);
    expect(result.engine.getViewState()?.sortModel).toEqual([]);
  });

  it('SET_SORT_MODEL reorders getAllUIRows and the ui row index', async () => {
    const result = await createFixture();
    await result.engine.dispatch({
      type: 'SET_SORT_MODEL',
      tableKey: 'table-sort-90',
      sortModel: [{ colId: 'name', sort: 'asc' }],
    });
    expect(result.engine.getViewState()?.sortModel).toEqual([
      { colId: 'name', sort: 'asc' },
    ]);
    expect(result.engine.getAllUIRows()?.map((row) => row.cells.name?.value)).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(result.engine.getUiRowIndex().getOrderedIds()).toEqual([2, 3, 1]);
  });

  it('UI_SET_SORT_MODEL via controller clears back to index order', async () => {
    const result = await createFixture();
    await result.controller.dispatch({
      type: 'UI_SET_SORT_MODEL',
      sortModel: [{ colId: 'amount', sort: 'desc' }],
    });
    expect(result.engine.getAllUIRows()?.map((row) => row.cells.amount?.value)).toEqual([
      30, 20, 10,
    ]);
    result.controller.setSortModel([]);
    expect(result.engine.getAllUIRows()?.map((row) => row.id)).toEqual([1, 2, 3]);
  });

  it('editing a non-sort column does not rebuild the ui row index', async () => {
    const result = await createFixture();
    await result.engine.dispatch({
      type: 'SET_SORT_MODEL',
      tableKey: 'table-sort-90',
      sortModel: [{ colId: 'name', sort: 'asc' }],
    });
    const orderedBefore = result.engine.getUiRowIndex().getOrderedIds();
    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-sort-90',
      tableKey: 'table-sort-90',
      rowId: 2,
      columnId: 'amount',
      newValue: 99,
    });
    expect(result.engine.getUiRowIndex().getOrderedIds()).toBe(orderedBefore);
    expect(
      result.engine.getAllUIRows()?.find((row) => row.id === 2)?.cells.amount?.value,
    ).toBe(99);
  });

  it('editing a sort column rebuilds the ui row index', async () => {
    const result = await createFixture();
    await result.engine.dispatch({
      type: 'SET_SORT_MODEL',
      tableKey: 'table-sort-90',
      sortModel: [{ colId: 'name', sort: 'asc' }],
    });
    const orderedBefore = result.engine.getUiRowIndex().getOrderedIds();
    expect([...orderedBefore]).toEqual([2, 3, 1]);
    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-sort-90',
      tableKey: 'table-sort-90',
      rowId: 1,
      columnId: 'name',
      newValue: 'aa',
    });
    const orderedAfter = result.engine.getUiRowIndex().getOrderedIds();
    expect(orderedAfter).not.toBe(orderedBefore);
    expect(result.engine.getAllUIRows()?.map((row) => row.cells.name?.value)).toEqual([
      'a',
      'aa',
      'b',
    ]);
    expect([...orderedAfter]).toEqual([2, 1, 3]);
  });
});
