# Filtering

Column filters and optional floating filter row (`floatingFilter`). Quick filter text is available via `quickFilterText` (find-and-filter across visible columns).

<LiveDemo name="filtering" />

```tsx
<DataGrid
  rowData={rows}
  columnDefs={cols.map((c) => ({ ...c, filter: true }))}
  floatingFilter
/>
```

`GridSearchPanel` is find-and-navigate, not a filter — use `quickFilterText` for filtering.
