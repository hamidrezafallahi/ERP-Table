import { createElement, useState } from 'react';
import { jalaliAdapter } from 'persian-data-grid';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function DatesGrid() {
  const [rows] = useState<DemoRow[]>(DEMO_ROWS);
  return createElement(DataGrid<DemoRow>, {
    rowData: rows,
    columnDefs: BASE_COLUMNS.map((c) =>
      c.field === 'date' ? { ...c, editable: true } : c,
    ),
    getRowId: (r) => r.id,
    locale: 'fa',
    dateAdapter: jalaliAdapter,
    tableHeight: 260,
  });
}
