# گروه‌بندی و جمع

`groupBy` تک‌سطحی به‌همراه `ColumnDef.aggFunc` (RFC-002). Pivot و tree چندسطحی خارج از محدوده است.

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
