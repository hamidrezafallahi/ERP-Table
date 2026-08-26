# Public API

Library entry for consumers: package root built from `publish/entry.ts`.

**Display name:** Event-driven ERP Grid · **npm:** `@fallahi/erp-table`

## Local development modes

Inspired by the Persian range-picker demo layout (`InitialComponent` / `DemoComponent`):

| Script | `VITE_APP_MODE` | UI |
|--------|-----------------|-----|
| `npm run dev:docs` | `docs` | Landing / live docs (`demo/src/InitialComponent.tsx`) |
| `npm run dev` / `dev:playground` | `dev` | QA playground (`demo/src/DemoComponent.tsx`) |

The `demo/` Vite app is excluded from tsup publish (`files` still ships `docs/`).

## Composition

```ts
import { createERPTable, VirtualList } from '@fallahi/erp-table';

const grid = await createERPTable({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columns: [/* ColumnSchema */],
  rows: [/* RowInput */],
  // Host injects real RemoteApi; package default is NoopRemoteApi
  remoteApi: hostRemoteApi,
});
```

Published entry: `publish/entry.ts` (built by tsup with **strict automatic** `dist/index.d.ts`).  
Host monorepo may still import local `index.ts` for `ERPTable` / `CellRenderer` (ERP-specific UI).
Guards: `npm run typecheck:publish` (publish graph) and `npm run typecheck:host-ui` (full UI with host shims in `types/host-shims.d.ts`).

## Plugins (Excel / PDF)

```ts
import {
  createERPTable,
  ExcelExportPlugin,
  PdfExportPlugin,
} from '@fallahi/erp-table';

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
import { IndexedDbEventStore, InMemoryEventStore } from '@fallahi/erp-table';

const memory = new InMemoryEventStore();
const durable = IndexedDbEventStore.inMemory(); // tests
// const browser = await IndexedDbEventStore.open('erp-table-events');
```

Pass a custom store via bootstrap when host wiring supports it (see `CreateERPTableConfig.eventStore` when provided).

## Stability

- Event type strings in `EVENT_CATALOG` are semver-stable.
- Prefer `GridSession` over reaching into `TableEngine` from host apps.

## Desktop virtualization (default on)

```tsx
<ERPTable
  tableHeight={480}
  /* virtualization defaults to on when session is ready */
/>

{/* Classic pagination escape hatch */}
<ERPTable virtualization={false} tableHeight={480} />
```

- Default is virtual scroll (`ERPTableVirtualBody` + session viewport) when `session` exists.
- Pass `virtualization={false}` for classic pagination (ERP hosts that still need page controls).
- Core helper: `controller.getAllUIRows()` (full active collection, no page slice).
- Grid search / validation error navigation uses `revealRow`: virtual → `CHANGE_VIEWPORT`, else → `CHANGE_PAGE`.
- Domain types must not import React.
