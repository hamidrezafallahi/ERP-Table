import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';

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

describe('PR-48 CLEAR_ROW_SELECTION', () => {
  it('clears selectedRows via engine and UI controller dispatch', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-crs',
      tableKey: 'table-crs',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        { id: 1, collection: 'default', values: { name: 'a' } },
        { id: 2, collection: 'default', values: { name: 'b' } },
      ],
    });

    result.controller.onRowSelect(1);
    result.controller.onRowSelect(2);
    expect(result.controller.getSelectedRows()).toEqual({ 1: true, 2: true });

    await result.controller.dispatch({ type: 'CLEAR_ROW_SELECTION' });
    expect(result.controller.getSelectedRows()).toEqual({});
  });
});
