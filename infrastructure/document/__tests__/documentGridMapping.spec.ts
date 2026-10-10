import { describe, expect, it } from 'vitest';

import { RowStateEnum } from '../../../domain/value-objects';
import type { TableSnapShot } from '../../../engine/type';
import {
  buildDocumentPayload,
  mapDetailsToRowInputs,
  mapServerHeaderToFields,
  mapSnapshotToDetails,
} from '../documentGridMapping';

const snap = (rows: TableSnapShot['rows']): TableSnapShot => ({ rows });

describe('mapSnapshotToDetails', () => {
  it('skips unchanged rows and maps index → RowNum under Details', () => {
    const out = mapSnapshotToDetails(
      snap([
        {
          id: 1,
          cells: { index: 1, Amount: 10 },
          rowState: RowStateEnum.Unchanged,
          collection: 'default',
          changeFields: [],
          isSaveDescription: false,
        },
        {
          id: 2,
          cells: { index: 2, Amount: 20, collection: 'default' },
          rowState: RowStateEnum.Added,
          collection: 'default',
          changeFields: ['Amount'],
          isSaveDescription: false,
        },
      ]),
      { detailFieldKey: 'DetailId', isUpdate: false },
    );
    expect(out).toEqual({
      Details: [
        { RowState: 'Add', ChangeFields: ['Amount'], RowNum: 2, Amount: 20 },
      ],
    });
  });

  it('sends the PK for non-new rows on update and groups custom collections', () => {
    const out = mapSnapshotToDetails(
      snap([
        {
          id: 7,
          cells: { Amount: { value: 5 } },
          rowState: RowStateEnum.Modified,
          collection: 'cheque',
          changeFields: ['Amount'],
          isSaveDescription: false,
        },
        {
          id: 8,
          cells: { Amount: 6 },
          rowState: RowStateEnum.Added,
          collection: 'cash',
          changeFields: [],
          isSaveDescription: true,
        },
      ]),
      { detailFieldKey: 'DetailId', isUpdate: true },
    );
    expect(out.cheque).toEqual([
      { RowState: 'Update', ChangeFields: ['Amount'], DetailId: 7, Amount: 5 },
    ]);
    expect(out.cash).toEqual([
      { RowState: 'Add', ChangeFields: [], isSaveDescription: true, Amount: 6 },
    ]);
  });
});

describe('mapDetailsToRowInputs', () => {
  it('uses the server PK as row id', () => {
    const rows = mapDetailsToRowInputs([{ DetailId: 3, Amount: 1 }], {
      detailFieldKey: 'DetailId',
      collection: 'default',
    });
    expect(rows).toEqual([
      { id: 3, values: { DetailId: 3, Amount: 1, collection: 'default' } },
    ]);
  });

  it('copy mode clears the PK and marks rows Added', () => {
    const rows = mapDetailsToRowInputs([{ DetailId: 3, Amount: 1 }], {
      detailFieldKey: 'DetailId',
      collection: 'default',
      isCopy: true,
      newRowId: () => 99,
    });
    expect(rows[0]).toEqual({
      id: 99,
      values: {
        Amount: 1,
        DetailId: undefined,
        RowState: RowStateEnum.Added,
        collection: 'default',
      },
    });
  });
});

describe('buildDocumentPayload / mapServerHeaderToFields', () => {
  it('coerces numerics, nulls empties and sends ChangeFields only on update', () => {
    const base = {
      headerFields: [
        { name: 'VoucherId', value: '5', originalValue: '5' },
        { name: 'Title', value: '', originalValue: 'x' },
        { name: 'Qty', value: '4', originalValue: '4', type: 'number' },
      ],
      headerFieldKey: 'VoucherId',
      details: { Details: [] },
    };
    const update = buildDocumentPayload({ ...base, recordId: 5 });
    expect(update).toMatchObject({
      VoucherId: 5,
      Title: null,
      Qty: 4,
      ChangeFields: ['Title'],
      Details: [],
    });
    const add = buildDocumentPayload({ ...base, recordId: 0 });
    expect(add.ChangeFields).toBeUndefined();
    expect(add.VoucherId).toBeUndefined();
  });

  it('copy mode resets identity fields', () => {
    const fields = mapServerHeaderToFields(
      [{ name: 'VoucherNumber' }, { name: 'Title' }],
      { VoucherNumber: 12, Title: 'T' },
      {
        headerFieldKey: 'VoucherId',
        recordId: 5,
        isCopy: true,
        copyResetFields: ['VoucherNumber'],
      },
    );
    expect(fields.find((f) => f.name === 'VoucherNumber')?.value).toBeNull();
    expect(fields.find((f) => f.name === 'Title')?.value).toBe('T');
    expect(fields.find((f) => f.name === 'VoucherId')).toMatchObject({
      value: null,
      type: 'hidden',
    });
  });
});
