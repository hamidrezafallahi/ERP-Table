import { createElement, useState } from 'react';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function GroupingGrid() {
  const [rows] = useState<DemoRow[]>(DEMO_ROWS);
  return createElement(DataGrid<DemoRow>, {
    rowData: rows,
    columnDefs: BASE_COLUMNS.map((c) =>
      c.field === 'price' ? { ...c, aggFunc: 'sum' as const } : c,
    ),
    getRowId: (r) => r.id,
    groupBy: 'category',
    footer: true,
    tableHeight: 300,
  });
}
