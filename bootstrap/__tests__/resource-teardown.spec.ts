import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import type {
  AppendResult,
  Unsubscribe,
} from '../../application/ports/EventStore';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { GridEvent } from '../../domain/types/GridEvent';
import { OfflineStatus } from '../../application/offline/OfflineStatus';
import { GridSyncService } from '../../application/sync/GridSyncService';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';
import { IndexedDbEventStore } from '../../infrastructure/eventStore/IndexedDbEventStore';
import { MemoryKvDatabase } from '../../infrastructure/eventStore/KvDatabase';
import { trackEventStoreSubscriptions } from '../../infrastructure/eventStore/trackedEventStore';
import { ChangelogProjection } from '../../infrastructure/projections/ChangelogProjection';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

function evt(id: string, tableId = 't1'): GridEvent {
  return {
    eventId: id,
    type: 'CELL_CHANGED',
    tableId,
    streamId: `table:${tableId}`,
    version: 0,
    occurredAt: 1,
    actorId: 'u1',
    payload: { rowId: 1, columnId: 'a', newValue: id },
  };
}

/** InMemoryEventStore that counts live subscriptions. */
class CountingStore extends InMemoryEventStore {
  live = 0;
  override subscribe(
    streamId: string,
    onEvent: (event: GridEvent) => void,
  ): Unsubscribe {
    this.live += 1;
    const off = super.subscribe(streamId, onEvent);
    let done = false;
    return () => {
      if (done) return;
      done = true;
      this.live -= 1;
      off();
    };
  }
  override subscribeAll(onEvent: (event: GridEvent) => void): Unsubscribe {
    this.live += 1;
    const off = super.subscribeAll(onEvent);
    let done = false;
    return () => {
      if (done) return;
      done = true;
      this.live -= 1;
      off();
    };
  }
}

/** EventStore whose readAll can be held open to simulate a slow catch-up. */
function gatedStore(): {
  store: CountingStore;
  release: () => void;
} {
  const store = new CountingStore();
  let open!: () => void;
  const gate = new Promise<void>((resolve) => {
    open = resolve;
  });
  const base = store.readAll.bind(store);
  store.readAll = async (from?: number) => {
    await gate;
    return base(from);
  };
  return { store, release: open };
}

