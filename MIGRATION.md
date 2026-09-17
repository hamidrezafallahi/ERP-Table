# Migration guide

Breaking and deprecated API changes for `persian-data-grid`.

**Codemod (PR-131):**

```bash
npx persian-data-grid-codemod src/
# from this repo:
node packages/codemod/cli.mjs src/
```

## Master table (D13–D22)

| Decision | Before | After | Codemod |
|----------|--------|-------|---------|
| D13 | `ERPTable`, `ERPTableProps`, `useERPTable`, `themeErp*` | `DataGrid`, `DataGridProps`, `useGrid`, `themeDefault` / `themeDark` | ✅ |
| D13 | `.erp-table`, `--erp-*` | `.pdg-grid`, `--pdg-*` | ✅ (CSS) |
| D14 | `columns` / `rows` only | Prefer `columnDefs` / `rowData` (old path still works) | manual |
| D15 | Excel / PDF / adapter on `.` | `persian-data-grid/plugins/*`, `/adapters/arian-erp` | ✅ imports |
| D16 | Auto CSS inject | `import 'persian-data-grid/styles.css'` or `injectGridStyles()` | ✅ |
| D17 | Virtualization off by default | **On** by default; `virtualization={false}` for pagination | manual |
| D18 | `Alt+C/X/V` clipboard | `Ctrl+C/X/V` (`Alt+*` deprecated) | ✅ comment |
| D19 | pin left/right (if any) | `pinned: 'start' \| 'end' \| null` | manual |
| D20 | no grouping API | `groupBy` + `aggFunc` (RFC-002) | n/a additive |
| D21 | hard Jalali picker peer | `DateAdapter` + optional `/date-picker-jalali` | manual |
| D22 | single package | monorepo packages | **تعویق تا پس از 1.0** — بدون تغییر API الان |
| D24 | `await createERPTable(cfg)` | `const grid = createGrid(cfg); await grid.ready` | ✅ await form |
| D24 | `injectERPTableStyles` | `injectGridStyles` | ✅ |

Aliases marked `@deprecated` remain until **1.0.0** (D25) unless noted as removed earlier (e.g. root `FetchRemoteApi`).

---

## 0.6.0 — PR-76 subpath exports (D15)

Heavy optional surfaces moved off the default entry so `.` can stay ≤ **65 KB gzip**. Root named exports remain as **deprecated aliases** for one minor line.

| Before (still works, deprecated) | After (preferred) |
|----------------------------------|-------------------|
| `import { ExcelExportPlugin, ExcelImportPlugin } from 'persian-data-grid'` | `import { … } from 'persian-data-grid/plugins/excel'` |
| `import { PdfExportPlugin, VazirmatnPdfRenderer, TextPdfRenderer } from 'persian-data-grid'` | `import { … } from 'persian-data-grid/plugins/pdf'` |
| `new PdfExportPlugin()` embeds Vazirmatn | `new PdfExportPlugin()` uses legacy `TextPdfRenderer`. For Persian: `import { createVazirmatnPdfExportPlugin } from 'persian-data-grid/plugins/pdf/fonts/vazirmatn'` |
| `new VazirmatnPdfRenderer()` | `new VazirmatnPdfRenderer(vazirmatnRegularBytes())` or `createVazirmatnPdfRenderer()` from the font subpath |
| `import { FetchRemoteApi } from 'persian-data-grid'` | `import { FetchRemoteApi } from 'persian-data-grid/adapters/arian-erp'` — **required as of PR-80**; the root alias is gone |
| (none) | `import { createERPTable, createGrid, … } from 'persian-data-grid/headless'` — no React chrome |
| (none / claimed early) | `import 'persian-data-grid/styles.css'` — CSS file export |

### Persian PDF example

```ts
import { createVazirmatnPdfExportPlugin } from 'persian-data-grid/plugins/pdf/fonts/vazirmatn';

const plugins = [createVazirmatnPdfExportPlugin({ download: true })];
```

### Headless

```ts
import { createGrid } from 'persian-data-grid/headless';
const grid = createGrid({ /* … */ });
await grid.ready;
```

See **0.7.0 — PR-84** for the deprecated `createERPTable` alias.

