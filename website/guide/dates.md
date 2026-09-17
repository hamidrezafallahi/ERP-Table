# Dates

`DateAdapter` is swappable (D21). Default is Jalali for `locale="fa"`, Gregorian otherwise.

Enhanced calendar / range UI is **built-in** on `persian-data-grid/date-picker-jalali` (PR-140 — no external peer). Finance helpers (Rial/Toman, FY periods, holidays, Persian words) are on `persian-data-grid/finance`.

<LiveDemo name="dates" />

```tsx
import { DataGrid, jalaliAdapter, gregorianAdapter } from 'persian-data-grid';
import { PersianRangeDateCell } from 'persian-data-grid/date-picker-jalali';
import { numberToPersianWords, formatPrice } from 'persian-data-grid/finance';

<DataGrid
  dateAdapter={jalaliAdapter}
  locale="fa"
  components={{ date: PersianRangeDateCell }}
  rowData={rows}
  columnDefs={cols}
/>
```
