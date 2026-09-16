# مرتب‌سازی

منوی هدر ستون یا `api.setSortModel` برای مرتب‌سازی چندستونه. موتور خالص (`applySort`) با collation فارسی و کلید تاریخ جلالی.

<LiveDemo name="sorting" />

```tsx
<DataGrid
  rowData={rows}
  columnDefs={cols.map((c) => ({ ...c, sortable: true }))}
  onGridReady={(e) => e.api.setSortModel([{ colId: 'price', sort: 'desc' }])}
/>
```
