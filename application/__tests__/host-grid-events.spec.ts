import { describe, expect, it, vi } from 'vitest';
import type { GridEvent } from '../../domain/types/GridEvent';
import {
  CATALOG_TO_HOST_CALLBACKS,
  dispatchCatalogHostEvent,
  ROW_DATA_UPDATED_CATALOG_TYPES,
  subscribeCatalogHostEvents,
} from '../events/hostGridEvents';
import { getEventCatalogEntry } from '../events/eventCatalog';

function cellChanged(overrides: Partial<GridEvent> = {}): GridEvent {
  return {
    eventId: 'e1',
    type: 'CELL_CHANGED',
    tableId: 't1',
    streamId: 'table:t1',
    version: 1,
    occurredAt: 1,
    actorId: 'u1',
    payload: {
      type: 'CELL_CHANGED',
      tableId: 't1',
      rowId: 1,
      columnId: 'name',
      newValue: 'beta',
      previousValue: 'alpha',
    },
    ...overrides,
  };
}

describe('PR-85 catalog → host React events', () => {
  it('maps CELL_CHANGED to one cell payload {oldValue, newValue, colId, rowId, data}', () => {
    const host = { name: 'alpha' };
    const onCellValueChanged = vi.fn();
    const onRowValueChanged = vi.fn();
    const onRowDataUpdated = vi.fn();

    const n = dispatchCatalogHostEvent(
      cellChanged(),
      {
        tableId: 't1',
        getRowData: (rowId) => (rowId === 1 ? host : undefined),
        getAllRowData: () => [host],
      },
      { onCellValueChanged, onRowValueChanged, onRowDataUpdated },
    );

    expect(n).toBe(2);
    expect(onCellValueChanged).toHaveBeenCalledTimes(1);
    expect(onCellValueChanged).toHaveBeenCalledWith({
      oldValue: 'alpha',
      newValue: 'beta',
      colId: 'name',
      rowId: 1,
      data: host,
    });
    expect(onRowValueChanged).toHaveBeenCalledTimes(1);
    expect(onRowValueChanged).toHaveBeenCalledWith({
      rowId: 1,
      data: host,
    });
    expect(onRowDataUpdated).not.toHaveBeenCalled();
  });

  it('ignores CELL_CHANGED for another tableId', () => {
    const onCellValueChanged = vi.fn();
    dispatchCatalogHostEvent(
      cellChanged({ tableId: 'other' }),
      {
        tableId: 't1',
        getRowData: () => undefined,
        getAllRowData: () => [],
      },
      { onCellValueChanged },
    );
    expect(onCellValueChanged).not.toHaveBeenCalled();
  });

  it('maps ROW_ADDED to onRowDataUpdated', () => {
    const onRowDataUpdated = vi.fn();
    const onCellValueChanged = vi.fn();
    dispatchCatalogHostEvent(
      {
        eventId: 'e2',
        type: 'ROW_ADDED',
        tableId: 't1',
        streamId: 'table:t1',
        version: 2,
        occurredAt: 2,
        actorId: 'u1',
        payload: { rowId: 2 },
      },
      {
        tableId: 't1',
        getRowData: () => undefined,
        getAllRowData: () => [{ name: 'a' }, { name: 'b' }],
      },
      { onCellValueChanged, onRowDataUpdated },
    );
    expect(onCellValueChanged).not.toHaveBeenCalled();
    expect(onRowDataUpdated).toHaveBeenCalledWith({
      rowData: [{ name: 'a' }, { name: 'b' }],
      source: 'ROW_ADDED',
    });
  });

  it('CELL_CHANGED is in EVENT_CATALOG and maps to the React callbacks', () => {
    expect(getEventCatalogEntry('CELL_CHANGED')?.type).toBe('CELL_CHANGED');
    expect(CATALOG_TO_HOST_CALLBACKS.CELL_CHANGED).toEqual([
      'onCellValueChanged',
      'onRowValueChanged',
    ]);
    for (const type of ROW_DATA_UPDATED_CATALOG_TYPES) {
      expect(getEventCatalogEntry(type), type).toBeTruthy();
      expect(CATALOG_TO_HOST_CALLBACKS[type]).toEqual(['onRowDataUpdated']);
    }
  });

  it('subscribeCatalogHostEvents forwards live appends', async () => {
    const { InMemoryEventStore } = await import(
      '../../infrastructure/eventStore/InMemoryEventStore'
    );
    const store = new InMemoryEventStore();
    const onCellValueChanged = vi.fn();
    const unsub = subscribeCatalogHostEvents(
      store,
      {
        tableId: 't1',
        getRowData: () => ({ name: 'alpha' }),
        getAllRowData: () => [{ name: 'alpha' }],
      },
      { onCellValueChanged },
    );
    await store.append('table:t1', [cellChanged()], -1);
    expect(onCellValueChanged).toHaveBeenCalledTimes(1);
    unsub();
    await store.append('table:t1', [cellChanged({ eventId: 'e3' })], -1);
    expect(onCellValueChanged).toHaveBeenCalledTimes(1);
  });
});
