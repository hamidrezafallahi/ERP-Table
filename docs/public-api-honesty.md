# Public API honesty

**Language (D23 / PR-129):** English is the source of truth for status labels and table headers; Persian notes remain for ERP hosts and agents. Product docs live on the VitePress site (`website/`, `yarn docs:dev`).

This file is an inventory, not a marketing roadmap. Every row is greppable in this repo. **PR-46 did not change runtime behavior.**

Audience: ERP hosts and the next agent. When a gap is wired, update this file and `docs/__tests__/public-api-honesty.spec.ts` together.

این سند inventory است، نه roadmap تبلیغاتی. هر ردیف با grep در همین ریپو قابل تأیید است. **رفتار runtime در PR-46 عوض نشده.**

مخاطب: میزبان ERP و ایجنت بعدی. وقتی یک شکاف سیم شد، همین فایل و تست `docs/__tests__/public-api-honesty.spec.ts` را با هم به‌روز کن.

Related: [`public-api.md`](./public-api.md) (export surface), [`cell-components.md`](./cell-components.md), [`event-catalog.md`](./event-catalog.md), VitePress site (`yarn docs:dev`), [`EXECUTION_PLAN.md`](../EXECUTION_PLAN.md).

---

## How to read the status column

| Status | Meaning |
|--------|---------|
| **live** | handler و مسیر محصول دارد |
| **dead** | نوع / export هست؛ handler یا مسیر UI ندارد |
| **stub** | `case` وجود دارد ولی بدنه خالی یا بی‌اثر است |
| **removed** | از commands/handlers حذف شده؛ فقط در این سند برای تاریخچه مانده |
| **exported-only** | از پکیج export می‌شود؛ مسیر محصول آن را نمی‌سازد |
| **advertised** | README / catalog طوری می‌گوید که runtime ندارد |

---

## Commands

| Token | Status | Evidence | Scheduled |
|-------|--------|----------|-----------|
| `CLEAR_ROW_SELECTION` | **live** (PR-48) | عضو `EngineTableCommand`. `tableEngine` → `SelectionManager.clearRowSelection` (`selectedRows: {}`). `UITableController.dispatch` / `clearRowSelection()`. `isApplicationTableCommand` = false. | — |
| `RESIZE_COLUMN` | **live** (PR-58) | view state جلسه (`columnWidths`). UI: `UI_RESIZE_COLUMN` از لبهٔ `<th>` (`data-erp-col-resize`). `minWidth` کف (پیش‌فرض ۱۴۴؛ ایندکس ۱۶۸). `isApplicationTableCommand` = false. **بدون EventStore.** موبایل هندل ندارد. | — |
| `COLUMN_REORDERED` | **live** (PR-61) | عضو `ApplicationTableCommand`. `TableAppService` → `ReorderColumnCommandHandler` → `Table.reorderColumns` (بازنویسی `order`). dual-write به EventStore. UI: درگ `<th>` دسکتاپ (`data-erp-col-drag`)؛ ستون `index` جابه‌جا نمی‌شود. `setColumns` ترتیب دامنه را هنگام refresh اسکیما نگه می‌دارد. کیبورد: Phase 12. | — |
| `SET_UNIT_LEVEL` | **removed** (PR-48) | از `application/commands`، `TableAppService`، `ChangeUnitLevelHandler` و `addColumns([])` حذف شد. هیچ UI این command را نمی‌فرستاد. | — |

سایر commandهای `TableCommand` در `tableEngine.dispatch` یا `TableAppService.execute` `case` دارند (از جمله `TOGGLE_SELECT_PAGE_ROWS` که از هدر `TOGGLE_PAGE_ROW_SELECTED` می‌آید).

---

## Types / engine APIs that look live

