import { useMemo, useState } from 'react';
import {
  DataGrid,
  type ColumnDef,
  type UITableController,
} from 'persian-data-grid';
import { GridPresencePanel } from 'persian-data-grid/presence';
import { InMemoryPresenceHub } from 'persian-data-grid/headless';
import 'persian-data-grid/styles.css';
import { SAMPLE_LINES, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', editable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', editable: true },
  { field: 'price', headerName: 'Price', type: 'price', editable: true },
];

/**
 * Presence demo (PR-139): two logical clients share an InMemoryPresenceHub.
 * Focus a cell on either grid to see the other peer's cursor in the panel.
 */
export default function PresencePeersExample() {
  const hub = useMemo(() => new InMemoryPresenceHub(), []);
  const [rowsA, setRowsA] = useState(SAMPLE_LINES);
  const [rowsB, setRowsB] = useState(SAMPLE_LINES);
  const [controllerA, setControllerA] = useState<UITableController | null>(
    null,
  );
  const [controllerB, setControllerB] = useState<UITableController | null>(
    null,
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Client A</strong>
        {controllerA ? <GridPresencePanel controller={controllerA} /> : null}
        <DataGrid<Line>
          rowData={rowsA}
          columnDefs={columns}
          getRowId={(r) => r.id}
          store="examples-gallery"
          tableKey="presence-a"
          actor={{ userId: 'alice', roles: ['admin'] }}
          presenceLabel="Alice"
          presenceTransport={hub.transportFor('A')}
          onReady={(c) => setControllerA(c)}
          onCellValueChanged={(e) => {
            if (!e.data) return;
            setRowsA((prev) =>
              prev.map((r) => (r.id === e.data!.id ? e.data! : r)),
            );
          }}
          tableHeight={220}
        />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Client B</strong>
        {controllerB ? <GridPresencePanel controller={controllerB} /> : null}
        <DataGrid<Line>
          rowData={rowsB}
          columnDefs={columns}
          getRowId={(r) => r.id}
          store="examples-gallery"
          tableKey="presence-b"
          actor={{ userId: 'bob', roles: ['admin'] }}
          presenceLabel="Bob"
          presenceTransport={hub.transportFor('B')}
          onReady={(c) => setControllerB(c)}
          onCellValueChanged={(e) => {
            if (!e.data) return;
            setRowsB((prev) =>
              prev.map((r) => (r.id === e.data!.id ? e.data! : r)),
            );
          }}
          tableHeight={220}
        />
      </div>
    </div>
  );
}
