# Getting Started

Install:

```bash
npm i persian-data-grid
```

Peer: `react` / `react-dom` `>=17`.

## Live example

<LiveDemo name="basic" />

## 60-second path

```tsx
import { DataGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

type Invoice = { id: string; title: string; amount: number; date: string };

export function InvoiceLines({ invoices }: { invoices: Invoice[] }) {
  return (
    <DataGrid<Invoice>
      rowData={invoices}
      columnDefs={[
        { field: 'title', headerName: 'Item' },
        { field: 'amount', type: 'price' },
        { field: 'date', type: 'date' },
      ]}
    />
  );
}
```

Styles are **opt-in**: import `persian-data-grid/styles.css`, or call `injectGridStyles()`.

`ERPTable` is a deprecated alias of `DataGrid` for one version.

## Headless `createGrid`

```ts
import { createGrid } from 'persian-data-grid';

const grid = createGrid({
  columnDefs: [{ field: 'item', headerName: 'Item' }],
  rowData: [{ item: 'SKU-1' }],
});
await grid.ready;
```

`createGrid()` is sync (D24). Await `grid.ready` before using `engine` / `controller` / `session`.

Durable IndexedDB needs `store` (and usually `tableKey` / `actor`).

## Next

- [Architecture](/concepts/architecture)
- [Sorting](/guide/sorting)
- [API Reference](/api/) (TypeDoc from `publish/entry.ts`)
- Example gallery (12 demos): see repo `examples/gallery/README.md`
