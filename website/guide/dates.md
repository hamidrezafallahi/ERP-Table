# Dates

`DateAdapter` is swappable (D21). Default is Jalali for `locale="fa"`, Gregorian otherwise. Optional peer `react-persian-range-picker` via `persian-data-grid/date-picker-jalali`.

<LiveDemo name="dates" />

```tsx
import { DataGrid, jalaliAdapter, gregorianAdapter } from 'persian-data-grid';

<DataGrid dateAdapter={jalaliAdapter} locale="fa" rowData={rows} columnDefs={cols} />
```
