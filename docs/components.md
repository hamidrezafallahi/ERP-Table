# Components & surfaces

Published React surface is intentionally small. Host `ERPTable` / `CellRenderer` stay in the monorepo.

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

`ERPTable`, `useERPTable`, `CellRenderer`, desktop/mobile chrome — require ERP host shims (`types/host-shims.d.ts`). Use the monorepo `index.ts` barrel when embedding in the ERP app.