## 0.6.0 — PR-77 explicit CSS (D16)

CSS is **no longer injected automatically** on `import { ERPTable } from 'persian-data-grid'`. Without one of the two paths below the grid renders unstyled. Codemod automation lands in PR-131.

| Before (still works, deprecated) | After (preferred) |
|----------------------------------|-------------------|
| Auto-inject on module load / `ERPTable` render | `import 'persian-data-grid/styles.css'` (recommended, tree-shake friendly) |
| `injectERPTableStyles()` (now a no-op unless you call it) | `injectGridStyles()` for hosts that cannot bundle CSS |

```ts
import { ERPTable, injectGridStyles } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

// Bundler hosts: the CSS import is enough. Do not also call injectGridStyles.
<ERPTable /* ... */ />

// No CSS bundler (script tag / CDN): skip the CSS import and call once:
injectGridStyles();
```

`injectERPTableStyles` remains as a **deprecated alias** of `injectGridStyles` for one minor line. `sideEffects` is `["**/*.css"]` so unused JS can tree-shake; CSS files stay.

## 0.6.0 — PR-80 arianERP adapter is subpath-only

`FetchRemoteApi` (cookie `_auth`, `persist:arianERP`) is **removed** from the package root so `dist/index.js` does not contain `arianERP`. The PR-76 deprecated alias no longer exists.

| Before (`0.5.x`) | After (required) |
|------------------|------------------|
| `import { FetchRemoteApi } from 'persian-data-grid'` | `import { FetchRemoteApi } from 'persian-data-grid/adapters/arian-erp'` |
| IndexedDB `erp-table-events:${store}` | `persian-data-grid-events:${store}` unless you opt into the old name |

Existing local data stays under `erp-table-events:${store}`. Pass `eventStoreName: 'erp-table-events'` (or `LEGACY_EVENT_STORE_PREFIX`) to keep using it. The package does **not** copy events between the two databases.

```ts
import {
  createERPTable,
  LEGACY_EVENT_STORE_PREFIX,
} from 'persian-data-grid';
import { FetchRemoteApi } from 'persian-data-grid/adapters/arian-erp';

await createERPTable({
  store: 'erp',
  eventStoreName: LEGACY_EVENT_STORE_PREFIX,
  remoteApi: new FetchRemoteApi(),
  /* … */
});
```

Adapter contract: [`examples/host-arian-erp/host-arian-erp.md`](./examples/host-arian-erp/host-arian-erp.md).

## 0.7.0 — PR-81 `ColumnDef<TRow>` (D14)

New generic column type. **Not a break:** `columns: ColumnSchema[]` still works.

| Before | After (optional) |
|--------|------------------|
| `{ fieldName, fieldCaption, fieldType, visibility }` | `{ field, headerName, type }` via `toColumnSchema` / `toColumnDef` |

```ts
import { toColumnSchema, type ColumnDef } from 'persian-data-grid';

type Line = { qty: number };
const defs: ColumnDef<Line>[] = [
  { field: 'qty', headerName: 'Qty', type: 'number' },
];
const columns = defs.map(toColumnSchema);
```

`ColumnSchema` is not deprecated. Codemod automation lands in PR-131.

## 0.7.0 — PR-82 `rowData` + `getRowId`

Pass host objects instead of `RowInput`. `getRowId` defaults to the array index.

| Before | After (optional) |
|--------|------------------|
| `rows: [{ id, values }]` | `rowData: T[]` + `getRowId?: (row) => string` |
| `columns: ColumnSchema[]` | `columnDefs: ColumnDef<T>[]` |

If both `columns` and `columnDefs` are set, `columns` wins. If both `rows` and `rowData` are set, `rows` wins for the initial load; later `rowData` updates still diff when the React `rowData` prop changes.

Domain `Row.data` is the same host reference (not a deep clone). IndexedDB does **not** persist `data` — remount with `rowData` to restore getters.

## 0.7.0 — PR-83 optional `store` / `tableKey` / `actor`

Zero-config grid. Passing these props keeps the previous durable / RBAC behavior.

