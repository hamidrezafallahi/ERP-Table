# Public API

Library entry for consumers: package root built from `publish/entry.ts`.

**Display name:** Persian Data Grid · **npm:** `persian-data-grid`

## Local development modes

Inspired by the Persian range-picker demo layout (`InitialComponent` / `DemoComponent`):

| Script | `VITE_APP_MODE` | UI |
|--------|-----------------|-----|
| `npm run dev:docs` | `docs` | Landing / live grid (`demo/src/InitialComponent.tsx`) |
| `npm run dev` / `dev:playground` | `dev` | QA playground (`demo/src/DemoComponent.tsx`) + live ERPTable |
| `npm run build:demo` | — | GitHub Pages bundle (`demo/dist`) |

The `demo/` Vite app is excluded from tsup publish. The npm `files` field ships `dist/`, `LICENSE`, and Vazirmatn `OFL.txt` — docs stay on GitHub, not in the package tarball.

## Composition

```tsx
import { DataGrid, themeDefault } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

<DataGrid
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columnConfig}
  rows={rows}
  tableHeight={tableHeight}
  recordPerPage={recordsPerPage}
  tableTitle={tableTitle}
  activeCollection={activeCollection}
  theme={themeDefault.withParams({ accentColor: '#1d4ed8' })}
  onReady={setController}
/>
```

Default `remoteApi` is **`NoopRemoteApi`** (no fetch, no ERP cookies). arianERP hosts inject `FetchRemoteApi` from **`persian-data-grid/adapters/arian-erp`** (not the package root) for dynamic select / `resolveOn`. Cookie `_auth`, `persist:arianERP`, and POST `Defaults`: [`host-arian-erp.md`](../examples/host-arian-erp/host-arian-erp.md).

`multiSelectConfig` is **optional**. Omit it to hide the choose-from-list button and modal. Pass it when the voucher needs that picker.

Published entry: `publish/entry.ts` (built by tsup). CSS is **not** auto-injected. Recommended: `import 'persian-data-grid/styles.css'`. Hosts without a CSS bundler call `injectGridStyles()` once (`injectERPTableStyles` is a deprecated alias). A host that does not import the CSS and does not call `injectGridStyles()` renders **unstyled** (PR-77 / D16). `sideEffects` is `["**/*.css"]`.

Theming: `theme?: GridTheme` defaults to `themeDefault` (rowHeight **40**). Canonical tokens are `--pdg-*` on `.pdg-grid`; `--erp-*` and `.erp-table` remain aliases for one version. `themeToggle` (default `true`) shows a light/dark button in product chrome (`GroupActionButtons` / `MobileActionButtons`). Passing a **custom** theme (`withParams` that is not stock light/dark) **locks** that toggle. `themeDark` is the stock dark theme (`themeErpDark` alias). Portal overlays copy `toCssVars()` so they inherit outside `.pdg-grid`.

Guards: `npm run typecheck:publish` and `npm run typecheck:host-ui`.

`ColumnDef<TRow>` is exported for hosts that already think in `field` / `headerName`. `DataGrid` / `createGrid` accept **either** `columns` + `rows` (ERP `ColumnSchema` / `RowInput`) **or** `columnDefs` + `rowData` + optional `getRowId` (PR-82). `ERPTable` is a deprecated alias of `DataGrid` (PR-87 / D13). `store` / `tableKey` / `actor` are optional (PR-83): omit `store` for in-memory (no IndexedDB); omit `actor` for anonymous admin; omit `tableKey` and one is generated. `createGrid()` is **sync** (PR-84 / D24); await `grid.ready` before using `engine`. `createERPTable` remains a deprecated async alias (`await createERPTable(cfg)` ≡ `await createGrid(cfg).ready`). React event props (PR-85): `onCellValueChanged`, `onRowValueChanged`, `onSelectionChanged`, `onCellFocused`, `onRowDataUpdated`, `onGridReady` — mapped from `EVENT_CATALOG` / the existing view store, not a second event bus. Imperative API (PR-86): `apiRef` / `onGridReady({ api })` / `grid.api` is `GridApi`. `UITableController` is a **type** on `.` and a **class** on `persian-data-grid/headless`. Domain `Row` keeps the host object by reference as `row.data` (no deep clone) so `valueGetter` can read it. **PR-88:** `DataGrid<TRow>` / `createGrid<TRow>` thread `TRow` through `rowData`, `columnDefs`, event `data`, `apiRef`, and `grid.api`; `TRow` is inferred from `rowData`. Updating `rowData` diffs by `getRowId` (default: array index) and does not reset the table. Convert with `toColumnSchema` / `toColumnDef` when you need the other shape.

