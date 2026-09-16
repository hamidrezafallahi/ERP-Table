import { createElement, useState } from 'react';
import {
  DataGrid,
  type CellRenderContext,
  type ColumnDef,
} from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

function BadgeCell(ctx: CellRenderContext) {
  const value = String(ctx.value ?? '');
  return createElement(
    'span',
    {
      style: {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        background: value === 'Parts' ? '#ccfbf1' : '#e0e7ff',
        fontSize: 12,
      },
    },
    value,
  );
}

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item' },
  {
    field: 'category',
    headerName: 'Category',
    cellRenderer: (ctx) => BadgeCell(ctx as CellRenderContext),
  },
  { field: 'price', headerName: 'Price', type: 'price' },
];

/** 09 — Custom cell via ColumnDef.cellRenderer. */
export default function CustomCellExample() {
  const [rows] = useState(SAMPLE_LINES);
  return (
    <DataGrid<Line>
      rowData={rows}
      columnDefs={columns}
      getRowId={(r) => r.id}
      tableHeight={320}
    />
  );
}
