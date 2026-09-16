import { useState } from 'react';
import { DataGrid, jalaliAdapter, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'قلم' },
  { field: 'date', headerName: 'تاریخ', type: 'date', editable: true },
  { field: 'price', headerName: 'مبلغ', type: 'price' },
];

/** 11 — Jalali DateAdapter + fa locale. */
export default function JalaliDatesExample() {
  const [rows, setRows] = useState(SAMPLE_LINES);
  return (
    <DataGrid<Line>
      rowData={rows}
      columnDefs={columns}
      getRowId={(r) => r.id}
      locale="fa"
      direction="rtl"
      dateAdapter={jalaliAdapter}
      onCellValueChanged={(e) => {
        if (!e.data) return;
        setRows((prev) => prev.map((r) => (r.id === e.data!.id ? e.data! : r)));
      }}
      tableHeight={320}
    />
  );
}
