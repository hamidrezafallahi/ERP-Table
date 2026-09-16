import { createElement, useState } from 'react';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function FilteringGrid() {
  const [rows] = useState<DemoRow[]>(DEMO_ROWS);
  return createElement(DataGrid<DemoRow>, {
    rowData: rows,
    columnDefs: BASE_COLUMNS.map((c) => ({ ...c, filter: true })),
    getRowId: (r) => r.id,
    floatingFilter: true,
    tableHeight: 280,
  });
}
