import { useState } from 'react';
import { DataGrid, themeDark, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item' },
  { field: 'qty', headerName: 'Qty', type: 'number' },
  { field: 'price', headerName: 'Price', type: 'price' },
];

const brandTheme = themeDark.withParams({
  accentColor: '#0d9488',
});

/** 08 — Dark stock theme + withParams accent override. */
export default function ThemeDarkExample() {
  const [rows] = useState(SAMPLE_LINES);
  return (
    <DataGrid<Line>
      rowData={rows}
      columnDefs={columns}
      getRowId={(r) => r.id}
      theme={brandTheme}
      themeToggle={false}
      tableHeight={320}
    />
  );
}
