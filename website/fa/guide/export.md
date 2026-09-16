# خروجی

Excel و PDF روی subpath هستند؛ CSV در `persian-data-grid/plugins/csv`. `GridApi.exportDataAsExcel` وقتی پلاگین Excel ثبت باشد کار می‌کند.

<LiveDemo name="export" />

```ts
import { ExcelExportPlugin } from 'persian-data-grid/plugins/excel';
import { buildCsvText } from 'persian-data-grid/plugins/csv';
```
