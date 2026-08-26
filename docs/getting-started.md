# Getting started

Install (private / restricted registry as configured by your org):

```bash
npm i @fallahi/erp-table
```

Peer: `react` `>=18`.

## Quick start

```ts
import { createERPTable, VirtualList } from '@fallahi/erp-table';

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

// Prefer session over raw engine in adapters
grid.session.getSnapShot('active');
```

## Local demo (this repo)

Pattern mirrored from the Persian range-picker library playground:

| Script | Mode | UI |
|--------|------|-----|
| `npm run dev:docs` | `VITE_APP_MODE=docs` | Landing / live docs |
| `npm run dev` | `VITE_APP_MODE=dev` | QA playground |

Demo app lives under `demo/` and is **not** part of the published tsup bundle.

## Next

- [public-api.md](./public-api.md) — exports & publish
- [components.md](./components.md) — VirtualList / session / plugins
- [event-catalog.md](./event-catalog.md) — stable event tokens
