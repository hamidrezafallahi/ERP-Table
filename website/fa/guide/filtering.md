# فیلتر

فیلتر ستون و ردیف floating اختیاری (`floatingFilter`). متن فیلتر سریع با `quickFilterText`.

<LiveDemo name="filtering" />

```tsx
<DataGrid
  rowData={rows}
  columnDefs={cols.map((c) => ({ ...c, filter: true }))}
  floatingFilter
/>
```

`GridSearchPanel` جست‌وجو و پرش است، نه فیلتر — برای فیلتر از `quickFilterText` استفاده کنید.
