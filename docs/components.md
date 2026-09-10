# Components & surfaces

Published React surface is the ERP table chrome used in the host app.

## `ERPTable`

Drop-in React table. Same props as the ERP host (`voucherTemplate`, cheque pages, inventory voucher, bank withdrawal):

`actor`, `store`, `tableKey`, `rows`, `columns`, `recordPerPage`, `tableHeight`, `tableTitle`, `activeCollection`, `multiSelectConfig`, `onReady`, optional `footer` / `header` / `moreDetailComponent`.

Default desktop chrome: paginated body + toolbar (add/copy/cut/paste/delete/excel/search) + numeric footer. CSS tokens match ERP Tailwind (`gray-gray3`, zebra `blue-blue11`, row height 36px).

Browser `FetchRemoteApi` is the default `remoteApi` (cookie `_auth` + `persist:arianERP`). Host may still inject a custom `RemoteApi`.

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
- `PdfExportPlugin` — `requestExport({ format: 'pdf' })`
- `PluginHost` — register + request export

Events: see [event-catalog.md](./event-catalog.md).

## Host-only (not published)

`useERPGrid` is ERP page glue (Next/Redux/RTK Query) and stays in the host app. Import table types from `persian-data-grid` instead of deep `@components/organisms/erp-table/...` paths.
