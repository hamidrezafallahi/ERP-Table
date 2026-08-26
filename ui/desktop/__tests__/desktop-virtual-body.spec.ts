import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../../application/ports/TableRepository';
import type { Table } from '../../../domain/entities/Table';
import type { AuditLogger } from '../../../application/ports/AuditLogger';
import { buildVirtualWindow } from '../../virtual/virtualWindow';

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

describe('DesktopTable virtualization path (core)', () => {
  it('defaults virtualization on when session exists; opt-out keeps pagination mode', async () => {
    const { resolveDesktopVirtualization } = await import(
      '../resolveDesktopVirtualization'
    );
    const { createERPTable } = await import('../../../bootstrap');

    const result = await createERPTable({
      store: 'store-dtv-default',
      tableKey: 'table-dtv-default',
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
      rows: [{ id: 1, collection: 'default', values: { name: 'a' } }],
    });

    expect(resolveDesktopVirtualization(undefined, result.session)).toBe(true);
    expect(resolveDesktopVirtualization(true, result.session)).toBe(true);
    expect(resolveDesktopVirtualization(false, result.session)).toBe(false);
    expect(resolveDesktopVirtualization(undefined, null)).toBe(false);
  });

  it('getAllUIRows returns full active collection without page slice', async () => {
    const { createERPTable } = await import('../../../bootstrap');
    const rows = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      collection: 'default',
      values: { name: `n${i + 1}` },
    }));

    const result = await createERPTable({
      store: 'store-dtv',
      tableKey: 'table-dtv',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      recordPerPage: 10,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows,
    });

    const pageRows = result.controller.getViewState()?.rows ?? [];
    const allUi = result.controller.getAllUIRows() ?? [];

    expect(pageRows.length).toBeLessThanOrEqual(10);
    expect(allUi.length).toBe(45);

    await result.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 400,
      viewportSize: 200,
      rowHeight: 40,
      overscan: 1,
    });

    const window = buildVirtualWindow(allUi, result.session.getViewport());
    expect(window.visibleItems.length).toBeLessThan(allUi.length);
    expect(window.visibleItems.length).toBeGreaterThan(0);
    expect(window.spacerTop).toBeGreaterThan(0);
  });
});
