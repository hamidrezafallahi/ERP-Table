# Components & surfaces

Published React surface is the ERP table chrome used in the host app.

## `DataGrid`

Drop-in React table. Same props as the ERP host (`voucherTemplate`, cheque pages, inventory voucher, bank withdrawal). `ERPTable` is a deprecated alias of `DataGrid` (PR-87 / D13).

`actor`, `store`, `tableKey`, `rows`, `columns`, `recordPerPage`, `tableHeight`, `tableTitle`, `activeCollection`, `onReady`, optional `multiSelectConfig` / `footer` / `header` / `moreDetailComponent`.

Default desktop chrome: paginated body + toolbar (add/copy/cut/paste/delete/excel/search) + numeric footer. CSS tokens match ERP Tailwind (`gray-gray3`, zebra `blue-blue11`, row height **40px** / D12).

Default `remoteApi` is **`NoopRemoteApi`** (no fetch). The arianERP host should pass `remoteApi={new FetchRemoteApi()}` from `persian-data-grid/adapters/arian-erp` — [`host-arian-erp.md`](../examples/host-arian-erp/host-arian-erp.md) (`_auth`, `persist:arianERP`, `Defaults`).

Custom cells: [`cell-components.md`](./cell-components.md) (`columns[].render`, `components`, `textArea`).

Desktop column resize: drag the header edge. Width stays in the session (`columnWidths`); it is not persisted. Mobile has no handle.

Set `pinned: 'start' | 'end'` on `ColumnDef` (index is always `start`). RTL: `start` = inline-start (right).

Column reorder: drag a desktop header cell (`COLUMN_REORDERED`). The pinned `index` column does not move. Keyboard reorder is Phase 12.

The product `<table>` is `role="grid"` with `columnheader` / `gridcell` and 1-based `aria-colindex` / `aria-rowindex`. Virtual rows use the absolute collection index, not the mounted window. The active cell is `aria-selected`; row checkboxes have `aria-label`. Toolbar icons have `aria-label` from `messages` and a visible focus ring. This is an AT baseline, not a WCAG claim.

Host React events (PR-85): `onCellValueChanged`, `onRowValueChanged`, `onSelectionChanged`, `onCellFocused`, `onRowDataUpdated`, `onGridReady`. Cell/row callbacks come from `EVENT_CATALOG`; selection/focus from the view store. `onGridReady({ api })` is `GridApi` (PR-86). `onReady(controller)` still works for one version. `apiRef` assigns the same `GridApi`.

## `createGrid`

Sync composition root (D24 / PR-84). Returns immediately with `store`, `tableKey`, and `ready`. Await `grid.ready` before using `engine` / `controller` / `session` / `api`.

Key config: optional `store` / `tableKey` / `actor` (PR-83; omit `store` = in-memory), `columnDefs` + `rowData` or `columns` + `rows`, optional `eventStore`, `plugins`, `remoteApi`.

`createERPTable` is a **deprecated** async alias: `await createERPTable(cfg)` ≡ `await createGrid(cfg).ready`.

## `GridApi`

Imperative host API (PR-86). Same object as `apiRef` / `onGridReady({ api })` / `grid.api`.

| Method | Notes |
|--------|--------|
| `getRowNode` | Host `getRowId` or numeric `rowId` |
| `setRowData` | Diff onto the live table (`applyHostRowData`) |
| `refreshCells` | View-store tick |
| `getSelectedRows` | Host objects (`TRow[]`), not the engine id map |
| `deselectAll` | `CLEAR_ROW_SELECTION` |
| `startEditingCell` / `stopEditing` | Active-cell focus is edit mode |
| `exportDataAsExcel` | `pluginHost.requestExport({ format: 'xlsx' })` |
| `undo` / `redo` | Cell undo stack |
| `getColumnState` / `applyColumnState` | Width + order + **hide** (PR-111). |

The `UITableController` **class** is on `persian-data-grid/headless`. `.` exports the type only, plus `onReady(controller)` for one version.

## `GridSession`

Framework-agnostic facade over the engine:

| Method | Purpose |
|--------|---------|
| `dispatchViewIntent` | Viewport, add row, selection intents |
| `getSnapShot` | Read model rows/cells |
| `subscribe` / `subscribeSelected` | Reactivity |
| `undo` / `redo` / `canUndo` | Cell undo stack |
| `getHistoryItems` / `subscribeHistoryItems` | History panel |
| `getViewport` / `getVisibleRange` | Virtual scroll |

## `VirtualList`

React adapter for Core `ViewportCalculator`.

| Prop | Notes |
|------|--------|
| `session` | `GridSession` |
| `items` | Full list; only visible slice renders |
| `height` | Scrollport px |
| `rowHeight` / `overscan` | Defaults 40 / 2 |
| `renderItem` | `(item, absoluteIndex) => ReactNode` |

Also: `useVirtualWindow`, `buildVirtualWindow` (pure helper).

## Plugins

- `ExcelExportPlugin` — `requestExport({ format: 'xlsx' })`
- `ExcelImportPlugin` — `requestImport({ format: 'xlsx' })`. Product toolbar shows an import button when this plugin is in `ERPTable plugins`.
- `PdfExportPlugin` — `requestExport({ format: 'pdf' })`. Default renderer is legacy `TextPdfRenderer` (PR-76). For Persian PDF use `createVazirmatnPdfExportPlugin` from `persian-data-grid/plugins/pdf/fonts/vazirmatn`. Product toolbar shows a PDF button when this plugin is in `ERPTable plugins`.
- `PluginHost` — register + request export

Events: see [event-catalog.md](./event-catalog.md).

## Host-only (not published)

`useERPGrid` is ERP page glue (Next/Redux/RTK Query) and lives in the host app — see [`examples/host-arian-erp/`](../examples/host-arian-erp/). Import table types from `persian-data-grid` instead of deep `@components/organisms/erp-table/...` paths.
