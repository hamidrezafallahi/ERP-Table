import { describe, expect, it, beforeEach } from 'vitest';
import { InMemoryEventStore } from '../eventStore/InMemoryEventStore';
import { ChangelogProjection } from '../projections/ChangelogProjection';
import type { GridEvent } from '../../domain/types/GridEvent';

function evt(overrides: Partial<GridEvent> = {}): GridEvent {
  return {
    eventId: `e-${Math.random().toString(36).slice(2, 6)}`,
    type: 'CELL_CHANGED',
    tableId: 't1',
    streamId: 'table:t1',
    version: 0,
    occurredAt: Date.now(),
    actorId: 'user-1',
    payload: { rowId: 1, columnId: 'name', newValue: 'b', previousValue: 'a' },
    ...overrides,
  };
}

describe('ChangelogProjection', () => {
  let store: InMemoryEventStore;
  let projection: ChangelogProjection;

  beforeEach(() => {
    store = new InMemoryEventStore();
    projection = new ChangelogProjection(store);
    projection.start();
  });

  it('captures events appended after start', async () => {
    await store.append('table:t1', [evt()], -1);
    expect(projection.count()).toBe(1);
  });

  it('filters by tableId', async () => {
    await store.append('table:t1', [evt({ tableId: 't1' })], -1);
    await store.append('table:t2', [evt({ tableId: 't2' })], -1);

    expect(projection.query({ tableId: 't1' })).toHaveLength(1);
    expect(projection.query({ tableId: 't2' })).toHaveLength(1);
    expect(projection.count()).toBe(2);
  });

  it('filters by event type', async () => {
    await store.append('table:t1', [
      evt({ type: 'CELL_CHANGED' }),
      evt({ type: 'PAGE_CHANGED', payload: { page: 2 } }),
    ], -1);

    expect(projection.query({ type: 'CELL_CHANGED' })).toHaveLength(1);
    expect(projection.query({ type: 'PAGE_CHANGED' })).toHaveLength(1);
  });

  it('filters by rowId', async () => {
    await store.append('table:t1', [
      evt({ payload: { rowId: 1, columnId: 'name', newValue: 'x' } }),
      evt({ payload: { rowId: 2, columnId: 'name', newValue: 'y' } }),
    ], -1);

    expect(projection.query({ rowId: 1 })).toHaveLength(1);
  });

  it('filters by columnId', async () => {
    await store.append('table:t1', [
      evt({ payload: { rowId: 1, columnId: 'name', newValue: 'x' } }),
      evt({ payload: { rowId: 1, columnId: 'price', newValue: 100 } }),
    ], -1);

    expect(projection.query({ columnId: 'price' })).toHaveLength(1);
  });

  it('applies limit (returns last N)', async () => {
    await store.append('table:t1', [evt(), evt(), evt()], -1);
    expect(projection.query({ limit: 2 })).toHaveLength(2);
  });

  it('stops receiving events after stop()', async () => {
    await store.append('table:t1', [evt()], -1);
    projection.stop();
    await store.append('table:t1', [evt()], -1);
    expect(projection.count()).toBe(1);
  });

  it('subscribes listeners and emits filtered results immediately and on changes', async () => {
    const received: number[] = [];
    const unsubscribe = projection.subscribe(
      (entries) => received.push(entries.length),
      { type: 'PAGE_CHANGED' },
    );

    await store.append('table:t1', [evt({ type: 'CELL_CHANGED' })], -1);
    await store.append('table:t1', [evt({ type: 'PAGE_CHANGED', payload: { page: 2 } })], -1);

    unsubscribe();

    expect(received).toEqual([0, 0, 1]);
  });

  it('clears all entries', async () => {
    await store.append('table:t1', [evt()], -1);
    projection.clear();
    expect(projection.count()).toBe(0);
  });

  it('combines multiple filters', async () => {
    await store.append('table:t1', [
      evt({ type: 'CELL_CHANGED', payload: { rowId: 1, columnId: 'name', newValue: 'a' } }),
      evt({ type: 'CELL_CHANGED', payload: { rowId: 2, columnId: 'name', newValue: 'b' } }),
      evt({ type: 'PAGE_CHANGED', payload: { page: 3 } }),
    ], -1);

    const result = projection.query({ type: 'CELL_CHANGED', rowId: 1 });
    expect(result).toHaveLength(1);
    expect((result[0].payload as any).newValue).toBe('a');
  });
});
