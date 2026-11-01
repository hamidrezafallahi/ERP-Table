import { describe, expect, it, vi } from 'vitest';

import type { ColumnSchema } from '../../bootstrap/type';
import type { Table } from '../../domain/entities/Table';
import type { TableRepository } from '../ports/TableRepository';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

class MemoryTableRepository implements TableRepository {
  private tables = new Map<string, Table>();
  async getById(store: string, tableKey: string): Promise<Table> {
    const table = this.tables.get(`${store}:${tableKey}`);
    if (!table) throw new Error(`Table not found: ${store}/${tableKey}`);
    return table;
  }
  async save(store: string, table: Table): Promise<void> {
    this.tables.set(`${store}:${table.id}`, table);
  }
  async delete(store: string, tableKey: string): Promise<void> {
    this.tables.delete(`${store}:${tableKey}`);
  }
  async resetTable(store: string, tableKey: string): Promise<void> {
    this.tables.delete(`${store}:${tableKey}`);
  }
  async exists(store: string, tableKey: string): Promise<boolean> {
    return this.tables.has(`${store}:${tableKey}`);
  }
}

/**
 * Host parity for the voucher pattern (newFront voucherTemplate): typing in
 * `Bed` zeroes `Bes` through the column's `onChange`, and a computed column
 * follows the committed values.
 *
 * The library edits through a session draft (the in-project table wrote every
 * keystroke to the store). This pins the resulting timing:
 *  - the host `onChange` fires per keystroke (the renderer calls it before
 *    `UI_CELL_CHANGE`), and its writes to OTHER columns go straight through;
 *  - the edited cell itself, and `computed` targets depending on it, change
 *    only when the session commits (active cell moves / Enter).
 */
describe('edit session vs host onChange / computed', () => {
  async function setup() {
    const { createERPTable } = await import('../../bootstrap/index');
    const columns: ColumnSchema[] = [
      {
        fieldName: 'Bed',
        fieldCaption: 'Debit',
        fieldType: 'price',
        fieldCollection: 'default',
        visibility: { kind: 'always' },
        onChange: (_tableKey, rowId, _row, controller) => {
          void controller.dispatch({ type: 'UI_CELL_CHANGE', value: 0, rowId, columnId: 'Bes' });
          void controller.dispatch({ type: 'UI_CELL_CHANGE_DISPLAY', value: '0', rowId, columnId: 'Bes' });
        },
      },
      {
        fieldName: 'Bes',
        fieldCaption: 'Credit',
        fieldType: 'price',
        fieldCollection: 'default',
        visibility: { kind: 'always' },
      },
      {
        fieldName: 'Net',
        fieldCaption: 'Net',
        fieldType: 'price',
        fieldCollection: 'default',
        visibility: { kind: 'always' },
        computed: {
          dependsOn: ['Bed', 'Bes'],
          compute: async (row) => (Number(row.Bed) || 0) - (Number(row.Bes) || 0),
        },
      },
    ];
    const grid = await createERPTable({
      store: 's',
      tableKey: 'voucher',
      actor: { userId: 'u', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      columns,
      rows: [{ id: 1, collection: 'default', values: { Bed: 100, Bes: 50, Net: 50 } }],
    });
    const cell = (columnId: string) => grid.table.getRow(1)?.getCell(columnId)?.getValue();
    /** What the cell renderer's dispatchChangeValue does on each keystroke. */
    const type = (columnId: string, value: unknown) => {
      const meta = columns.find((c) => c.fieldName === columnId)!;
      meta.onChange?.('voucher', 1, grid.controller.getRowView(1)!, grid.controller, value);
      void grid.controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId, value });
    };
    return { grid, cell, type };
  }

  it('host onChange writes other columns per keystroke; the edited cell waits for commit', async () => {
    const { grid, cell, type } = await setup();

    grid.engine.startCellEdit(1, 'Bed');
    type('Bed', 500);

    // Bes is not part of the cell session: zeroed immediately; Net follows it.
    await vi.waitFor(() => {
      expect(cell('Bes')).toBe(0);
      expect(cell('Net')).toBe(100);
    });
    // Bed itself is still a draft.
    expect(cell('Bed')).toBe(100);
    expect(grid.engine.getEditDraft(1, 'Bed')?.value).toBe(500);

    await grid.engine.commitCellEdit();
    expect(cell('Bed')).toBe(500);
    expect(cell('Net')).toBe(500);
    expect(grid.engine.getCellEdit()).toBeNull();
  });

  it('cancel reverts the edited cell but keeps what onChange already wrote', async () => {
    const { grid, cell, type } = await setup();

    grid.engine.startCellEdit(1, 'Bed');
    type('Bed', 500);
    await vi.waitFor(() => expect(cell('Bes')).toBe(0));

    grid.engine.cancelCellEdit();
    expect(cell('Bed')).toBe(100);
    expect(cell('Bes')).toBe(0);
  });
});