Honest gap list (dead commands, stubs, exported-but-unwired types): [`docs/public-api-honesty.md`](./public-api-honesty.md).

Register or replace a cell editor without reading `CellRenderer`: [`cell-components.md`](./cell-components.md).

## Plugins (Excel / PDF)

```ts
import {
  createGrid,
  ExcelExportPlugin,
  PdfExportPlugin,
} from 'persian-data-grid';

const grid = createGrid({
  /* ... */
  plugins: [
    new ExcelExportPlugin({ download: true }),
    new PdfExportPlugin({ download: true }),
  ],
});
await grid.ready;

await grid.pluginHost.requestExport({ format: 'xlsx' });
await grid.pluginHost.requestExport({ format: 'pdf' });
```

- Events live on the **view stream** (`EXPORT_REQUESTED`, `XLSX_EXPORT_*`, `PDF_EXPORT_*`).
- Domain aggregates are never mutated by plugins.
- Imperative toolbar path still works: `exportActiveCollectionToExcel(controller)`.
- PDF toolbar button appears on desktop and mobile when `plugins` includes `PdfExportPlugin`. `ERPTable` forwards `plugins` to `createGrid`.
- Excel import toolbar button appears when `plugins` includes `ExcelImportPlugin`.

## Build

```bash
npm run build        # tsup → dist/index.js + index.cjs + index.d.ts
npm run verify:dist  # guards against stub regression
npm test
```

## Primary exports

