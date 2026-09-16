# Getting started

Install:

```bash
npm i persian-data-grid
```

Peer: `react` / `react-dom` `>=17`.

## 60-second path

```tsx
import { DataGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

type Invoice = { id: string; title: string; amount: number; date: string };

const invoices: Invoice[] = [
  { id: '1', title: 'کابل', amount: 120_000, date: '1404-01-15' },
];

function save(_row: Invoice | undefined) {}

export function InvoiceLines() {
  return (
    <DataGrid<Invoice>
      rowData={invoices}
      columnDefs={[
        { field: 'title', headerName: 'شرح' },
        { field: 'amount', type: 'price' },
        { field: 'date', type: 'date' },
      ]}
      onCellValueChanged={(e) => save(e.data)}
    />
  );
}
```

No `store` / `actor` / `tableKey`: the grid is in-memory and IndexedDB is not opened (`no `store` means in-memory`). Styles are **opt-in**: import `persian-data-grid/styles.css`, or call `injectGridStyles()` if the host has no CSS bundler. Without either, the grid is unstyled.

`TRow` is inferred from `rowData` if you omit `<Invoice>`. `columnDefs[].field`, `onCellValueChanged` `data`, `apiRef`, and `getRowId` all carry the same row type.

`ERPTable` is a deprecated alias of `DataGrid` and stays generic for one version.

## Headless `createGrid`

```ts
import { createGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

const grid = createGrid({
  columnDefs: [
    { field: 'item', headerName: 'Item', type: 'text' },
  ],
  rowData: [{ item: 'SKU-1' }],
});
await grid.ready;

grid.session.getSnapShot('active');
```

`createGrid()` is **sync** (D24 / PR-84). Await `grid.ready` before using `engine` / `controller` / `session`. The deprecated alias `await createERPTable(cfg)` is the same as `await createGrid(cfg).ready`.

Durable IndexedDB still needs `store` (and usually `tableKey` / `actor`):

```ts
const grid = createGrid({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columns: [
    {
      fieldName: 'item',
      fieldCaption: 'Item',
      fieldType: 'text',
      fieldCollection: 'default',
      visibility: { kind: 'always' },
    },
  ],
  rows: [{ id: 1, collection: 'default', values: { item: 'SKU-1' } }],
});
await grid.ready;
```

Default `remoteApi` is `NoopRemoteApi`. For arianERP (`_auth`, `persist:arianERP`, `Defaults`), inject `FetchRemoteApi` from `persian-data-grid/adapters/arian-erp` — [`host-arian-erp.md`](../examples/host-arian-erp/host-arian-erp.md).

Date cells use `react-persian-range-picker`.

## ColumnDef, rowData, events, apiRef

`ColumnDef<TRow>` is the generic column type (`field` / `headerName` / `valueGetter`). `rowData` + `columnDefs` feed the grid without building `RowInput`. `getRowId` defaults to the array index — pass a stable key when you have one. Domain rows keep the original object (`row.data`) so `valueGetter` works. Changing one item in `rowData` updates that row only.

`columns` / `rows` still work. `store` / `tableKey` / `actor` are optional (PR-83). Headless hosts should call `createGrid` (not `await createERPTable`) so the instance exists before hydrate finishes.

React callbacks (PR-85) are derived from `EVENT_CATALOG` — do not subscribe to a second bus:

```tsx
import { DataGrid, type ColumnDef } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

type Line = { id: number; name: string; price: number };

const columnDefs: ColumnDef<Line>[] = [
  { field: 'name', headerName: 'Name', type: 'text' },
  { field: 'price', headerName: 'Price', type: 'price' },
];

<DataGrid
  columnDefs={columnDefs}
  rowData={lines}
  getRowId={(row) => String(row.id)}
  onCellValueChanged={({ oldValue, newValue, colId, rowId, data }) => {
    saveLine(data);
  }}
  onSelectionChanged={({ selectedRows }) => setSelected(selectedRows)}
  onGridReady={({ api }) => {
    api.getRowNode('1');
  }}
/>
```

You can still convert with `toColumnSchema` / `toColumnDef` when talking to the ERP `ColumnSchema` path.

`apiRef` / `onGridReady({ api })` expose `GridApi` (PR-86): `getRowNode`, `setRowData`, `refreshCells`, `getSelectedRows`, `deselectAll`, `startEditingCell`, `stopEditing`, `exportDataAsExcel`, `undo`, `redo`, `getColumnState`, `applyColumnState`. `onReady(controller)` still receives `UITableController` for one version.

```tsx
import { useRef } from 'react';
import { DataGrid, type GridApi } from 'persian-data-grid';

const apiRef = useRef<GridApi<Line> | null>(null);
<DataGrid apiRef={apiRef} columnDefs={columnDefs} rowData={lines} />
```