| Omit | Default |
|------|---------|
| `store` | In-memory repo + `InMemoryEventStore`. **IndexedDB is not opened.** |
| `tableKey` | Generated `pdg-…` (React: stable for the component lifetime) |
| `actor` | `{ userId: 'anonymous', roles: ['admin'] }` (all access) |

```tsx
<ERPTable columnDefs={cols} rowData={rows} />
```

## 0.7.0 — PR-84 `createGrid` sync (D24)

`createGrid(cfg)` returns immediately. EventStore / snapshot load is lazy on `grid.ready`. `createERPTable` stays as a **deprecated** async alias for one minor line.

| Before | After (preferred) |
|--------|-------------------|
| `await createERPTable(cfg)` | `const grid = createGrid(cfg); await grid.ready` |
| `createGrid === createERPTable` (temporary PR-76 alias) | They are different functions: `createGrid` is sync |

```ts
import { createGrid } from 'persian-data-grid';

const grid = createGrid({ columnDefs, rowData });
await grid.ready;
grid.session.getSnapShot('active');
```

`await createERPTable(cfg)` ≡ `await createGrid(cfg).ready` — both paths work until the alias is removed.

**Codemod input (PR-131 / `scripts/codemod-v0.7.mjs`):** rewrite `await createERPTable(` to `createGrid(` and insert `await grid.ready` before the first use of `engine` / `controller` / `session`. Do not rewrite `ERPTable` in this step (that is PR-87).

## 0.7.0 — PR-85 React event props

Additive. No break. Callbacks are optional.

| Prop | Source |
|------|--------|
| `onCellValueChanged` | `CELL_CHANGED` (`EVENT_CATALOG` / EventStore) — `{oldValue, newValue, colId, rowId, data}` |
| `onRowValueChanged` | Same `CELL_CHANGED` event, host row `data` |
| `onRowDataUpdated` | `ROW_ADDED` / `ROW_DELETED` / … catalog tokens, and later `rowData` prop updates |
| `onSelectionChanged` | Existing view store `selectedRows` |
| `onCellFocused` | Existing view store `activeCell` |
| `onGridReady` | Hydrate complete; `{ api }` is `GridApi` (PR-86). `onReady(controller)` still works. |

`onReady(controller)` is unchanged for one version. Prefer `apiRef` / `onGridReady`. There is no `onSortChanged` yet (Phase 18). Headless: `subscribeCatalogHostEvents` / `bindGridHostEvents`. `applyColumnState` writes **width**, **order**, and **hide** (`setColumnVisible`). Domain `visibility: { kind: 'never' }` cannot be un-hidden.

## 0.7.0 — PR-86 `apiRef` / `GridApi`

Imperative API. `UITableController` stays the implementation and is still on `persian-data-grid/headless`. The class is **not** a value export of `.`.

| Before | After |
|--------|--------|
| `onReady={(c) => …}` + `c.dispatch` / `c.getCell` | `apiRef` or `onGridReady={({ api }) => …}` |
| `import { UITableController } from 'persian-data-grid'` (value) | `import type { UITableController }` from `.`, or the class from `/headless` |
| `onGridReady.api` is `UITableController` | `GridApi` |

Minimum `GridApi`: `getRowNode`, `setRowData`, `refreshCells`, `getSelectedRows`, `deselectAll`, `startEditingCell`, `stopEditing`, `exportDataAsExcel`, `undo`, `redo`, `getColumnState`, `applyColumnState`.

```tsx
import { useRef } from 'react';
import { ERPTable, type GridApi } from 'persian-data-grid';

const apiRef = useRef<GridApi<Line> | null>(null);

<ERPTable apiRef={apiRef} columnDefs={columnDefs} rowData={lines} />

apiRef.current?.getRowNode('sku-1');
await apiRef.current?.undo();
```

`createGrid().ready` also fills `grid.api`. `exportDataAsExcel` goes through `pluginHost.requestExport({ format: 'xlsx' })` — register `ExcelExportPlugin` (subpath) to actually download.

**Codemod input (PR-131 / `scripts/codemod-v0.7.mjs`):** rewrite value imports of `UITableController` from `'persian-data-grid'` to `'persian-data-grid/headless'` (or type-only on `.`). Do not strip `onReady` yet.