| Export | Kind | Purpose |
|--------|------|---------|
| `createGrid` | function | Sync composition root. Await `grid.ready` for hydrate. |
| `createERPTable` | function | **Deprecated** async alias: `createGrid(cfg).ready` (D24). |
| `VirtualList` / `useVirtualWindow` | React | Adapter virtual scroll on Core viewport |
| `buildVirtualWindow` | function | Pure window helper (no DOM) |
| `CreateGridConfig` / `CreateGridResult` | types | Bootstrap contract (`CreateERPTable*` aliases remain) |
| `GridSession` / `ViewIntent` | types | Session-centric adapter API |
| `ColumnDef<TRow>` | type | Generic column (PR-81 / D14). Convert with `toColumnSchema` / `toColumnDef`. |
| `rowData` / `columnDefs` / `getRowId` | config | Host objects → domain `Row` (PR-82). `getRowId` defaults to array index. |
| `store` / `tableKey` / `actor` | config | Optional (PR-83). Omit `store` → in-memory, no IndexedDB. |
| `grid.ready` | Promise | Resolves when EventStore / snapshot hydrate finishes (PR-84). |
| `onCellValueChanged` | prop | One call per `CELL_CHANGED`: `{oldValue, newValue, colId, rowId, data}` (PR-85). |
| `onRowValueChanged` / `onRowDataUpdated` | prop | Same catalog stream (cell → row; `ROW_*` → rowData). |
| `onSelectionChanged` / `onCellFocused` | prop | Existing view store (`selectedRows` / `activeCell`). |
| `onGridReady` | prop | Once, `{ api: GridApi }` (same moment as `onReady`). |
| `apiRef` / `GridApi` | prop / type | Imperative host API (PR-86). Class `UITableController` lives on `/headless`. |
| `applySort` / `SortModel` / `cycleSortModel` | function / type | Pure multi-sort (PR-89) + header click cycle (PR-91). Session `SET_SORT_MODEL` reorders rows (PR-90). Desktop header: click asc→desc→none, Shift+Click multi-sort, `aria-sort`. |
| `GridApi.getSortModel` / `setSortModel` | method | Imperative sort (PR-91). |
| `applyFilter` / `FilterModel` | function / type | Pure column filter (PR-92). Session `SET_FILTER_MODEL` hides rows (PR-94). Header filter icon + optional `floatingFilter`. |
| `filterComponents` / `FilterComponent` | prop / type | Custom filter popover registry (PR-95). Keys match `ColumnDef.filter`. |
| `rowModelType` / `GridDatasource` | prop / type | `infinite` / `serverSide`: skip local sort/filter; block cache + `api.refreshServerSide()` (PR-96 / PR-102). |
| `loading` / `loadingOverlayComponent` / `noRowsOverlayComponent` | prop | Full-body overlays + infinite skeleton rows (PR-103). |
| `CellRange` / `clickCell` / `shiftArrowCell` | type / function | Pure cell-range model on `/headless` (PR-104). |
| `GridApi.getCellRanges` / `addCellRange` | method | Cell-range UI + imperative API (PR-105). Shift/Ctrl+click; Shift+arrow; Ctrl+A. |
| `copyFormattedValue` / `copyHeadersToClipboard` / `copyDigitsAsLatin` | prop | System clipboard copy options (PR-106). Default: raw values, no headers, latin digits. |
| `onClipboardCopy` / `processCellForClipboard` | prop / callback | Override or cancel `Ctrl+C` clipboard write (PR-106). |
| `buildClipboardPayload` / `copyGridSelectionToClipboard` / `cutGridSelectionToClipboard` | function | Pure TSV/HTML builder + clipboard helpers on `/headless` (PR-106/109). |
| `pasteAddsRows` / `onClipboardPaste` | prop | Clipboard paste options (PR-107). Default adds rows when paste extends past the grid. |
| `parseDelimitedClipboardText` / `pasteGridFromClipboard` | function | TSV/CSV parse + paste helper on `/headless` (PR-107). |
| `buildFillUpdates` / `applyFillHandleDrag` | function | Fill-handle series + drag apply on `/headless` (PR-108). |
| `quickFilterText` / `applyQuickFilter` / `QuickFilterIndex` | prop / function / class | Session quick filter **hides** rows (PR-93). Distinct from `GridSearchPanel` find-and-navigate. `api.setQuickFilter`. |
| `GridApi.getFilterModel` / `setFilterModel` | method | Imperative column filters (PR-94). |
| `GridApi.autoSizeColumns` / `sizeColumnsToFit` | method | Canvas off-DOM auto-size + fit-to-viewport (PR-112). Double-click column resize handle auto-sizes that column. |
| `ColumnDef.flex` | field | Flex columns share remaining scrollport width after fixed columns (PR-112). Cleared when session width is set (drag/auto-size). |
| `ColumnGroupDef` / `ColDefOrGroup` | type | Nested column groups in `columnDefs`; multi-row header with collapse + group reorder (PR-113). |
| `columnMenuItems` / `onColumnMenuAction` | prop / callback | Header ⋮ menu: sort, filter, hide, pin, auto-size, configure columns; trim/reorder defaults or append custom items (PR-114). |
| `ColumnMenuItemsConfig` / `ColumnMenuActionEvent` | type | Menu item list or `(defaults) => items` fn; custom action payload with `columnId` + `name` (PR-114). |
| `GridApi.getColumnState` / `applyColumnState` | method | Width, order, hide, pin, sort (PR-115). |
| `stateKey` | prop | Persist column layout to `localStorage` and restore on next create; emits `COLUMN_STATE_CHANGED` (PR-115). |
| `pinnedTopRowData` / `pinnedBottomRowData` | prop | Sticky display-only rows outside the virtual window (PR-116). Not sorted/filtered/selected with body rows. |
| `ColumnDef.aggFunc` / `ColumnAggIndex` / `applyAgg` | field / class / function | Incremental aggregates (`sum`/`avg`/…/custom); integer minor units (PR-118 / RFC-002). |
| `footer` / `footerRows` | prop | Footer reads `aggFunc`; multi-row `footerRows` with optional per-row override (PR-119). Columns without `aggFunc` stay empty when any column declares one. |
| `groupBy` / `groupDefaultExpanded` | prop | Single-level row grouping (PR-120 / RFC-002). Only the first column is active; session-only (not EventStore). Flat UI index includes synthetic group rows. |
| `singleClickEdit` / `stopEditingWhenCellsLoseFocus` / `editType` | prop | Edit cycle (PR-126). Drafts are session-only until Enter/Tab/blur commit; Esc cancels. `editType: 'fullRow'` edits every editable column on the row. |
| `GridApi.startEditingCell` / `stopEditing(cancel?)` | method | Start draft edit; `stopEditing(true)` cancels without EventStore write (PR-126). |
| `locale` / `direction` / `numberingSystem` | prop | `fa` \| `en` \| `ar` (PR-127). `dir` defaults from locale; override with `direction`. Digits via Intl `numberingSystem`. |
| `persian-data-grid/locales/{fa,en,ar}` | subpath | Message packs + `formatLocaleNumber` / `formatLocaleDate` (PR-127). |
| `dateAdapter` / `jalaliAdapter` / `gregorianAdapter` | prop / export | Pluggable calendar (PR-128 / D21). Default jalali for `fa`. |
| `persian-data-grid/date-picker-jalali` | subpath | Internal Jalali single/range calendar UI (PR-140). No peer dependency. |
| `persian-data-grid/finance` | subpath | Rial/Toman, Persian number-words, FY periods, Iran holidays (PR-140). |
| `GridApi.setRowGroupColumns` / `getRowGroupColumns` / `toggleRowGroup` / `setGroupDefaultExpanded` | method | Imperative grouping + expand/collapse (PR-120). |
| `SET_ROW_GROUP_COLUMNS` / `TOGGLE_ROW_GROUP` | command | Engine session commands for grouping (PR-120). |
| `ERPTableGroupRow` / group chevron | UI | Group row with `aria-expanded` / `aria-level`, leaf indent; ArrowLeft/Right toggle; selecting a group selects children (PR-121). |
| `ExportSource.rows[].kind` / `outlineLevel` | type | Export projection includes group headers (PR-122). |
| `persian-data-grid/plugins/csv` / `CsvExportPlugin` | subpath | CSV export with optional Group column; UTF-8 BOM (PR-122). |
| `ViewportCalculator` / `calculateColumnViewport` | class / function | Vertical row window + horizontal column window (PR-98). |
| `floatingFilter` | prop | Optional filter row under the header (PR-94). |
| `ColumnDefinition` / `ColumnViewBinding` | types | Core column + view bindings |
| `mapColumnSchemas` | function | Host ColumnSchema → definition + bindings |
| `toColumnSchema` / `toColumnDef` | function | Bidirectional `ColumnDef` ↔ `ColumnSchema` |
| `InMemoryEventStore` | class | Node/test event store |
| `IndexedDbEventStore` | class | Browser-durable event store |
| `SnapshotStrategy` / `InMemorySnapshotStore` | class | Opt-in aggregate snapshots via `snapshotStore` |
| `EVENT_CATALOG` | const | Plugin-friendly event tokens |
| `ExcelExportPlugin` / `PdfExportPlugin` | class | Prefer `persian-data-grid/plugins/*`. Root re-exports are deprecated (PR-76). PDF default is legacy `TextPdfRenderer`; Persian = `createVazirmatnPdfExportPlugin` from fonts/vazirmatn. |
| `VazirmatnPdfRenderer` | class | Persian table PDF (Vazirmatn OFL, RTL). Requires font bytes from `./plugins/pdf/fonts/vazirmatn`. Optional `DocumentPdfTemplate` (PR-141): header/footer/logo/page#/signature/stamp/page totals. |
| `DocumentPdfTemplate` | type | Document chrome for `VazirmatnPdfRenderer` / `PdfExportPlugin({ template })` (PR-141). |
| `TextPdfRenderer` | class | Legacy Helvetica PDF (8×40). Opt-in via `PdfExportPlugin({ renderer })`. |
| `PluginHost` | class | Register plugins + `requestExport` |
| `NoopRemoteApi` | class | Default remote (no fetch). arianERP injects `FetchRemoteApi` from `./adapters/arian-erp`. |
| `DataGrid` / `DataGridProps` | UI | Canonical React grid (PR-87 / D13). |
| `ERPTable` / `ERPTableProps` | UI | **Deprecated** aliases of `DataGrid` / `DataGridProps`. |
| `useGrid` / `useERPTable` | hook | Canonical / **deprecated** alias. |
| `CellRenderer` / `CellRenderContext` / `CellComponentMap` | UI | `columns[].render` then `components[fieldType]`, then FieldType switch. |
| `highlightIfCurrentSearch` / `highlightSearchText` | function | Search `mark` for custom cells (PR-71). `textArea` / `description` use it by default. |
| `GridTheme` / `themeDefault` / `themeDark` | theme | `DataGrid theme={...}` writes `--pdg-*` and `--erp-*` aliases on the root. |
| `themeErp` / `themeErpDark` | theme | **Deprecated** aliases of `themeDefault` / `themeDark`. |

