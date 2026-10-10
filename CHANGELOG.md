# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Main entry gzip ceiling raised **65 → 66 KB** (D15 amended) to budget the paged-idb mode (+0.5 KB measured).

- **Behaviour change:** `Table.deleteRow` now soft-deletes a *modified* row (`RowState = Delete`) and restores only a row that is already deleted (it used to restore a modified row). Matches the arianERP host table.
- `isInitiallyHidden` scopes the "has data" check to the column's own collection (no cross-collection unhide).

- **D22 locked (deferred):** monorepo / `@persian-data-grid/core` postponed until after `1.0.0`; release-gate waives `monorepo-core` and treats §۴ 60 KB as stretch (hard ceiling remains 65 KB per D15)

### Added

- **Paged IndexedDB mode** `persistence: 'paged-idb'` (ported from the arianERP host table): IndexedDB is the single source of truth, RAM holds one page window; paging, add/duplicate-at-end, soft/bulk delete, select-all, search, footer totals and Excel export stream from IndexedDB. Repos: `PagedCachedTableRepository` / `PagedIndexedDbTableRepository` / `PagedLocalTableRepository`; port `WindowedTableRepository` + `isWindowedRepository`. See `docs/paged-idb.md`.
- `APPLY_ROW_VISIBILITY` (re-apply remote visibility when a row becomes active) and `ROWS_DELETED` (bulk delete) commands; collection guard for dynamic projection / visibility so twin column configs of other collections never leak.
- `controller.getFullSnapShot / iterateRowsFromDb / isPagedWindow`; streamed `subscribeColumn(col, scope, reducer, seed, cb)` (legacy `cb`-only form still works).
- Host injection: `CallbackRemoteApi`, `FetchRemoteApi({ getToken, getDefaults, fetcher })`, `ERPTableHostProvider useDependOn`, `GRID_REVALIDATE_EVENT`, pure document helpers (`mapSnapshotToDetails`, `mapDetailsToRowInputs`, `buildDocumentPayload`, `mapServerHeaderToFields`) on `/headless`.
- `IRule.requiredIf`, keyboard fallback to the engine's active row when focus is inside a Select, table shortcuts win over a focused Select (`isGridShortcutKey`).
- Document PDF template on `VazirmatnPdfRenderer` / `PdfExportPlugin({ template })`: header, footer, JPEG logo, page numbers, repeating table header, signature, stamp, per-page totals (PR-141)
- Gallery example `17 · Document PDF` (PR-141)
- Internal Jalali single/range calendar on `persian-data-grid/date-picker-jalali` (`PersianRangeDateCell` / `JalaliCalendar`); removes `react-persian-range-picker` peer (PR-140)
- `persian-data-grid/finance`: Rial↔Toman, `formatPrice`, `numberToPersianWords`, Iranian FY periods, official holidays, `nextBusinessDay` (PR-140)
- `ColumnDef.currencyUnit` (`rial` | `toman`) for default price display (canonical storage remains integer rials) (PR-140)
- Gallery example `16 · Document / finance` (PR-140)

### Removed

- Optional peer dependency `react-persian-range-picker` (PR-140)

## [0.13.0-next.0] — 2026-09-16

Phase 16–24 pre-`1.0.0` channel (D25 / PR-134). Install with `npm i persian-data-grid@next`.

### Added

