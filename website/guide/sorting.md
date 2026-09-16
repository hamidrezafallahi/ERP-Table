# Sorting

Click a column header menu (or call `api.setSortModel`) for multi-column sort. Sorting is a pure engine pass (`applySort`) with Persian collation and Jalali-aware date keys.

<LiveDemo name="sorting" />

```tsx
<DataGrid
  rowData={rows}
  columnDefs={cols.map((c) => ({ ...c, sortable: true }))}
  onGridReady={(e) => e.api.setSortModel([{ colId: 'price', sort: 'desc' }])}
/>
```
