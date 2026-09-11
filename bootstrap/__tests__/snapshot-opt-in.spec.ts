import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';
import { InMemorySnapshotStore } from '../../infrastructure/snapshot/InMemorySnapshotStore';

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
    fieldName: 'name',
    fieldCaption: 'Name',
    fieldType: 'text' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
];

describe('PR-50 snapshotStore opt-in', () => {
  it('does not construct SnapshotStrategy without snapshotStore', async () => {
    const { createERPTable } = await import('../index');
    const snapshots = new InMemorySnapshotStore();
    const eventStore = new InMemoryEventStore();

    const result = await createERPTable({
      store: 'store-snap-off',
      tableKey: 'table-snap-off',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      eventStore,
      columns,
      rows: [{ id: 1, collection: 'default', values: { name: 'a' } }],
    });

    expect(result.snapshotStrategy).toBeUndefined();

    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-snap-off',
      tableKey: 'table-snap-off',
      page: 2,
    });
    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-snap-off',
      tableKey: 'table-snap-off',
      page: 1,
    });

    expect(await snapshots.loadLatest('table:table-snap-off')).toBeNull();
    expect(await eventStore.read('table:table-snap-off')).toHaveLength(2);
  });

  it('wires SnapshotStrategy and catch-up when snapshotStore is passed', async () => {
    const { createERPTable } = await import('../index');
    const snapshots = new InMemorySnapshotStore();
    const eventStore = new InMemoryEventStore();

    const result = await createERPTable({
      store: 'store-snap-on',
      tableKey: 'table-snap-on',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      eventStore,
      snapshotStore: snapshots,
      snapshotEveryNEvents: 2,
      columns,
      rows: [{ id: 1, collection: 'default', values: { name: 'a' } }],
    });

    expect(result.snapshotStrategy).toBeDefined();

    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-snap-on',
      tableKey: 'table-snap-on',
      page: 2,
    });
    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-snap-on',
      tableKey: 'table-snap-on',
      page: 3,
    });
    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-snap-on',
      tableKey: 'table-snap-on',
      page: 1,
    });

    const latest = await snapshots.loadLatest('table:table-snap-on');
    expect(latest).not.toBeNull();
    expect(latest!.version).toBe(2);

    const catchUp = await result.snapshotStrategy!.loadWithCatchUp(
      'table:table-snap-on',
    );
    expect(catchUp.snapshot?.version).toBe(2);
    expect(catchUp.eventsAfter).toHaveLength(1);
    expect(catchUp.eventsAfter[0].type).toBe('PAGE_CHANGED');
  });
});
