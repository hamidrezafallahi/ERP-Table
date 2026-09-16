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
    fieldName: 'sku',
    fieldCaption: 'SKU',
    fieldType: 'text' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
];

async function createFixture() {
  const { createERPTable } = await import('../../bootstrap');
  return createERPTable({
    store: 'store-qf-93',
    tableKey: 'table-qf-93',
    actor: { userId: 'u1', roles: ['admin'] },
    tableType: 'default',
    activeCollection: 'default',
    repo: new MemoryTableRepository(),
    audit: new SilentAuditLogger(),
    remoteApi: { request: async () => null },
    columns,
    rows: [
      { id: 1, collection: 'default', values: { index: 1, name: 'Alpha', sku: 'A-1' } },
      { id: 2, collection: 'default', values: { index: 2, name: 'Beta', sku: 'B-2' } },
      { id: 3, collection: 'default', values: { index: 3, name: 'Alpha Plus', sku: 'A-3' } },
    ],
  });
}

describe('PR-93 quickFilterText removes rows', () => {
  it('SET_QUICK_FILTER_TEXT reduces getAllUIRows / ui row count', async () => {
    const result = await createFixture();
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 2, 3]);
    expect(result.engine.getViewState()?.pagination.totalRows).toBe(3);

    await result.engine.dispatch({
      type: 'SET_QUICK_FILTER_TEXT',
      tableKey: 'table-qf-93',
      quickFilterText: 'Alpha',
    });
    expect(result.engine.getViewState()?.quickFilterText).toBe('Alpha');
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 3]);
    expect(result.engine.getViewState()?.pagination.totalRows).toBe(2);

    result.controller.setQuickFilterText('');
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('GridApi.setQuickFilter mirrors controller and does not use gridSearch', async () => {
    const result = await createFixture();
    result.api.setQuickFilter('Beta');
    expect(result.api.getQuickFilter()).toBe('Beta');
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([2]);
    expect(result.engine.getViewState()?.gridSearch).toBeNull();
  });

  it('grid search state can coexist without claiming to filter rows', async () => {
    const result = await createFixture();
    await result.engine.dispatch({
      type: 'SET_GRID_SEARCH',
      tableKey: 'table-qf-93',
      search: {
        columnId: 'name',
        query: 'Alpha',
        matches: [{ rowId: 1, columnId: 'name' }],
        currentIndex: 0,
      },
    });
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 2, 3]);
    result.controller.setQuickFilterText('Alpha');
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 3]);
    expect(result.engine.getViewState()?.gridSearch?.query).toBe('Alpha');
  });
});
