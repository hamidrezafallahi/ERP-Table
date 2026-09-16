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
- `remoteApi={new FetchRemoteApi()}` for live lookups
- `multiSelectConfig` only if the voucher needs the choose-from-list modal

## Related

- [`public-api.md`](../../docs/public-api.md) — default Noop vs inject Fetch
- [`getting-started.md`](../../docs/getting-started.md) — package install without ERP
- [`components.md`](../../docs/components.md) — `ERPTable` surface
- [`MIGRATION.md`](../../MIGRATION.md) — root `FetchRemoteApi` removal
