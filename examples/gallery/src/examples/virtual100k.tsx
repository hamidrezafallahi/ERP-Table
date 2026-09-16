import { useMemo, useState } from 'react';
import { DataGrid, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { makeLines, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item' },
  { field: 'qty', headerName: 'Qty', type: 'number' },
  { field: 'price', headerName: 'Price', type: 'price' },
  { field: 'category', headerName: 'Category' },
];

/** 05 — 100k rows with default row virtualization. */
export default function Virtual100kExample() {
  const seed = useMemo(() => makeLines(100_000), []);
  const [rows] = useState(seed);
  return (
    <DataGrid<Line>
      rowData={rows}
      columnDefs={columns}
      getRowId={(r) => r.id}
      tableHeight={360}
    />
  );
}
