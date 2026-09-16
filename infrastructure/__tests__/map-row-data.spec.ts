import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import type { ColumnDef } from '../../domain/types/ColumnDef';
import {
  defaultGetRowId,
  mapRowDataToRowInputs,
} from '../rows/mapRowData';

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

type Line = { id: number; name: string; price: number };

const columnDefs: ColumnDef<Line>[] = [
  { field: 'id', headerName: 'ID', type: 'number' },
  { field: 'name', headerName: 'Name', type: 'text' },
  { field: 'price', headerName: 'Price', type: 'price' },
];

function lines(count: number): Line[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `item-${i + 1}`,
    price: i + 1,
  }));
}

describe('PR-82 mapRowData adapter', () => {
  it('maps 1000 POJOs to RowInput without a host-built RowInput', () => {
    const data = lines(1000);
    const inputs = mapRowDataToRowInputs(data, columnDefs, (row) =>
      String(row.id),
    );
    expect(inputs).toHaveLength(1000);
    // PR-101: values stay on host `data`; RowInput.values keeps index only.
    expect(inputs[0]?.values?.index).toBe(1);
    expect(inputs[0]?.values?.name).toBeUndefined();
    expect((inputs[0]?.data as Line)?.name).toBe('item-1');
    expect((inputs[999]?.data as Line)?.price).toBe(1000);
    expect(inputs[42]?.data).toBe(data[42]);
    expect(inputs[42]?.sourceId).toBe('43');
  });

  it('default getRowId is the array index', () => {
    expect(defaultGetRowId({ id: 9 }, 3)).toBe('3');
  });

  it('valueGetter reads the original object, not a clone', () => {
    const row = { id: 1, name: 'a', price: 10 };
    const defs: ColumnDef<Line>[] = [
      {
        colId: 'tax',
        headerName: 'Tax',
        type: 'number',
        valueGetter: ({ data }) => data.price * 0.09,
      },
    ];
    const [input] = mapRowDataToRowInputs([row], defs, (r) => String(r.id));
    expect(input?.values?.tax).toBeCloseTo(0.9);
    expect(input?.data).toBe(row);
  });
});

describe('PR-82 createERPTable rowData', () => {
  it('hydrates 1000 {id,name,price} rows without RowInput', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const data = lines(1000);
    const result = await createERPTable({
      store: 'store-rowdata',
      tableKey: 'table-rowdata',
      actor: { userId: 'u1', roles: ['admin'] },
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      recordPerPage: 1000,
      columnDefs,
      rowData: data,
      getRowId: (row) => String((row as Line).id),
    });

    const domainRows = result.table.getRows();
    expect(domainRows).toHaveLength(1000);
    const sample = domainRows.find((r) => r.sourceId === '42');
    expect(sample).toBeTruthy();
    expect(sample?.getData()).toBe(data[41]);
    expect(sample?.getCell('name')?.getValue()).toBe('item-42');
    expect(sample?.getCell('price')?.getValue()).toBe(42);
  });

  it('changing one host row only rewrites that domain/UI row', async () => {
    const { createERPTable } = await import('../../bootstrap');
    const data = lines(1000);
    const result = await createERPTable({
      store: 'store-rowdata-diff',
      tableKey: 'table-rowdata-diff',
      actor: { userId: 'u1', roles: ['admin'] },
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      recordPerPage: 1000,
      columnDefs,
      rowData: data,
      getRowId: (row) => String((row as Line).id),
    });

    const beforeUi = result.engine.getAllUIRows() ?? [];
    expect(beforeUi).toHaveLength(1000);
    const uiById = new Map(beforeUi.map((r) => [r.id, r]));
    const domainBySource = new Map(
      result.table.getRows().map((r) => [r.sourceId, r]),
    );
    const unchangedDomain = domainBySource.get('1');
    const changedDomain = domainBySource.get('50');
    expect(unchangedDomain).toBeTruthy();
    expect(changedDomain).toBeTruthy();

    const next = data.map((row) =>
      row.id === 50 ? { ...row, price: 9999 } : row,
    );
    result.engine.applyHostRowData(next, columnDefs, (row) =>
      String((row as Line).id),
    );

    expect(changedDomain?.getCell('price')?.getValue()).toBe(9999);
    expect(changedDomain?.getData()).toBe(next[49]);
    expect(unchangedDomain?.getData()).toBe(data[0]);
    expect(unchangedDomain).toBe(domainBySource.get('1'));

    const afterUi = result.engine.getAllUIRows() ?? [];
    expect(afterUi).toHaveLength(1000);
    let rewritten = 0;
    for (const row of afterUi) {
      const prev = uiById.get(row.id);
      if (prev !== row) rewritten += 1;
    }
    expect(rewritten).toBe(1);
  });
});
