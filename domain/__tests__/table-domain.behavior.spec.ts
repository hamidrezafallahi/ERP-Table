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

  it('marks an unchanged persisted row as deleted instead of removing it', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'persisted' })]);

    const event = table.deleteRow(new RowId(1));
    const row = table.getRow(1)!;

    expect(event?.type).toBe('ROW_DELETED');
    expect(row.rowState.value).toBe(RowStateEnum.Deleted);
    expect(table.getRows()).toHaveLength(1);
  });

  it('restores a modified row instead of deleting it permanently', () => {
    const table = createTable([createRow({ rowId: 1, index: 1, name: 'alpha' })]);
    table.changeCell(new RowId(1), new ColumnId('name'), 'beta');

    const event = table.deleteRow(new RowId(1));
    const row = table.getRow(1)!;

    expect(event?.type).toBe('ROW_RESTORED');
    expect(row.rowState.value).toBe(RowStateEnum.Modified);
    expect(row.getChangeFields()).toEqual(['name']);
  });
});
