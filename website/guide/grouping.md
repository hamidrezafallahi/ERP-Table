# Grouping & aggregation

Single-level `groupBy` plus `ColumnDef.aggFunc` (RFC-002). Pivot and multi-level trees stay out of scope.

<LiveDemo name="grouping" />

```tsx
<DataGrid
  rowData={rows}
  columnDefs={[
    { field: 'category' },
    { field: 'price', type: 'price', aggFunc: 'sum' },
  ]}
  groupBy="category"
  footer
/>
```
