# Hosting persian-data-grid inside arianERP

`npm i persian-data-grid` does **not** talk to the ERP backend. The package default is `NoopRemoteApi` (no `fetch`, no cookies, no `localStorage`). Dynamic select, `resolveOn`, and `computed` cells stay empty until the host injects a `RemoteApi`.

This page is the arianERP adapter contract. Code lives in `FetchRemoteApi` on the **`persian-data-grid/adapters/arian-erp`** subpath — it is **not** constructed by bootstrap and is **not** exported from the package root (PR-80).

## Inject

```tsx
import { ERPTable } from 'persian-data-grid';
import { FetchRemoteApi } from 'persian-data-grid/adapters/arian-erp';
import 'persian-data-grid/styles.css';

<ERPTable
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columns}
  rows={rows}
  tableHeight={420}
  multiSelectConfig={multiSelectConfig}
  remoteApi={new FetchRemoteApi()}
  onReady={setController}
/>
```

Optional `baseUrl` if the grid is not served from the same origin as the API:

```ts
new FetchRemoteApi(undefined, { baseUrl: 'https://erp.example.local' })
```

A custom `RemoteApi` is fine if it implements `request({ endpoint, params, method })`.

## Failures: reject, never resolve error bodies

`FetchRemoteApi` rejects with an `Error` (message contains the HTTP status and endpoint) on any non-2xx response and on a non-JSON body (e.g. a 502 HTML page). The grid catches rejections: a failing `resolveOn` / `computed` lookup still commits the cell edit and is written to the audit logger; `useRemoteQuery` / `useLazyRemote` expose `error` and call `onToast('error', …)`.

### Wrapping an RTK Query base query (`baseQueryByToken`)

RTK base queries never throw — they resolve `{ data }` or `{ error }`. Returning `res.data` blindly turns a failure into `undefined`. Use `createBaseQueryRemoteApi`, which throws when `error` is set (or the result is empty) and returns `data` otherwise:

```ts
import { CallbackRemoteApi, createBaseQueryRemoteApi } from 'persian-data-grid/adapters/arian-erp';

const remoteApi = new CallbackRemoteApi(
  createBaseQueryRemoteApi(({ endpoint, params, method }) =>
    baseQueryByToken(
      { url: endpoint, method: method ?? 'POST', body: params ?? {} },
      { getState: () => store.getState(), dispatch: store.dispatch } as never,
      {},
    ),
  ),
);
```

## Cookie `_auth`

`FetchRemoteApi` reads `document.cookie` for **`_auth`**. If present, every request sends:

```http
Authorization: Bearer <token>
```

No cookie → request still goes out, without that header.

## `persist:arianERP`

Browser `localStorage` key **`persist:arianERP`** is redux-persist JSON. The adapter parses:

1. `JSON.parse(localStorage.getItem('persist:arianERP'))`
2. `JSON.parse(parsed.config)`
3. `defaultConfigs` object

Missing or invalid storage → empty defaults (request still runs).

## `Defaults` on POST

Default HTTP method is **POST**. JSON body is `params` plus a `Defaults` object (ids only):

| Field in body | Source (`defaultConfigs`) |
|---------------|---------------------------|
| `Defaults.CurrencyId` | `CurrencyId.id` |
| `Defaults.CashierId` | `CashierId.id` |
| `Defaults.PlaceId` | `PlaceId.id` |
| `Defaults.YearId` | `YearId.id` |
| `Defaults.LangId` | `LanguageId.id` |

`GET` does not send a body.

Relative `endpoint` values work on the ERP origin (`joinUrl(baseUrl, endpoint)`). Absolute `http(s):` URLs are used as-is.

## IndexedDB event log (0.5.x → 0.6.0)

Bootstrap opens IndexedDB as `{eventStoreName}:{store}`. The default prefix is **`persian-data-grid-events`**. `persian-data-grid@0.5.x` used **`erp-table-events`**. Those are different databases; the package does not copy events automatically.

To keep reading existing local data:

```ts
import { createERPTable, LEGACY_EVENT_STORE_PREFIX } from 'persian-data-grid';

await createERPTable({
  store: 'erp',
  eventStoreName: LEGACY_EVENT_STORE_PREFIX, // 'erp-table-events'
  /* … */
});
```

## What the host must still pass

- `actor`, `store`, `tableKey`, `columns`, `rows`
- `persistence="paged-idb"` — the in-project table's storage contract: IndexedDB
  `ERP_TABLE_DB` (same records, existing drafts stay readable), one page in RAM,
  `dispose()` only drops the page window, every cell change written at once,
  pagination, no page-local header sort / filter. Without it the grid runs the
  event-sourced mode (whole table in RAM, `dispose()` deletes the table).
- `remoteApi` for live lookups. To keep `baseQueryByToken` behaviour
  (`NEXT_PUBLIC_API_URL`, token refresh, error toasts) wrap it with
  `CallbackRemoteApi(createBaseQueryRemoteApi(...))` (above); `FetchRemoteApi`
  alone posts to relative URLs and does not refresh tokens.
- `useDependOn={useDependOn}` (the host's Redux `@hooks/custom/useDependOn`) —
  the description column resolves `dependOn` header fields through it.
- `multiSelectConfig` only if the voucher needs the choose-from-list modal
- `import 'persian-data-grid/styles.css'` once; `themeToggle={false}` to hide the
  light/dark button, `onToast` to route toasts to the host.

Everything else of the in-project table is the default: `Enter` → next cell /
new row, `Tab` from any cell, keys typed in the page header form are never
taken by the grid, `getFullSnapShot('all')` for the save body.

## Related

- [`public-api.md`](../../docs/public-api.md) — default Noop vs inject Fetch
- [`getting-started.md`](../../docs/getting-started.md) — package install without ERP
- [`components.md`](../../docs/components.md) — `ERPTable` surface
- [`MIGRATION.md`](../../MIGRATION.md) — root `FetchRemoteApi` removal
