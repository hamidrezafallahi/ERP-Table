import { describe, expect, it } from 'vitest';

import {
  OfflineStatus,
  alwaysOnlineConnectivity,
} from '../offline/OfflineStatus';
import { GridSyncService } from '../sync/GridSyncService';
import { resolveConflictChoice } from '../sync/resolveCellConflicts';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';
import { InMemorySyncHub } from '../../infrastructure/sync/InMemorySyncHub';
import type { GridEvent } from '../../domain/types/GridEvent';
import type { SyncConflict } from '../ports/SyncPort';

function cellEvent(
  tableId: string,
  eventId: string,
  value: string,
  opts?: { version?: number; occurredAt?: number; actorId?: string },
): GridEvent {
  return {
    eventId,
    type: 'CELL_CHANGED',
    tableId,
    streamId: `table:${tableId}`,
    version: opts?.version ?? 1,
    occurredAt: opts?.occurredAt ?? 1_000,
    actorId: opts?.actorId ?? 'u1',
    payload: {
      rowId: 1,
      columnId: 'name',
      newValue: value,
      previousValue: 'old',
    },
  };
}

async function makeClient(
  hub: InMemorySyncHub,
  clientId: string,
  tableId: string,
  applied: Map<string, unknown>,
) {
  const store = new InMemoryEventStore();
  const offline = new OfflineStatus({
    tableId,
    connectivity: alwaysOnlineConnectivity,
  });
  await offline.start(store);
  const sync = new GridSyncService({
    tableId,
    eventStore: store,
    offlineStatus: offline,
    transport: hub.transportFor(clientId),
    applyCellValue: async (rowId, columnId, value) => {
      applied.set(`${rowId}:${columnId}`, value);
    },
  });
  return { store, offline, sync, applied };
}

describe('PR-138 resolveConflictChoice', () => {
  const base: SyncConflict = {
    id: 'c1',
    key: { rowId: 1, columnId: 'name' },
    local: {
      eventId: 'l',
      value: 'local',
      occurredAt: 100,
      version: 1,
    },
    remote: {
      eventId: 'r',
      value: 'remote',
      occurredAt: 200,
      version: 1,
    },
  };

  it('serverWins always picks remote', () => {
    expect(resolveConflictChoice(base, 'serverWins')).toBe('remote');
  });

  it('manual stays unresolved', () => {
    expect(resolveConflictChoice(base, 'manual')).toBe('unresolved');
  });

  it('lastWriteWins uses occurredAt then version', () => {
    expect(resolveConflictChoice(base, 'lastWriteWins')).toBe('remote');
    expect(
      resolveConflictChoice(
        {
          ...base,
          local: { ...base.local, version: 3, occurredAt: 50 },
          remote: { ...base.remote, version: 2, occurredAt: 999 },
        },
        'lastWriteWins',
      ),
    ).toBe('local');
  });
});

describe('PR-138 SyncPort two-client policies', () => {
  it('lastWriteWins applies the newer remote when it wins', async () => {
    const hub = new InMemorySyncHub();
    const appliedA = new Map<string, unknown>();
    const appliedB = new Map<string, unknown>();
    const a = await makeClient(hub, 'A', 't1', appliedA);
    const b = await makeClient(hub, 'B', 't1', appliedB);

    await a.store.append(
      'table:t1',
      [cellEvent('t1', 'a1', 'from-A', { occurredAt: 100, version: 1 })],
      -1,
    );
    await b.store.append(
      'table:t1',
      [cellEvent('t1', 'b1', 'from-B', { occurredAt: 200, version: 1 })],
      -1,
    );

    a.sync.setPolicy('lastWriteWins');
    b.sync.setPolicy('lastWriteWins');

    await a.sync.sync();
    const resultB = await b.sync.sync();

    expect(resultB.conflicts).toHaveLength(0);
    // B's local is newer (occurredAt 200) so keep local — no apply of A's value
    expect(appliedB.get('1:name')).toBeUndefined();

    // A pulls B's newer write → remote wins for A
    const resultA2 = await a.sync.sync();
    expect(resultA2.conflicts).toHaveLength(0);
    expect(appliedA.get('1:name')).toBe('from-B');
  });

  it('serverWins applies remote over local', async () => {
    const hub = new InMemorySyncHub();
    const appliedB = new Map<string, unknown>();
    const a = await makeClient(hub, 'A', 't1', new Map());
    const b = await makeClient(hub, 'B', 't1', appliedB);

    await a.store.append(
      'table:t1',
      [cellEvent('t1', 'a1', 'from-A', { occurredAt: 50 })],
      -1,
    );
    await b.store.append(
      'table:t1',
      [cellEvent('t1', 'b1', 'from-B', { occurredAt: 999 })],
      -1,
    );

    a.sync.setPolicy('serverWins');
    b.sync.setPolicy('serverWins');

    await a.sync.sync();
    const resultB = await b.sync.sync();
    expect(resultB.conflicts).toHaveLength(0);
    expect(appliedB.get('1:name')).toBe('from-A');
  });

  it('manual leaves conflicts for resolveConflict', async () => {
    const hub = new InMemorySyncHub();
    const appliedB = new Map<string, unknown>();
    const a = await makeClient(hub, 'A', 't1', new Map());
    const b = await makeClient(hub, 'B', 't1', appliedB);

    await a.store.append(
      'table:t1',
      [cellEvent('t1', 'a1', 'from-A')],
      -1,
    );
    await b.store.append(
      'table:t1',
      [cellEvent('t1', 'b1', 'from-B')],
      -1,
    );

    a.sync.setPolicy('manual');
    b.sync.setPolicy('manual');

    await a.sync.sync();
    const resultB = await b.sync.sync();
    expect(resultB.conflicts.length).toBeGreaterThan(0);
    expect(appliedB.get('1:name')).toBeUndefined();

    const conflict = resultB.conflicts[0]!;
    await b.sync.resolveConflict(conflict.id, 'remote');
    expect(appliedB.get('1:name')).toBe('from-A');
    expect(b.sync.getOpenConflicts()).toHaveLength(0);
  });

  it('push clears offline pending via markSynced', async () => {
    const hub = new InMemorySyncHub();
    const a = await makeClient(hub, 'A', 't1', new Map());
    await a.store.append('table:t1', [cellEvent('t1', 'a1', 'x')], -1);
    expect(a.offline.getPendingCount()).toBe(1);
    await a.sync.sync();
    expect(a.offline.getPendingCount()).toBe(0);
  });
});