| Surface | Status | Evidence | Scheduled |
|---------|--------|----------|-----------|
| `IRule.asyncValidator` | **live** (PR-47) | `TableEngine.validation` اگر ستونی `asyncValidator` داشته باشد await می‌کند و خطا را در همان `CellError` map می‌گذارد. بدون rule ناهمگام، `validation()` همان تیک sync می‌ماند. `isValidCell` sync است؛ نتیجهٔ async بعد از settle در cache/`errors` می‌آید و store را bump می‌کند. | — |
| `SparseRowIndex` | **live** (PR-49) | Engine/session ایندکس تنک ردیف‌های UI را با ترتیب ستون `index` نگه می‌دارند. `ERPTableVirtualBody` / `useVirtualWindow` / `buildVirtualWindowFromSparse` پنجره را از `SparseRowIndex.projectVisible` می‌گیرند — بدون clone+sort کل `getAllUIRows()` در رندر مجازی. افزودن/حذف/reorder ایندکس را invalidate می‌کند. export عمومی ماند. | — |
| `SnapshotStrategy` / `InMemorySnapshotStore` | **live** (PR-50, opt-in) | `CreateERPTableConfig.snapshotStore?` — فقط وقتی پاس داده شود `new SnapshotStrategy` در `bootstrap/index.ts`. پیش‌فرض dual-write repository است. `loadWithCatchUp` هنگام create اجرا می‌شود. | — |
| `ColumnViewBinding.render` | **live** (PR-54) | `toColumnViewBinding` از `schema.render` پر می‌شود (نه `returnDisplayValue`). `CellRenderer` قبل از switch `FieldType` `resolveCustomCellNode` را صدا می‌زند — دسکتاپ و موبایل همان کامپوننت را دارند. `returnDisplayValue` فقط فرمت نمایش موتور است. | — |
| Pin ستون | **live** (PR-59 / PR-110 / D19) | `ColumnDef.pinned: 'start' \| 'end'`. Index همیشه `start`. سه ناحیهٔ رندر (start / scroll / end) در هدر، بدنه، فوتر، spacer مجازی. sticky با offset تجمعی. بدون `pinnedColumns` prop. | — |
| Hide/show ستون | **live** (PR-111) | `api.setColumnVisible(colId, visible)` + `ColumnDef.hide` واکنشی + `applyColumnState.hide`. `visibility.kind === 'never'` قابل override نیست. Index مخفی نمی‌شود. | — |
| `role="grid"` | **live** (PR-62) | `<table role="grid">` دسکتاپ و موبایل. هدر `columnheader`، سلول `gridcell`، `aria-colindex` / `aria-rowindex` (مجازی: ایندکس مطلق مجموعه، نه ایندکس DOM). | — |
| سلول فعال `aria-selected` | **live** (PR-63) | `aria-selected` روی `gridcell` فعال + `aria-activedescendant` روی grid. چک‌باکس ردیف `aria-label` از `general.selectRow` (الگوی DemoIndexCol). میانبر `KEY_DOWN` عوض نشد. | — |
| live region (sort/filter/select) | **live** (PR-125) | `GridLiveRegion` با `aria-live="polite"`؛ متن از `messages` (`a11y.*`) | — |
| تولبار آیکونی | **live** (PR-64) | `ToolbarIconButton` با `aria-label` از `messages`. `role="toolbar"`. فوکوس `:focus-visible` با `var(--erp-accent)` — بدون `outline-none` روی این دکمه‌ها. | — |
| `VazirmatnPdfRenderer` / Persian PDF | **live** (PR-66 / PR-76) | Renderer requires font bytes. `createVazirmatnPdfExportPlugin` on `./plugins/pdf/fonts/vazirmatn`. Default `PdfExportPlugin()` is legacy `TextPdfRenderer` so `.` / `./plugins/pdf` stay font-free. | — |
| دکمهٔ PDF تولبار | **live** (PR-67) | وقتی `plugins` شامل `PdfExportPlugin` باشد (`name === 'pdf-export'`). دسکتاپ و موبایل. `ERPTable` همان `plugins` را به `createERPTable` می‌دهد. بدون plugin دکمه نیست. | — |
| دکمهٔ import اکسل تولبار | **live** (PR-68) | وقتی `plugins` شامل `ExcelImportPlugin` باشد (`name === 'excel-import'`). فایل‌پیکر → `pluginHost.requestImport`. بدون plugin دکمه نیست. | — |
| فوتر اعداد / highlight جستجو | **live** (PR-69) | `tfoot.erp-table-footer` با `--erp-bg` / `--erp-fg` و `tabular-nums`. `mark.erp-search-hit` از `--erp-search-match` / `--erp-search-other`. query لاتین روی رقم فارسی هم mark می‌شود. | — |
| سلول بدون `@ts-nocheck` | **live** (PR-70 / PR-74) | مسیر سلول پکیج typed است. host-glue (`useVoucherDescription`, `useERPGrid`) به `examples/host-arian-erp/` منتقل شد. صفر `@ts-nocheck` در `ui/**`. بدون peer `antd`. | — |
| mark جستجو در textArea / custom | **live** (PR-71) | `CellRenderContext.searchQuery` + `isCurrentSearchMatch`. `TextAreaCell` و `description` حتی وقتی سلول فعال است `mark.erp-search-hit` می‌گذارند. Host با `highlightIfCurrentSearch`. ویجت‌های غیرمتنی (چک‌باکس، تاریخ) mark ندارند. | — |
| `TextPdfRenderer` | **exported-only** (legacy) | Helvetica و سقف ۸ ستون × ۴۰ سطر. دیگر پیش‌فرض پلاگین نیست؛ Host می‌تواند `renderer: new TextPdfRenderer()` تزریق کند. | — |

