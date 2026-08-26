import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';

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

describe('GridSession viewport', () => {
  it('updates visible window via CHANGE_VIEWPORT without touching domain rows', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-vp',
      tableKey: 'table-vp',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        collection: 'default',
        values: { name: `r${i + 1}` },
      })),
    });

    const before = result.session.getVisibleRange(50);
    expect(before.startIndex).toBe(0);

    const seen: number[] = [];
    const unsub = result.session.subscribeSelected(
      () => result.session.getVisibleRange(50).startIndex,
      (start) => seen.push(start),
    );

    await result.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 400,
    });

    const after = result.session.getVisibleRange(50);
    expect(after.startIndex).toBeGreaterThan(0);
    expect(result.session.projectVisibleRows(
      Array.from({ length: 50 }, (_, i) => i),
      50,
    ).length).toBe(after.visibleCount);
    expect(seen.length).toBeGreaterThan(0);
    unsub();
  });
});
