import { describe, expect, it } from 'vitest';
import { InMemoryEventStore } from '../eventStore/InMemoryEventStore';
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

describe('InMemoryEventStore', () => {
  it('appends and reads events for a stream', async () => {
    const store = new InMemoryEventStore();
    const event = makeEvent();

    const result = await store.append('stream-1', [event], 0);
    expect(result).toEqual({ ok: true, version: 1 });

    const events = await store.read('stream-1');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('CELL_CHANGED');
  });

  it('rejects on version conflict', async () => {
    const store = new InMemoryEventStore();
    await store.append('stream-1', [makeEvent()], 0);

    const result = await store.append('stream-1', [makeEvent({ eventId: 'evt-2' })], 0);
    expect(result).toEqual({ ok: false, conflict: { expectedVersion: 0, actualVersion: 1 } });
  });

  it('reads from a specific version', async () => {
    const store = new InMemoryEventStore();
    await store.append('s1', [makeEvent({ eventId: 'e1' })], 0);
    await store.append('s1', [makeEvent({ eventId: 'e2' })], 1);

    const events = await store.read('s1', 1);
    expect(events).toHaveLength(1);
    expect(events[0].eventId).toBe('e2');
  });

  it('notifies subscribers on append', async () => {
    const store = new InMemoryEventStore();
    const received: GridEvent[] = [];
    store.subscribe('s1', (e) => received.push(e));

    await store.append('s1', [makeEvent()], 0);
    expect(received).toHaveLength(1);
  });

  it('unsubscribe stops notifications', async () => {
    const store = new InMemoryEventStore();
    const received: GridEvent[] = [];
    const unsub = store.subscribe('s1', (e) => received.push(e));

    await store.append('s1', [makeEvent()], 0);
    unsub();
    await store.append('s1', [makeEvent({ eventId: 'e2' })], 1);

    expect(received).toHaveLength(1);
  });

  it('returns empty array for unknown stream', async () => {
    const store = new InMemoryEventStore();
    const events = await store.read('nonexistent');
    expect(events).toEqual([]);
  });
});
