# Migration guide

Breaking and deprecated API changes for `persian-data-grid`. Codemod automation lands in PR-131; until then apply the rows by hand.

## 0.6.0 — PR-76 subpath exports (D15)

Heavy optional surfaces moved off the default entry so `.` can stay ≤ **65 KB gzip**. Root named exports remain as **deprecated aliases** for one minor line.

| Before (still works, deprecated) | After (preferred) |
|----------------------------------|-------------------|
| `import { ExcelExportPlugin, ExcelImportPlugin } from 'persian-data-grid'` | `import { … } from 'persian-data-grid/plugins/excel'` |
| `import { PdfExportPlugin, VazirmatnPdfRenderer, TextPdfRenderer } from 'persian-data-grid'` | `import { … } from 'persian-data-grid/plugins/pdf'` |
| `new PdfExportPlugin()` embeds Vazirmatn | `new PdfExportPlugin()` uses legacy `TextPdfRenderer`. For Persian: `import { createVazirmatnPdfExportPlugin } from 'persian-data-grid/plugins/pdf/fonts/vazirmatn'` |
| `new VazirmatnPdfRenderer()` | `new VazirmatnPdfRenderer(vazirmatnRegularBytes())` or `createVazirmatnPdfRenderer()` from the font subpath |
| `import { FetchRemoteApi } from 'persian-data-grid'` | `import { FetchRemoteApi } from 'persian-data-grid/adapters/arian-erp'` |
| (none) | `import { createERPTable, createGrid, … } from 'persian-data-grid/headless'` — no React chrome |
| (none / claimed early) | `import 'persian-data-grid/styles.css'` — CSS file export (auto-inject still runs until PR-77) |

### Persian PDF example

```ts
import { createVazirmatnPdfExportPlugin } from 'persian-data-grid/plugins/pdf/fonts/vazirmatn';

const plugins = [createVazirmatnPdfExportPlugin({ download: true })];
```

### Headless

```ts
import { createERPTable, createGrid } from 'persian-data-grid/headless';
// createGrid === createERPTable until D24 ships a sync createGrid
```
