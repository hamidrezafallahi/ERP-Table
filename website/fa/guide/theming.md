# تم

`GridTheme` را پاس دهید (`themeDefault`، `themeDark`، یا متغیرهای CSS سفارشی). ترجیح: `--pdg-accent` معنایی.

<LiveDemo name="theming" />

```tsx
import { DataGrid, themeDark } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

<DataGrid theme={themeDark} themeToggle={false} rowData={rows} columnDefs={cols} />
```
