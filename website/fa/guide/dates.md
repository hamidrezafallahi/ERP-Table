# تاریخ

`DateAdapter` تعویض‌پذیر است (D21). برای `locale="fa"` پیش‌فرض جلالی است.

تقویم/بازهٔ داخلی روی `persian-data-grid/date-picker-jalali` است (PR-140 — بدون peer خارجی). توابع مالی (ریال/تومان، دورهٔ مالی، تعطیلات، حروف‌نویسی) روی `persian-data-grid/finance`.

<LiveDemo name="dates" />

```tsx
import { DataGrid, jalaliAdapter, gregorianAdapter } from 'persian-data-grid';
import { PersianRangeDateCell } from 'persian-data-grid/date-picker-jalali';

<DataGrid
  dateAdapter={jalaliAdapter}
  locale="fa"
  components={{ date: PersianRangeDateCell }}
  rowData={rows}
  columnDefs={cols}
/>
```
