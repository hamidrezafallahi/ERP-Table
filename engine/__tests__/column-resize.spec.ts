import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import {
  clampColumnWidth,
  DEFAULT_COLUMN_MIN_WIDTH,
  INDEX_COLUMN_DEFAULT_WIDTH,
  resolveColumnWidth,
} from '../columnWidth';

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

describe('clampColumnWidth / resolveColumnWidth', () => {
  it('uses 144px as the default floor', () => {
    expect(clampColumnWidth(50)).toBe(DEFAULT_COLUMN_MIN_WIDTH);
    expect(clampColumnWidth(200)).toBe(200);
  });

  it('treats schema minWidth as a floor', () => {
    expect(clampColumnWidth(50, { minWidth: 200 })).toBe(200);
    expect(clampColumnWidth(240, { minWidth: 200 })).toBe(240);
  });

  it('keeps the index column at least 168px', () => {
    expect(clampColumnWidth(50, { fieldType: 'index' })).toBe(
      INDEX_COLUMN_DEFAULT_WIDTH,
    );
    expect(clampColumnWidth(300, { fieldName: 'index' })).toBe(300);
  });

  it('resolves stored width over the fallback', () => {
    expect(
      resolveColumnWidth({ fieldName: 'name', fieldType: 'text' }, {}),
    ).toBe(DEFAULT_COLUMN_MIN_WIDTH);
    expect(
      resolveColumnWidth({ fieldName: 'name', minWidth: 180 }, { name: 90 }),
    ).toBe(180);
    expect(
      resolveColumnWidth({ fieldName: 'name' }, { name: 220 }),
    ).toBe(220);
  });
});

describe('PR-58 RESIZE_COLUMN session view state', () => {
  it('stores width in getViewState and survives a second read', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-resize',
      tableKey: 'table-resize',
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
          minWidth: 180,
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'a' } }],
    });

    await result.engine.dispatch({
      type: 'RESIZE_COLUMN',
      tableKey: 'table-resize',
      columnId: 'name',
      width: 320,
    });

    const first = result.controller.getViewState();
    expect(first?.columnWidths.name).toBe(320);

    const second = result.controller.getViewState();
    expect(second?.columnWidths.name).toBe(320);
  });

  it('clamps UI_RESIZE_COLUMN to schema minWidth', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const result = await createERPTable({
      store: 'store-resize-ui',
      tableKey: 'table-resize-ui',
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
          minWidth: 200,
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'a' } }],
    });

    await result.controller.dispatch({
      type: 'UI_RESIZE_COLUMN',
      columnId: 'name',
      width: 40,
    });

    expect(result.controller.getViewState()?.columnWidths.name).toBe(200);
  });
});
