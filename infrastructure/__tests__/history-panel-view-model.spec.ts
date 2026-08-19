import { describe, expect, it, beforeEach } from 'vitest';

import { InMemoryEventStore } from '../eventStore/InMemoryEventStore';
import {
  classifyHistoryEvent,
  HistoryPanelViewModel,
} from '../history/HistoryPanelViewModel';
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
    payload: { type: 'CELL_CHANGED', tableId: 't1', rowId: 1, columnId: 'name', newValue: 'beta' },
    ...overrides,
  };
}

describe('HistoryPanelViewModel', () => {
  let store: InMemoryEventStore;
  let projection: ChangelogProjection;
  let viewModel: HistoryPanelViewModel;

  beforeEach(() => {
    store = new InMemoryEventStore();
    projection = new ChangelogProjection(store);
    projection.start();
    viewModel = new HistoryPanelViewModel(projection);
  });

  it('maps cell changes to display-friendly history items', async () => {
    await store.append('table:t1', [evt()], -1);

    const items = viewModel.query({ tableId: 't1' });
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Cell changed');
    expect(items[0].description).toContain('Row 1');
    expect(items[0].description).toContain('column "name"');
    expect(items[0].category).toBe('data');
    expect(items[0].severity).toBe('info');
  });

  it('maps page changes to readable descriptions', async () => {
    await store.append('table:t1', [
      evt({
        type: 'PAGE_CHANGED',
        payload: { type: 'PAGE_CHANGED', tableId: 't1', page: 3 },
      }),
    ], -1);

    const items = viewModel.query({ type: 'PAGE_CHANGED' });
    expect(items[0].title).toBe('Page changed');
    expect(items[0].description).toContain('3');
    expect(items[0].category).toBe('view');
    expect(items[0].severity).toBe('info');
  });

  it('classifies destructive and error events for UI tokens', () => {
    expect(classifyHistoryEvent('ROW_DELETED')).toEqual({
      category: 'data',
      severity: 'warning',
    });
    expect(classifyHistoryEvent('TABLE_DELETED')).toEqual({
      category: 'system',
      severity: 'warning',
    });
    expect(classifyHistoryEvent('VALIDATION_FAILED')).toEqual({
      category: 'data',
      severity: 'error',
    });
    expect(classifyHistoryEvent('UNKNOWN_EVENT')).toEqual({
      category: 'system',
      severity: 'info',
    });
  });

  it('filters to data changes only', async () => {
    await store.append('table:t1', [
      evt(),
      evt({
        type: 'PAGE_CHANGED',
        payload: { type: 'PAGE_CHANGED', tableId: 't1', page: 2 },
      }),
      evt({
        type: 'ROW_DELETED',
        payload: { type: 'ROW_DELETED', tableId: 't1', rowId: '2' },
      }),
    ], -1);

    const items = viewModel.query({ tableId: 't1', category: 'data' });
    expect(items.map((item) => item.type)).toEqual(['CELL_CHANGED', 'ROW_DELETED']);
    expect(viewModel.count({ tableId: 't1', category: 'data' })).toBe(2);
  });

  it('filters to errors only', async () => {
    await store.append('table:t1', [
      evt(),
      evt({
        type: 'VALIDATION_FAILED',
        payload: { type: 'VALIDATION_FAILED', tableId: 't1', reason: 'duplicate' },
      }),
      evt({
        type: 'PAGE_CHANGED',
        payload: { type: 'PAGE_CHANGED', tableId: 't1', page: 4 },
      }),
    ], -1);

    const items = viewModel.query({ tableId: 't1', severity: 'error' });
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('VALIDATION_FAILED');
    expect(items[0].title).toBe('Validation failed');
  });

  it('applies limit after category and severity filters', async () => {
    await store.append('table:t1', [
      evt({ eventId: 'data-1' }),
      evt({
        eventId: 'view-1',
        type: 'PAGE_CHANGED',
        payload: { type: 'PAGE_CHANGED', tableId: 't1', page: 1 },
      }),
      evt({ eventId: 'data-2' }),
      evt({ eventId: 'data-3' }),
    ], -1);

    const items = viewModel.query({ tableId: 't1', category: 'data', limit: 2 });
    expect(items.map((item) => item.id)).toEqual(['data-2', 'data-3']);
  });

  it('subscribes to formatted history items', async () => {
    const snapshots: number[] = [];
    const unsubscribe = viewModel.subscribe(
      (items) => snapshots.push(items.length),
      { tableId: 't1' },
    );

    await store.append('table:t1', [evt()], -1);
    unsubscribe();

    expect(snapshots).toEqual([0, 1]);
  });

  it('subscribes with category filters', async () => {
    const types: string[][] = [];
    const unsubscribe = viewModel.subscribe(
      (items) => types.push(items.map((item) => item.type)),
      { tableId: 't1', category: 'data' },
    );

    await store.append('table:t1', [
      evt(),
      evt({
        type: 'PAGE_CHANGED',
        payload: { type: 'PAGE_CHANGED', tableId: 't1', page: 2 },
      }),
    ], -1);
    unsubscribe();

    expect(types).toEqual([[], ['CELL_CHANGED']]);
  });
});
