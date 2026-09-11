# Hosting persian-data-grid inside arianERP

`npm i persian-data-grid` does **not** talk to the ERP backend. The package default is `NoopRemoteApi` (no `fetch`, no cookies, no `localStorage`). Dynamic select, `resolveOn`, and `computed` cells stay empty until the host injects a `RemoteApi`.

This page is the arianERP adapter contract. Code lives in `FetchRemoteApi` — keep importing it from the package; it is **not** constructed by bootstrap.

## Inject

```tsx
import { ERPTable, FetchRemoteApi } from 'persian-data-grid';

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

## What the host must still pass

- `actor`, `store`, `tableKey`, `columns`, `rows`
- `remoteApi={new FetchRemoteApi()}` for live lookups
- `multiSelectConfig` only if the voucher needs the choose-from-list modal

## Related

- [`public-api.md`](./public-api.md) — default Noop vs inject Fetch
- [`getting-started.md`](./getting-started.md) — package install without ERP
- [`components.md`](./components.md) — `ERPTable` surface
