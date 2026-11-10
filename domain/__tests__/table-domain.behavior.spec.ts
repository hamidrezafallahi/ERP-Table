import { describe, expect, it } from 'vitest';

import { Collection } from '../entities/Collection';
import { Row } from '../entities/Row';
import { Table } from '../entities/Table';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  Pagination,
  RowId,
  RowState,
  RowStateEnum,
} from '../value-objects';
import { Cell } from '../entities/Cell';

type TestColumn = {
  fieldName: string;
  fieldCaption: string;
  fieldType: 'index' | 'text' | 'number';
  visibility: { kind: 'always' };
  editable?: boolean;
  fieldCollection?: string;
  order?: number;
  hidden?: boolean;
};

function createCell(
  rowId: RowId,
  columnId: string,
  value: unknown,
  originalValue: unknown = value,
  display: unknown = value
): Cell {
  return new Cell(
    rowId,
    new ColumnId(columnId),
    new CellValue(value),
    new CellValue(originalValue),
    new CellDisplay(display)
  );
}

function createRow(options: {
  rowId: number;
  index: number;
  name?: string;
  rowState?: RowStateEnum;
  originalName?: string;
  collection?: string;
}): Row {
  const rowId = new RowId(options.rowId);
  return new Row(
    rowId,
    new Map<string, Cell>([
      ['index', createCell(rowId, 'index', options.index)],
      [
        'name',
        createCell(
          rowId,
          'name',
          options.name ?? `row-${options.rowId}`,
          options.originalName ?? options.name ?? `row-${options.rowId}`
        ),
      ],
    ]),
    new RowState(options.rowState ?? RowStateEnum.Unchanged),
    new Set(),
    {},
    options.collection ?? 'default',
    false
  );
}

function createTable(rows: Row[]): Table {
  const columns = new Map<string, TestColumn>([
    [
      'index',
      {
        fieldName: 'index',
        fieldCaption: 'Index',
        fieldType: 'number',
        visibility: { kind: 'always' },
        order: 0,
      },
    ],
    [
      'name',
      {
        fieldName: 'name',
        fieldCaption: 'Name',
        fieldType: 'text',
        visibility: { kind: 'always' },
        order: 1,
      },
    ],
  ]);

  const collection = new Collection(
    'default',
    new Map(rows.map((row) => [row.id.value, row])),
    columns as any
  );

  return new Table(
    'table-1',
    new Map([['default', collection]]),
    new Pagination(1, 10, rows.length),
    null,
    'default'
  );
}

