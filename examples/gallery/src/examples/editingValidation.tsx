import { useState } from 'react';
import { DataGrid, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', editable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', editable: true },
  { field: 'price', headerName: 'Price', type: 'price', editable: true },
];

/** 03 — Cell edit with host-side validation (qty must be ≥ 1). */
export default function EditingValidationExample() {
  const [rows, setRows] = useState(SAMPLE_LINES);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error ? <p style={{ color: '#b91c1c', margin: '0 0 8px' }}>{error}</p> : null}
      <DataGrid<Line>
        rowData={rows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        onCellValueChanged={(e) => {
          if (!e.data) return;
          if (e.colId === 'qty' && Number(e.newValue) < 1) {
            setError('Qty must be ≥ 1 — change reverted');
            setRows((prev) => [...prev]);
            return;
          }
          setError(null);
          setRows((prev) => prev.map((r) => (r.id === e.data!.id ? e.data! : r)));
        }}
        tableHeight={320}
      />
    </div>
  );
}
