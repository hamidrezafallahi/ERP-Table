import type { ColumnSchema, RowInput } from '@fallahi/erp-table';

export const DEMO_COLUMNS: ColumnSchema[] = [
  {
    fieldName: 'item',
    fieldCaption: 'Item',
    fieldType: 'text',
    fieldCollection: 'default',
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'qty',
    fieldCaption: 'Qty',
    fieldType: 'number',
    fieldCollection: 'default',
    visibility: { kind: 'always' },
  },
  {
    fieldName: 'amount',
    fieldCaption: 'Amount',
    fieldType: 'number',
    fieldCollection: 'default',
    visibility: { kind: 'always' },
  },
];

export function buildDemoRows(count = 200): RowInput[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    return {
      id,
      collection: 'default',
      values: {
        item: `SKU-${String(id).padStart(4, '0')}`,
        qty: (id % 12) + 1,
        amount: ((id * 17) % 900) + 50,
      },
    };
  });
}
