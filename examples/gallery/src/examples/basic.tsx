import { useState } from 'react';
import { DataGrid, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item' },
  { field: 'qty', headerName: 'Qty', type: 'number' },
  { field: 'price', headerName: 'Price', type: 'price' },
  { field: 'category', headerName: 'Category' },
  { field: 'date', headerName: 'Date', type: 'date' },
];

/** 01 — Zero-config DataGrid with rowData + columnDefs. */
export default function BasicExample() {
  const [rows] = useState(SAMPLE_LINES);
  return (
    <DataGrid<Line>
      rowData={rows}
      columnDefs={columns}
      getRowId={(r) => r.id}
      tableHeight={320}
    />
  );
}
