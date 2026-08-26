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

/**
 * PR-20 — ERP-like voucher lines harness:
 * seed row → edit cells → add line → history → undo stack → session view intent
 */
describe('ERP voucher harness', () => {
  it('runs an edit / history / undo / session flow for voucher lines', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = { request: async () => null } as any;

    const result = await createERPTable({
      store: 'voucher-store',
      tableKey: 'voucher-lines',
      actor: { userId: 'accountant', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'item',
          fieldCaption: 'Item',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
          className: 'item-col',
        },
        {
          fieldName: 'qty',
          fieldCaption: 'Qty',
          fieldType: 'number',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { item: 'SKU-1', qty: 1 },
        },
      ],
    });

    expect(result.session).toBeTruthy();
    expect(result.columnDefinitions).toHaveLength(2);
    expect(result.columnDefinitions[0].fieldName).toBe('item');
    expect(result.columnBindings[0].className).toBe('item-col');
    expect(result.columnDefinitions[0]).not.toHaveProperty('className');

    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'voucher-store',
      tableKey: 'voucher-lines',
      rowId: 1,
      columnId: 'qty',
      newValue: 5,
    });

    expect(result.table.getRow(1)?.getCell('qty')?.getValue()).toBe(5);
    expect(result.session.getHistoryItems({ type: 'CELL_CHANGED' }).length).toBeGreaterThan(0);
    expect(result.session.canUndo()).toBe(true);

    const beforeRows = result.table.getRows().length;
    await result.session.dispatchViewIntent({
      type: 'ADD_EMPTY_ROW',
      autoActivate: false,
    });
    expect(result.table.getRows().length).toBe(beforeRows + 1);

    const selected: unknown[] = [];
    const unsub = result.session.subscribeSelected(
      () => result.session.getSnapShot('active')?.rows.length ?? 0,
      (n) => selected.push(n),
    );

    await result.session.undo();
    // undo of ADD_EMPTY_ROW removes the added row
    expect(result.table.getRows().length).toBe(beforeRows);
    unsub();

    await result.session.undo();
    expect(result.table.getRow(1)?.getCell('qty')?.getValue()).toBe(1);
  });
});
