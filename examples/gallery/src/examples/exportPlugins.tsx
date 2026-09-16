import { useRef, useState } from 'react';
import {
  DataGrid,
  type ColumnDef,
  type GridApi,
} from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item' },
  { field: 'qty', headerName: 'Qty', type: 'number' },
  { field: 'price', headerName: 'Price', type: 'price' },
  { field: 'category', headerName: 'Category' },
];

/** 10 — Excel via GridApi; CSV via ./plugins/csv (PDF uses the same subpath pattern). */
export default function ExportPluginsExample() {
  const [rows] = useState(SAMPLE_LINES);
  const apiRef = useRef<GridApi<Line> | null>(null);
  const [status, setStatus] = useState('Ready');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            void apiRef.current?.exportDataAsExcel().then(
              () => setStatus('Excel export started'),
              () => setStatus('Excel export failed (register Excel plugin in host)'),
            );
          }}
        >
          Excel
        </button>
        <button
          type="button"
          onClick={async () => {
            const { buildCsvText } = await import('persian-data-grid/plugins/csv');
            const text = buildCsvText({
              columns: [
                { fieldName: 'item', fieldCaption: 'Item' },
                { fieldName: 'qty', fieldCaption: 'Qty' },
                { fieldName: 'price', fieldCaption: 'Price' },
                { fieldName: 'category', fieldCaption: 'Category' },
              ],
              rows: rows.map((r, i) => ({
                id: i + 1,
                rowState: 'Active',
                cells: {
                  item: { value: r.item },
                  qty: { value: r.qty },
                  price: { value: r.price },
                  category: { value: r.category },
                },
              })),
            });
            const blob = new Blob([`\uFEFF${text}`], {
              type: 'text/csv;charset=utf-8',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lines.csv';
            a.click();
            URL.revokeObjectURL(url);
            setStatus('CSV downloaded');
          }}
        >
          CSV
        </button>
        <span style={{ opacity: 0.7 }}>{status}</span>
      </div>
      <DataGrid<Line>
        rowData={rows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        apiRef={apiRef}
        tableHeight={280}
      />
    </div>
  );
}
