import { useState } from 'react';
import { DataGrid, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', sortable: true, filter: 'text' },
  { field: 'qty', headerName: 'Qty', type: 'number', sortable: true, filter: 'number' },
  { field: 'price', headerName: 'Price', type: 'price', sortable: true, filter: 'number' },
  { field: 'category', headerName: 'Category', sortable: true, filter: 'text' },
];

/** 02 — Column sort + floating filters. */
export default function SortFilterExample() {
  const [rows] = useState(SAMPLE_LINES);
  return (
    <DataGrid<Line>
      rowData={rows}
      columnDefs={columns}
      getRowId={(r) => r.id}
      floatingFilter
      onGridReady={(e) => e.api.setSortModel([{ colId: 'price', sort: 'desc' }])}
      tableHeight={320}
    />
  );
}
