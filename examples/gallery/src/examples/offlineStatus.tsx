import { useState } from 'react';
import {
  DataGrid,
  GridOfflineStatus,
  type ColumnDef,
  type UITableController,
} from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', editable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', editable: true },
  { field: 'price', headerName: 'Price', type: 'price', editable: true },
];

/**
 * Offline-first status (PR-137): online/offline badge + pending mutation queue.
 * Edits dual-write to IndexedDB; remount recovers from the same store key.
 */
export default function OfflineStatusExample() {
  const [rows, setRows] = useState(SAMPLE_LINES);
  const [controller, setController] = useState<UITableController | null>(null);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {controller ? <GridOfflineStatus controller={controller} /> : null}
      <DataGrid<Line>
        rowData={rows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        store="examples-gallery"
        tableKey="offline-demo"
        actor={{ userId: 'demo', roles: ['admin'] }}
        onReady={(c) => setController(c)}
        onCellValueChanged={(e) => {
          if (!e.data) return;
          setRows((prev) =>
            prev.map((r) => (r.id === e.data!.id ? e.data! : r)),
          );
        }}
        tableHeight={280}
      />
    </div>
  );
}
