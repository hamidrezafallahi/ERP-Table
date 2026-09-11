import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import { SparseRowIndex } from '../SparseRowIndex';

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

const indexColumn = {
  fieldName: 'index',
  fieldCaption: '#',
  fieldType: 'index' as const,
  fieldCollection: 'default',
  visibility: { kind: 'always' as const },
};

const nameColumn = {
  fieldName: 'name',
  fieldCaption: 'Name',
  fieldType: 'text' as const,
  fieldCollection: 'default',
  visibility: { kind: 'always' as const },
};

describe('PR-49 SparseRowIndex on GridSession / virtual path', () => {
  it('projects a bounded window and updates order on add/delete/reorder', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-sri',
      tableKey: 'table-sri',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [indexColumn, nameColumn],
      rows: [
        { id: 1, collection: 'default', values: { name: 'a' } },
        { id: 2, collection: 'default', values: { name: 'b' } },
        { id: 3, collection: 'default', values: { name: 'c' } },
      ],
    });

    expect(result.session.getUiRowCount()).toBe(3);
    expect(result.engine.getUiRowIndex()).toBeInstanceOf(SparseRowIndex);

    await result.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 0,
      viewportSize: 80,
      rowHeight: 40,
      overscan: 0,
    });

    const window = result.session.projectVisibleUiRows();
    expect(window.length).toBeLessThan(result.session.getUiRowCount());
    expect(window.length).toBeGreaterThan(0);
    expect(window.map((r) => r.id)).toEqual(
      result.engine.getUiRowIndex().getOrderedIds().slice(0, window.length),
    );

    const beforeAdd = result.session.getUiRowCount();
    const idsBeforeAdd = new Set(result.engine.getUiRowIndex().getOrderedIds());
    await result.session.dispatchViewIntent({ type: 'ADD_EMPTY_ROW' });
    expect(result.session.getUiRowCount()).toBe(beforeAdd + 1);
    const addedId = result.engine
      .getUiRowIndex()
      .getOrderedIds()
      .find((id) => !idsBeforeAdd.has(id));
    expect(addedId).toBeDefined();

    const orderedAfterAdd = [...result.engine.getUiRowIndex().getOrderedIds()];
    await result.engine.dispatch({
      type: 'ROW_REORDERED',
      store: 'store-sri',
      tableKey: 'table-sri',
      draggedRowId: orderedAfterAdd[0],
      droppedRowId: orderedAfterAdd[1],
      position: 'after',
    });
    const orderedAfterReorder = result.engine.getUiRowIndex().getOrderedIds();
    expect(orderedAfterReorder[0]).toBe(orderedAfterAdd[1]);
    expect(orderedAfterReorder[1]).toBe(orderedAfterAdd[0]);

    await result.session.dispatchViewIntent({
      type: 'DELETE_ROW',
      rowId: addedId!,
    });
    expect(result.session.getUiRowCount()).toBe(beforeAdd);
    expect(result.engine.getUiRowIndex().getById(addedId!)).toBeUndefined();
  });

  it('GridSession visible range at 100k stays bounded and SparseRowIndex projects it', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-sri-100k',
      tableKey: 'table-sri-100k',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns: [indexColumn, nameColumn],
      rows: [{ id: 1, collection: 'default', values: { name: 'a' } }],
    });

    await result.session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset: 40_000,
      viewportSize: 400,
      rowHeight: 40,
      overscan: 2,
    });

    const range = result.session.getVisibleRange(100_000);
    expect(range.visibleCount).toBeLessThanOrEqual(20);

    const index = new SparseRowIndex<number>();
    for (let i = 0; i < 100_000; i += 1) {
      index.set(i, i);
    }
    const visible = index.projectVisible(range);
    expect(visible).toHaveLength(range.visibleCount);
    expect(visible[0]).toBe(range.startIndex);
  });
});
