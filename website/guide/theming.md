# Theming

Pass a `GridTheme` (`themeDefault`, `themeDark`, or custom CSS variables). Prefer semantic `--pdg-accent` over palette tokens.

<LiveDemo name="theming" />

```tsx
import { DataGrid, themeDark } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

<DataGrid theme={themeDark} themeToggle={false} rowData={rows} columnDefs={cols} />
```
