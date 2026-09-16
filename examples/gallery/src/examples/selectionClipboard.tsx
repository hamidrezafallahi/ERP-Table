import { useState } from 'react';
import { DataGrid, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', editable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', editable: true },
  { field: 'price', headerName: 'Price', type: 'price', editable: true },
  { field: 'category', headerName: 'Category' },
];

/** 04 — Range selection + Ctrl+C/V clipboard. */
export default function SelectionClipboardExample() {
  const [rows, setRows] = useState(SAMPLE_LINES);
  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.75 }}>
        Select a range, then Ctrl+C / Ctrl+V (Alt+* still works as deprecated aliases).
      </p>
      <DataGrid<Line>
        rowData={rows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        copyHeadersToClipboard
        pasteAddsRows
        onCellValueChanged={(e) => {
          if (!e.data) return;
          setRows((prev) => prev.map((r) => (r.id === e.data!.id ? e.data! : r)));
        }}
        tableHeight={320}
      />
    </div>
  );
}
