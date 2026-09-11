# Public API

Library entry for consumers: package root built from `publish/entry.ts`.

**Display name:** Persian Data Grid · **npm:** `persian-data-grid`

## Local development modes

Inspired by the Persian range-picker demo layout (`InitialComponent` / `DemoComponent`):

| Script | `VITE_APP_MODE` | UI |
|--------|-----------------|-----|
| `npm run dev:docs` | `docs` | Landing / live grid (`demo/src/InitialComponent.tsx`) |
| `npm run dev` / `dev:playground` | `dev` | QA playground (`demo/src/DemoComponent.tsx`) + live ERPTable |
| `npm run build:demo` | — | GitHub Pages bundle (`demo/dist`) |

The `demo/` Vite app is excluded from tsup publish (`files` still ships `docs/`).

## Composition

```tsx
import { ERPTable, FetchRemoteApi, themeErp } from 'persian-data-grid';

<ERPTable
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columnConfig}
  rows={rows}
  tableHeight={tableHeight}
  recordPerPage={recordsPerPage}
  tableTitle={tableTitle}
  activeCollection={activeCollection}
  remoteApi={new FetchRemoteApi()}
  theme={themeErp.withParams({ accentColor: '#1d4ed8' })}
  onReady={setController}
/>
```

Default `remoteApi` is **`NoopRemoteApi`** (no fetch, no ERP cookies). The arianERP host must inject `FetchRemoteApi` (or a custom adapter) for dynamic select / `resolveOn`. Cookie `_auth`, `persist:arianERP`, and POST `Defaults`: [`host-arian-erp.md`](./host-arian-erp.md).

`multiSelectConfig` is **optional**. Omit it to hide the choose-from-list button and modal. Pass it when the voucher needs that picker.

Published entry: `publish/entry.ts` (built by tsup). CSS is injected (range-picker pattern). Optional `import 'persian-data-grid/styles.css'` if the bundler strips injected styles.

Theming: `theme?: GridTheme` defaults to `themeErp` (rowHeight **40**). CSS `.erp-table { --erp-accent: ... }` still works. `themeToggle` (default `true`) shows a light/dark button in product chrome (`GroupActionButtons` / `MobileActionButtons`). Passing a **custom** theme (`withParams` that is not stock light/dark) **locks** that toggle. `themeErpDark` is the stock dark theme. Portal overlays (select, modal, tooltip, toast, search) copy `toCssVars()` so they inherit outside `.erp-table`.

Guards: `npm run typecheck:publish` and `npm run typecheck:host-ui`.

Honest gap list (dead commands, stubs, exported-but-unwired types): [`docs/public-api-honesty.md`](./public-api-honesty.md).

Register or replace a cell editor without reading `CellRenderer`: [`cell-components.md`](./cell-components.md).

## Plugins (Excel / PDF)

```ts
import {
  createERPTable,
  ExcelExportPlugin,
  PdfExportPlugin,
} from 'persian-data-grid';

const grid = await createERPTable({
  /* ... */
  plugins: [
    new ExcelExportPlugin({ download: true }),
    new PdfExportPlugin({ download: true }),
  ],
});

await grid.pluginHost.requestExport({ format: 'xlsx' });
await grid.pluginHost.requestExport({ format: 'pdf' });
```

- Events live on the **view stream** (`EXPORT_REQUESTED`, `XLSX_EXPORT_*`, `PDF_EXPORT_*`).
- Domain aggregates are never mutated by plugins.
- Imperative toolbar path still works: `exportActiveCollectionToExcel(controller)`.

## Build

```bash
npm run build        # tsup → dist/index.js + index.cjs + index.d.ts
npm run verify:dist  # guards against stub regression
npm test
```

## Primary exports

| Export | Kind | Purpose |
|--------|------|---------|
| `createERPTable` | function | Composition root |
| `VirtualList` / `useVirtualWindow` | React | Adapter virtual scroll on Core viewport |
| `buildVirtualWindow` | function | Pure window helper (no DOM) |
| `CreateERPTableConfig` / `CreateERPTableResult` | types | Bootstrap contract |
| `GridSession` / `ViewIntent` | types | Session-centric adapter API |
| `ColumnDefinition` / `ColumnViewBinding` | types | Core column + view bindings |
| `mapColumnSchemas` | function | Host ColumnSchema → definition + bindings |
| `InMemoryEventStore` | class | Node/test event store |
| `IndexedDbEventStore` | class | Browser-durable event store |
| `SnapshotStrategy` / `InMemorySnapshotStore` | class | Opt-in aggregate snapshots via `snapshotStore` |
| `EVENT_CATALOG` | const | Plugin-friendly event tokens |
| `ExcelExportPlugin` / `PdfExportPlugin` | class | Export plugins on `EXPORT_REQUESTED` |
| `PluginHost` | class | Register plugins + `requestExport` |
| `NoopRemoteApi` / `FetchRemoteApi` | class | Default remote is Noop; ERP injects Fetch |
| `ERPTable` / `CellRenderer` / `CellRenderContext` / `CellComponentMap` | UI | React surfaces. `columns[].render` then `components[fieldType]`, then FieldType switch. |
| `GridTheme` / `themeErp` / `themeErpDark` | theme | `ERPTable theme={...}` writes `--erp-*` on the root. Stock light/dark toggle lives in product chrome. |

