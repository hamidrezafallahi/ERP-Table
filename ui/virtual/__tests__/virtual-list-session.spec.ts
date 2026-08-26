import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../../application/ports/TableRepository';
import type { Table } from '../../../domain/entities/Table';
import type { AuditLogger } from '../../../application/ports/AuditLogger';
import { buildVirtualWindow } from '../virtualWindow';

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

describe('VirtualList session wiring', () => {
  it('CHANGE_VIEWPORT drives buildVirtualWindow for adapter rendering', async () => {
    const { createERPTable } = await import('../../../bootstrap');
    const items = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }));

    const result = await createERPTable({
      store: 'store-vl',
      tableKey: 'table-vl',
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
      rows: items.map((r) => ({
        id: r.id,
        collection: 'default',
        values: { name: `n${r.id}` },
      })),
    });

    await result.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 800,
      viewportSize: 240,
      rowHeight: 40,
      overscan: 1,
    });

    const model = buildVirtualWindow(items, result.session.getViewport());
    expect(model.range.startIndex).toBeGreaterThan(0);
    expect(model.visibleItems.length).toBe(model.range.visibleCount);
    expect(model.visibleItems[0].id).toBe(items[model.range.startIndex].id);
    expect(model.visibleItems.length).toBeLessThan(items.length);
  });
});
