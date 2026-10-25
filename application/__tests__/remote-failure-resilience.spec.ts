import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../ports/AuditLogger';

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
    if (!table) throw new Error(`Table not found: ${store}/${tableKey}`);
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

type LoggedEvent = Parameters<AuditLogger['log']>[0];

class RecordingAuditLogger implements AuditLogger {
  readonly events: LoggedEvent[] = [];
  log(event: LoggedEvent): void {
    this.events.push(event);
  }
  error(event: LoggedEvent): void {
    this.events.push(event);
  }
  warn(event: LoggedEvent): void {
    this.events.push(event);
  }
  info(event: LoggedEvent): void {
    this.events.push(event);
  }
}

describe('remote failures never corrupt or block cell edits', () => {
  it('a rejecting resolveOn request still commits the cell value and logs the error', async () => {
    const { createERPTable } = await import('../../bootstrap/index');
    const repo = new MemoryTableRepository();
    const audit = new RecordingAuditLogger();
    const request = vi.fn(async () => {
      throw new Error('RemoteApi request failed: HTTP 502 /api/resolve');
    });

    const result = await createERPTable({
      store: 's',
      tableKey: 't',
      actor: { userId: 'u', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi: { request } as never,
      columns: [
        {
          fieldName: 'qty',
          fieldCaption: 'Qty',
          fieldType: 'number',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
          resolveOn: {
            endpoint: '/api/resolve',
            fieldName: 'qty',
            buildParams: (row) => ({ qty: row.qty }),
            mapFlags: () => ({ showExtra: true }),
          },
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { qty: 1 } }],
    });

    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 's',
      tableKey: 't',
      rowId: 1,
      columnId: 'qty',
      newValue: 5,
    });

    expect(request).toHaveBeenCalledTimes(1);
    expect(result.table.getRow(1)?.getCell('qty')?.getValue()).toBe(5);
    const persisted = await repo.getById('s', 't');
    expect(persisted.getRow(1)?.getCell('qty')?.getValue()).toBe(5);
    expect(
      audit.events.some((e) => e.message.includes('HTTP 502 /api/resolve')),
    ).toBe(true);
  });
});
