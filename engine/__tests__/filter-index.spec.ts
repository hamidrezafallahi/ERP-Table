import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AuditLogger } from '../../application/ports/AuditLogger';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

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

const columns = [
  {
    fieldName: 'index',
    fieldCaption: '#',
    fieldType: 'index' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
  {
    fieldName: 'name',
    fieldCaption: 'Name',
    fieldType: 'text' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
  {
    fieldName: 'amount',
    fieldCaption: 'Amount',
    fieldType: 'number' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
  {
    fieldName: 'when',
    fieldCaption: 'When',
    fieldType: 'date' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
  {
    fieldName: 'ok',
    fieldCaption: 'OK',
    fieldType: 'checkbox' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
  },
  {
    fieldName: 'wh',
    fieldCaption: 'WH',
    fieldType: 'text' as const,
    fieldCollection: 'default',
    visibility: { kind: 'always' as const },
    columnDef: { filter: 'set' as const },
  },
];

async function createFixture() {
  const { createERPTable } = await import('../../bootstrap');
  return createERPTable({
    store: 'store-filter-94',
    tableKey: 'table-filter-94',
    actor: { userId: 'u1', roles: ['admin'] },
    tableType: 'default',
    activeCollection: 'default',
    repo: new MemoryTableRepository(),
    audit: new SilentAuditLogger(),
    remoteApi: { request: async () => null },
    columns,
    rows: [
      {
        id: 1,
        collection: 'default',
        values: {
          index: 1,
          name: 'Alpha',
          amount: 10,
          when: Date.parse('2026-01-01T00:00:00Z'),
          ok: true,
          wh: 'A',
        },
      },
      {
        id: 2,
        collection: 'default',
        values: {
          index: 2,
          name: 'Beta',
          amount: 20,
          when: Date.parse('2026-06-01T00:00:00Z'),
          ok: false,
          wh: 'B',
        },
      },
      {
        id: 3,
        collection: 'default',
        values: {
          index: 3,
          name: 'Alpha',
          amount: 30,
          when: Date.parse('2026-12-01T00:00:00Z'),
          ok: true,
          wh: 'A',
        },
      },
    ],
  });
}

describe('PR-94 filterModel wired to SparseRowIndex', () => {
  it('text / number / date / boolean / set filters reduce getAllUIRows', async () => {
    const result = await createFixture();
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 2, 3]);

    result.api.setFilterModel({
      name: { filterType: 'text', type: 'equals', filter: 'Alpha' },
    });
    expect(result.api.getFilterModel().name).toBeTruthy();
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 3]);

    result.api.setFilterModel({
      amount: { filterType: 'number', type: '>', filter: 15 },
    });
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([2, 3]);

    result.api.setFilterModel({
      when: {
        filterType: 'date',
        type: 'before',
        dateFrom: Date.parse('2026-06-01T00:00:00Z'),
      },
    });
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1]);

    result.api.setFilterModel({
      ok: { filterType: 'boolean', type: 'false' },
    });
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([2]);

    result.api.setFilterModel({
      wh: { filterType: 'set', type: 'in', values: ['A'] },
    });
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 3]);

    result.api.setFilterModel({});
    expect(result.engine.getAllUIRows()?.map((r) => r.id)).toEqual([1, 2, 3]);
  });
});

describe('PR-94 header filter DOM wiring', () => {
  it('exposes filter icon, popover portal theme, floating row, RTL/dark hooks', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    expect(header).toContain('data-pdg-filter-btn');
    expect(header).toContain('data-pdg-filter-active');
    expect(header).toContain('data-pdg-floating-filter');
    expect(header).toContain('ColumnFilterPopover');
    expect(header).toContain('data-pdg-dir={direction}');

    const popover = load('ui/desktop/ColumnFilterPopover.tsx');
    expect(popover).toContain('useThemePortalStyle');
    expect(popover).toContain('createPortal');
    expect(popover).toContain('data-pdg-filter-popover={popoverKind}');
    expect(popover).toContain('customComponent');
    expect(popover).toContain("data-pdg-filter-input=\"text\"");
    expect(popover).toContain("data-pdg-filter-input=\"number\"");
    expect(popover).toContain("data-pdg-filter-input=\"date\"");
    expect(popover).toContain("data-pdg-filter-input=\"set\"");
    expect(popover).toContain("data-pdg-filter-input={`boolean-${op}`}");

    expect(load('infrastructure/ui/createGridApi.ts')).toContain('setFilterModel');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('getFilterModel');
    expect(load('ui/index.tsx')).toContain('floatingFilter');
  });
});
