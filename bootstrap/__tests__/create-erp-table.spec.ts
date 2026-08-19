import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

class MemoryTableRepository implements TableRepository {
  private tables = new Map<string, Table>();

  private key(store: string, tableKey: string): string {
    return `${store}:${tableKey}`;
  }

  async getById(store: string, tableKey: string): Promise<Table> {
    const table = this.tables.get(this.key(store, tableKey));
    if (!table) {
      throw new Error(`Table not found: ${store}/${tableKey}`);
    }
    return table;
  }

  async save(store: string, table: Table): Promise<void> {
    this.tables.set(this.key(store, table.id), table);
  }

  async delete(store: string, tableKey: string): Promise<void> {
    this.tables.delete(this.key(store, tableKey));
  }

  async resetTable(store: string, tableKey: string): Promise<void> {
    this.tables.delete(this.key(store, tableKey));
  }

  async exists(store: string, tableKey: string): Promise<boolean> {
    return this.tables.has(this.key(store, tableKey));
  }
}

class SilentAuditLogger implements AuditLogger {
  log(): void {}
  error(): void {}
  warn(): void {}
  info(): void {}
}

describe('createERPTable runtime wiring', () => {
  it('returns a started changelog projection wired to real app events', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-1',
      tableKey: 'table-1',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
      ],
    });

    expect(result.eventStore).toBeDefined();
    expect(result.changelogProjection).toBeDefined();

    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-1',
      tableKey: 'table-1',
      page: 2,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const events = result.changelogProjection.query({
      tableId: 'table-1',
      type: 'PAGE_CHANGED',
    });
    const controllerEvents = result.controller.getChangelog({
      type: 'PAGE_CHANGED',
    });
    const historyItems = result.controller.getHistoryItems({
      type: 'PAGE_CHANGED',
    });

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('PAGE_CHANGED');
    expect((events[0].payload as { page: number }).page).toBe(2);
    expect(controllerEvents).toHaveLength(1);
    expect(result.controller.getChangelogCount({ type: 'PAGE_CHANGED' })).toBe(1);
    expect(historyItems).toHaveLength(1);
    expect(historyItems[0].title).toBe('Page changed');
    expect(historyItems[0].category).toBe('view');
    expect(historyItems[0].severity).toBe('info');
  });

  it('streams changelog updates through controller.subscribeChangelog', async () => {
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const { createERPTable } = await import('../index');
    const result = await createERPTable({
      store: 'store-2',
      tableKey: 'table-2',
      actor: { userId: 'user-2', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
      ],
    });

    const lengths: number[] = [];
    const unsubscribe = result.controller.subscribeChangelog(
      (entries) => lengths.push(entries.length),
      { type: 'PAGE_CHANGED' },
    );
    const historyLengths: number[] = [];
    const unsubscribeHistory = result.controller.subscribeHistoryItems(
      (items) => historyLengths.push(items.length),
      { type: 'PAGE_CHANGED' },
    );

    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-2',
      tableKey: 'table-2',
      page: 3,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();
    unsubscribeHistory();

    expect(lengths).toEqual([0, 1]);
    expect(historyLengths).toEqual([0, 1]);
  });
});
