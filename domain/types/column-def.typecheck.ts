import type { ColumnDef } from './ColumnDef';

type Invoice = { id: string; title: string; amount: number };

export const titleCol: ColumnDef<Invoice> = {
  field: 'title',
  headerName: 'Title',
};

export const taxCol: ColumnDef<Invoice, number> = {
  colId: 'tax',
  headerName: 'Tax',
  valueGetter: ({ data }) => data.amount * 0.09,
};

export const badField: ColumnDef<Invoice> = {
  // @ts-expect-error — field must be a key of Invoice
  field: 'missing',
  headerName: 'No',
};