class MemoryTableRepository implements TableRepository {
  tables = new Map<string, Table>();
  deleteCalls = 0;
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
    this.deleteCalls += 1;
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

describe('trackEventStoreSubscriptions', () => {
  it('unsubscribes everything on release and refuses new subscriptions', () => {
    const inner = new CountingStore();
    const tracked = trackEventStoreSubscriptions(inner);
    tracked.store.subscribeAll(() => undefined);
    tracked.store.subscribe('s', () => undefined);
    const own = tracked.store.subscribeAll(() => undefined);
    own();
    expect(inner.live).toBe(2);

    tracked.release();
    expect(inner.live).toBe(0);
    tracked.release();

    tracked.store.subscribeAll(() => undefined);
    expect(inner.live).toBe(0);
  });

  it('still delegates append / read after release (data path untouched)', async () => {
    const inner = new InMemoryEventStore();
    const tracked = trackEventStoreSubscriptions(inner);
    tracked.release();
    const res: AppendResult = await tracked.store.append('s', [evt('e1')], -1);
    expect(res.ok).toBe(true);
    expect(await inner.read('s')).toHaveLength(1);
  });
});

describe('IndexedDbEventStore.close', () => {
  it('closes the db once, drains in-flight appends, drops later ones', async () => {
    const db = new MemoryKvDatabase();
    const closeSpy = vi.fn();
    (db as unknown as { close: () => void }).close = closeSpy;
    const store = new IndexedDbEventStore(db);

    const pending = store.append('s', [evt('e1')], -1);
    const closing = store.close();
    expect(store.close()).toBe(closing);
    await closing;
    expect((await pending).ok).toBe(true);
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const late = await store.append('s', [evt('e2')], -1);
    expect(late.ok).toBe(true);
    expect(await store.readAll()).toEqual([]);
    const fresh = new IndexedDbEventStore(db);
    expect((await fresh.read('s')).map((e) => e.eventId)).toEqual(['e1']);
  });
});

describe('OfflineStatus lifecycle', () => {
  it('stop() during start() does not leave a store subscription behind', async () => {
    const { store, release } = gatedStore();
    const status = new OfflineStatus({
      tableId: 't1',
      connectivity: { getOnline: () => true, subscribe: () => () => undefined },
    });
    const starting = status.start(store);
    status.stop();
    release();
    await starting;
    expect(store.live).toBe(0);
  });

  it('dispose() removes store subscription and listeners', async () => {
    const store = new CountingStore();
    const status = new OfflineStatus({
      tableId: 't1',
      connectivity: { getOnline: () => true, subscribe: () => () => undefined },
    });
    await status.start(store);
    expect(store.live).toBe(1);
    const seen = vi.fn();
    status.subscribePending(seen);
    seen.mockClear();
    status.dispose();
    expect(store.live).toBe(0);
    await store.append('table:t1', [evt('e1')], -1);
    expect(seen).not.toHaveBeenCalled();
  });
});

describe('ChangelogProjection lifecycle', () => {
  it('stop() during catch-up does not project into a stopped projection', async () => {
    const { store, release } = gatedStore();
    await InMemoryEventStore.prototype.append.call(store, 'table:t1', [evt('e1')], -1);
    const projection = new ChangelogProjection(store);
    const starting = projection.start();
    projection.stop();
    release();
    await starting;
    expect(projection.query()).toHaveLength(0);
    expect(store.live).toBe(0);
  });

  it('dispose() drops subscribers', async () => {
    const store = new InMemoryEventStore();
    const projection = new ChangelogProjection(store);
    await projection.start();
    const cb = vi.fn();
    projection.subscribe(cb);
    cb.mockClear();
    projection.dispose();
    await store.append('table:t1', [evt('e1')], -1);
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('GridSyncService.dispose', () => {
  it('turns sync() into a no-op and drops conflict listeners', async () => {
    const store = new InMemoryEventStore();
    const offline = new OfflineStatus({
      tableId: 't1',
      connectivity: { getOnline: () => true, subscribe: () => () => undefined },
    });
    const push = vi.fn(async () => ({ acceptedIds: [] as string[] }));
    const service = new GridSyncService({
      tableId: 't1',
      eventStore: store,
      offlineStatus: offline,
      transport: { push, pull: async () => ({ events: [], cursor: 0 }) },
      applyCellValue: async () => undefined,
    });
    const listener = vi.fn();
    service.subscribeConflicts(listener);
    service.dispose();
    service.dispose();
    const res = await service.sync();
    expect(res).toEqual({ pushed: 0, pulled: 0, applied: 0, conflicts: [] });
    expect(push).not.toHaveBeenCalled();
    const late = vi.fn();
    service.subscribeConflicts(late);
    expect(late).not.toHaveBeenCalled();
  });
});

const columns = [
  {
    fieldName: 'name',
    fieldCaption: 'Name',
    fieldType: 'text',
    fieldCollection: 'default',
    visibility: { kind: 'always' },
  },
] as const;

function baseConfig(repo: MemoryTableRepository, extra: Record<string, unknown>) {
  return {
    store: 'store-td',
    tableKey: 'table-td',
    actor: { userId: 'u1', roles: ['admin'] },
    tableType: 'default',
    activeCollection: 'default',
    repo,
    audit: new SilentAuditLogger(),
    remoteApi: { request: async () => null },
    columns: [...columns],
    rows: [{ id: 1, collection: 'default', values: { name: 'alpha' } }],
    ...extra,
  };
}

describe('createGrid resource teardown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('releaseResources() drops every internal subscription without TABLE_DISPOSED', async () => {
    const { createGrid } = await import('../index');
    const eventStore = new CountingStore();
    const repo = new MemoryTableRepository();
    const pluginDispose = vi.fn();
    const grid = await createGrid(
      baseConfig(repo, {
        eventStore,
        plugins: [{ name: 'p', register: () => undefined, dispose: pluginDispose }],
      }) as never,
    ).ready;

    expect(eventStore.live).toBeGreaterThan(0);
    const first = grid.controller.releaseResources();
    expect(grid.controller.releaseResources()).toBe(first);
    await first;

    expect(eventStore.live).toBe(0);
    expect(pluginDispose).toHaveBeenCalledTimes(1);
    expect(repo.deleteCalls).toBe(0);
    expect(repo.tables.size).toBe(1);
    expect(grid.controller.isReleased()).toBe(true);

    const noop = vi.fn();
    grid.controller.subscribeChangelog(noop)();
    grid.controller.subscribePendingChanges(noop);
    expect(noop).not.toHaveBeenCalled();
    expect(eventStore.live).toBe(0);
  });

  it('dispose() keeps TABLE_DISPOSED data semantics and then releases resources', async () => {
    const { createGrid } = await import('../index');
    const eventStore = new CountingStore();
    const repo = new MemoryTableRepository();
    const grid = await createGrid(baseConfig(repo, { eventStore }) as never).ready;

    await grid.controller.dispose();

    expect(repo.deleteCalls).toBe(1);
    expect(eventStore.live).toBe(0);
    await expect(grid.controller.dispose()).resolves.toBeUndefined();
    expect(repo.deleteCalls).toBe(1);
  });

  it('dispose() after releaseResources() still applies TABLE_DISPOSED', async () => {
    const { createGrid } = await import('../index');
    const repo = new MemoryTableRepository();
    const grid = await createGrid(
      baseConfig(repo, { eventStore: new CountingStore() }) as never,
    ).ready;
    await grid.controller.releaseResources();
    expect(repo.deleteCalls).toBe(0);
    await grid.controller.dispose();
    expect(repo.deleteCalls).toBe(1);
  });

  it('closes an event store the grid opened, never a host-injected one', async () => {
    const { createGrid } = await import('../index');
    const opened = IndexedDbEventStore.inMemory();
    const closeOpened = vi.spyOn(opened, 'close');
    vi.spyOn(IndexedDbEventStore, 'open').mockResolvedValue(opened);
    vi.stubGlobal('indexedDB', {});

    const ownedRepo = new MemoryTableRepository();
    const owned = await createGrid(baseConfig(ownedRepo, {}) as never).ready;
    expect(owned.eventStore).toBe(opened);
    await owned.controller.releaseResources();
    expect(closeOpened).toHaveBeenCalledTimes(1);

    const injected = IndexedDbEventStore.inMemory();
    const closeInjected = vi.spyOn(injected, 'close');
    const hostGrid = await createGrid(
      baseConfig(new MemoryTableRepository(), { eventStore: injected }) as never,
    ).ready;
    await hostGrid.controller.releaseResources();
    expect(closeInjected).not.toHaveBeenCalled();
  });

  it('a failed assembly releases what it already created', async () => {
    const { createGrid } = await import('../index');
    const opened = IndexedDbEventStore.inMemory();
    const closeOpened = vi.spyOn(opened, 'close');
    vi.spyOn(IndexedDbEventStore, 'open').mockResolvedValue(opened);
    vi.stubGlobal('indexedDB', {});
    const goodDispose = vi.fn();

    const ready = createGrid(
      baseConfig(new MemoryTableRepository(), {
        plugins: [
          { name: 'good', register: () => undefined, dispose: goodDispose },
          {
            name: 'bad',
            register: () => {
              throw new Error('boom');
            },
          },
        ],
      }) as never,
    ).ready;

    await expect(ready).rejects.toThrow('boom');
    expect(closeOpened).toHaveBeenCalledTimes(1);
    expect(goodDispose).toHaveBeenCalledTimes(1);
  });
});
