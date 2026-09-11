import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import { isApplicationTableCommand } from '../../application/commands';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

class MemoryTableRepository implements TableRepository {
  private tables = new Map<string, Table>();
  private key(store: string, tableKey: string) {
    return `${store}:${tableKey}`;
  }
  async getById(store: string, tableKey: string) {
    const table = this.tables.get(this.key(store, tableKey));
    if (!table) throw new Error('missing');
    return table;
  }
  async save(store: string, table: Table) {
    this.tables.set(this.key(store, table.id), table);
  }
  async delete(store: string, tableKey: string) {
    this.tables.delete(this.key(store, tableKey));
  }
  async resetTable(store: string, tableKey: string) {
    this.tables.delete(this.key(store, tableKey));
  }
  async exists(store: string, tableKey: string) {
    return this.tables.has(this.key(store, tableKey));
  }
}

class SilentAuditLogger implements AuditLogger {
  log(): void {}
  error(): void {}
  warn(): void {}
  info(): void {}
}

describe('PR-60 COLUMN_REORDERED', () => {
  it('is an application command that changes getColumns order', async () => {
    expect(
      isApplicationTableCommand({
        type: 'COLUMN_REORDERED',
        store: 's',
        tableKey: 't',
        sourceIndex: 0,
        destIndex: 1,
      }),
    ).toBe(true);

    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-col-reorder',
      tableKey: 'table-col-reorder',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      eventStore: new InMemoryEventStore(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'alpha',
          fieldCaption: 'Alpha',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
        {
          fieldName: 'beta',
          fieldCaption: 'Beta',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
        {
          fieldName: 'gamma',
          fieldCaption: 'Gamma',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { alpha: 'a', beta: 'b', gamma: 'c' } }],
    });

    expect(
      result.controller.getViewState()?.columns.map((c) => c.fieldName),
    ).toEqual(['alpha', 'beta', 'gamma']);

    await result.engine.dispatch({
      type: 'COLUMN_REORDERED',
      store: 'store-col-reorder',
      tableKey: 'table-col-reorder',
      sourceIndex: 0,
      destIndex: 2,
    });

    expect(
      result.controller.getViewState()?.columns.map((c) => c.fieldName),
    ).toEqual(['beta', 'gamma', 'alpha']);

    const stored = await result.eventStore.read('table:table-col-reorder');
    expect(stored.some((e) => e.type === 'COLUMN_REORDERED')).toBe(true);
  });

  it('UI_COLUMN_REORDERED on the controller reaches the same handler', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-col-ui',
      tableKey: 'table-col-ui',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      eventStore: new InMemoryEventStore(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'left',
          fieldCaption: 'Left',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
        {
          fieldName: 'right',
          fieldCaption: 'Right',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { left: 'L', right: 'R' } }],
    });

    await result.controller.dispatch({
      type: 'COLUMN_REORDERED',
      sourceIndex: 1,
      destIndex: 0,
    });

    expect(
      result.controller.getViewState()?.columns.map((c) => c.fieldName),
    ).toEqual(['right', 'left']);
  });

  it('keeps domain order when host schema refresh resends original order', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const hostColumns = [
      {
        fieldName: 'index',
        fieldCaption: 'Index',
        fieldType: 'index' as const,
        fieldCollection: 'default',
        visibility: { kind: 'always' as const },
        order: 1,
      },
      {
        fieldName: 'price',
        fieldCaption: 'Price',
        fieldType: 'number' as const,
        fieldCollection: 'default',
        visibility: { kind: 'always' as const },
        order: 6,
      },
      {
        fieldName: 'date',
        fieldCaption: 'Date',
        fieldType: 'date' as const,
        fieldCollection: 'default',
        visibility: { kind: 'always' as const },
        order: 10,
      },
    ];
    const result = await createERPTable({
      store: 'store-col-order',
      tableKey: 'table-col-order',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      eventStore: new InMemoryEventStore(),
      remoteApi: { request: async () => null } as any,
      columns: hostColumns,
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { index: 1, price: 10, date: '1404-01-01' },
        },
      ],
    });

    expect(
      result.controller.getViewState()?.columns.map((c) => c.fieldName),
    ).toEqual(['index', 'price', 'date']);

    await result.controller.dispatch({
      type: 'COLUMN_REORDERED',
      sourceIndex: 2,
      destIndex: 1,
    });

    expect(
      result.controller.getViewState()?.columns.map((c) => c.fieldName),
    ).toEqual(['index', 'date', 'price']);

    result.table.setColumns(hostColumns);

    expect(
      result.controller.getViewState()?.columns.map((c) => c.fieldName),
    ).toEqual(['index', 'date', 'price']);
  });
});