## Event stores

```ts
import {
  IndexedDbEventStore,
  InMemoryEventStore,
  DEFAULT_EVENT_STORE_PREFIX,
  LEGACY_EVENT_STORE_PREFIX,
} from 'persian-data-grid';

const memory = new InMemoryEventStore();
const durable = IndexedDbEventStore.inMemory(); // tests
// const browser = await IndexedDbEventStore.open(
//   `${DEFAULT_EVENT_STORE_PREFIX}:erp`,
// );
```

Bootstrap default is `{DEFAULT_EVENT_STORE_PREFIX}:{store}` (`persian-data-grid-events:…`). `0.5.x` used `erp-table-events:{store}` — pass `eventStoreName: LEGACY_EVENT_STORE_PREFIX` to keep existing IndexedDB data. There is no automatic copy between the two names.

Pass a custom store via bootstrap when host wiring supports it (see `CreateERPTableConfig.eventStore` when provided).

## Snapshots (opt-in)

Default bootstrap is **dual-write to the table repository**. Snapshots are off unless you pass `snapshotStore`.

```ts
import {
  createGrid,
  InMemoryEventStore,
  InMemorySnapshotStore,
} from 'persian-data-grid';

const eventStore = new InMemoryEventStore();
const snapshotStore = new InMemorySnapshotStore();

const grid = createGrid({
  /* ... */
  eventStore,
  snapshotStore,
  snapshotEveryNEvents: 200, // default
});
await grid.ready;

await grid.snapshotStrategy?.loadWithCatchUp(`table:${grid.tableKey}`);
```

