# Paged IndexedDB mode (`persistence: 'paged-idb'`)

Opt-in persistence strategy ported from the arianERP document-grid host. It
exists for forms whose detail lines must survive page reloads / tab switches
**without** holding every row in the JS heap.

| | `'event-sourced'` (default) | `'paged-idb'` |
|---|---|---|
| Source of truth | EventStore + in-memory table | **IndexedDB — one record per row** |
| Heap | O(rows) | **O(page)** (Memory Iron Rule) |
| Row chrome | virtual scroll (default on) | **pagination** |
| Cell edits (`cellEditCommit`) | `deferred` — session draft, written on commit | **`immediate`** — every change written at once (arianERP contract) |
| Header sort / filter UI | every column | **off**, unless a column opts in (`columnDef.sortable: true` / `columnDef.filter`) — they would act on the current page only |
| Sort / filter / group (API) | every row | current page only |
| Select-all, delete-selected, search, totals, Excel | in memory | **streamed from IndexedDB** |
| Delete | soft (`RowState = Delete`) | soft; `Added` rows are hard-removed |
| EventStore (undo / audit) | IndexedDB | in-memory unless you inject `eventStore` |

```tsx
import { DataGrid } from 'persian-data-grid';
import { FetchRemoteApi } from 'persian-data-grid/adapters/arian-erp';

<DataGrid
  persistence="paged-idb"
  store="erp"            // required — IndexedDB object-store prefix
  tableKey={pageId}      // required, stable & unique per document page
  columns={columns}
  rows={rows}            // seeds IndexedDB the FIRST time only
  recordPerPage={20}
  activeCollection="Cheques"
  remoteApi={remoteApi}
  onReady={setController}
/>
```

`tableKey` empty ⇒ nothing is built (the page was left). Re-opening the same
`store` + `tableKey` reuses the persisted rows; `rows` is ignored then.

The IndexedDB database name (`ERP_TABLE_DB`) and record layout are the same as
the host table's, so drafts written by the host version are readable.

## Host contract — nothing project-specific lives in the package

| Concern | Injection point |
|---|---|
| Fetching remote lists / `resolveOn` | `remoteApi` (`RemoteApi` port). `CallbackRemoteApi` wraps any transport (RTK Query base query with token refresh, axios, …) |
| Token / ERP `Defaults` (Redux) | `new FetchRemoteApi(err, { getToken, getDefaults, fetcher })` or `CallbackRemoteApi` |
| `dependOn` values of a remote list | `<DataGrid useDependOn={hook}>` or an outer `ERPTableHostProvider useDependOn={hook}` (the grid's own provider inherits `useDependOn`, `onToast`, `messages`, `components`, `filterComponents`, `columnMenuItems`, `onColumnMenuAction` from the nearest outer provider when the prop is not set; explicit props win) + `multiSelectConfig.dependOnFromHost` |
| Toasts / i18n / theme | `ERPTableHostProvider onToast / messages / locale / theme` |
| Header form ⇄ detail payload | pure helpers on `/headless`: `mapSnapshotToDetails`, `mapDetailsToRowInputs`, `buildDocumentPayload`, `mapServerHeaderToFields` |
| Re-validate after a header field changes | `window.dispatchEvent(new Event(GRID_REVALIDATE_EVENT))` (`'pdg-grid:revalidate'`; legacy `'erp-table:revalidate'` works too) |

Reference host glue (Redux / RTK / Next.js): `examples/host-arian-erp/useERPGrid.ts`.

## Save flow

```ts
const snapshot = await controller.getFullSnapShot('all');   // IndexedDB, all collections
const body = buildDocumentPayload({
  headerFields,
  headerFieldKey: 'VoucherId',
  recordId: id,
  details: mapSnapshotToDetails(snapshot, { detailFieldKey: 'DetailId', isUpdate: !!id }),
});
```

`getSnapShot()` stays the RAM page window — never use it for saving in this mode.

Nothing typed is lost by a save: with the default `cellEditCommit: 'immediate'`
every editor change is already in the table, and `getFullSnapShot`,
`iterateRowsFromDb`, the exports and `dispose()` first write whatever is still
in a cell editor (`flushCellEdit`) and wait until every queued cell write is
durable — the editor stays open. Before reading a synchronous API for a save
(`getRowView`, `getSnapShot`), `await controller.flushCellEdit()`.

## Streaming APIs

- `controller.iterateRowsFromDb(scope, onBatch, batchSize?)` — bounded batches.
- `controller.subscribeColumn(col, scope, reducer, seed, cb)` — folded totals.
- `exportActiveCollectionToExcel(controller)` — two cursor passes, chunked Blob.
- Grid search (`GridSearchPanel`) streams records and derives the page from the
  record ordinal.

## Behaviour notes (parity with the host table)

- Add / duplicate append **at the end** and jump to the last page.
- Collection switch loads page 1 of the new collection; other collections'
  rows are never touched. Column configs of other collections never leak into
  the active one (collection guard).
- Activating a row re-applies remote visibility flags (`resolveOn`) once per
  row/value signature (`APPLY_ROW_VISIBILITY`).
- Select / Alt / Ctrl+Space|Arrows|End shortcuts win over a focused Select.
- `Enter` walks to the next editable cell and adds a row past the last one
  (`enterNavigation: 'nextCell'`, the default in every mode).
- Keys typed outside the grid's cells (page forms, toolbar, filters) are never
  taken; only the legacy `Alt+…` / `Ctrl+Space|Arrows|End` chords are global.
- Validation covers the RAM page window (same as the host table).
