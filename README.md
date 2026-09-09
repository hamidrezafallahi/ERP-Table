# @fallahi/erp-table

Event-driven ERP grid with the same React table chrome as the ERP host (pagination, cells, toolbar, mobile).

## Install

```bash
npm i @fallahi/erp-table
```

```tsx
import { ERPTable } from '@fallahi/erp-table';

<ERPTable
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columnConfig}
  rows={rows}
  tableHeight={tableHeight}
  multiSelectConfig={multiSelectConfig}
  onReady={setController}
/>
```

## Docs

| Doc | Path |
|-----|------|
| Getting started | [docs/getting-started.md](./docs/getting-started.md) |
| Public API | [docs/public-api.md](./docs/public-api.md) |
| Components | [docs/components.md](./docs/components.md) |
| Event catalog | [docs/event-catalog.md](./docs/event-catalog.md) |

## Local demo

```bash
npm run dev:docs        # landing / live docs
npm run dev             # ERPTable playground
```

## Build & publish

```bash
npm run build
npm run verify:dist
npm test
# npm publish  → runs prepublishOnly
```

Bundler: **tsup** (ESM + CJS + d.ts). See `tsup.config.ts` and `scripts/verify-dist.mjs`.
