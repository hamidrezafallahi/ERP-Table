import { useState } from 'react';
import { DataGrid, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'category', headerName: 'Category' },
  { field: 'item', headerName: 'Item' },
  { field: 'qty', headerName: 'Qty', type: 'number', aggFunc: 'sum' },
  { field: 'price', headerName: 'Price', type: 'price', aggFunc: 'sum' },
];

/** 07 — Single-level groupBy + aggFunc footer. */
export default function GroupingAggExample() {
  const [rows] = useState(SAMPLE_LINES);
  return (
    <DataGrid<Line>
      rowData={rows}
      columnDefs={columns}
      getRowId={(r) => r.id}
      groupBy="category"
      footer
      tableHeight={360}
    />
  );
}
