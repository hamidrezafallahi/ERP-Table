import { useMemo, useState } from 'react';
import {
  DataGrid,
  GridOfflineStatus,
  type ColumnDef,
  type UITableController,
} from 'persian-data-grid';
import { GridSyncPanel } from 'persian-data-grid/sync';
import { InMemorySyncHub } from 'persian-data-grid/headless';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', editable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', editable: true },
  { field: 'price', headerName: 'Price', type: 'price', editable: true },
];

/**
 * SyncPort demo (PR-138): shared InMemorySyncHub + policy UI.
 * Two logical clients share one hub; Sync panel pushes/pulls and resolves conflicts.
 */
export default function SyncConflictsExample() {
  const hub = useMemo(() => new InMemorySyncHub(), []);
  const [rows, setRows] = useState(SAMPLE_LINES);
  const [controller, setController] = useState<UITableController | null>(null);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {controller ? (
        <>
          <GridOfflineStatus controller={controller} />
          <GridSyncPanel controller={controller} />
        </>
      ) : null}
      <DataGrid<Line>
        rowData={rows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        store="examples-gallery"
        tableKey="sync-demo"
        actor={{ userId: 'demo', roles: ['admin'] }}
        syncTransport={hub.transportFor('gallery-client')}
        syncConflictPolicy="manual"
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
