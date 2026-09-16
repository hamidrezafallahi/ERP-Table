import { createElement, useState } from 'react';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function EditingGrid() {
  const [rows, setRows] = useState<DemoRow[]>(DEMO_ROWS);
  return createElement(DataGrid<DemoRow>, {
    rowData: rows,
    columnDefs: BASE_COLUMNS.map((c) => ({ ...c, editable: true })),
    getRowId: (r) => r.id,
    onCellValueChanged: (e) => {
      if (!e.data) return;
      setRows((prev) => prev.map((r) => (r.id === e.data!.id ? e.data! : r)));
    },
    tableHeight: 260,
  });
}
