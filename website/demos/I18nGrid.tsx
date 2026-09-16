import { createElement, useState } from 'react';
import { EN_MESSAGES } from 'persian-data-grid';
import { BASE_COLUMNS, DEMO_ROWS, DataGrid, type DemoRow } from './shared';

export default function I18nGrid() {
  const [rows] = useState<DemoRow[]>(DEMO_ROWS);
  return createElement(DataGrid<DemoRow>, {
    rowData: rows,
    columnDefs: BASE_COLUMNS,
    getRowId: (r) => r.id,
    locale: 'en',
    messages: EN_MESSAGES,
    direction: 'ltr',
    numberingSystem: 'latn',
    tableHeight: 260,
  });
}
