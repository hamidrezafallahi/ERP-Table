import { describe, expect, it } from 'vitest';

import type { ColumnDef } from '../../domain/types/ColumnDef';
import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import { toColumnDefinition } from '../columns/mapColumnSchema';
import {
  columnDefFieldName,
  mapColumnDefs,
  mapColumnSchemasToDefs,
  toColumnDef,
  toColumnSchema,
} from '../columns/mapColumnDef';

const schema: ColumnSchema = {
  fieldName: 'qty',
  fieldCaption: 'Quantity',
  fieldType: 'number',
  fieldCollection: 'lines',
  editable: true,
  visibility: { kind: 'whenFieldTruthy', fieldName: 'showQty' },
  className: 'qty-col',
  minWidth: 80,
  hidden: false,
  resolveOn: {
    endpoint: '/resolve',
    fieldName: 'qty',
    buildParams: (row) => ({ id: row.id as number }),
  },
  computed: {
    dependsOn: ['price'],
    compute: async () => 0,
  },
};

describe('mapColumnDef (PR-81)', () => {
  it('ColumnSchema → ColumnDef → ColumnSchema is idempotent', () => {
    const roundTrip = toColumnSchema(toColumnDef(schema));
    expect(roundTrip).toEqual(schema);
    expect(roundTrip.computed?.compute).toBe(schema.computed?.compute);
    expect(roundTrip.resolveOn?.buildParams).toBe(schema.resolveOn?.buildParams);
  });

  it('does not clobber visibility rules when hide is omitted', () => {
    const def = toColumnDef(schema);
    expect(def.hide).toBe(false);
    expect(toColumnSchema(def).visibility).toEqual({
      kind: 'whenFieldTruthy',
      fieldName: 'showQty',
    });
  });

  it('ColumnDef → ColumnSchema → ColumnDef keeps getters and layout extras', () => {
    type Line = { id: number; price: number };
    const getter = ({ data }: { data: Line }) => data.price * 2;
    const setter = ({ newValue }: { data: Line; newValue: number }) =>
      newValue >= 0;
    const formatter = ({ value }: { value: number; data: Line }) =>
      String(value);
    const cmp = (a: number, b: number) => a - b;
    const editableWhen = ({ data }: { data: Line }) => data.id > 0;
    const render = () => 'cell';

    const def: ColumnDef<Line, number> = {
      colId: 'doubled',
      field: 'price',
      headerName: 'Doubled',
      type: 'price',
      valueGetter: getter,
      valueSetter: setter,
      valueFormatter: formatter,
      comparator: cmp,
      editable: editableWhen,
      width: 120,
      minWidth: 80,
      flex: 1,
      hide: false,
      pinned: 'start',
      sortable: true,
      filter: 'number',
      aggFunc: 'sum',
      cellRenderer: render,
    };

    const back = toColumnDef<Line, number>(toColumnSchema(def));
    expect(back.colId).toBe('doubled');
    expect(back.field).toBe('price');
    expect(back.headerName).toBe('Doubled');
    expect(back.type).toBe('price');
    expect(back.valueGetter).toBe(getter);
    expect(back.valueSetter).toBe(setter);
    expect(back.valueFormatter).toBe(formatter);
    expect(back.comparator).toBe(cmp);
    expect(back.editable).toBe(editableWhen);
    expect(back.width).toBe(120);
    expect(back.minWidth).toBe(80);
    expect(back.flex).toBe(1);
    expect(back.hide).toBe(false);
    expect(back.pinned).toBe('start');
    expect(back.sortable).toBe(true);
    expect(back.filter).toBe('number');
    expect(back.aggFunc).toBe('sum');
    expect(back.cellRenderer).toBe(render);
  });

  it('maps lists both ways', () => {
    const defs = mapColumnSchemasToDefs([schema]);
    expect(defs).toHaveLength(1);
    expect(defs[0]?.field).toBe('qty');
    expect(mapColumnDefs(defs)[0]).toEqual(schema);
  });

  it('feeds the existing ColumnDefinition mapper', () => {
    const def: ColumnDef<{ qty: number }> = {
      field: 'qty',
      headerName: 'Qty',
      type: 'number',
      minWidth: 64,
    };
    const definition = toColumnDefinition(toColumnSchema(def));
    expect(definition.fieldName).toBe('qty');
    expect(definition.fieldType).toBe('number');
    expect(definition.minWidth).toBe(64);
  });

  it('columnDefFieldName prefers colId then field', () => {
    expect(
      columnDefFieldName({ colId: 'tax', field: 'amount', headerName: 'Tax' }),
    ).toBe('tax');
    expect(columnDefFieldName({ field: 'amount' })).toBe('amount');
    expect(() => columnDefFieldName({ headerName: 'No id' })).toThrow(
      /colId or field/,
    );
  });
});
