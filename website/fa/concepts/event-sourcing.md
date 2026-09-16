# Event sourcing

با پاس‌دادن `store`، ویرایش سلول به جای جهش بی‌صدا، رویداد دامنه در IndexedDB می‌نویسد. این یعنی:

- undo / redo تاریخچهٔ سلول
- رد ممیزی (چه کسی / کی / از چه به چه)
- بازیابی آفلاین بعد از refresh

بدون `store` گرید **در حافظه** می‌ماند و IndexedDB باز نمی‌شود.

```ts
const grid = createGrid({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columnDefs: [{ field: 'qty', type: 'number' }],
  rowData: [{ qty: 1 }],
});
await grid.ready;
```

همگام‌سازی ریموت پیش‌فرض no-op است. برای هاست arianERP از `persian-data-grid/adapters/arian-erp` استفاده کنید.