## Event stores

```ts
import { IndexedDbEventStore, InMemoryEventStore } from 'persian-data-grid';

const memory = new InMemoryEventStore();
const durable = IndexedDbEventStore.inMemory(); // tests
// const browser = await IndexedDbEventStore.open('erp-table-events');
```

Pass a custom store via bootstrap when host wiring supports it (see `CreateERPTableConfig.eventStore` when provided).

## Snapshots (opt-in)

Default bootstrap is **dual-write to the table repository**. Snapshots are off unless you pass `snapshotStore`.

```ts
import {
  createERPTable,
  InMemoryEventStore,
  InMemorySnapshotStore,
} from 'persian-data-grid';

const eventStore = new InMemoryEventStore();
const snapshotStore = new InMemorySnapshotStore();

const grid = await createERPTable({
  /* ... */
  eventStore,
  snapshotStore,
  snapshotEveryNEvents: 200, // default
});

await grid.snapshotStrategy?.loadWithCatchUp(`table:${grid.tableKey}`);
```

- No `snapshotStore` → `snapshotStrategy` is `undefined`; repository dual-write unchanged.
- With `snapshotStore` → `SnapshotStrategy` snapshots every N appended events and `createERPTable` runs catch-up (`last snapshot + events after version`).

## Stability

- Event type strings in `EVENT_CATALOG` are semver-stable.
- Prefer `GridSession` over reaching into `TableEngine` from host apps.

## Desktop virtualization (default **off**)

```tsx
{/* ERP default: pagination chrome */}
<ERPTable tableHeight={480} />

{/* Opt-in virtual scroll */}
<ERPTable virtualization tableHeight={480} />
```

- Default is classic pagination (`ERPTableBody` + `ERPTablePagination`) to match ERP pages.
- Pass `virtualization` / `virtualization={true}` for `ERPTableVirtualBody`.
- Core helper: `controller.getAllUIRows()` (full active collection, no page slice).
- Grid search / validation error navigation uses `revealRow`: virtual → `CHANGE_VIEWPORT`, else → `CHANGE_PAGE`.
- Domain types must not import React.

## Custom cell `render` (PR-54)

```tsx
<ERPTable
  columns={[
    {
      fieldName: 'side',
      fieldCaption: 'طرف',
      fieldType: 'static',
      visibility: { kind: 'always' },
      render: (ctx) => <span data-erp-custom-cell="side">{String(ctx.value ?? '')}</span>,
    },
  ]}
/>
```

`CellRenderer` (desktop + mobile) calls `columns[].render` **before** the FieldType switch. Omit it to keep built-in editors. `returnDisplayValue` is still the engine display formatter, not a React renderer.

## Cell `components` map (PR-55)

```tsx
<ERPTable
  components={{
    checkbox: (ctx) => (
      <input
        type="checkbox"
        checked={ctx.value === true}
        onChange={(e) => ctx.dispatchChangeValue(e.target.checked)}
      />
    ),
  }}
/>
```

`ERPTableProps.components` is a `Partial<Record<FieldType, CellComponent>>` plus free string keys. Registry lives on host context. Lookup order: column `render` → `components[fieldType]` → built-in switch. Other FieldTypes stay untouched when you only override `checkbox`.

`textArea` is a real `FieldType`. The editor lives in `TextAreaCell` and is registered in `DEFAULT_CELL_COMPONENTS` — not as a `switch` case in `CellRenderer`. Enter inside the textarea inserts a newline (grid navigation is skipped). Tab still moves to the next cell.

Host guide (override, one-off `render`, new type, keyboard): [`cell-components.md`](./cell-components.md).

## Column resize (PR-58)

Drag the trailing edge of a desktop header cell. Width is stored in session view state (`columnWidths`) for this table instance — **not** EventStore. `columns[].minWidth` is the floor (default 144px; index column 168px). Mobile has no resize handle.

Honesty inventory: [`public-api-honesty.md`](./public-api-honesty.md).

## Index column pin (PR-59)

The `index` column stays on the inline-start edge while the rest of the grid scrolls horizontally (`position: sticky`). This is always on for that column — **D10: no pin for arbitrary columns**, and no `pinnedColumns` prop. Works with pagination and desktop virtualization (spacer rows keep one cell per column).

## Column reorder (PR-61)

Drag a desktop header cell (not the pinned `index` column, not the resize handle). `COLUMN_REORDERED` calls `Table.reorderColumns` through AppService (dual-write to EventStore) using display-order indices. Host schema refresh (`setColumns`) keeps the domain `order` unless the column is new. Keyboard reorder is Phase 12.

## Accessibility baseline (PR-62)

Desktop and mobile `ERPTable` chrome expose `role="grid"` on the `<table>`, with `role="row"` / `columnheader` / `gridcell`, plus `aria-colcount` / `aria-rowcount`. `aria-colindex` and `aria-rowindex` are 1-based (header is row 1). Virtualized bodies use the absolute collection index, not the DOM window offset. Active-cell `aria-selected` is PR-63. This is not a WCAG-complete claim.


