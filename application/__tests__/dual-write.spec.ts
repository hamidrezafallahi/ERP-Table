import { describe, expect, it, vi } from 'vitest';
import { TableAppService } from '../TableAppService';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

function makeMockHandler(returnValue: any) {
  return { execute: vi.fn().mockResolvedValue(returnValue) };
}

function createServiceWithStore() {
  const cellChangedEvent = [{ type: 'CELL_CHANGED', tableId: 't1', rowId: 1, columnId: 'name', newValue: 'b', previousValue: 'a' }];
  const pageChangedEvent = [{ type: 'PAGE_CHANGED', tableId: 't1', page: 2 }];

  const handlers = {
    changeCellValue: makeMockHandler(cellChangedEvent),
    changeCellDisplayValue: makeMockHandler([]),
    saveDescription: makeMockHandler([]),
    addEmptyRow: makeMockHandler(null),
    addNewRows: makeMockHandler(null),
    duplicateRow: makeMockHandler(null),
    deleteRow: makeMockHandler(null),
    reorderRow: makeMockHandler(null),
    setPageSize: makeMockHandler([]),
    setPage: makeMockHandler(pageChangedEvent),
    setActiveCollection: makeMockHandler([]),
    deleteTable: makeMockHandler([]),
    resetTable: makeMockHandler([]),
    applyDynamicProjection: makeMockHandler([]),
  };

  const service = new TableAppService(
    handlers.changeCellValue as any,
    handlers.changeCellDisplayValue as any,
    handlers.saveDescription as any,
    handlers.addEmptyRow as any,
    handlers.addNewRows as any,
    handlers.duplicateRow as any,
    handlers.deleteRow as any,
    handlers.reorderRow as any,
    handlers.setPageSize as any,
    handlers.setPage as any,
    handlers.setActiveCollection as any,
    handlers.deleteTable as any,
    handlers.resetTable as any,
    handlers.applyDynamicProjection as any,
  );

  const store = new InMemoryEventStore();
  service.setEventStore(store);

  return { service, store, handlers };
}

describe('TableAppService dual-write', () => {
  it('writes CELL_CHANGED to EventStore after handler succeeds', async () => {
    const { service, store } = createServiceWithStore();

    await service.execute(
      { type: 'CHANGE_CELL_VALUE', store: 's1', tableKey: 't1', rowId: 1, columnId: 'name', newValue: 'b' } as any,
      {} as any
    );

    const events = await store.read('table:t1');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('CELL_CHANGED');
    expect(events[0].tableId).toBe('t1');
    expect((events[0].payload as { previousValue: unknown; newValue: unknown }).previousValue).toBe('a');
    expect((events[0].payload as { previousValue: unknown; newValue: unknown }).newValue).toBe('b');
    expect(typeof events[0].correlationId).toBe('string');
    expect(events[0].correlationId!.length).toBeGreaterThan(0);
  });

  it('stamps shared correlationId from the command onto all events', async () => {
    const { service, store, handlers } = createServiceWithStore();
    handlers.changeCellValue.execute.mockResolvedValue([
      { type: 'CELL_CHANGED', tableId: 't1', rowId: 1, columnId: 'a', newValue: '1', previousValue: '0' },
      { type: 'CELL_CHANGED', tableId: 't1', rowId: 1, columnId: 'b', newValue: '2', previousValue: '0' },
    ]);

    await service.execute(
      {
        type: 'CHANGE_CELL_VALUE',
        store: 's1',
        tableKey: 't1',
        rowId: 1,
        columnId: 'a',
        newValue: '1',
        correlationId: 'paste-xyz',
      } as any,
      {} as any,
    );

    const events = await store.read('table:t1');
    expect(events).toHaveLength(2);
    expect(events.every((e) => e.correlationId === 'paste-xyz')).toBe(true);
  });

  it('writes PAGE_CHANGED to EventStore', async () => {
    const { service, store } = createServiceWithStore();

    await service.execute(
      { type: 'CHANGE_PAGE', store: 's1', tableKey: 't1', page: 2 } as any,
      {} as any
    );

    const events = await store.read('table:t1');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('PAGE_CHANGED');
  });

  it('does not write to EventStore when handler returns null', async () => {
    const { service, store } = createServiceWithStore();

    await service.execute(
      { type: 'ADD_EMPTY_ROW', store: 's1', tableKey: 't1' } as any,
      {} as any
    );

    const events = await store.read('table:t1');
    expect(events).toHaveLength(0);
  });

  it('works without EventStore (backward compatible)', async () => {
    const handlers = {
      changeCellValue: makeMockHandler([{ type: 'CELL_CHANGED', tableId: 't1' }]),
    };

    const service = new TableAppService(
      handlers.changeCellValue as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
    );

    const result = await service.execute(
      { type: 'CHANGE_CELL_VALUE', store: 's1', tableKey: 't1', rowId: 1, columnId: 'name', newValue: 'x' } as any,
      {} as any
    );

    expect(result).toHaveLength(1);
  });

  it('accumulates multiple events in the same stream', async () => {
    const { service, store } = createServiceWithStore();

    await service.execute(
      { type: 'CHANGE_CELL_VALUE', store: 's1', tableKey: 't1', rowId: 1, columnId: 'name', newValue: 'b' } as any,
      {} as any
    );
    await service.execute(
      { type: 'CHANGE_PAGE', store: 's1', tableKey: 't1', page: 2 } as any,
      {} as any
    );

    const events = await store.read('table:t1');
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('CELL_CHANGED');
    expect(events[1].type).toBe('PAGE_CHANGED');
  });

  it('writes COLUMN_REORDERED when the handler is configured', async () => {
    const store = new InMemoryEventStore();
    const reorderColumn = makeMockHandler([
      { type: 'COLUMN_REORDERED', tableId: 't1', sourceIndex: 0, destIndex: 1 },
    ]);
    const service = new TableAppService(
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler(null) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      makeMockHandler([]) as any,
      undefined,
      undefined,
      reorderColumn as any,
    );
    service.setEventStore(store);

    await service.execute(
      {
        type: 'COLUMN_REORDERED',
        store: 's1',
        tableKey: 't1',
        sourceIndex: 0,
        destIndex: 1,
      } as any,
      {} as any,
    );

    const events = await store.read('table:t1');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('COLUMN_REORDERED');
  });
});
