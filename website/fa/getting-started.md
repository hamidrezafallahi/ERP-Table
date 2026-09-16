# شروع سریع

نصب:

```bash
npm i persian-data-grid
```

Peer: `react` / `react-dom` `>=17`.

## مثال زنده

<LiveDemo name="basic" />

## مسیر ۶۰ ثانیه‌ای

```tsx
import { DataGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

type Invoice = { id: string; title: string; amount: number; date: string };

export function InvoiceLines({ invoices }: { invoices: Invoice[] }) {
  return (
    <DataGrid<Invoice>
      rowData={invoices}
      columnDefs={[
        { field: 'title', headerName: 'شرح' },
        { field: 'amount', type: 'price' },
        { field: 'date', type: 'date' },
      ]}
    />
  );
}
```

استایل **اختیاری** است: `persian-data-grid/styles.css` یا `injectGridStyles()`.

`ERPTable` یک نسخه alias منسوخِ `DataGrid` است.

## `createGrid` بدون UI

```ts
import { createGrid } from 'persian-data-grid';

const grid = createGrid({
  columnDefs: [{ field: 'item', headerName: 'قلم' }],
  rowData: [{ item: 'SKU-1' }],
});
await grid.ready;
```

`createGrid()` همگام است (D24). قبل از استفاده از `engine` / `controller` / `session` منتظر `grid.ready` بمانید.

IndexedDB پایدار به `store` (و معمولاً `tableKey` / `actor`) نیاز دارد.

## بعدی

- [معماری](/fa/concepts/architecture)
- [مرتب‌سازی](/fa/guide/sorting)
- [مرجع API](/api/) (TypeDoc از `publish/entry.ts`)
- گالری مثال (۱۲ دمو): `examples/gallery/README.md` در مخزن