describe('table domain behavior', () => {
  it('changes a cell and marks an unchanged row as modified', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'alpha' })]);

    const event = table.changeCell(new RowId(1), new ColumnId('name'), 'beta');
    const row = table.getRow(1)!;

    expect(event?.type).toBe('CELL_CHANGED');
    expect(event?.newValue).toBe('beta');
    expect(event?.previousValue).toBe('alpha');
    expect(row.getCell('name')?.getValue()).toBe('beta');
    expect(row.getChangeFields()).toEqual(['name']);
    expect(row.rowState.value).toBe(RowStateEnum.Modified);
  });

  it('clears changeFields when a changed cell is restored to its original value', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'alpha' })]);

    table.changeCell(new RowId(1), new ColumnId('name'), 'beta');
    table.changeCell(new RowId(1), new ColumnId('name'), 'alpha');
    const row = table.getRow(1)!;

    expect(row.getCell('name')?.getValue()).toBe('alpha');
    expect(row.getChangeFields()).toEqual([]);
    expect(row.rowState.value).toBe(RowStateEnum.Unchanged);
  });

  it('keeps an added row in Added state when cells change', () => {
    const table = createTable([
      createRow({ rowId: 1, index: 1, name: 'draft', rowState: RowStateEnum.Added }),
    ]);

    const event = table.changeCell(new RowId(1), new ColumnId('name'), 'edited-draft');
    const row = table.getRow(1)!;

    expect(event?.type).toBe('CELL_CHANGED');
    expect(row.getCell('name')?.getValue()).toBe('edited-draft');
    expect(row.getChangeFields()).toEqual([]);
    expect(row.rowState.value).toBe(RowStateEnum.Added);
  });

  it('returns null when display does not actually change', () => {
    const row = createRow({ rowId: 1, index: 1, name: 'alpha' });

    const event = row.changeDisplay(new ColumnId('name'), 'alpha');

    expect(event).toBeNull();
    expect(row.getCell('name')?.getDisplay()).toBe('alpha');
  });

  it('replaces the only added row with a fresh added row on delete', () => {
    const table = createTable([
      createRow({ rowId: 1, index: 1, name: 'draft', rowState: RowStateEnum.Added }),
    ]);

    const event = table.deleteRow(new RowId(1));
    const rows = table.getRows();

    expect(event?.type).toBe('NEW_AND_FIRST_ROW_CAN_NOT_BE_REMOVE');
    expect(rows).toHaveLength(1);
    expect(rows[0].id.value).not.toBe(1);
    expect(rows[0].rowState.value).toBe(RowStateEnum.Added);
    expect(rows[0].getCell('index')?.getValue()).toBe(1);
  });

  it('page-window: removing the only added row on page >= 2 does NOT re-add a row', () => {
    const table = createTable([
      createRow({ rowId: 11, index: 11, name: 'draft', rowState: RowStateEnum.Added }),
    ]);
    table.setPageWindow(true);
    table.setPagination(new Pagination(2, 10, 11));

    const event = table.deleteRow(new RowId(11));

    expect(event?.type).toBe('NEW_ROW_REMOVED');
    expect(table.getRows()).toHaveLength(0);
  });

  it('page-window: removing the only added row on page 1 re-adds an empty row', () => {
    const table = createTable([
      createRow({ rowId: 1, index: 1, name: 'draft', rowState: RowStateEnum.Added }),
    ]);
    table.setPageWindow(true);

    const event = table.deleteRow(new RowId(1));

    expect(event?.type).toBe('NEW_AND_FIRST_ROW_CAN_NOT_BE_REMOVE');
    expect(table.getRows()).toHaveLength(1);
  });

  it('in-memory: removing the last row of the last page steps back one page', () => {
    const rows = Array.from({ length: 11 }, (_, i) =>
      createRow({ rowId: i + 1, index: i + 1, rowState: RowStateEnum.Added }),
    );
    const table = createTable(rows);
    table.changePage(2);

    const event = table.deleteRow(new RowId(11));

    expect(event?.type).toBe('NEW_ROW_REMOVED');
    expect(table.getRows()).toHaveLength(10);
    expect(table.getPagination().page).toBe(1);
    expect(table.getVisibleRows()).toHaveLength(10);
  });

  it('marks an unchanged persisted row as deleted instead of removing it', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'persisted' })]);

    const event = table.deleteRow(new RowId(1));
    const row = table.getRow(1)!;

    expect(event?.type).toBe('ROW_DELETED');
    expect(row.rowState.value).toBe(RowStateEnum.Deleted);
    expect(table.getRows()).toHaveLength(1);
  });

  it('soft-deletes a modified row (arianERP parity), then restores it on the next delete', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'alpha' })]);
    table.changeCell(new RowId(1), new ColumnId('name'), 'beta');

    const deleted = table.deleteRow(new RowId(1));
    const row = table.getRow(1)!;
    expect(deleted?.type).toBe('ROW_DELETED');
    expect(row.rowState.value).toBe(RowStateEnum.Deleted);

    const restored = table.deleteRow(new RowId(1));
    expect(restored?.type).toBe('ROW_RESTORED');
    expect(row.rowState.value).toBe(RowStateEnum.Modified);
    expect(row.getChangeFields()).toEqual(['name']);
  });

  it('restoreAddedRow re-inserts the same row identity and cell values', () => {
    const table = createTable([
      createRow({ rowId: 1, index: 1, name: 'seed', rowState: RowStateEnum.Added }),
      createRow({ rowId: 99, index: 2, name: 'draft', rowState: RowStateEnum.Added }),
    ]);

    table.deleteRow(new RowId(99));
    expect(table.getRow(99)).toBeUndefined();

    const event = table.restoreAddedRow({
      rowId: 99,
      cells: {
        index: { value: 2, display: 2, originalValue: 2 },
        name: { value: 'draft', display: 'draft', originalValue: 'draft' },
      },
      collection: 'default',
    });

    expect(event.type).toBe('ROW_ADDED');
    const restored = table.getRow(99)!;
    expect(restored.id.value).toBe(99);
    expect(restored.rowState.value).toBe(RowStateEnum.Added);
    expect(restored.getCell('name')?.getValue()).toBe('draft');
    expect(restored.getCell('index')?.getValue()).toBe(2);
  });

  it('reorderColumns moves a column inside the active collection', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'alpha' })]);
    expect(table.getColumns().map((c) => c.fieldName)).toEqual(['index', 'name']);

    const event = table.reorderColumns(1, 0);

    expect(event.type).toBe('COLUMN_REORDERED');
    expect(event.sourceIndex).toBe(1);
    expect(event.destIndex).toBe(0);
    expect(table.getColumns().map((c) => c.fieldName)).toEqual(['name', 'index']);
    expect(table.getActiveCollectionColumns().map((c) => [c.fieldName, c.order])).toEqual([
      ['name', 0],
      ['index', 1],
    ]);
  });

  it('setColumns keeps domain order when the host resends original order', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'alpha' })]);
    table.reorderColumns(1, 0);

    table.setColumns([
      {
        fieldName: 'index',
        fieldCaption: 'Index',
        fieldType: 'number',
        visibility: { kind: 'always' },
        order: 0,
      },
      {
        fieldName: 'name',
        fieldCaption: 'Name',
        fieldType: 'text',
        visibility: { kind: 'always' },
        order: 1,
      },
    ]);

    expect(table.getActiveCollectionColumns().map((c) => c.fieldName)).toEqual([
      'name',
      'index',
    ]);
  });
});
