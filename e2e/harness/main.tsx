import { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DataGrid,
  themeDark,
  themeDefault,
  type ColumnDef,
  type GridApi,
} from 'persian-data-grid';
import { ExcelExportPlugin } from 'persian-data-grid/plugins/excel';
import 'persian-data-grid/styles.css';

export type Line = {
  id: string;
  item: string;
  qty: number;
  price: number;
  category: string;
};

function makeRows(n: number): Line[] {
  const cats = ['Parts', 'Labor', 'Freight'];
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    item: `Item ${i + 1}`,
    qty: (i % 20) + 1,
    price: ((i * 137) % 900) * 1000,
    category: cats[i % cats.length]!,
  }));
}

const params = new URLSearchParams(window.location.search);
const scenario = params.get('scenario') ?? 'basic';
const locale = (params.get('locale') ?? 'en') as 'en' | 'fa';
const themeName = params.get('theme') ?? 'light';
const rowCount = Number(params.get('rows') ?? '20');

const baseColumns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', editable: true, sortable: true, filter: 'text' },
  { field: 'qty', headerName: 'Qty', type: 'number', editable: true, sortable: true, filter: 'number' },
  { field: 'price', headerName: 'Price', type: 'price', editable: true, sortable: true, filter: 'number' },
  { field: 'category', headerName: 'Category', sortable: true, filter: 'text' },
];

function HarnessApp() {
  const seed = useMemo(() => makeRows(Math.max(1, rowCount)), []);
  const [rows, setRows] = useState(seed);
  const apiRef = useRef<GridApi<Line> | null>(null);
  const [status, setStatus] = useState('ready');

  const theme = themeName === 'dark' ? themeDark : themeDefault;
  const direction = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <div data-e2e-harness data-e2e-scenario={scenario} style={{ padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          data-e2e="undo"
          onClick={() => {
            void apiRef.current?.undo().then((ok) => setStatus(ok ? 'undone' : 'undo-empty'));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          data-e2e="export-excel"
          onClick={() => {
            void apiRef.current?.exportDataAsExcel().then(
              () => setStatus('excel-ok'),
              () => setStatus('excel-fail'),
            );
          }}
        >
          Export Excel
        </button>
        <span data-e2e="status">{status}</span>
      </div>
      <DataGrid<Line>
        rowData={rows}
        columnDefs={baseColumns}
        getRowId={(r) => r.id}
        apiRef={apiRef}
        locale={locale}
        direction={direction}
        theme={theme}
        themeToggle={false}
        floatingFilter={scenario === 'sort-filter'}
        plugins={[new ExcelExportPlugin({ download: true })]}
        tableHeight={scenario === 'scroll-100k' ? 420 : 360}
        onCellValueChanged={(e) => {
          setStatus(`edited:${e.colId}:${String(e.newValue)}`);
        }}
        onReady={(controller) => {
          (
            window as unknown as {
              __pdgController?: {
                dispatch: (cmd: unknown) => Promise<unknown> | unknown;
                startCellEdit: (rowId: number, colId: string) => void;
                commitCellEdit: () => Promise<void>;
                getEditDraft: (rowId: number, colId: string) => unknown;
              };
            }
          ).__pdgController = controller;
        }}
        onGridReady={({ api }) => {
          (
            window as unknown as { __pdgApi?: GridApi<Line> }
          ).__pdgApi = api;
          (
            window as unknown as {
              __pdgTest?: {
                editAndCommit: (
                  rowId: string,
                  colId: string,
                  value: string,
                ) => Promise<Record<string, unknown>>;
                pasteText: (text: string) => Promise<void>;
              };
            }
          ).__pdgTest = {
            async editAndCommit(rowId, colId, value) {
              const node = api.getRowNode(rowId);
              const controller = (
                window as unknown as {
                  __pdgController?: {
                    dispatch: (cmd: unknown) => Promise<unknown> | unknown;
                    startCellEdit: (rowId: number, colId: string) => void;
                    commitCellEdit: () => Promise<void>;
                    getEditDraft: (rowId: number, colId: string) => unknown;
                  };
                }
              ).__pdgController;
              if (!node || !controller) {
                return { ok: false, reason: 'missing-node-or-controller' };
              }
              await controller.dispatch({
                type: 'UI_ACTIVE_CELL',
                rowId: node.rowId,
                columnId: colId,
              });
              controller.startCellEdit(node.rowId, colId);
              await controller.dispatch({
                type: 'UI_CELL_CHANGE',
                rowId: node.rowId,
                columnId: colId,
                value,
              });
              const draft = controller.getEditDraft(node.rowId, colId);
              await controller.commitCellEdit();
              const after = (
                controller as unknown as {
                  getCell: (
                    rowId: number,
                    colId: string,
                  ) => { getValue: () => unknown } | null | undefined;
                }
              ).getCell(node.rowId, colId)?.getValue();
              return { ok: true, rowId: node.rowId, draft, after };
            },
            async pasteText(text) {
              await navigator.clipboard.writeText(text);
              const controller = (
                window as unknown as {
                  __pdgController?: {
                    dispatch: (cmd: unknown) => Promise<unknown> | unknown;
                  };
                }
              ).__pdgController;
              // Prefer keyboard path used by hosts
              window.dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'v',
                  code: 'KeyV',
                  ctrlKey: true,
                  bubbles: true,
                  cancelable: true,
                }),
              );
              void controller;
              await new Promise((r) => setTimeout(r, 100));
            },
          };
          setStatus('grid-ready');
        }}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<HarnessApp />);
