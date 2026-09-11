# Getting started

Install:

```bash
npm i persian-data-grid
```

Peer: `react` / `react-dom` `>=17`.

## Quick start

```ts
import { ERPTable, createERPTable } from 'persian-data-grid';

const grid = await createERPTable({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columns: [
    {
      fieldName: 'item',
      fieldCaption: 'Item',
      fieldType: 'text',
      fieldCollection: 'default',
      visibility: { kind: 'always' },
    },
  ],
  rows: [{ id: 1, collection: 'default', values: { item: 'SKU-1' } }],
});

grid.session.getSnapShot('active');
```

Default `remoteApi` is `NoopRemoteApi`. For arianERP (`_auth`, `persist:arianERP`, `Defaults`), inject `FetchRemoteApi` — [`host-arian-erp.md`](./host-arian-erp.md).

Date cells use `react-persian-range-picker`.

## Local demo (this repo)

Same presentation pattern as the Persian range-picker library: landing (`InitialComponent`) + QA playground (`DemoComponent`). The published surface on the landing is the live **grid**.

| Script | Mode | UI |
|--------|------|-----|
| `npm run dev:docs` | `VITE_APP_MODE=docs` | Landing / live grid docs |
| `npm run dev` | `VITE_APP_MODE=dev` | QA playground (`DemoComponent`) |
| `npm run build:demo` | — | Static site → `demo/dist` (GitHub Pages) |

Demo: https://hamidrezafallahi.github.io/ERP-Table/

Demo app lives under `demo/` and is **not** part of the published tsup bundle.

## Next

- [public-api.md](./public-api.md) — exports & publish
- [cell-components.md](./cell-components.md) — register a cell editor without reading CellRenderer
- [host-arian-erp.md](./host-arian-erp.md) — arianERP `FetchRemoteApi` (`_auth`, persist, Defaults)
- [components.md](./components.md) — VirtualList / session / plugins
- [event-catalog.md](./event-catalog.md) — stable event tokens
- [demo-playground-report.md](./demo-playground-report.md) — playground QA features (DnD, search, pagination, Jalali mask)
- [agent-handoff.md](./agent-handoff.md) — ایجنت: فاز باز و گزارش کار (`EXECUTION_PLAN.md` / `WORKLOG.md`)