---

## Defaults that docs understate

این بخش برای پیش‌فرض‌هایی بود که سند با runtime یکی نبود. بعد از PR-59 ردیف بازی نمانده؛ شکاف‌های باقی در جدول Commands / Types بالا و Phaseهای باز پلن هستند.

---

## Catalog tokens without a product path

`EVENT_CATALOG` این‌ها را پایدار اعلام می‌کند؛ امروز از مسیر محصول emit نمی‌شوند (یا فقط از stub):

| Event | Why listed here |
|-------|-----------------|
| `UNIT_COLUMN_ADDED` | **reserved, no emitter.** توکن catalog برای semver مانده. stub `SET_UNIT_LEVEL` در PR-48 حذف شد؛ هیچ handler این رویداد را نمی‌سازد |

توکن‌ها را از catalog حذف نکن مگر PR مربوطه تصمیم بگیرد — semver-stable در `docs/public-api.md`.

---

## What is actually live (do not “fix” these as gaps)

- Cell/row/page/viewport commands با handler در engine یا AppService (از جمله `CLEAR_ROW_SELECTION`)
- Undo سلول + `ROW_ADDED` / paste batch (Phase 2–5)
- Desktop virtualization **default on** (PR-97 / D17) when `session` is present — `virtualization={false}` keeps classic pagination
- Column virtualization **live** (PR-98). Shared `ColumnWindowProvider` for header/body/footer; `ViewportCalculator.calculateColumns`; index pin always mounted; RTL scroll normalized.
- Hot-path indexes **live** (PR-99). `SparseRowIndex.neighbor`, incremental UI insert, QuickFilter search, `ColumnTotalsIndex` footer.
- **100k performance numbers published** (PR-100). `docs/performance.md` + README table; CI harness hydrates 100 000 domain rows.
- Lazy host cells + **215 MB** heap for 100k×20 under 300 MB budget **live** (PR-101).
- Infinite/serverSide **block cache** **live** (PR-102). `cacheBlockSize` / `maxBlocksInCache` / `refreshServerSide`.
- Loading / no-rows overlays + infinite skeleton **live** (PR-103). `loading`, `loadingOverlayComponent`, `noRowsOverlayComponent`.
- Excel export/import plugin روی `EXPORT_REQUESTED`
- Theming: `theme` / `themeErp` / `themeErpDark` / portal vars (Phase 6–7)
- `controller.getAllUIRows()` — کل collection فعال، بدون slice صفحه
- Snapshot opt-in: `createERPTable({ snapshotStore })` (D7)
- Default `remoteApi` = `NoopRemoteApi` (PR-51 / D1). ERP injects `FetchRemoteApi` from `persian-data-grid/adapters/arian-erp` (PR-80).
- `multiSelectConfig` optional (PR-53 / D11); omit = no choose-from-list chrome
- `ColumnSchema.render` / `ColumnViewBinding.render` (PR-54); omit = built-in FieldType editor
- `ERPTableProps.components` (PR-55); override e.g. `checkbox`, other FieldTypes keep the switch
- `FieldType.textArea` (PR-56) via `DEFAULT_CELL_COMPONENTS` / `TextAreaCell`; Enter in the textarea does not move the active cell
- Column resize (PR-58): drag the desktop `<th>` edge; session `columnWidths` only (not EventStore)
- Index column pin (PR-59 / D10): sticky `inset-inline-start` on the `index` cell; no arbitrary column pin API
- `COLUMN_REORDERED` (PR-61): AppService + header drag on desktop `<th>` + EventStore; `setColumns` keeps domain `order`
- `role="grid"` (PR-62): desktop + mobile table; `aria-rowindex` is the absolute collection index (virtual window included)
- Active cell (PR-63): `aria-selected` on the active `gridcell` + `aria-activedescendant` on the grid; row checkbox `aria-label` (`general.selectRow`)
- Live region (PR-125): polite `GridLiveRegion` announces sort / filter / selection / validation from `messages`
- Toolbar icons (PR-64): `aria-label` from `messages`; `:focus-visible` outline uses `--erp-accent`
- `VazirmatnPdfRenderer` (PR-65/66/76): Persian table PDF with embedded Vazirmatn (OFL) when font bytes are passed. Default `PdfExportPlugin` is legacy Text (PR-76). Font subpath: `plugins/pdf/fonts/vazirmatn`.
- PDF toolbar (PR-67): `PdfExportToolbarButton` when `PdfExportPlugin` is in `ERPTable plugins`
- Excel import toolbar (PR-68): `ExcelImportToolbarButton` when `ExcelImportPlugin` is in `ERPTable plugins`
- Footer totals / search marks (PR-69): semantic `--erp-fg` / `--erp-search-match` / `--erp-search-other`; numeric footer on the live demo
- Cell renderer (PR-70 / PR-74): no `@ts-nocheck` under `ui/**`; host glue in `examples/host-arian-erp/`
- Search marks in registered cells (PR-71): `textArea` / `description` use `highlightIfCurrentSearch`; custom `render` gets `searchQuery` / `isCurrentSearchMatch`
- `ColumnDef<TRow>` + `toColumnDef` / `toColumnSchema` **live** (PR-81). Mapper is lossless for `ColumnSchema` round-trips.
- `rowData` + `columnDefs` + `getRowId` **live** (PR-82). Host objects map to domain `Row` with `row.data` by reference. Diff on `rowData` change does not reset the table. `columns`/`rows` still work.
- `store` / `tableKey` / `actor` optional **live** (PR-83). No `store` → `LocalTableRepository` + `InMemoryEventStore` (IndexedDB not opened). No `actor` → `{ userId: 'anonymous', roles: ['admin'] }`. No `tableKey` → generated `pdg-…` (stable for the React component lifetime). Passing them keeps the 0.5.x durable path.
- `createGrid()` sync + `grid.ready` **live** (PR-84). Instance returns immediately; EventStore / snapshot load is lazy. `createERPTable` is a deprecated async alias (`await createERPTable(cfg)` ≡ `await createGrid(cfg).ready`). Both paths work.
- React event props **live** (PR-85). `onCellValueChanged` / `onRowValueChanged` come from `CELL_CHANGED` on the EventStore catalog stream (exactly one cell callback per edit). `onRowDataUpdated` from row catalog events. `onSelectionChanged` / `onCellFocused` from the existing view store. `onGridReady` fires once with `{ api: GridApi }` (PR-86). `onSortChanged` is not here (sort = Phase 18).
- `GridApi` / `apiRef` **live** (PR-86). Documented methods wrap `UITableController` + `PluginHost`. The class is not a value export of `.` (type-only there; class on `/headless`). `applyColumnState` applies width, order, and hide (`setColumnVisible`, PR-111). `exportDataAsExcel` is `pluginHost.requestExport({ format: 'xlsx' })`. `onReady(controller)` remains for one version.
- D13 public rename **live** (PR-87). `DataGrid` / `DataGridProps` / `useGrid` / `themeDefault` / `themeDark` / `.pdg-grid` / `--pdg-*`. Old names (`ERPTable`, `themeErp`, `.erp-table`, `--erp-*`) are `@deprecated` aliases for one version. Codemod: `npx persian-data-grid-codemod` (`packages/codemod`, PR-131; compat `scripts/codemod-v0.7.mjs`).
- End-to-end `DataGrid<TRow>` **live** (PR-88). `rowData`, `columnDefs`, `getRowId`, `onCellValueChanged` / `onRowValueChanged` / `onRowDataUpdated` / `onSelectionChanged`, `apiRef`, `onGridReady.api`, and `createGrid().api` carry `TRow`. `TRow` is inferred from `rowData` (no annotation required). Wrong `field` is a type error (`ui/data-grid-generics.typecheck.tsx`). Domain `Row.data` is still `unknown` at the engine boundary.
- Pure `applySort` / `SortModel` **live** (PR-89) in `engine/dataOps/sortModel.ts`. Multi-sort, stable, nulls last, `Intl.Collator('fa')`, jalali date keys, `ColumnDef.comparator` override, `index` tie-breaker. **Wired to the row index** in PR-90 (`SET_SORT_MODEL` / `UI_SET_SORT_MODEL`). **Header click / `aria-sort` / Shift+Click multi-sort live** (PR-91); click vs drag uses a 5px movement threshold. `GridApi.getSortModel` / `setSortModel` live. `onSortChanged` is still absent.
- Pure `applyFilter` / `FilterModel` **live** (PR-92) in `engine/dataOps/filterModel.ts`. text / number / date / set / boolean / custom, column-level AND/OR, Persian/Arabic digit + ي/ك normalization. **Wired to the row index + header UI** in PR-94 (`SET_FILTER_MODEL`, filter icon popover, optional `floatingFilter`).
- `quickFilterText` **live** (PR-93). Hides non-matching rows via `QuickFilterIndex` (cached blobs + inverted tokens; typing reuses the index). `SET_QUICK_FILTER_TEXT` / `api.setQuickFilter` / prop `quickFilterText`. **`GridSearchPanel` remains find-and-navigate** and does not hide rows.
- Column filter UI **live** (PR-94). Header filter icon → themed portal popover (`useThemePortalStyle`); `data-pdg-filter-active`; optional `floatingFilter` row; `api.getFilterModel` / `setFilterModel`.
- Custom filter components **live** (PR-95). `filterComponents` registry + `ColumnDef.filter` custom key / `{ type, params }`; demo «فقط مبالغ رُند» on Bed.
- Server/infinite datasource **live** (PR-96 / PR-102). `rowModelType` + `GridDatasource.getRows`; LRU block cache (`cacheBlockSize` / `maxBlocksInCache`); `api.refreshServerSide()`; filter/sort purge cache; loading placeholders (`__pdgLoading`).
- Loading / no-rows overlays **live** (PR-103). Host `loading` prop; default overlays; custom `loadingOverlayComponent` / `noRowsOverlayComponent`; skeleton cells for `__pdgLoading` rows.
- Cell-range **model** **live** on `/headless` (PR-104). Pure `CellRange` + anchor/focus helpers.
- Cell-range **UI** **live** (PR-105). Shift/Ctrl+click, Shift+arrow, Ctrl+A; `--pdg-range-*` chrome; `api.getCellRanges()` / `addCellRange()`.
- System **clipboard copy** **live** (PR-106). `Ctrl+C` → TSV + HTML; props `copyFormattedValue`, `copyHeadersToClipboard`, `copyDigitsAsLatin`, `onClipboardCopy`.
- System **clipboard paste** **live** (PR-107). `Ctrl+V` → TSV parse + tile; `pasteAddsRows`, `onClipboardPaste`; `PASTE_CELLS` batch + one undo; Persian number/date coercion.
- **Fill handle** **live** (PR-108). Corner drag on cell range; numeric + Jalali series; Ctrl+drag copy-only; single undo via shared `PASTE_CELLS` batch.
- Column header menu **live** (PR-114). ⋮ button on desktop header → `ColumnMenuPopover` (sort asc/desc/none, filter, hide, pin start/end/none, auto-size, configure columns). `columnMenuItems` trims/reorders defaults or appends `{ name, label }` custom entries; `onColumnMenuAction` handles custom items. Runtime pin via `SET_COLUMN_PIN`. `ColumnsPanelPopover` toggles column visibility. Keyboard: Arrow/Enter/Esc. Index column pin/hide locked.
- Column state persist **live** (PR-115). `getColumnState` / `applyColumnState` include width, order, hide, pin, sort. Optional `stateKey` restores from `localStorage` on create; layout changes emit `COLUMN_STATE_CHANGED` on the EventStore.
- Pinned top/bottom rows **live** (PR-116). `pinnedTopRowData` / `pinnedBottomRowData` render in sticky `tbody`s outside the virtual window; footer aggregation (`ColumnTotalsIndex`) unchanged.
- Aggregation engine **live** (PR-118 / RFC-002 Accepted). `ColumnDef.aggFunc`, pure `applyAgg` / `ColumnAggIndex` with O(1) patch for sum/avg/count; integer minor units.
- Footer from aggregation model **live** (PR-119). `ERPTableFooter` uses `getColumnAggs`; `footerRows` for multi-row (sum/avg); legacy sum only when no column sets `aggFunc`.
- Single-level row grouping engine **live** (PR-120). `groupBy` / `groupDefaultExpanded`; flat `SparseRowIndex` with synthetic group row ids; `api.setRowGroupColumns` / `toggleRowGroup`. Chevron UI is PR-121.
- Group row UI **live** (PR-121). `ERPTableGroupRow` chevron, `aria-expanded` / `aria-level`, leaf indent; ArrowLeft collapses / ArrowRight expands; selecting a group selects its children.
- Grouped export **live** (PR-122). `ExportSource` carries `kind`/`outlineLevel`; Excel outlineLevel; PDF includes group rows; `persian-data-grid/plugins/csv`.
- `<GridHistoryPanel />` product audit UI **live** (PR-136). Timeline from `HistoryPanelViewModel`; severity/category filters; click jumps via `revealRow` + `UI_ACTIVE_CELL`; restore writes `previousValue` for `CELL_CHANGED`.
- `<GridOfflineStatus />` **live** (PR-137). `navigator.onLine` (+ injectable `connectivity`); pending data mutations until `markSynced` / SyncPort; durable remount via shared `repo` + EventStore.
- `SyncPort` / `<GridSyncPanel />` **live** (PR-138). `createGrid({ syncTransport })` wires `GridSyncService`; policies `lastWriteWins` / `serverWins` / `manual`; UI on `persian-data-grid/sync`; `InMemorySyncHub` on `/headless`.
- Presence / `<GridPresencePanel />` **live** (PR-139). `presence: true` (BroadcastChannel) or `presenceTransport`; peer cursor list on `persian-data-grid/presence`; different-cell edits stay independent.

---

## Out of scope (not missing features)

grouping، pivot، tree، chart، SSRM، فرمول. این کتابخانه ویرایشگر اقلام سند است. RFC جدا لازم است؛ در این فایل «شکاف API» حساب نمی‌شوند.
