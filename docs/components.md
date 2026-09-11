# Components & surfaces

Published React surface is the ERP table chrome used in the host app.

## `ERPTable`

Drop-in React table. Same props as the ERP host (`voucherTemplate`, cheque pages, inventory voucher, bank withdrawal):

`actor`, `store`, `tableKey`, `rows`, `columns`, `recordPerPage`, `tableHeight`, `tableTitle`, `activeCollection`, `onReady`, optional `multiSelectConfig` / `footer` / `header` / `moreDetailComponent`.

Default desktop chrome: paginated body + toolbar (add/copy/cut/paste/delete/excel/search) + numeric footer. CSS tokens match ERP Tailwind (`gray-gray3`, zebra `blue-blue11`, row height **40px** / D12).

Default `remoteApi` is **`NoopRemoteApi`** (no fetch). The arianERP host should pass `remoteApi={new FetchRemoteApi()}` — [`host-arian-erp.md`](./host-arian-erp.md) (`_auth`, `persist:arianERP`, `Defaults`).

Custom cells: [`cell-components.md`](./cell-components.md) (`columns[].render`, `components`, `textArea`).

Desktop column resize: drag the header edge. Width stays in the session (`columnWidths`); it is not persisted. Mobile has no handle.

The `index` column is pinned on horizontal scroll (D10: only `index`).

Column reorder: drag a desktop header cell (`COLUMN_REORDERED`). The pinned `index` column does not move. Keyboard reorder is Phase 12.

The product `<table>` is `role="grid"` with `columnheader` / `gridcell` and 1-based `aria-colindex` / `aria-rowindex`. Virtual rows use the absolute collection index, not the mounted window. The active cell is `aria-selected`; row checkboxes have `aria-label`. Toolbar icons have `aria-label` from `messages` and a visible focus ring. This is an AT baseline, not a WCAG claim.

## `createERPTable`

Composition root. Returns `engine`, `controller`, `session`, `eventStore`, `changelogProjection`, `historyPanelViewModel`, `cellUndoStack`, `pluginHost`, column maps.

Key config: `store`, `tableKey`, `actor`, `columns`, `rows`, optional `eventStore`, `plugins`, `remoteApi`.

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
