import { createElement, useState } from 'react';
import { themeDark } from 'persian-data-grid';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function ThemingGrid() {
  const [rows] = useState<DemoRow[]>(DEMO_ROWS);
  return createElement(DataGrid<DemoRow>, {
    rowData: rows,
    columnDefs: BASE_COLUMNS,
    getRowId: (r) => r.id,
    theme: themeDark,
    themeToggle: false,
    tableHeight: 260,
  });
}
