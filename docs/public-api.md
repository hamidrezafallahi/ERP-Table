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
import { ERPTable } from 'persian-data-grid';

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
  multiSelectConfig={multiSelectConfig}
  onReady={setController}
/>
```

Published entry: `publish/entry.ts` (built by tsup). CSS is injected (range-picker pattern). Optional `import 'persian-data-grid/styles.css'` if the bundler strips injected styles.

Guards: `npm run typecheck:publish` and `npm run typecheck:host-ui`.

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
| `SnapshotStrategy` / `InMemorySnapshotStore` | class | Periodic aggregate snapshots |
| `EVENT_CATALOG` | const | Plugin-friendly event tokens |
| `ExcelExportPlugin` / `PdfExportPlugin` | class | Export plugins on `EXPORT_REQUESTED` |
| `PluginHost` | class | Register plugins + `requestExport` |
| `TableEngine` | class | Low-level engine (prefer `session`) |
| `ERPTable` / `CellRenderer` | UI | React surfaces (host may wrap) |

## Event stores

```ts
import { IndexedDbEventStore, InMemoryEventStore } from 'persian-data-grid';

const memory = new InMemoryEventStore();
const durable = IndexedDbEventStore.inMemory(); // tests
// const browser = await IndexedDbEventStore.open('erp-table-events');
```

Pass a custom store via bootstrap when host wiring supports it (see `CreateERPTableConfig.eventStore` when provided).

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
