import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import { IndexedDbEventStore } from '../../infrastructure/eventStore/IndexedDbEventStore';

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

describe('createERPTable with IndexedDbEventStore', () => {
  it('accepts injected durable event store and dual-writes cell changes', async () => {
    const { createERPTable } = await import('../index');
    const eventStore = IndexedDbEventStore.inMemory();

    const result = await createERPTable({
      store: 'store-idb',
      tableKey: 'table-idb',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      eventStore,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'alpha' } }],
    });

    expect(result.eventStore).toBe(eventStore);

    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-idb',
      tableKey: 'table-idb',
      rowId: 1,
      columnId: 'name',
      newValue: 'beta',
    });

    const stored = await eventStore.read('table:table-idb');
    expect(stored.some((e) => e.type === 'CELL_CHANGED')).toBe(true);
  });
});
