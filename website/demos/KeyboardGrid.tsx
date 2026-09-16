import { createElement, useState } from 'react';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function KeyboardGrid() {
  const [rows] = useState<DemoRow[]>(DEMO_ROWS);
  return createElement(DataGrid<DemoRow>, {
    rowData: rows,
    columnDefs: BASE_COLUMNS.map((c) => ({ ...c, editable: true })),
    getRowId: (r) => r.id,
    tableHeight: 260,
  });
}
