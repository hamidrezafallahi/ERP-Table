# ویرایش

ستون‌های editable با Enter / Tab commit و با Esc draft را لغو می‌کنند. برای ذخیرهٔ هاست از `onCellValueChanged` استفاده کنید.

<LiveDemo name="editing" />

```tsx
<DataGrid
  rowData={rows}
  columnDefs={cols.map((c) => ({ ...c, editable: true }))}
  onCellValueChanged={(e) => save(e.data)}
/>
```