- Semver policy (D25) in `CONTRIBUTING.md`, `@changesets/cli`, `yarn release:next:dry`, and Release workflow that publishes prereleases with `--tag next`, stables with `--tag latest`, npm provenance, and GitHub Release notes from `CHANGELOG.md` (PR-134)
- `yarn release:gate` (`scripts/release-gate.mjs`) encodes the §۴ / 1.0.0 checklist; CI runs it soft (`continue-on-error`) until green (PR-135)
- `<GridHistoryPanel />` product audit timeline: filters, jump-to-cell, restore previous cell value (PR-136)
- `<GridOfflineStatus />` online/offline badge + pending local mutation queue; remount recovers from durable store (PR-137)
- `SyncPort` / `GridSyncService` / `<GridSyncPanel />`: push pending events, pull remote, cell conflict policies `lastWriteWins` / `serverWins` / `manual`; UI on `persian-data-grid/sync`; hub on `/headless` (PR-138)
- Presence / `<GridPresencePanel />`: peer cursors via BroadcastChannel or injectable transport; UI on `persian-data-grid/presence` (PR-139)
- CI on Node 18 / 20 / 22 and a provenance publish workflow (PR-72)
- `size-limit` gzip budget; main entry ceiling 66 KB after the split (PR-73, PR-76)
- Subpath exports: `headless`, `plugins/excel`, `plugins/pdf`, `plugins/pdf/fonts/vazirmatn`, `adapters/arian-erp`, `styles.css` (PR-76 / D15)
- `injectGridStyles()` for hosts without a CSS bundler (PR-77 / D16)
- `LICENSE` and Vazirmatn `OFL.txt` in the npm tarball; `CONTRIBUTING.md`, `SECURITY.md`, GitHub issue templates (PR-78)
- ESLint `@typescript-eslint/no-explicit-any` on the publish graph (`yarn lint:publish`) (PR-79)
- `eventStoreName`, `DEFAULT_EVENT_STORE_PREFIX`, and `LEGACY_EVENT_STORE_PREFIX` for IndexedDB (PR-80)
- `ColumnDef<TRow>` and `toColumnDef` / `toColumnSchema` (PR-81 / D14)
- `rowData` / `columnDefs` / `getRowId` on `ERPTable` and `createERPTable` (PR-82). Host objects map to domain rows without `RowInput`.
- `store` / `tableKey` / `actor` optional (PR-83). Omit `store` for an in-memory grid that does not open IndexedDB.
- Sync `createGrid()` with lazy hydrate on `grid.ready` (PR-84 / D24). `createERPTable` remains a deprecated async alias.
- React event props `onCellValueChanged` / `onRowValueChanged` / `onSelectionChanged` / `onCellFocused` / `onRowDataUpdated` / `onGridReady` (PR-85). Mapped from `EVENT_CATALOG` and the existing view store.
- `GridApi` / `apiRef` (PR-86). `onGridReady.api` is `GridApi`. `UITableController` remains a type on `.` and a class on `/headless`.
- Public rename `ERPTable` → `DataGrid`, `themeErp` → `themeDefault`, CSS `--erp-*` → `--pdg-*` with aliases, class `.erp-table` → `.pdg-grid` (PR-87 / D13). Deprecated names remain for one version.
- End-to-end `DataGrid<TRow>`: `rowData`, `columnDefs`, events, and `apiRef` share one row type; inferred from `rowData` (PR-88).
- Pure `applySort` / `SortModel` in the engine (PR-89). Header click sort is still PR-91.
- `SET_SORT_MODEL` reorders `SparseRowIndex` / `getAllUIRows`; cell edits invalidate the index only for sort columns (PR-90).
- Header click sort: asc → desc → none, Shift+Click multi-sort, `aria-sort`, 5px click-vs-drag threshold; `GridApi.getSortModel` / `setSortModel` (PR-91).
- Pure `applyFilter` / `FilterModel` in the engine (PR-92). Column filter UI / row-index wiring still PR-94.
- `quickFilterText` hides rows (PR-93); `GridSearchPanel` stays find-and-navigate only.
- Column filter UI: header icon popover, optional `floatingFilter`, `api.setFilterModel` / `getFilterModel` (PR-94).
- Custom column filter components via `filterComponents` + `ColumnDef.filter` (PR-95).
- `rowModelType` + `GridDatasource.getRows` for infinite/serverSide (PR-96); local sort/filter skipped.
- Column virtualization via cumulative widths + shared header/body/footer window (PR-98).
- Hot-path indexes: `SparseRowIndex.neighbor`, incremental UI insert, `QuickFilterIndex` search, `ColumnTotalsIndex` footer (PR-99).
- 100k grid harness + published numbers in `docs/performance.md` / README (PR-100).
- Lazy host cells; 100k×20 heap delta **215 MB** under 300 MB (PR-101).
- Infinite/serverSide block cache with LRU + `api.refreshServerSide()` (PR-102).
- Loading / no-rows overlays + infinite row skeleton; swappable overlay components (PR-103).
- Pure cell-range selection model on `/headless` (PR-104).
- Cell-range UI: themed chrome, keyboard/mouse selection, `getCellRanges` / `addCellRange` (PR-105).
- System clipboard copy: `Ctrl+C` → TSV + HTML; `copyFormattedValue`, `copyHeadersToClipboard`, `copyDigitsAsLatin`, `onClipboardCopy` (PR-106).
- System clipboard paste: `Ctrl+V` → TSV/CSV parse, tile onto range, `pasteAddsRows`, Persian number/date coercion, batch `PASTE_CELLS` + one undo (PR-107).
- Fill handle on cell-range corner: numeric/Jalali series extend, Ctrl+drag copy-only, single undo (PR-108).
- Standard keyboard shortcuts (D18): `Ctrl+C/X/V`, `Home`/`End`, `Ctrl+Home`/`Ctrl+End`, `Ctrl+Shift+Arrow`; `Alt+C/X/V` deprecated row-clone aliases; [`docs/keyboard.md`](docs/keyboard.md) (PR-109).
- Column pin (D19): `ColumnDef.pinned: 'start' | 'end'` with RTL-aware sticky zones in header/body/footer/virtual column window (PR-110).
- Column hide/show: `api.setColumnVisible`, reactive `ColumnDef.hide`, `applyColumnState.hide`; `visibility.never` cannot be overridden (PR-111).
- Column auto-size and flex: `api.autoSizeColumns`, `api.sizeColumnsToFit`, `ColumnDef.flex`, double-click resize handle auto-sizes column; off-DOM canvas `measureText` (PR-112).
- Column groups: `ColumnGroupDef` / `ColDefOrGroup`, multi-row headers with `aria-colspan`, expand/collapse, group-level reorder (PR-113).
- Column header menu: ⋮ popover with sort/filter/hide/pin/auto-size/configure columns; `columnMenuItems` + `onColumnMenuAction`; runtime pin via `SET_COLUMN_PIN` (PR-114).
- Column state persist: `getColumnState`/`applyColumnState` include pin+sort; `stateKey` localStorage restore; `COLUMN_STATE_CHANGED` EventStore event (PR-115).
- Pinned top/bottom rows: `pinnedTopRowData` / `pinnedBottomRowData` sticky outside virtualization; footer totals intact (PR-116).
- Aggregation engine: `ColumnDef.aggFunc`, `ColumnAggIndex` / `applyAgg`, incremental sum/avg, integer minor units (PR-118 / RFC-002).
- Footer aggregation UI: `footerRows` + per-column `aggFunc` (PR-119).
- Single-level row grouping: `groupBy`, flat group/leaf index, `ERPTableGroupRow`, export outline (PR-120 … PR-122 / RFC-002).
- `./plugins/csv` Tier-1 CSV export with group rows (PR-122).
- Real axe-core a11y suite in jsdom: 20-row sort/filter/group/pin/menu; canary fails without accessible name (PR-123).
- APG single tab-stop focus: grid `tabIndex={0}`, Esc ladder, modal/menu focus trap, `.pdg-cell-editor:focus-visible` (PR-124).
- Polite `GridLiveRegion` announces sort/filter/selection/validation from `messages` (`a11y.*`) (PR-125).
- Session-only cell edit drafts: `Esc` cancels without EventStore; `Enter`/`Tab` commit + move; `singleClickEdit` / `stopEditingWhenCellsLoseFocus` / `editType: 'fullRow'` (PR-126).
- Locale packs `fa` / `en` / `ar` on `persian-data-grid/locales/*`; `numberingSystem` + `dir` from locale with override (PR-127).
- Pluggable `DateAdapter` (`jalaliAdapter` / `gregorianAdapter`); default DatePicker needs no peer; optional `persian-data-grid/date-picker-jalali` (PR-128 / D21).
- VitePress docs site (`website/`, `yarn docs:dev` / `yarn docs:build`) with en + fa locales, live React demos, and TypeDoc API from `publish/entry.ts` (PR-129 / D23).
- Example gallery under `examples/gallery` (12 demos) with StackBlitz links and `yarn examples:typecheck` in CI (PR-130).
- `persian-data-grid-codemod` (`npx persian-data-grid-codemod`) + master D13–D22 table in `MIGRATION.md` (PR-131).
- Playwright e2e harness (`yarn e2e`) covering edit/undo, clipboard, 100k scroll, sort/filter, Excel download, and light/dark × LTR/RTL captures (PR-133).