## 0.7.0 — PR-87 public rename (D13)

Canonical names. Old names stay **deprecated aliases until 1.0.0**.

| Before | After |
|--------|--------|
| `ERPTable` | `DataGrid` |
| `ERPTableProps` | `DataGridProps` |
| `useERPTable` / `UseERPTableResult` | `useGrid` / `UseGridResult` |
| `themeErp` / `themeErpDark` | `themeDefault` / `themeDark` |
| `.erp-table` | `.pdg-grid` (root also keeps `.erp-table`) |
| `--erp-*` | `--pdg-*` (`--erp-*` aliases `var(--pdg-*)`) |

```tsx
import { DataGrid, themeDefault } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

<DataGrid theme={themeDefault} columnDefs={cols} rowData={rows} />
```

`ERPTable === DataGrid`, `themeErp === themeDefault`. Run `node scripts/codemod-v0.7.mjs src/` to rewrite host files. The codemod does **not** touch `createERPTable` or `injectERPTableStyles`.

## 0.7.0 — PR-88 end-to-end generics

`DataGrid<TRow>` / `createGrid<TRow>` now thread `TRow` through `rowData`, `columnDefs`, `getRowId`, React event `data`, `apiRef`, and `grid.api`. Untyped hosts (`TRow = unknown`) still compile; a wrong `field` on `ColumnDef<Invoice>` is a type error.

```tsx
<DataGrid
  rowData={invoices}
  columnDefs={[{ field: 'title' }]}
  onCellValueChanged={(e) => save(e.data)}
/>
```

`TRow` is inferred from `rowData`. No runtime change. `columns` / `rows` (ERP `ColumnSchema` / `RowInput`) are unchanged.

## 0.8.0 — PR-89 SortModel (core only)

`applySort(rowIds, sortModel, accessor)` is a **pure** engine helper. The grid header does not call it yet (PR-91).

```ts
import { applySort } from 'persian-data-grid';

const ordered = applySort(rowIds, [{ colId: 'amount', sort: 'desc' }], accessor);
```

## 0.8.0 — PR-90 sort wired to the row index

`SET_SORT_MODEL` / `UI_SET_SORT_MODEL` / `controller.setSortModel` update session `sortModel` and rebuild `SparseRowIndex`. `getAllUIRows` follows that order. Empty model restores document `index` order. No EventStore write. No host migration required for hosts that do not call sort yet.

## 0.8.0 — PR-91 header sort UI

Click a sortable column header to cycle **asc → desc → none**. Hold **Shift** while clicking to build a multi-sort (priority badge on the header). `aria-sort` reflects the active direction. `ColumnDef.sortable: false` and the `index` column stay unsorted. Column reorder drag is unchanged: pointer travel of **5px or more** (or an HTML5 drag) does not change sort.

```ts
api.setSortModel([{ colId: 'amount', sort: 'desc' }]);
api.getSortModel();
```

## 0.8.0 — PR-92 FilterModel (core only)

`applyFilter(rowIds, filterModel, accessor)` is a **pure** engine helper. The grid does not apply it to the row index yet (PR-94). Supports text / number / date / set / boolean / custom, column AND/OR, and Persian digit + ي/ك normalization.

```ts
import { applyFilter } from 'persian-data-grid';

const visible = applyFilter(
  rowIds,
  { name: { filterType: 'text', type: 'contains', filter: 'علی' } },
  accessor,
);
```

## 0.8.0 — PR-93 quick filter (hides rows)

`quickFilterText` hides non-matching rows. It is **not** `GridSearchPanel` (find/navigate).

```ts
<DataGrid quickFilterText={q} rowData={rows} columnDefs={cols} />
// or
api.setQuickFilter(q);
```

Empty string clears the filter. Digits and Arabic ي/ك are normalized like column filters.

## 0.8.0 — PR-94 column filter UI

`SET_FILTER_MODEL` / `api.setFilterModel` / `api.getFilterModel` apply column filters to the UI row index. Header ▽ opens a portal popover (inherits theme via `useThemePortalStyle`). Pass `floatingFilter` for an input row under the header.

