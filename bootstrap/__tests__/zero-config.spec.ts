import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';
import { IndexedDbEventStore } from '../../infrastructure/eventStore/IndexedDbEventStore';
import { DEFAULT_GRID_ACTOR, DEFAULT_MEMORY_STORE } from '../defaults';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

describe('PR-83 zero-config createERPTable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('runs with no store / tableKey / actor and does not touch indexedDB', async () => {
    const open = vi.fn(() => {
      throw new Error('indexedDB.open must not run without store');
    });
    vi.stubGlobal('indexedDB', { open });
    const idbOpen = vi.spyOn(IndexedDbEventStore, 'open');

    const { createERPTable } = await import('../index');
    const result = await createERPTable({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
      ],
      rowData: [{ name: 'alpha' }],
    });

    expect(open).not.toHaveBeenCalled();
    expect(idbOpen).not.toHaveBeenCalled();
    expect(result.eventStore).toBeInstanceOf(InMemoryEventStore);
    expect(result.store).toBe(DEFAULT_MEMORY_STORE);
    expect(result.tableKey.startsWith('pdg-')).toBe(true);
    expect(result.table.getRows()).toHaveLength(1);
    expect(result.table.getRows()[0]?.getCell('name')?.getValue()).toBe('alpha');
  });

  it('createERPTable() with an empty config still boots an in-memory grid', async () => {
    const open = vi.fn(() => {
      throw new Error('indexedDB.open must not run without store');
    });
    vi.stubGlobal('indexedDB', { open });

    const { createERPTable } = await import('../index');
    const result = await createERPTable({});
    expect(open).not.toHaveBeenCalled();
    expect(result.store).toBe(DEFAULT_MEMORY_STORE);
    expect(result.eventStore).toBeInstanceOf(InMemoryEventStore);
  });

  it('default actor can edit cells (all access)', async () => {
    const { createERPTable } = await import('../index');
    const result = await createERPTable({
      columnDefs: [{ field: 'name', headerName: 'Name', type: 'text' }],
      rowData: [{ name: 'alpha' }],
      getRowId: (_row, index) => String(index + 1),
    });
    const rowId = result.table.getRows()[0]?.id.value;
    expect(rowId).toBeDefined();
    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: result.store,
      tableKey: result.tableKey,
      rowId: rowId!,
      columnId: 'name',
      newValue: 'beta',
    });
    expect(result.table.getRow(rowId!)?.getCell('name')?.getValue()).toBe('beta');
  });

  it('generated tableKeys differ across createERPTable calls', async () => {
    const { createERPTable } = await import('../index');
    const a = await createERPTable({ rowData: [], columnDefs: [{ field: 'n' }] });
    const b = await createERPTable({ rowData: [], columnDefs: [{ field: 'n' }] });
    expect(a.tableKey).not.toBe(b.tableKey);
  });

  it('does not change the durable path when store is passed', async () => {
    const eventStore = IndexedDbEventStore.inMemory();
    const open = vi
      .spyOn(IndexedDbEventStore, 'open')
      .mockResolvedValue(eventStore);
    vi.stubGlobal('indexedDB', { open: vi.fn() });
    const { createERPTable } = await import('../index');

    const result = await createERPTable({
      store: 'erp',
      tableKey: 'voucher-1',
      actor: { userId: 'u1', roles: ['admin'] },
      repo: {
        async getById() {
          throw new Error('missing');
        },
        async save() {},
        async delete() {},
        async resetTable() {},
        async exists() {
          return false;
        },
      },
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'alpha' } }],
    });

    expect(open).toHaveBeenCalledWith('persian-data-grid-events:erp');
    expect(result.store).toBe('erp');
    expect(result.tableKey).toBe('voucher-1');
    expect(result.eventStore).toBe(eventStore);
  });
});

describe('PR-83 ERPTable renders with no extra props', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('SSR-renders <ERPTable /> without touching indexedDB', async () => {
    const open = vi.fn(() => {
      throw new Error('indexedDB.open must not run without store');
    });
    vi.stubGlobal('indexedDB', { open });
    const { ERPTable } = await import('../../ui');
    const html = renderToStaticMarkup(React.createElement(ERPTable));
    expect(open).not.toHaveBeenCalled();
    expect(typeof html).toBe('string');
  });

  it('SSR-renders <DataGrid /> and ERPTable is the same component', async () => {
    const open = vi.fn(() => {
      throw new Error('indexedDB.open must not run without store');
    });
    vi.stubGlobal('indexedDB', { open });
    const { DataGrid, ERPTable } = await import('../../ui');
    expect(DataGrid).toBe(ERPTable);
    const html = renderToStaticMarkup(React.createElement(DataGrid));
    expect(open).not.toHaveBeenCalled();
    expect(typeof html).toBe('string');
  });
});

describe('PR-83 defaults', () => {
  it('DEFAULT_GRID_ACTOR is anonymous admin', () => {
    expect(DEFAULT_GRID_ACTOR).toEqual({
      userId: 'anonymous',
      roles: ['admin'],
    });
  });
});
