import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../../application/ports/TableRepository';
import type { Table } from '../../../domain/entities/Table';
import type { AuditLogger } from '../../../application/ports/AuditLogger';
import { buildVirtualWindow } from '../../virtual/virtualWindow';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

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

describe('DesktopTable virtualization path (PR-97 / D17)', () => {
  it('defaults virtualization on when session exists; false keeps pagination', async () => {
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
      remoteApi: { request: async () => null },
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

  it('without prop, visible window is much smaller than total row count', async () => {
    const { createERPTable } = await import('../../../bootstrap');
    const rows = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      collection: 'default',
      values: { name: `n${i + 1}` },
    }));

    const result = await createERPTable({
      store: 'store-dtv-window',
      tableKey: 'table-dtv-window',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null },
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

    await result.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 0,
      viewportSize: 400,
      rowHeight: 40,
      overscan: 2,
    });

    const total = result.session.getUiRowCount();
    const visible = result.session.projectVisibleUiRows();
    expect(total).toBe(200);
    expect(visible.length).toBeLessThan(total);
    expect(visible.length).toBeLessThan(30);
    expect(visible.length).toBeGreaterThan(0);
  });

  it('virtualization={false} keeps page-sized view rows (pagination)', async () => {
    const { createERPTable } = await import('../../../bootstrap');
    const { resolveDesktopVirtualization } = await import(
      '../resolveDesktopVirtualization'
    );
    const rows = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      collection: 'default',
      values: { name: `n${i + 1}` },
    }));

    const result = await createERPTable({
      store: 'store-dtv-page',
      tableKey: 'table-dtv-page',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null },
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

    expect(resolveDesktopVirtualization(false, result.session)).toBe(false);
    const pageRows = result.controller.getViewState()?.rows ?? [];
    expect(pageRows.length).toBeLessThanOrEqual(10);
    expect(pageRows.length).toBeGreaterThan(0);
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
      remoteApi: { request: async () => null },
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

    const sparseWindow = result.session.projectVisibleUiRows();
    expect(sparseWindow.length).toBe(window.visibleItems.length);
    expect(sparseWindow.length).toBeLessThan(result.session.getUiRowCount());
  });

  it('DesktopTable wires virtual body + hides pagination when default-on', () => {
    const desktop = load('ui/desktop/DesktopTable.tsx');
    expect(desktop).toContain('ERPTableVirtualBody');
    expect(desktop).toContain('!useVirtual');
    expect(desktop).toContain('ERPTablePagination');
    expect(desktop).toContain('data-erp-virtualization');
  });

  it('virtual spacers keep index pin cells (sticky index + virtual)', () => {
    const virtual = load('ui/desktop/ERPTableVirtualBody.tsx');
    expect(virtual).toContain('data-erp-virtual-spacer');
    expect(virtual).toContain('columnPinCellProps');
    expect(virtual).toContain('data-erp-col-pin');
  });
});