- No `snapshotStore` → `snapshotStrategy` is `undefined`; repository dual-write unchanged.
- With `snapshotStore` → `SnapshotStrategy` snapshots every N appended events and `createGrid` runs catch-up on `grid.ready` (`last snapshot + events after version`).

## Stability

- Event type strings in `EVENT_CATALOG` are semver-stable.
- Prefer `GridSession` over reaching into `TableEngine` from host apps.

## Desktop virtualization (default **on**)

```tsx
{/* Default: virtual scroll when session is present */}
<DataGrid tableHeight={480} />

{/* Classic pagination (ERP hosts) */}
<DataGrid virtualization={false} tableHeight={480} />
```

- Default is `ERPTableVirtualBody` when `session` exists (PR-97 / D17).
- Pass `virtualization={false}` for `ERPTableBody` + `ERPTablePagination`.
- Pagination and virtualization are mutually exclusive in the desktop chrome.

## Column virtualization (PR-98)

Header, body, and footer share one horizontal window (`ColumnWindowProvider` on the desktop scrollport). Pinned index column always mounts; off-screen scrollable columns become `data-pdg-col-spacer` cells. RTL scroll offset is normalized via `scrollOffsetFromInlineStart`.
- Core helper: `controller.getAllUIRows()` (full active collection, no page slice).
- Grid search / validation error navigation uses `revealRow`: virtual → `CHANGE_VIEWPORT`, else → `CHANGE_PAGE`.
- Domain types must not import React.

## Performance (PR-100 / PR-101)