```tsx
<DataGrid floatingFilter rowData={rows} columnDefs={cols} />
api.setFilterModel({
  name: { filterType: 'text', type: 'contains', filter: 'علی' },
});
```

## 0.8.0 — PR-95 custom filter components

Register a filter UI like a cell editor. `ColumnDef.filter` accepts a built-in name, a custom registry key, or `{ type, params }`. Pass `filterComponents` on `DataGrid`.

```tsx
<DataGrid
  filterComponents={{
    roundAmount: ({ apply }) => (
      <button
        type="button"
        onClick={() =>
          apply({
            filterType: 'custom',
            type: 'roundAmount',
            customFilter: (v) => Number(v) % 1_000_000 === 0,
          })
        }
      >
        فقط مبالغ رُند
      </button>
    ),
  }}
  columnDefs={[{ field: 'Bed', type: 'price', filter: 'roundAmount' }]}
  rowData={rows}
/>
```

## 0.8.0 — PR-96 server / infinite datasource (contract)

When `rowModelType` is `'infinite'` or `'serverSide'`, the grid does **not** apply local sort/filter. It calls `datasource.getRows` with the current window and models. Block cache (PR-102): `cacheBlockSize`, `maxBlocksInCache`, `api.refreshServerSide()`.

```tsx
<DataGrid
  rowModelType="infinite"
  recordPerPage={50}
  cacheBlockSize={50}
  maxBlocksInCache={10}
  datasource={{
    async getRows({ startRow, endRow, sortModel, filterModel }) {
      const page = await fetchPage({ startRow, endRow, sortModel, filterModel });
      return { rows: page.items, lastRow: page.total };
    },
  }}
  columnDefs={cols}
/>
```

## 0.9.0 — PR-97 row virtualization default on (D17)

**Breaking for hosts that relied on pagination without setting a prop.**

Desktop row virtualization is **on by default** whenever a `GridSession` is present (every normal `DataGrid` / `createGrid` mount). Pagination chrome is hidden in that mode.

| Before (≤ 0.8.x) | After (0.9.0) |
|------------------|---------------|
| Pagination unless `virtualization={true}` | Virtual scroll unless `virtualization={false}` |

```tsx
// Keep classic ERP pagination
<DataGrid virtualization={false} tableHeight={480} rowData={rows} columnDefs={cols} />

// Default — virtual body (no change needed for new hosts)
<DataGrid tableHeight={480} rowData={rows} columnDefs={cols} />
```

`virtualization` and pagination are mutually exclusive in the desktop toolbar. Index-column sticky pin still works with virtual spacers.

## 0.9.0 — PR-98 column virtualization

Wide grids virtualize columns. `ViewportCalculator.calculateColumns` / `calculateColumnViewport` use cumulative widths + binary search. Desktop chrome shares one window across header / body / footer; the index pin stays mounted; horizontal spacers are RTL-aware.

```tsx
// No host prop required — enabled automatically on DesktopTable.
// Engine-only:
import { calculateColumnViewport } from 'persian-data-grid';
const range = calculateColumnViewport(widths, scrollLeft, clientWidth, pinnedWidth, 1);
```

## 0.10.0 — PR-109 standard keyboard shortcuts (D18)

System clipboard shortcuts are now **Ctrl+C / Ctrl+X / Ctrl+V**. The legacy **Alt+C / Alt+X / Alt+V** row-clone mode remains as **deprecated aliases until 1.0.0**.

| Deprecated | Replacement |
|------------|-------------|
| `Alt+C` (row clone) | `Ctrl+C` (system clipboard) |
| `Alt+X` (row clone) | `Ctrl+X` (cut to clipboard + clear cells) |
| `Alt+V` (row clone) | `Ctrl+V` (paste from clipboard) |

New navigation shortcuts: `Home` / `End`, `Ctrl+Home` / `Ctrl+End`, `Ctrl+Shift+Arrow` (extend range to edge). Full table: [`docs/keyboard.md`](docs/keyboard.md).

**Codemod input (PR-131):** search host shortcut docs and custom key handlers for `Alt+C`, `Alt+X`, `Alt+V` and replace with Ctrl variants where system clipboard is intended.

## Unreleased — PR-126 edit cancel / editor cycle

