import React, { useRef } from 'react';
import { expectTypeOf } from 'vitest';

import type { ColumnDef, ColumnField } from '../domain/types/ColumnDef';
import type { GridApi } from '../infrastructure/ui/createGridApi';
import {
  DataGrid,
  ERPTable,
  type CellValueChangedEvent,
  type DataGridProps,
} from './index';

type Invoice = { id: string; title: string; amount: number; date: string };

const invoices: Invoice[] = [
  { id: '1', title: 'کابل', amount: 120_000, date: '1404-01-15' },
];

function save(_data: Invoice | undefined): void {}

/** Phase 17 exit example — explicit `TRow`. */
export function ExplicitInvoiceGrid(): React.ReactElement {
  return (
    <DataGrid<Invoice>
      rowData={invoices}
      columnDefs={[
        { field: 'title', headerName: 'شرح' },
        { field: 'amount', type: 'price' },
        { field: 'date', type: 'date' },
      ]}
      onCellValueChanged={(e) => save(e.data)}
    />
  );
}

/** Inference from `rowData` without `<Invoice>` (PR-88). */
export function InferredInvoiceGrid(): React.ReactElement {
  return (
    <DataGrid
      rowData={invoices}
      columnDefs={[
        { field: 'title', headerName: 'شرح' },
        { field: 'amount', type: 'price' },
        { field: 'date', type: 'date' },
      ]}
      getRowId={(row) => row.id}
      onCellValueChanged={(e) => {
        save(e.data);
        const title: string | undefined = e.data?.title;
        void title;
      }}
    />
  );
}

/** Deprecated alias stays generic. */
export function LegacyErpTable(): React.ReactElement {
  return (
    <ERPTable<Invoice>
      rowData={invoices}
      columnDefs={[{ field: 'title', headerName: 'شرح' }]}
    />
  );
}

export function ApiRefGrid(): React.ReactElement {
  const apiRef = useRef<GridApi<Invoice> | null>(null);
  return (
    <DataGrid
      apiRef={apiRef}
      rowData={invoices}
      columnDefs={[{ field: 'amount', type: 'price' }]}
      onGridReady={({ api }) => {
        const rows: Invoice[] = api.getSelectedRows();
        void rows;
      }}
    />
  );
}

export function BadFieldGrid(): React.ReactElement {
  return (
    <DataGrid<Invoice>
      rowData={invoices}
      columnDefs={[
        { field: 'title' },
        // @ts-expect-error — field must be a key of Invoice
        { field: 'notAColumn' },
      ]}
      onCellValueChanged={(e) => {
        if (!e.data) return;
        // @ts-expect-error — Invoice has no `sku`
        const sku = e.data.sku;
        void sku;
      }}
    />
  );
}

expectTypeOf<ColumnField<Invoice>>().toEqualTypeOf<
  'id' | 'title' | 'amount' | 'date'
>();
expectTypeOf<DataGridProps<Invoice>['rowData']>().toEqualTypeOf<
  readonly Invoice[] | undefined
>();
expectTypeOf<
  NonNullable<DataGridProps<Invoice>['onCellValueChanged']>
>().parameters.toEqualTypeOf<[CellValueChangedEvent<Invoice>]>();
expectTypeOf<NonNullable<DataGridProps<Invoice>['columnDefs']>[number]>().toMatchTypeOf<
  ColumnDef<Invoice>
>();
expectTypeOf<
  NonNullable<DataGridProps<Invoice>['getRowId']>
>().parameters.toEqualTypeOf<[Invoice, number]>();
