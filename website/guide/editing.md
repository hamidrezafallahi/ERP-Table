# Editing

Editable columns commit on Enter / Tab and cancel on Esc (cell-edit session). Prefer `onCellValueChanged` for host persistence.

<LiveDemo name="editing" />

```tsx
<DataGrid
  rowData={rows}
  columnDefs={cols.map((c) => ({ ...c, editable: true }))}
  onCellValueChanged={(e) => save(e.data)}
/>
```
