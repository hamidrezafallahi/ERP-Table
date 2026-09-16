# تاریخ

`DateAdapter` تعویض‌پذیر است (D21). برای `locale="fa"` پیش‌فرض جلالی است. peer اختیاری `react-persian-range-picker` از `persian-data-grid/date-picker-jalali`.

<LiveDemo name="dates" />

```tsx
import { DataGrid, jalaliAdapter, gregorianAdapter } from 'persian-data-grid';

<DataGrid dateAdapter={jalaliAdapter} locale="fa" rowData={rows} columnDefs={cols} />
```
