import { describe, expect, it } from 'vitest';

import { InMemoryEventStore } from '../eventStore/InMemoryEventStore';
import { InMemorySnapshotStore } from '../snapshot/InMemorySnapshotStore';
import { SnapshotStrategy } from '../snapshot/SnapshotStrategy';
import type { GridEvent } from '../../domain/types/GridEvent';

function evt(id: string): GridEvent {
  return {
    eventId: id,
    type: 'CELL_CHANGED',
    tableId: 't1',
    streamId: 'table:t1',
    version: 0,
    occurredAt: Date.now(),
    actorId: 'system',
    payload: { rowId: 1, columnId: 'a', newValue: id, previousValue: null },
  };
}

describe('SnapshotStrategy', () => {
  it('takes a snapshot every N events and supports catch-up load', async () => {
    const eventStore = new InMemoryEventStore();
    const snapshots = new InMemorySnapshotStore<{ rows: number }>();
    let payloadRows = 0;

    const strategy = new SnapshotStrategy(
      snapshots,
      eventStore,
      async () => ({ rows: payloadRows }),
      { everyNEvents: 3 },
    );

    for (let i = 1; i <= 5; i += 1) {
      payloadRows = i;
      await eventStore.append('table:t1', [evt(`e${i}`)], i - 1);
      await strategy.onAppend('table:t1', 't1', 1);
    }

    const latest = await snapshots.loadLatest('table:t1');
    expect(latest).not.toBeNull();
    expect(latest!.version).toBe(3);
    expect(latest!.payload.rows).toBe(3);

    const { snapshot, eventsAfter } = await strategy.loadWithCatchUp('table:t1');
    expect(snapshot?.version).toBe(3);
    expect(eventsAfter.map((e) => e.eventId)).toEqual(['e4', 'e5']);
  });

  it('returns all events when no snapshot exists', async () => {
    const eventStore = new InMemoryEventStore();
    const snapshots = new InMemorySnapshotStore();
    const strategy = new SnapshotStrategy(snapshots, eventStore, () => ({}), {
      everyNEvents: 100,
    });

    await eventStore.append('table:t1', [evt('only')], 0);
    const { snapshot, eventsAfter } = await strategy.loadWithCatchUp('table:t1');
    expect(snapshot).toBeNull();
    expect(eventsAfter).toHaveLength(1);
  });
});
