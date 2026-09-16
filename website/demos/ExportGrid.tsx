import { createElement, useRef, useState } from 'react';
import type { GridApi } from 'persian-data-grid';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function ExportGrid() {
  const [rows] = useState<DemoRow[]>(DEMO_ROWS);
  const apiRef = useRef<GridApi<DemoRow> | null>(null);
  return createElement(
    'div',
    null,
    createElement(
      'div',
      { style: { display: 'flex', gap: 8, padding: '8px 12px' } },
      createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            void apiRef.current?.exportDataAsExcel();
          },
        },
        'Export Excel',
      ),
    ),
    createElement(DataGrid<DemoRow>, {
      rowData: rows,
      columnDefs: BASE_COLUMNS,
      getRowId: (r) => r.id,
      apiRef,
      tableHeight: 240,
    }),
  );
}