Published numbers for **100 000** hydrated domain rows live in [`docs/performance.md`](./performance.md) (throughput + **215 MB** heap for 100k×20). CI enforces ceilings from JSON / `DEFAULT_GRID_MEMORY_BUDGET`. Do not claim scale with adjectives — paste the table.

## Custom cell `render` (PR-54)

```tsx
<ERPTable
  columns={[
    {
      fieldName: 'side',
      fieldCaption: 'طرف',
      fieldType: 'static',
      visibility: { kind: 'always' },
      render: (ctx) => <span data-erp-custom-cell="side">{String(ctx.value ?? '')}</span>,
    },
  ]}
/>
```

`CellRenderer` (desktop + mobile) calls `columns[].render` **before** the FieldType switch. Omit it to keep built-in editors. `returnDisplayValue` is still the engine display formatter, not a React renderer.

## Cell `components` map (PR-55)

```tsx
<ERPTable
  components={{
    checkbox: (ctx) => (
      <input
        type="checkbox"
        checked={ctx.value === true}
        onChange={(e) => ctx.dispatchChangeValue(e.target.checked)}
      />
    ),
  }}
/>
```

`ERPTableProps.components` is a `Partial<Record<FieldType, CellComponent>>` plus free string keys. Registry lives on host context. Lookup order: column `render` → `components[fieldType]` → built-in switch. Other FieldTypes stay untouched when you only override `checkbox`.

`textArea` is a real `FieldType`. The editor lives in `TextAreaCell` and is registered in `DEFAULT_CELL_COMPONENTS` — not as a `switch` case in `CellRenderer`. Enter inside the textarea inserts a newline (grid navigation is skipped). Tab still moves to the next cell.

Host guide (override, one-off `render`, new type): [`cell-components.md`](./cell-components.md). Keyboard shortcuts: [`keyboard.md`](./keyboard.md).

## Column resize (PR-58)

Drag the trailing edge of a desktop header cell. Width is stored in session view state (`columnWidths`) for this table instance — **not** EventStore. `columns[].minWidth` is the floor (default 144px; index column 168px). Mobile has no resize handle.

Honesty inventory: [`public-api-honesty.md`](./public-api-honesty.md).

## Column pin (PR-59 / PR-110)

Set `pinned: 'start' | 'end' | null` on `ColumnDef`. In RTL grids, **`start`** is the inline-start edge (right); **`end`** is inline-end (left). The `index` column is always pinned at **`start`**. There is no `pinnedColumns` prop — pin is per column definition. Works with column virtualization (PR-98): start/end zones always mount; the middle scrolls.

## Column hide / show (PR-111)

```ts
api.setColumnVisible('amount', false);
api.setColumnVisible('amount', true);
```

`ColumnDef.hide` is applied at create and when `columnDefs` updates. `applyColumnState([{ colId, hide }])` also toggles visibility. Domain `visibility: { kind: 'never' }` cannot be overridden (RBAC). The `index` column cannot be hidden. Visible columns keep contiguous `aria-colindex` (1-based).

## Column reorder (PR-61)

Drag a desktop header cell (not the pinned `index` column, not the resize handle). `COLUMN_REORDERED` calls `Table.reorderColumns` through AppService (dual-write to EventStore) using display-order indices. Host schema refresh (`setColumns`) keeps the domain `order` unless the column is new. Keyboard reorder is Phase 12.

## Accessibility baseline (PR-62)

Desktop and mobile `ERPTable` chrome expose `role="grid"` on the `<table>`, with `role="row"` / `columnheader` / `gridcell`, plus `aria-colcount` / `aria-rowcount`. `aria-colindex` and `aria-rowindex` are 1-based (header is row 1). Virtualized bodies use the absolute collection index, not the DOM window offset.

The active cell is `aria-selected` on that `gridcell` and referenced from the grid via `aria-activedescendant`. Row checkboxes use `aria-label` (`Select row N` / `انتخاب سطر N`). Icon-only toolbar buttons use `aria-label` from `messages` and a visible `:focus-visible` ring (`--erp-accent`). A polite `aria-live` region (`GridLiveRegion`) announces sort, filter, selection, and validation changes from `messages` (PR-125). This is an AT baseline, not a WCAG claim.


