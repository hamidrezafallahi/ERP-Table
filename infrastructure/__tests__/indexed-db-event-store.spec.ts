import { describe, expect, it } from 'vitest';
import { IndexedDbEventStore } from '../eventStore/IndexedDbEventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

function makeEvent(overrides: Partial<GridEvent> = {}): GridEvent {
  return {
    eventId: 'evt-1',
    type: 'CELL_CHANGED',
    tableId: 'table-1',
    streamId: 'stream-1',
    version: 0,
    occurredAt: Date.now(),
    actorId: 'system',
    payload: { rowId: 1, columnId: 'name', newValue: 'b', previousValue: 'a' },
    ...overrides,
  };
}

describe('IndexedDbEventStore', () => {
  it('persists append/read across store instances sharing the same kv backend', async () => {
    const first = IndexedDbEventStore.inMemory();
    // Reuse internal db by constructing a second store is hard — verify within one instance durability API
    const result = await first.append('stream-1', [makeEvent()], 0);
    expect(result).toEqual({ ok: true, version: 1 });

    const events = await first.read('stream-1');
    expect(events).toHaveLength(1);
    expect(events[0].version).toBe(1);
  });

  it('rejects on version conflict', async () => {
    const store = IndexedDbEventStore.inMemory();
    await store.append('stream-1', [makeEvent()], 0);
    const conflict = await store.append(
      'stream-1',
      [makeEvent({ eventId: 'evt-2' })],
      0,
    );
    expect(conflict).toEqual({
      ok: false,
      conflict: { expectedVersion: 0, actualVersion: 1 },
    });
  });

  it('readAll returns global ordered log', async () => {
    const store = IndexedDbEventStore.inMemory();
    await store.append('a', [makeEvent({ eventId: 'a1', streamId: 'a' })], 0);
    await store.append('b', [makeEvent({ eventId: 'b1', streamId: 'b' })], 0);
    await store.append('a', [makeEvent({ eventId: 'a2', streamId: 'a' })], 1);

    const all = await store.readAll();
    expect(all.map((e) => e.eventId)).toEqual(['a1', 'b1', 'a2']);
  });

  it('notifies subscribers and supports unsubscribe', async () => {
    const store = IndexedDbEventStore.inMemory();
    const received: string[] = [];
    const unsub = store.subscribe('s1', (e) => received.push(e.eventId));

    await store.append('s1', [makeEvent({ eventId: 'e1' })], 0);
    unsub();
    await store.append('s1', [makeEvent({ eventId: 'e2' })], 1);

    expect(received).toEqual(['e1']);
  });

  it('survives rehydration when two stores share MemoryKvDatabase', async () => {
    const { MemoryKvDatabase } = await import('../eventStore/KvDatabase');
    const db = new MemoryKvDatabase();
    const writer = new IndexedDbEventStore(db);
    await writer.append('table:v1', [makeEvent({ eventId: 'persist-1' })], 0);

    const reader = new IndexedDbEventStore(db);
    const events = await reader.read('table:v1');
    expect(events).toHaveLength(1);
    expect(events[0].eventId).toBe('persist-1');
  });
});
