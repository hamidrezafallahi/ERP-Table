import { describe, expect, it, vi } from 'vitest';

import {
  OfflineStatus,
  type ConnectivitySource,
} from '../offline/OfflineStatus';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

function makeConnectivity(initial = true): ConnectivitySource & {
  setOnline: (v: boolean) => void;
} {
  let online = initial;
  const listeners = new Set<(v: boolean) => void>();
  return {
    getOnline: () => online,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setOnline(v) {
      online = v;
      for (const listener of listeners) listener(v);
    },
  };
}

function cellEvent(
  tableId: string,
  eventId: string,
  value: string,
): GridEvent {
  return {
    eventId,
    type: 'CELL_CHANGED',
    tableId,
    streamId: `table:${tableId}`,
    version: 1,
    occurredAt: Date.now(),
    actorId: 'u1',
    payload: {
      rowId: 1,
      columnId: 'name',
      newValue: value,
      previousValue: 'old',
    },
  };
}

describe('PR-137 OfflineStatus', () => {
  it('tracks connectivity and pending data mutations', async () => {
    const connectivity = makeConnectivity(true);
    const store = new InMemoryEventStore();
    const status = new OfflineStatus({
      tableId: 't1',
      connectivity,
    });
    await status.start(store);

    expect(status.getConnectivity()).toBe('online');
    expect(status.getPendingCount()).toBe(0);

    const onConn = vi.fn();
    status.subscribeConnectivity(onConn);
    connectivity.setOnline(false);
    expect(status.getConnectivity()).toBe('offline');
    expect(onConn).toHaveBeenCalledWith('offline');

    await store.append('table:t1', [cellEvent('t1', 'e1', 'a')], -1);
    await store.append('table:t1', [cellEvent('t1', 'e2', 'b')], 1);
    // PAGE_CHANGED should not count
    await store.append(
      'table:t1',
      [
        {
          eventId: 'e3',
          type: 'PAGE_CHANGED',
          tableId: 't1',
          streamId: 'table:t1',
          version: 3,
          occurredAt: Date.now(),
          actorId: 'u1',
          payload: { page: 2 },
        },
      ],
      2,
    );

    expect(status.getPendingCount()).toBe(2);
    expect(status.getPendingChanges().map((p) => p.eventId)).toEqual([
      'e1',
      'e2',
    ]);

    status.markSynced(['e1']);
    expect(status.getPendingCount()).toBe(1);
    status.markSynced();
    expect(status.getPendingCount()).toBe(0);
  });

  it('hydrates pending from EventStore history and respects watermark', async () => {
    const store = new InMemoryEventStore();
    await store.append('table:t1', [cellEvent('t1', 'e1', 'a')], -1);

    const watermarkIds = ['e1'];
    const status = new OfflineStatus({
      tableId: 't1',
      connectivity: makeConnectivity(),
      watermark: {
        load: () => watermarkIds,
        save: (ids) => {
          watermarkIds.length = 0;
          watermarkIds.push(...ids);
        },
      },
    });
    await status.start(store);
    expect(status.getPendingCount()).toBe(0);

    await store.append('table:t1', [cellEvent('t1', 'e2', 'b')], 1);
    expect(status.getPendingCount()).toBe(1);
    status.markSynced();
    expect(watermarkIds).toContain('e1');
    expect(watermarkIds).toContain('e2');
  });
});
