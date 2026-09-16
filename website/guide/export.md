# Export

Excel and PDF live on subpaths; CSV is `persian-data-grid/plugins/csv`. Root `GridApi.exportDataAsExcel` still works when the Excel plugin is registered (default in React chrome for one version).

<LiveDemo name="export" />

```ts
import { ExcelExportPlugin } from 'persian-data-grid/plugins/excel';
import { buildCsvText } from 'persian-data-grid/plugins/csv';
```
