import { describe, expect, it, vi } from 'vitest';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

import { buildColumns, buildRows } from '../../bootstrap/builders';
import {
  ensureIndexColumnDef,
  mapRowDataToRowInputs,
} from '../rows/mapRowData';
import { mapColumnDefs } from '../columns/mapColumnDef';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';

class MemoryRepo implements TableRepository {
  async getById(): Promise<Table> {
    throw new Error('missing');
  }
  async save(): Promise<void> {}
  async delete(): Promise<void> {}
  async resetTable(): Promise<void> {}
  async exists(): Promise<boolean> {
    return false;
  }
}

describe('PR-101 lazy host cells', () => {
  it('buildRows materializes only the index cell when row.data is set', async () => {
    const columnDefs = ensureIndexColumnDef([
      { field: 'name', headerName: 'Name', type: 'text' as const },
      { field: 'amount', headerName: 'Amount', type: 'number' as const },
    ]);
    const schemas = mapColumnDefs(columnDefs);
    const rowData = [
      { id: 1, name: 'a', amount: 10 },
      { id: 2, name: 'b', amount: 20 },
    ];
    const inputs = mapRowDataToRowInputs(rowData, columnDefs, (r) =>
      String((r as { id: number }).id),
    );
    expect(inputs[0]?.data).toBe(rowData[0]);

    const built = buildColumns(schemas, inputs, 'default');
    const { rows } = await buildRows(
      built.collectionColumns,
      built.columnMeta,
      inputs,
      new MemoryRepo(),
      's',
      't',
      { request: async () => null },
      { skipPersistLoad: true },
    );

    const row = rows.get(1);
    expect(row).toBeDefined();
    expect((row as { cells: Map<string, unknown> }).cells.size).toBe(1);
    expect(row!.peekCell('index')).toBeDefined();
    expect(row!.peekCell('name')).toBeUndefined();
    expect(row!.readValue('name')).toBe('a');
    expect(row!.getCell('name')?.getValue()).toBe('a');
    expect((row as { cells: Map<string, unknown> }).cells.size).toBe(2);
  });
});
