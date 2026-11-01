/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { cleanup, renderHook, waitFor } from '@testing-library/react';

import type { AuditLogger } from '../../../application/ports/AuditLogger';
import type { Unsubscribe } from '../../../application/ports/EventStore';
import type { TableRepository } from '../../../application/ports/TableRepository';
import type { Table } from '../../../domain/entities/Table';
import type { GridEvent } from '../../../domain/types/GridEvent';
import { InMemoryEventStore } from '../../../infrastructure/eventStore/InMemoryEventStore';
import { ChangelogProjection } from '../../../infrastructure/projections/ChangelogProjection';
import { useGrid } from '../../useERPTable';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

class CountingStore extends InMemoryEventStore {
  live = 0;
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

class MemoryTableRepository implements TableRepository {
  tables = new Map<string, Table>();
  deleteCalls = 0;
  async getById(store: string, tableKey: string) {
    const table = this.tables.get(`${store}:${tableKey}`);
    if (!table) throw new Error('missing');
    return table;
  }
  async save(store: string, table: Table) {
    this.tables.set(`${store}:${table.id}`, table);
  }
  async delete(store: string, tableKey: string) {
    this.deleteCalls += 1;
    this.tables.delete(`${store}:${tableKey}`);
  }
  async resetTable(store: string, tableKey: string) {
    this.tables.delete(`${store}:${tableKey}`);
  }
  async exists(store: string, tableKey: string) {
    return this.tables.has(`${store}:${tableKey}`);
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
    fieldType: 'text',
    fieldCollection: 'default',
    visibility: { kind: 'always' },
  },
];

function makeConfig(
  repo: MemoryTableRepository,
  eventStore: CountingStore,
  tableKey: string,
) {
  return {
    store: 'store-hook',
    tableKey,
    actor: { userId: 'u1', roles: ['admin'] },
    tableType: 'default',
    activeCollection: 'default',
    repo,
    audit: new SilentAuditLogger(),
    remoteApi: { request: async () => null },
    eventStore,
    columns,
    rows: [{ id: 1, collection: 'default', values: { name: 'alpha' } }],
  } as never;
}

describe('useGrid teardown (default event-sourced mode)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('builds exactly one grid under StrictMode and releases it on unmount without touching data', async () => {
    const start = vi.spyOn(ChangelogProjection.prototype, 'start');
    const eventStore = new CountingStore();
    const repo = new MemoryTableRepository();

    const { result, unmount } = renderHook(
      () => useGrid(makeConfig(repo, eventStore, 't-strict')),
      { wrapper: StrictMode },
    );
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(start).toHaveBeenCalledTimes(1);
    expect(eventStore.live).toBeGreaterThan(0);

    unmount();
    await waitFor(() => expect(eventStore.live).toBe(0));
    expect(repo.deleteCalls).toBe(0);
    expect(repo.tables.size).toBe(1);
  });

  it('switching tableKey releases the previous grid before the next one is live', async () => {
    const eventStore = new CountingStore();
    const repo = new MemoryTableRepository();

    const { result, rerender, unmount } = renderHook(
      ({ tableKey }: { tableKey: string }) =>
        useGrid(makeConfig(repo, eventStore, tableKey)),
      { initialProps: { tableKey: 't-a' } },
    );
    await waitFor(() => expect(result.current.ready).toBe(true));
    const liveForOneGrid = eventStore.live;
    expect(liveForOneGrid).toBeGreaterThan(0);

    rerender({ tableKey: 't-b' });
    await waitFor(() => {
      expect(result.current.ready).toBe(true);
      expect(result.current.ready && result.current.tableKey).toBe('t-b');
    });
    expect(eventStore.live).toBe(liveForOneGrid);
    expect(repo.deleteCalls).toBe(0);

    unmount();
    await waitFor(() => expect(eventStore.live).toBe(0));
  });

  it('does not leave a grid behind when unmounted before it finished building', async () => {
    const eventStore = new CountingStore();
    const repo = new MemoryTableRepository();
    const { unmount } = renderHook(() =>
      useGrid(makeConfig(repo, eventStore, 't-fast')),
    );
    unmount();
    await new Promise((r) => setTimeout(r, 50));
    expect(eventStore.live).toBe(0);
    expect(repo.deleteCalls).toBe(0);
  });
});