### Changed

- Desktop row virtualization is **on by default** when a session is present; use `virtualization={false}` for pagination (PR-97 / D17)
- CSS is no longer auto-injected; import `persian-data-grid/styles.css` (PR-77 / D16)
- `"sideEffects"` is `["**/*.css"]` (PR-77)
- npm keywords moved from ERP-specific terms to data-grid market terms (PR-78)
- Public types use `unknown` instead of `any`; published `.d.ts` has zero `any` (PR-79)
- `FetchRemoteApi` is only on `persian-data-grid/adapters/arian-erp`; IndexedDB default prefix is `persian-data-grid-events` (PR-80)
- Cell editors use `tabIndex={-1}` (APG `aria-activedescendant`); grouped tables use `role="treegrid"` (PR-123).
- Navigation-mode `Tab` leaves the grid; while editing, `Tab` confirms and advances (PR-124 / PR-126).
- `Enter` while editing confirms and moves **down** (was sideways); `Esc` discards the draft (PR-126).
- Grid chrome strings live in locale packs; `ui/` has zero hardcoded Persian/Arabic UI copy (PR-127).
- `react-persian-range-picker` is an **optional peer** (was a hard dependency); `.` no longer references it (PR-128).

### Fixed

- Host-glue (`useERPGrid`, `useVoucherDescription`) removed from publish UI; zero `@ts-nocheck` in `ui/**` (PR-74)
- README / public-api claims aligned with runtime and locked by CI tests (PR-75)
- Footer aggregation no longer infinite-loops when `footer={true}` without `footerRows` (stable default row list) (PR-123).

## [0.6.0] - unreleased

Phase 16 (Truth, Packaging, CI). The version number on npm stays `0.5.0` until this phase exits. Notes above track the 0.6.0 line.

## [0.5.0] - 2026-09-10

### Added

- First public npm release of `persian-data-grid`: event-sourced React data grid with IndexedDB, Jalali / RTL cells, domain undo, and Excel / PDF plugins.