## Local demo (this repo)

Same presentation pattern as the Persian range-picker library: landing (`InitialComponent`) + QA playground (`DemoComponent`). The published surface on the landing is the live **grid**.

| Script | Mode | UI |
|--------|------|----|
| `npm run dev:docs` | `VITE_APP_MODE=docs` | Landing / live grid docs |
| `npm run dev` | `VITE_APP_MODE=dev` | QA playground (`DemoComponent`) |
| `npm run build:demo` | — | Static site → `demo/dist` (GitHub Pages) |

Demo: https://hamidrezafallahi.github.io/ERP-Table/

Demo app lives under `demo/` and is **not** part of the published tsup bundle.

## Sort (core)

`applySort(rowIds, sortModel, accessor)` is a pure engine function (PR-89): multi-sort, stable, nulls last, Persian collation, jalali date keys, optional `ColumnDef.comparator`, `index` as the last tie-breaker.

Session command `SET_SORT_MODEL` / `UI_SET_SORT_MODEL` (PR-90) stores `sortModel` on view state and rebuilds `SparseRowIndex`. Empty model ⇒ document `index` order. Editing a cell rebuilds the index only when that column is in the sort model (or is `index`).

Desktop header clicks (PR-91): asc → desc → none; `Shift+Click` for multi-sort with a priority badge; `aria-sort` on `<th>`; `sortable: false` and the `index` column are skipped; movement ≥ 5px (or a column drag) does not change sort. `api.getSortModel()` / `api.setSortModel(...)` mirror the session model.

## Filter (core)

`applyFilter(rowIds, filterModel, accessor)` is a pure engine function (PR-92): text / number / date / set / boolean / `customFilter`, column-level AND/OR, Persian/Arabic digit and ي/ك normalization. Empty model keeps all rows.

Session `SET_FILTER_MODEL` / `api.setFilterModel` (PR-94) stores `filterModel` on view state and rebuilds the UI row index (before quick filter, before sort). Header filter icon opens a themed portal popover; optional `floatingFilter` row under the header; `data-pdg-filter-active` marks filtered columns. Custom popovers: `filterComponents` + `ColumnDef.filter` (PR-95) — see [cell-components.md](./cell-components.md).

For remote pages, set `rowModelType: 'infinite'` (or `'serverSide'`) and pass a `datasource` with `getRows` (PR-96). Local sort/filter are skipped; the host applies them on the server. Block cache (PR-102): `cacheBlockSize`, `maxBlocksInCache`, and `api.refreshServerSide()`. Overlays (PR-103): `loading`, optional `loadingOverlayComponent` / `noRowsOverlayComponent`; infinite placeholders render as skeleton rows.

Desktop row virtualization is **on by default** (PR-97). Pass `virtualization={false}` if you need classic pagination chrome. Wide tables also virtualize columns horizontally (PR-98) — no extra prop.

## Quick filter vs grid search

`quickFilterText` (PR-93) **removes** non-matching rows from `getAllUIRows` / pagination. Session command `SET_QUICK_FILTER_TEXT`, prop `quickFilterText`, or `api.setQuickFilter(text)`. Uses a per-row text index so typing does not re-walk every cell.

`GridSearchPanel` is **find and navigate** only: it marks matches and moves focus; it does **not** hide rows.

## Row grouping

`groupBy` (PR-120) nests leaf rows under synthetic group rows in the flat UI index (virtualization-safe). Only the first column is active in 0.12.0; pass `string[]` for forward compatibility. Session-only (`SET_ROW_GROUP_COLUMNS` / `api.setRowGroupColumns`) — not EventStore. `groupDefaultExpanded` (default `true`) and `api.toggleRowGroup(key)` control expand/collapse. Group cells show the key on the group column and `aggFunc` values on aggregate columns. Chevron / `aria-expanded` / ArrowLeft·Right toggle are PR-121.

## Next

- [public-api.md](./public-api.md) — exports & publish
- [cell-components.md](./cell-components.md) — register a cell editor without reading CellRenderer
- [host-arian-erp.md](../examples/host-arian-erp/host-arian-erp.md) — arianERP `FetchRemoteApi` (`_auth`, persist, Defaults)
- [components.md](./components.md) — VirtualList / session / plugins
- [event-catalog.md](./event-catalog.md) — stable event tokens
- [demo-playground-report.md](./demo-playground-report.md) — playground QA features (DnD, search, pagination, Jalali mask)
- [agent-handoff.md](./agent-handoff.md) — ایجنت: فاز باز و گزارش کار (`EXECUTION_PLAN.md` / `WORKLOG.md`)
