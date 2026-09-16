import { createElement, useMemo, useState } from 'react';
import { BASE_COLUMNS, DataGrid, type DemoRow } from './shared';

function makeRows(n: number): DemoRow[] {
  const cats = ['Parts', 'Labor', 'Freight'];
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    item: `Item ${i + 1}`,
    qty: (i % 20) + 1,
    price: ((i * 137) % 900) * 1000,
    category: cats[i % cats.length]!,
    date: '1404-01-01',
  }));
}

export default function VirtualizationGrid() {
  const rows = useMemo(() => makeRows(500), []);
  const [data] = useState(rows);
  return createElement(DataGrid<DemoRow>, {
    rowData: data,
    columnDefs: BASE_COLUMNS,
    getRowId: (r) => r.id,
    tableHeight: 280,
  });
}