Cell typing no longer writes EventStore on every keystroke. Drafts live in session state until commit.

| Behavior | Before | After |
|----------|--------|-------|
| Keystroke | Immediate `CHANGE_CELL_VALUE` | Session draft (`cellEdit`) |
| `Esc` | Blur / clear action only | Cancel draft; domain value unchanged |
| `Enter` | Move to next **column** | Commit + move **down** |
| `Tab` (while editing) | Move sideways | Commit + move sideways |
| Props | — | `singleClickEdit` (default true), `stopEditingWhenCellsLoseFocus` (default true), `editType: 'cell' \| 'fullRow'` |
| API | `stopEditing()` | `stopEditing(true)` cancels without write |

Hosts that assumed every `onChange` was durable must call Enter/Tab/blur/`api.stopEditing()` (or keep writing via direct `CHANGE_CELL_VALUE` / non-edit `UI_CELL_CHANGE` when no session is open).

## Unreleased — PR-127 locale packs

| Before | After |
|--------|-------|
| `locale: 'fa' \| 'en'` | `+ 'ar'` |
| Messages only in `ui/host/messages.ts` | Packs on `persian-data-grid/locales/fa` (etc.) |
| Digits via manual FA map | `Intl` + optional `numberingSystem` (`latn` / `arab` / `arabext`) |
| `dir` only from `fa` vs other | `resolveDirection(locale)` (`fa`/`ar` → rtl); `direction` prop overrides |

```tsx
import { DataGrid } from 'persian-data-grid';
import { enMessages } from 'persian-data-grid/locales/en';

<DataGrid locale="en" numberingSystem="latn" messages={enMessages} />
```

## Unreleased — PR-128 DateAdapter (D21)

| Before | After |
|--------|-------|
| Hard dependency on `react-persian-range-picker` | Optional peer; default DatePicker is native/`DateAdapter` |
| Fixed Jalali display via Intl only | `dateAdapter={gregorianAdapter \| jalaliAdapter}` |
| Picker always in default chrome | Enhanced picker: `import { PersianRangeDatePicker } from 'persian-data-grid/date-picker-jalali'` + `components={{ date: … }}` |

```tsx
import { DataGrid, gregorianAdapter } from 'persian-data-grid';

<DataGrid locale="en" dateAdapter={gregorianAdapter} />
```

## Unreleased — PR-141 Document PDF template

| Before | After |
|--------|-------|
| Title + table only | `DocumentPdfTemplate`: header/footer/logo/page#/repeat header/signature/stamp/page totals |
| — | `PdfExportPlugin({ template })` or `renderer.render(source, { template })` |

```tsx
import { createVazirmatnPdfExportPlugin } from 'persian-data-grid/plugins/pdf/fonts/vazirmatn';
import type { DocumentPdfTemplate } from 'persian-data-grid/plugins/pdf';

const template: DocumentPdfTemplate = {
  header: { title: 'فاکتور', subtitle: 'شرکت نمونه', meta: ['شماره: 1'] },
  footer: { text: 'محرمانه', showPageNumber: true },
  signature: { label: 'امضا' },
  stamp: { label: 'مهر' },
  pageTotals: { columns: ['price'], label: 'جمع صفحه' },
};

<DataGrid plugins={[createVazirmatnPdfExportPlugin({ template })]} … />
```

## Unreleased — PR-140 Persian date/finance (no peer)

| Before | After |
|--------|-------|
| Optional peer `react-persian-range-picker` | **Removed** — internal Jalali calendar on `/date-picker-jalali` |
| `components={{ date: PersianRangeDatePicker }}` | `components={{ date: PersianRangeDateCell }}` (context adapter) |
| Price = grouped number only | `currencyUnit: 'rial' \| 'toman'` + `persian-data-grid/finance` helpers |

```tsx
import { PersianRangeDateCell } from 'persian-data-grid/date-picker-jalali';
import { numberToPersianWords, formatPrice } from 'persian-data-grid/finance';

<DataGrid components={{ date: PersianRangeDateCell }} columnDefs={[
  { field: 'amount', type: 'price', currencyUnit: 'toman' },
]} />
```
