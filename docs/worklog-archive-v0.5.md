# WORKLOG.md

## Purpose

این فایل گزارش کار اجرایی پروژه است: چه چیزی انجام شده، چرا انجام شده، و با چه سطحی از اطمینان verify شده است.

---

## Current Snapshot

- **فاز اجرایی باز: ندارد — Phase 15 بسته**
- **PR بعدی برای ایجنت: هیچ** (قبل از فاز جدید از کاربر بپرس)
- آخرین PR تمام‌شده: **PR-71** (mark جستجو در textArea)
- طرح قبلی Phase 1–5 (PR-1 … PR-38) **بسته** است
- طرح Phase 6–7 (PR-39 … PR-45) **بسته** است
- طرح Phase 8 (PR-46 … PR-50) **بسته** است
- طرح Phase 9 (PR-51 … PR-53) **بسته** است
- طرح Phase 10 (PR-54 … PR-57) **بسته** است
- طرح Phase 11 (PR-58 … PR-61) **بسته** است
- طرح Phase 12 (PR-62 … PR-64) **بسته** است
- طرح Phase 13 (PR-65 … PR-67) **بسته** است
- طرح Phase 14 (PR-68 … PR-70) **بسته** است
- طرح Phase 15 (PR-71) **بسته** است
- پلن زنده: `EXECUTION_PLAN.md` از Active Track به بعد
- ورود ایجنت: `docs/agent-handoff.md`

---

## Completed Work

### PR-71 — mark جستجو در textArea / description (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/cellRenderer/cellRenderContext.ts`, `ui/cellRenderer/TextAreaCell.tsx`, `ui/cellRenderer/descriptionComponent/index.tsx`, `ui/gridSearch/highlightText.tsx`, `index.ts`, `publish/entry.ts`, `docs/cell-components.md`, `docs/public-api.md`, `docs/public-api-honesty.md`
- `searchQuery` / `isCurrentSearchMatch` روی context. سلول فعال هم `mark` می‌گیرد نه فقط textarea. Host: `highlightIfCurrentSearch`. چک‌باکس/تاریخ mark ندارند.
- Verify: `yarn test` 52 file / 228 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`؛ مرورگر localhost:5175 تم تیره، جستجوی شرح ردیف `123` → `mark.erp-search-hit.is-current` داخل `data-erp-cell-component="textArea"` با `--erp-search-match` `#eab308`
- بعدی: فاز جدید فقط با RFC / تأیید کاربر.

### Phase 15 Exit — Search marks in registered cells (۲۰۲۶-۰۹-۱۱)

PR-71: شرح ردیف در جستجو mark دارد. custom غیرمتنی همچنان ring.

### PR-70 — بستن `@ts-nocheck` سلول بدون peer antd (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/cellRenderer/descriptionComponent/useVoucherDescription.tsx` (حذف), `ui/cellRenderer/descriptionComponent/index.tsx`, `tsconfig.json`, `tsconfig.publish.json`, `docs/public-api-honesty.md`
- `cellRenderer/index.tsx` از قبل typed بود. هوک host-only `useVoucherDescription` (redux / next-intl / RTK) مصرف‌کننده نداشت — حذف شد تا nocheck و exclude لازم نباشد. `useERPGrid.ts` همچنان خارج از tsconfig (صفحهٔ ERP، نه سلول).
- Verify: `yarn test` 52 file / 225 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: فاز جدید فقط با RFC / تأیید کاربر. grouping/pivot/tree خارج از محدوده.

### Phase 14 Exit — Voucher polish (۲۰۲۶-۰۹-۱۱)

PR-68…PR-70: import اکسل تولبار، فوتر/جستجو با توکن معنایی، سلول بدون `@ts-nocheck` در مسیر محصول.

### PR-69 — فوتر اعداد و highlight جستجو با تم (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/styles/erp-table.css`, `ui/styles/injectStyles.ts`, `ui/gridSearch/highlightText.tsx`, `ui/desktop/ERPTableFooter.tsx`, `ui/primitives/DatePicker.tsx`, `demo/src/LiveGridPreview.tsx`, `docs/public-api-honesty.md`
- `--erp-search-other` / `--erp-muted`. `mark.erp-search-hit` به‌جای `bg-yellow-*`. فوتر `tabular-nums` + `--erp-fg`. دمو `footer={true}`. DatePicker از `theme.params` می‌خواند (hex ثابت نماند). query لاتین روی رقم فارسی هم mark می‌شود (`toFaDigits`).
- باقی‌مانده: سلول‌های `textArea` / custom فقط `ring-yellow-400` دارند نه `mark`؛ utilityهای Tailwind مثل `bg-blue-blue11` هنوز alias هستند؛ palette `--erp-yellow-200` برای مقدار dark ماند.
- Verify: `yarn test` 52 file / 224 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`؛ مرورگر localhost:5175 تم تیره: `tfoot` اعداد `۵۰۱,۲۰۰,۰۰۰` رنگ `--erp-fg` / ردیف `--erp-bg` / `tabular-nums`؛ `mark.erp-search-hit.is-current` پس‌زمینه `--erp-search-match` (`#eab308`)
- بعدی: PR-70

### PR-68 — Excel import در تولبار (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/export/ExcelImportToolbarButton.tsx`, `ui/desktop/groupActionButtons.tsx`, `ui/mobile/MobileActionButtons.tsx`, `ui/primitives/icons.tsx`, `ui/host/messages.ts`, `demo/src/LiveGridPreview.tsx`, `docs/public-api-honesty.md`
- دکمه فقط با `ExcelImportPlugin`. فایل‌پیکر → `pluginHost.requestImport`. خروجی اکسل تولبار همچنان imperative است.
- Verify: `yarn test` 51 file / 220 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`؛ مرورگر round-trip خروجی اکسل تولبار → `data-erp-xlsx-import` (aria-rowcount 50→101)
- بعدی: PR-69

### PR-67 — دکمهٔ PDF تولبار (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/export/PdfExportToolbarButton.tsx`, `ui/desktop/groupActionButtons.tsx`, `ui/mobile/MobileActionButtons.tsx`, `ui/index.tsx`, `ui/useERPTable.ts`, `application/plugins/PluginHost.ts`, `ui/host/messages.ts`, `demo/src/LiveGridPreview.tsx`, `docs/public-api-honesty.md`
- `ERPTable` همان `plugins` را به `createERPTable` می‌دهد. دکمه فقط با `PdfExportPlugin`. `requestExport` تا COMPLETED/FAILED صبر می‌کند.
- Verify: `yarn test` 51 file / 219 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`؛ مرورگر localhost:5175 دکمهٔ تولبار `data-erp-pdf-export` و toast موفقیت
- بعدی: PR-68

### Phase 13 Exit — Persian PDF (۲۰۲۶-۰۹-۱۱)

PR-65…PR-67: Vazirmatn + پیش‌فرض پلاگین + دکمهٔ تولبار وقتی plugin ثبت است. PDF برای فارسی قابل انتشار است.

### PR-66 — پیش‌فرض PDF فارسی (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `packages/plugins/pdf/src/PdfExportPlugin.ts`, `packages/plugins/pdf/src/TextPdfRenderer.ts`, `packages/plugins/pdf/__tests__/pdf-export-plugin.spec.ts`, `demo/src/DemoComponent.tsx`, `docs/rfc/RFC-001-pdf-export.md`, `docs/public-api-honesty.md`, `docs/public-api.md`, `docs/components.md`
- `new PdfExportPlugin()` حالا `VazirmatnPdfRenderer` است. `TextPdfRenderer` export ماند با `@deprecated` برای تست / opt-in Host.
- Verify: `yarn test` 51 file / 218 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-67

### PR-65 — Vazirmatn + جدول PDF (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `packages/plugins/pdf/src/VazirmatnPdfRenderer.ts`, `parseTtf.ts`, `shapeRtl.ts`, `pdfBuilder.ts`, `vazirmatnBytes.ts`, `fonts/Vazirmatn-Regular.ttf`, `fonts/OFL.txt`, `packages/plugins/pdf/__tests__/vazirmatn-pdf.spec.ts`, `demo/src/LiveGridPreview.tsx`, `demo/src/DemoComponent.tsx`, `docs/public-api-honesty.md`, `docs/public-api.md`, `docs/rfc/RFC-001-pdf-export.md`
- رندرر خودی (بدون jsPDF): CIDFontType2 / Identity-H + Vazirmatn OFL، جدول RTL، بدون سقف ۸×۴۰. پیش‌فرض `PdfExportPlugin` هنوز `TextPdfRenderer` است (PR-66).
- Verify: `yarn test` 51 file / 218 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-66

### PR-64 — aria-label تولبار و فوکوس قابل‌رؤیت (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/a11y/ToolbarIconButton.tsx`, `ui/desktop/groupActionButtons.tsx`, `ui/mobile/MobileActionButtons.tsx`, `ui/gridSearch/GridSearchControl.tsx`, `ui/gridSearch/GridSearchPanel.tsx`, `ui/theme/ThemeToggleButton.tsx`, `ui/host/messages.ts`, `ui/styles/erp-table.css`, `ui/styles/injectStyles.ts`, `docs/public-api-honesty.md`
- دکمه‌های آیکونی تولبار `aria-label` از `messages` دارند (`role="toolbar"`). `:focus-visible` با `var(--erp-accent)`؛ این دکمه‌ها `outline-none` ندارند. ادیتور سلول هنوز `outline-none` دارد (حاشیهٔ سلول فعال).
- Verify: `yarn test` 50 file / 214 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-65

### PR-63 — سلول فعال و aria-label چک‌باکس ردیف (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/a11y/gridRoles.ts`, `ui/desktop/eRPTableRow.tsx`, `ui/desktop/DesktopTable.tsx`, `ui/desktop/indexCol.tsx`, `ui/desktop/ERPTableHeader.tsx`, `ui/mobile/MobileTable.tsx`, `ui/mobile/MobileTableRow.tsx`, `ui/mobile/MobileTableBody.tsx`, `ui/mobile/MobileIndexCol.tsx`, `ui/mobile/MobileTableHeader.tsx`, `ui/primitives/chrome.tsx`, `ui/host/messages.ts`, `docs/public-api-honesty.md`
- `aria-selected` روی `gridcell` فعال + `aria-activedescendant` روی grid. چک‌باکس ردیف `aria-label` (`general.selectRow` + شماره). `KEY_DOWN` روی window عوض نشد. تولبار PR-64.
- Verify: `yarn test` 49 file / 210 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-64

### PR-62 — role=grid baseline (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/a11y/gridRoles.ts`, `ui/desktop/DesktopTable.tsx`, `ui/desktop/ERPTableHeader.tsx`, `ui/desktop/eRPTableRow.tsx`, `ui/desktop/ERPTableBody.tsx`, `ui/desktop/ERPTableVirtualBody.tsx`, `ui/desktop/ERPTableFooter.tsx`, `ui/mobile/MobileTable.tsx`, `ui/mobile/MobileTableHeader.tsx`, `ui/mobile/MobileTableBody.tsx`, `ui/mobile/MobileTableRow.tsx`, `docs/public-api-honesty.md`
- `<table role="grid">` دسکتاپ و موبایل با `columnheader` / `gridcell` و `aria-colindex` / `aria-rowindex` یک‌پایه. مجازی از ایندکس مطلق مجموعه استفاده می‌کند. `aria-selected` نرفت (PR-63).
- Verify: `yarn test` 49 file / 207 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-63

### PR-61 — drag هدر برای reorder ستون (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `engine/columnReorder.ts`, `domain/entities/Table.ts`, `application/handlers/tableCommandHandler.ts`, `ui/desktop/ERPTableHeader.tsx`, `ui/desktop/ColumnResizeHandle.tsx`, `ui/styles/erp-table.css`, `ui/styles/injectStyles.ts`, `docs/public-api-honesty.md`
- درگ HTML5 روی `<th>` دسکتاپ (`data-erp-col-drag`) → `COLUMN_REORDERED`. ستون `index` و هندل resize درگ نمی‌شوند. `reorderColumns` روی ترتیب نمایش کار می‌کند و `order` را بازنویسی می‌کند؛ `setColumns` همان `order` را هنگام refresh اسکیما نگه می‌دارد.
- Verify: `yarn test` 48 file / 202 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-62

### PR-60 — COLUMN_REORDERED engine + handler (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `application/commands/index.ts`, `application/handlers/tableCommandHandler.ts`, `application/TableAppService.ts`, `bootstrap/builders/index.ts`, `domain/policies/index.ts`, `infrastructure/ui/uiEvents.ts`, `infrastructure/ui/UITableController.ts`, `docs/public-api-honesty.md`
- `COLUMN_REORDERED` عضو `ApplicationTableCommand`. Handler → `Table.reorderColumns` + dual-write EventStore. Controller dispatch بدون drag هدر (PR-61).
- Verify: `yarn test` 46 file / 194 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-61

### PR-59 — pin ستون index (D10) (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/columnPin.ts`, `ui/desktop/ERPTableHeader.tsx`, `ui/desktop/eRPTableRow.tsx`, `ui/desktop/ERPTableFooter.tsx`, `ui/desktop/ERPTableVirtualBody.tsx`, `ui/desktop/DesktopTable.tsx`, `ui/mobile/MobileTable.tsx`, `ui/mobile/MobileTableHeader.tsx`, `ui/mobile/MobileTableRow.tsx`, `ui/styles/erp-table.css`, `ui/styles/injectStyles.ts`, `demo/src/DemoComponent.tsx`, `docs/public-api-honesty.md`, `docs/public-api.md`, `docs/components.md`, `docs/demo-playground-report.md`
- Sticky افقی فقط ستون `index` (`inset-inline-start: 0`). جدول `border-collapse: separate` تا sticky سلول کار کند. spacer مجازی یک سلول per column. toggle دموی Sticky IndexCol حذف شد.
- Verify: `yarn test` 45 file / 190 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-60

### PR-58 — column resize (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `engine/columnWidth.ts`, `engine/type.ts`, `engine/tableEngine.ts`, `engine/ViewStateBuilder.ts`, `application/commands/index.ts`, `infrastructure/ui/uiEvents.ts`, `infrastructure/ui/UITableController.ts`, `ui/desktop/ColumnResizeHandle.tsx`, `ui/desktop/ERPTableHeader.tsx`, `ui/desktop/eRPTableRow.tsx`, `ui/desktop/ERPTableFooter.tsx`, `ui/mobile/MobileTableHeader.tsx`, `ui/mobile/MobileTableRow.tsx`, `ui/styles/erp-table.css`, `ui/styles/injectStyles.ts`, `docs/public-api-honesty.md`, `docs/public-api.md`, `docs/components.md`
- Drag لبهٔ `<th>` دسکتاپ (`data-erp-col-resize`، pointer events). عرض در `columnWidths` view state جلسه؛ **بدون EventStore**. `minWidth` کف (۱۴۴ / ایندکس ۱۶۸). موبایل هندل ندارد.
- Verify: `yarn test` 44 file / 185 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-59

### PR-57 — cell-components host guide (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `docs/cell-components.md`, `docs/public-api.md`, `docs/getting-started.md`, `docs/components.md`, `README.md`, `docs/public-api-honesty.md`, `docs/__tests__/cell-components.spec.ts`
- راهنمای ثبت/جایگزینی ادیتور بدون خواندن `CellRenderer`: `render` ستونی، `components`، نوع جدید، کیبورد textarea.
- Verify: `yarn test` 42 file / 175 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-58

### PR-56 — textArea via default registry (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `domain/types/ColumnSchema.ts`, `ui/cellRenderer/TextAreaCell.tsx`, `ui/cellRenderer/cellRegistry.ts`, `ui/keyboard/skipGridNavigation.ts`, `ui/index.tsx`, `ui/helper.ts`, `application/handlers/cellCommandsHandler.ts`, `demo/src/fixtures.ts`, `demo/src/DemoComponent.tsx`
- `FieldType` شامل `textArea`. ادیتور فایل جدا + `DEFAULT_CELL_COMPONENTS`؛ هیچ `case "textArea"` در سوئیچ CellRenderer.
- Enter/جهت‌نما داخل `[data-erp-cell-textarea]` ناوبری سلول را skip می‌کنند؛ Tab همچنان جابه‌جا می‌شود.
- دمو: ستون «شرح ردیف» (`DetailDesc`) چندخطی شد.
- Verify: `yarn test` 41 file / 172 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-57

### PR-55 — components map (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/cellRenderer/cellRegistry.ts`, `ui/cellRenderer/index.tsx`, `ui/host/ERPTableHost.tsx`, `ui/index.tsx`, `ui/cell-components.typecheck.tsx`, `demo/src/LiveGridPreview.tsx`, `demo/src/fixtures.ts`, `docs/public-api.md`, `docs/public-api-honesty.md`
- `ERPTableProps.components` روی host context؛ CellRenderer بعد از `columns[].render` و قبل از switch می‌خواند. کلید آزاد برای type سفارشی.
- دمو: ستون «تأیید» + جایگزینی `checkbox` با `data-erp-cell-component`.
- Verify: `yarn test` 39 file / 163 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-56

### PR-54 — bind ColumnViewBinding.render (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/cellRenderer/cellRenderContext.ts`, `ui/cellRenderer/index.tsx`, `domain/types/ColumnSchema.ts`, `infrastructure/columns/mapColumnSchema.ts`, `demo/src/fixtures.ts`, `docs/public-api.md`, `docs/public-api-honesty.md`
- `columns[].render` قبل از switch `FieldType` در CellRenderer (دسکتاپ + موبایل). `returnDisplayValue` دیگر به `binding.render` map نمی‌شود.
- دمو: ستون «طرف» (`SideMark`) با `data-erp-custom-cell`.
- Verify: `yarn test` 38 file / 157 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`
- بعدی: PR-55

### PR-53 — optional multiSelectConfig (D11) (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/index.tsx`, `ui/desktop/DesktopTable.tsx`, `ui/mobile/MobileTable.tsx`, `ui/optional-multiselect.typecheck.tsx`, `ui/desktop/__tests__/multiselect-optional.spec.ts`, `demo/src/InitialComponent.tsx`, `README.md`, `docs/public-api.md`, `docs/components.md`, `docs/host-arian-erp.md`
- نبودن config = بدون دکمه/مودال choose-from-list. playground هنوز config دارد تا مسیر موجود نشکند.
- Verify: `yarn test` 37 file / 150 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui` (کامنت JSX در fixture TSX حذف شد)
- بعدی: PR-54

### PR-52 — arianERP host adapter docs (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `docs/host-arian-erp.md`, `README.md`, `docs/getting-started.md`, `docs/public-api.md`, `docs/components.md`, `docs/__tests__/host-arian-erp.spec.ts`
- کوکی `_auth`، `persist:arianERP`، بدنهٔ `Defaults` مستند شد. `FetchRemoteApi` در پکیج ماند؛ bootstrap آن را نمی‌سازد.
- README نصب صریحاً می‌گوید بدون inject به ERP وصل نمی‌شود.
- Verify: `yarn test` 36 file / 147 tests؛ `yarn typecheck:publish`
- بعدی: PR-53

### PR-51 — default NoopRemoteApi (D1) (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `bootstrap/index.ts`, `bootstrap/type.ts`, `index.ts`, `infrastructure/Repositories/fetchRemoteApi.ts`, `bootstrap/__tests__/create-erp-table.spec.ts`, `docs/public-api.md`, `docs/getting-started.md`, `docs/components.md`, `docs/public-api-honesty.md`
- بدون `remoteApi` دیگر Fetch / کوکی `_auth` / `persist:arianERP` نمی‌زند. `FetchRemoteApi` export ماند برای inject میزبان.
- دمو از قبل `DemoMockRemoteApi` می‌دهد — select پویا نشکست.
- Verify: `yarn test` 35 file / 144 tests؛ `yarn typecheck:publish`
- بعدی: PR-52

### PR-50 — Snapshot opt-in (D7) (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `bootstrap/type.ts`, `bootstrap/index.ts`, `application/TableAppService.ts`, `bootstrap/__tests__/snapshot-opt-in.spec.ts`, `docs/public-api.md`, `docs/public-api-honesty.md`
- `snapshotStore?` / `snapshotEveryNEvents?`؛ بدون store همان dual-write؛ با store `SnapshotStrategy` + catch-up هنگام create
- Verify: `yarn test` 35 file / 142 tests؛ `yarn typecheck:publish`
- بعدی: PR-51 (شکستن D1)

### PR-49 — SparseRowIndex on virtual path (D6) (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `engine/ViewStateBuilder.ts`, `engine/tableEngine.ts`, `application/session/GridSession.ts`, `infrastructure/session/DefaultGridSession.ts`, `ui/virtual/virtualWindow.ts`, `ui/virtual/useVirtualWindow.ts`, `ui/desktop/ERPTableVirtualBody.tsx`, `ui/desktop/DesktopTable.tsx`, `engine/__tests__/sparse-ui-row-index.spec.ts`, `docs/public-api-honesty.md`
- ایندکس تنک با ترتیب ستون `index`؛ رندر مجازی بدون clone+sort کل `getAllUIRows()`؛ add/delete/reorder invalidate می‌کند
- pagination پیش‌فرض اجباری نشد؛ `SparseRowIndex` export ماند
- Verify: `yarn test` 34 file / 140 tests؛ `yarn typecheck:publish`
- بعدی: PR-50

### PR-48 — CLEAR_ROW_SELECTION live / SET_UNIT_LEVEL removed (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `application/commands/index.ts`, `engine/tableEngine.ts`, `engine/managers/SelectionManager.ts`, `infrastructure/ui/UITableController.ts`, `infrastructure/ui/uiEvents.ts`, `application/TableAppService.ts`, `application/handlers/tableCommandHandler.ts`, `bootstrap/builders/index.ts`, `application/__tests__/dual-write.spec.ts`, `application/__tests__/command-categories.spec.ts`, `engine/__tests__/clear-row-selection.spec.ts`, `docs/public-api-honesty.md`, `docs/__tests__/public-api-honesty.spec.ts`, `docs/event-catalog.md`, `application/events/eventCatalog.ts`
- `CLEAR_ROW_SELECTION` در `EngineTableCommand` + `tableEngine` + UI controller؛ انتخاب ردیف را خالی می‌کند
- stub `SET_UNIT_LEVEL` / `ChangeUnitLevelHandler` / `addColumns([])` حذف شد؛ `UNIT_COLUMN_ADDED` در catalog reserved ماند (بدون emitter)
- Verify: `yarn test` 33 file / 137 tests؛ `yarn typecheck:publish`
- **نشد:** سیم کردن `COLUMN_REORDERED` (Phase 11)
- بعدی: PR-49

### PR-47 — asyncValidator await (D5) (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `engine/tableEngine.ts`, `engine/__tests__/async-validator.spec.ts`, `docs/public-api-honesty.md`, `docs/__tests__/public-api-honesty.spec.ts`
- `validation()` اگر ستونی `asyncValidator` داشته باشد Promise را await می‌کند و خطا را در همان `errors` map می‌گذارد؛ بدون rule ناهمگام همان تیک sync می‌ماند
- `isValidCell` امضای sync را نگه می‌دارد؛ نتیجهٔ async بعد از settle در cache می‌آید و store را bump می‌کند تا هدر/سلول re-render شوند
- Verify: `yarn test` 32 file / 134 tests (۴ تست PR-47 + honesty grep برای `await rule.asyncValidator`)؛ `yarn typecheck:publish`
- **نشد:** عوض کردن signature عمومی `isValidCell` به Promise
- بعدی: PR-48

### PR-46 — Public API honesty audit (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `docs/public-api-honesty.md`, `docs/__tests__/public-api-honesty.spec.ts`, `docs/public-api.md` (لینک), `package.json` (اسکریپت test شامل `docs/__tests__`)
- هدف: فهرست شکاف‌ها بدون تغییر runtime
- مرده/stub: `CLEAR_ROW_SELECTION` (حتی در union نیست)، `COLUMN_REORDERED` (Unhandled engine command)، `SET_UNIT_LEVEL` → `addColumns([])`
- exported-only: `asyncValidator` ignore، `SparseRowIndex` فقط تست viewport، `SnapshotStrategy` خارج از bootstrap
- Verify: `yarn test` 31 file / 130 tests (۷ assertion grep برای هم‌خوانی سند با کد)
- **نشد:** سیم کردن هیچ stub (PR-47+)
- بعدی: PR-47

### PR-45 — density از theme.params (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `bootstrap/type.ts`, `bootstrap/index.ts`, `ui/desktop/useERPTableLayout.ts`, `ui/desktop/DesktopTable.tsx`, `ui/index.tsx`, `ui/styles/injectStyles.ts`, `ui/styles/erp-table.css`, `demo/src/LiveGridPreview.tsx`
- `createERPTable` از `config.rowHeight ?? 40` برای `tableHeight / rowHeight` استفاده می‌کند
- virtual body و layout از `useERPTableTheme().params.rowHeight` می‌خوانند
- `.h-9` = `var(--erp-row-height)` (پیش‌فرض توکن ۴۰px مطابق D12)
- دمو: دکمهٔ «سطر ۴۸»
- Verify کل Phase 7: `yarn test` 30 file / 123 tests؛ `yarn typecheck:publish`؛ `yarn typecheck:host-ui`؛ `yarn build` + `verify:dist` پاس (`themeErpDark` در DTS)
- ظاهر: بدون مرورگر تعاملی در این جلسه؛ دمو روی `yarn dev` (پورت 5175) باید HMR شود
- **نشد:** عوض کردن پیش‌فرض ۴۰
- بعدی: PR-46

### PR-44 — themeErpDark + دکمه محصول (D8) (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/theme/GridTheme.ts`, `ui/theme/resolveActiveTheme.ts`, `ui/theme/ThemeToggleButton.tsx`, `ui/desktop/groupActionButtons.tsx`, `ui/mobile/MobileActionButtons.tsx`, `ui/index.tsx`, `ui/host/messages.ts`
- تم سفارشی (`withParams` غیر stock) دکمه را قفل/مخفی می‌کند
- دمو UI موازی نساخته؛ همان chrome + دکمه‌های QA صورتی/سطر۴۸ که تم را سفارشی می‌کنند (و در آن حالت toggle قفل است)
- بعدی در همان جلسه: PR-45

### PR-43 — Portal inheritance (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/host/ERPTableHost.tsx` (`useThemePortalStyle`), `ui/theme/applyCssVars.ts`, `ui/primitives/chrome.tsx`, `Select.tsx`, `Dropdown.tsx`, `ui/host/toast.ts`, `ui/gridSearch/GridSearchPanel.tsx`
- overlay روی `document.body` همان `toCssVars()` را می‌گیرد
- بعدی در همان جلسه: PR-44

### PR-42 — theme prop + host context (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/index.tsx`, `ui/host/ERPTableHost.tsx`, `index.ts`, `publish/entry.ts`, `docs/public-api.md`
- `ERPTableProps.theme?: GridTheme` پیش‌فرض `themeErp`؛ `style={toCssVars()}` روی `.erp-table`؛ `useERPTableTheme()`
- دمو: دکمهٔ «صورتی» = `withParams({ accentColor: 'hotpink' })`
- **نشد در این برش به‌تنهایی:** تم تیره (PR-44)، density موتور (PR-45)
- بعدی در همان جلسه: PR-43

### PR-41 — GridTheme + themeErp (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/theme/GridTheme.ts`, `ui/theme/index.ts`, `ui/theme/__tests__/grid-theme.spec.ts`, `index.ts`, `publish/entry.ts`, `docs/public-api.md`, `scripts/verify-dist.mjs`
- هدف: API Typed بدون وصل به `ERPTable`
- `themeErp.params.rowHeight === 40` (D12)
- Verify: `yarn test` 28 file / 115 tests؛ `yarn typecheck:publish`؛ `yarn build` + `verify:dist` پاس (`GridTheme` / `themeErp` در DTS)
- **نشد:** prop روی ERPTable (PR-42)
- بعدی: PR-42

### PR-40 — Kill hardcoded hex (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/styles/injectStyles.ts`, `ui/styles/erp-table.css`, `ui/styles/__tests__/semantic-tokens.spec.ts`
- utilityها (`bg-blue-blue11` → `--erp-row-stripe` و مشابه) و pagination/modal/toast/select به `var(--erp-*)`
- hex باقی‌مانده فقط در بلوک تعریف پالت (شامل `--erp-success` / `--erp-error` / `--erp-overlay` / `--erp-scrollbar` / `--erp-gray-100` برای مقدار دقیق قبلی)
- Verify: تست PR-40 hex-guard + بقیهٔ سوئیت
- بعدی در همان جلسه: PR-41

### PR-39 — Semantic CSS role aliases (۲۰۲۶-۰۹-۱۱)

- فایل‌ها: `ui/styles/injectStyles.ts`, `ui/styles/erp-table.css`, `ui/styles/__tests__/semantic-tokens.spec.ts`, `package.json` (اسکریپت test)
- هدف: توکن نقش (`--erp-bg`, `--erp-accent`, …) روی `.erp-table`، alias به پالت فعلی
- `font-family` / `color` ریشه از `--erp-font` / `--erp-fg` می‌خوانند (مقدار محاسبه‌شده همان IRANSans و `--erp-black-6`)
- `--erp-row-height: 40px` مطابق D12
- **نشد:** JSX، prop `theme`، تم تیره، عوض کردن utility/hex (PR-40)
- Verify: `yarn test` — 27 file / 110 tests پاس
- ظاهر: بدون مرورگر تعاملی؛ رنگ‌ها alias هستند پس zebra/هدر باید همان palette قبلی باشد
- بعدی: PR-40

---

### Phase 6+ roadmap + handoff (۲۰۲۶-۰۹-۱۱) — فقط مستندات

- مقایسهٔ سخت‌گیرانه با AG Grid: کتابخانه = ویرایشگر اقلام سند، نه گرید عمومی.
- `EXECUTION_PLAN.md`: Phase 6–14 (PR-39 … PR-70) اضافه شد. Phase 1–5 دست‌نخورده و بسته.
- تصمیم‌های قفل: D1 Noop پیش‌فرض RemoteApi؛ D2 سیم کامل COLUMN_REORDERED؛ D3 PDF فارسی واقعی؛ D4 هر شکستن دیگر باید جدا تأیید شود.
- دور دوم (۲۰۲۶-۰۹-۱۱): D5 اجرای asyncValidator؛ D6 SparseRowIndex در مسیر مجازی Phase 8؛ D7 snapshot opt-in؛ D8 دکمه تم تیره در ERPTable محصول؛ D9 Vazirmatn/OFL؛ D10 pin فقط index؛ D11 multiSelectConfig اختیاری؛ D12 rowHeight پیش‌فرض ۴۰.
- کد محصول تغییر نکرد. Verify: ندارد (docs-only).
- بعدی: PR-39

---

### Publish ERPTable chrome as drop-in package (۲۰۲۶-۰۹-۰۹)

- ERP host usages audited: voucherTemplate, inventoryVoucher, cheque organisms, bank withdrawal, issuance, receipt&deploy, bankedCheque.
- Library UI no longer imports ERP atoms / antd / next-intl / RTK Query.
- Injected CSS recreates ERP tokens (`gray-gray3`, `blue-blue11`, row `h-9`, pagination chrome).
- Default `virtualization={false}` so pagination matches ERP pages.
- Browser `FetchRemoteApi` (cookie `_auth` + `persist:arianERP`) is the default remote adapter.
- `publish/entry.ts` now exports `ERPTable`, `UITableController`, `RowStateEnum`, `IMultiSelectConfig`, `TableSnapShot`, `ItemType`.
- Playground: `demo/src/ERPTablePlayground.tsx`.
- `useERPGrid` stays host-only (Next/Redux page glue).

---

### Demo playground — سطح QA تعاملی (۲۰۲۶-۰۹-۰۸)

- گزارش کامل: [`docs/demo-playground-report.md`](./docs/demo-playground-report.md)
- هدف: قابل‌رؤیت کردن قابلیت‌هایی که در هسته/ViewIntent بودند ولی در playground دیده نمی‌شدند
- انجام‌شده در دمو:
  1. **روی‌هم‌افتادگی سلول** — sticky ID/Item + اسکرول افقی + دکمهٔ toggle
  2. **DatePicker ماسک‌دار جلالی** — `react-persian-range-picker` با `showMask` روی ستون `date`
  3. **Drag & drop ردیف** — `ROW_REORDERED` از دستهٔ ⋮⋮
  4. **اکشن سمپل سطر** — کپی / حذف / افزودن (`DUPLICATE_ROW` / `DELETE_ROW` / `ADD_EMPTY_ROW`)
  5. **صفحه‌بندی** — حالت Pagination مقابل VirtualList با `CHANGE_PAGE` / `CHANGE_PAGE_SIZE`
  6. **جستجو** — نوار Find/Prev/Next + `SET_GRID_SEARCH`
  7. رندر پویای ستون‌ها از `DEMO_COLUMNS` (رفع hard-code قبلی)
- فایل‌های اصلی: `demo/src/DemoComponent.tsx`, `DemoDateCell.tsx`, `demoHelpers.ts`, `fixtures.ts`, `site.module.css`
- وابستگی: `react-persian-range-picker` به‌عنوان `devDependency` (فقط playground)

### PR-1 — Characterization Tests

- فایل اضافه شد: `domain/__tests__/table-domain.behavior.spec.ts`
- هدف:
  - قفل کردن رفتار فعلی `Table` / `Row` / `Cell`
  - کم کردن ریسک refactor
- نتیجه:
  - مسیر refactor بعدی با safety net شروع شد

### PR-2 — Domain Boundary Cleanup

- فایل اضافه شد: `domain/types/ColumnSchema.ts`
- فایل‌های تغییر یافته:
  - `bootstrap/type.ts`
  - `domain/entities/Table.ts`
  - `domain/entities/Collection.ts`
- هدف:
  - حذف نشت React از Domain
  - شکستن وابستگی اشتباه Domain -> bootstrap
- نتیجه:
  - `ColumnSchema` دامنه‌ای شد و importها تمیز شدند

### PR-3 — Command Separation

- فایل تغییر یافته: `application/commands/index.ts`
- فایل تغییر یافته: `application/TableAppService.ts`
- فایل تغییر یافته: `engine/tableEngine.ts`
- فایل اضافه شد: `application/__tests__/command-categories.spec.ts`
- هدف:
  - جدا کردن commandهای Application از commandهای Engine
- نتیجه:
  - مسیر تمیزتری برای Event-Driven refactor ساخته شد

### PR-4 — First Dual-write

- فایل اضافه شد: `domain/types/GridEvent.ts`
- فایل اضافه شد: `application/ports/EventStore.ts`
- فایل اضافه شد: `infrastructure/eventStore/InMemoryEventStore.ts`
- فایل تغییر یافته: `application/handlers/cellCommandsHandler.ts`
- هدف:
  - نوشتن اولیهٔ event برای `CHANGE_CELL_VALUE`
- نتیجه:
  - EventStore اولیه وارد سیستم شد

### PR-5 — Service-level Dual-write

- فایل تغییر یافته: `application/TableAppService.ts`
- فایل تغییر یافته: `bootstrap/builders/index.ts`
- فایل اضافه شد: `application/__tests__/dual-write.spec.ts`
- هدف:
  - انتقال dual-write از handler منفرد به service-level middleware
- نتیجه:
  - همهٔ Application commandهای مهم از یک مسیر مرکزی وارد EventStore شدند

### PR-6 — Changelog Projection

- فایل اضافه شد: `infrastructure/projections/ChangelogProjection.ts`
- فایل تغییر یافته: `application/ports/EventStore.ts`
- فایل تغییر یافته: `infrastructure/eventStore/InMemoryEventStore.ts`
- فایل اضافه شد: `infrastructure/__tests__/changelog-projection.spec.ts`
- هدف:
  - ساخت read model قابل query برای تاریخچه
- نتیجه:
  - تاریخچهٔ تغییرات table/row/column قابل فیلتر شد

### PR-7 — Runtime Wiring

- فایل تغییر یافته: `bootstrap/index.ts`
- فایل تغییر یافته: `bootstrap/type.ts`
- فایل تغییر یافته: `index.ts`
- فایل اضافه شد: `bootstrap/__tests__/create-erp-table.spec.ts`
- هدف:
  - wiring واقعی `InMemoryEventStore` و `ChangelogProjection` در composition root
- نتیجه:
  - این قابلیت‌ها در runtime واقعی جدول فعال شدند

### PR-8 — Controller Changelog API

- فایل تغییر یافته: `infrastructure/ui/UITableController.ts`
- فایل تغییر یافته: `bootstrap/index.ts`
- فایل اضافه شد: `infrastructure/__tests__/ui-table-controller.spec.ts`
- هدف:
  - expose کردن changelog از طریق controller
- نتیجه:
  - UI و integrationها به API رسمی تاریخچه دسترسی پیدا کردند

### PR-9 — Hook Changelog Facade

- فایل تغییر یافته: `ui/useERPTable.ts`
- هدف:
  - expose کردن changelog در سطح hook
- نتیجه:
  - مصرف‌کننده React بدون دسترسی مستقیم به controller، history را می‌بیند

### PR-10 — Changelog Subscription

- فایل تغییر یافته: `infrastructure/projections/ChangelogProjection.ts`
- فایل تغییر یافته: `infrastructure/ui/UITableController.ts`
- فایل تغییر یافته: `ui/useERPTable.ts`
- هدف:
  - subscription برای changelog بدون وابستگی به table view subscription
- نتیجه:
  - activity panel / audit sidebar می‌توانند incremental update بگیرند

### PR-11 — History Panel ViewModel

- فایل اضافه شد: `infrastructure/history/HistoryPanelViewModel.ts`
- فایل تغییر یافته:
  - `bootstrap/index.ts`
  - `bootstrap/type.ts`
  - `infrastructure/ui/UITableController.ts`
  - `ui/useERPTable.ts`
- فایل اضافه شد:
  - `infrastructure/__tests__/history-panel-view-model.spec.ts`
- هدف:
  - تبدیل raw changelog به آیتم‌های display-friendly
- نتیجه:
  - UI دیگر لازم نیست payload خام eventها را parse کند

### PR-12 — History Severity and Category

- فایل تغییر یافته: `infrastructure/history/HistoryPanelViewModel.ts`
- فایل تغییر یافته:
  - `infrastructure/ui/UITableController.ts`
  - `ui/useERPTable.ts`
  - `infrastructure/__tests__/history-panel-view-model.spec.ts`
- هدف:
  - دسته‌بندی eventها برای UI بدون منطق presentation در مصرف‌کننده
  - فیلترهای functional مثل `errors only` و `data changes only`
- نتیجه:
  - هر `HistoryItem` دارای `severity` و `category` است
  - query/subscribe/count روی همان توکن‌ها فیلتر می‌شوند

### PR-13 — Real previousValue on Cell Changes

- فایل‌های تغییر یافته:
  - `domain/events/index.ts` — `CellChanged` حالا `previousValue` دارد
  - `domain/entities/Cell.ts` — قبل از mutate مقدار قبلی capture می‌شود
  - `application/events/index.ts` — `CellChangedEvent.previousValue`
  - `application/handlers/cellCommandsHandler.ts` — خروجی `CHANGE_CELL_VALUE` و `APPLY_DYNAMIC_PROJECTION`
  - `infrastructure/history/HistoryPanelViewModel.ts` — توضیح from/to
- هدف:
  - Undo و history از یک payload پایدار استفاده کنند
- نتیجه:
  - مسیر runtime واقعی `previousValue` را می‌نویسد و در history نمایش می‌دهد

### PR-14 — Global Stream readAll

- فایل‌های تغییر یافته:
  - `application/ports/EventStore.ts` — `readAll(fromPosition?)`
  - `infrastructure/eventStore/InMemoryEventStore.ts` — global log + version stamping
  - `infrastructure/projections/ChangelogProjection.ts` — hydrate با `readAll` سپس subscribe (dedupe با `eventId`)
- هدف:
  - projectionهای سراسری بتوانند catch-up کنند، نه فقط live subscribe
- نتیجه:
  - projection دیرساخت با رویدادهای قبلی hydrate می‌شود

### PR-15 — Undo/Redo for CELL_CHANGED

- فایل اضافه شد: `application/undo/CellUndoStack.ts`
- فایل اضافه شد: `application/__tests__/cell-undo-stack.spec.ts`
- فایل‌های تغییر یافته:
  - `application/TableAppService.ts` — record undoable CELL_CHANGED؛ await روی append
  - `bootstrap/index.ts` / `bootstrap/type.ts`
  - `infrastructure/ui/UITableController.ts` — `undo` / `redo` / `canUndo` / `canRedo`
  - `ui/useERPTable.ts` — facade سطح hook
  - `bootstrap/__tests__/create-erp-table.spec.ts` — integration edit → undo → redo
- هدف:
  - شروع Undo/Redo با compensating command روی `previousValue`
- نتیجه:
  - فقط `CELL_CHANGED` واقعی (با تغییر مقدار) stack می‌شود؛ رویدادهای undo/redo دوباره stack نمی‌شوند

### PR-15b — Phase 2 gap close: ROW_ADDED undo + correlationId batch

- فایل‌های تغییر یافته:
  - `application/undo/CellUndoStack.ts` — واحد Undo چندورودی؛ `ROW_ADDED`؛ merge با `correlationId`
  - `application/TableAppService.ts` — ثبت `ROW_ADDED` / `NEW_ROW_ADDED`؛ stamp کردن `correlationId` روی GridEvent
  - `application/commands/index.ts` — `BaseTableCommand.correlationId?`
  - `application/__tests__/cell-undo-stack.spec.ts`
  - `application/__tests__/dual-write.spec.ts`
  - `bootstrap/__tests__/create-erp-table.spec.ts` — integration برای row undo و batch paste-style
- هدف:
  - بستن شکاف‌های Remaining Gaps مربوط به Phase 2 قبل از شروع Phase 3
- نتیجه:
  - Undo افزودن ردیف با compensating `ROW_DELETED` کار می‌کند
  - چند `CELL_CHANGED` با یک `correlationId` یک واحد Undo می‌شوند
  - EventStore برای هر command یک `correlationId` می‌نویسد (صریح از command یا تولید خودکار)
- محدودیت آگاهانه:
  - Redoی `ROW_ADDED` فقط `ADD_EMPTY_ROW` می‌زند (هویت ردیف پس از delete عوض می‌شود)
  - Paste موتور (`SET_TABLE_ACTION`) هنوز از AppService رد نمی‌شود؛ تا مهاجرت آن مسیر، batch undo برای paste فقط وقتی فعال است که host همان `correlationId` را روی commandهای `CHANGE_CELL_VALUE` بفرستد

### PR-16 — Selector-based subscription

- فایل‌های اضافه/تغییر یافته:
  - `engine/tableStore.ts` — `subscribeWithSelector`
  - `engine/equality.ts` — `structuralEqual` / `shallowEqualArray`
  - `engine/tableEngine.ts` — `subscribeSelected`
  - `infrastructure/ui/UITableController.ts` — `subscribeSelected` / `getSession`
  - `ui/useERPTable.ts` — subscribe جدا برای rows، undo flags، history/changelog
  - `engine/__tests__/table-store-selector.spec.ts`
- هدف: جلوگیری از rerender سراسری وقتی فقط slice نامرتبط عوض می‌شود
- نتیجه: Hook دیگر با هر notify کل view را force نمی‌کند؛ history از projection جدا subscribe می‌شود

### PR-17 — Thin adapter via GridSession

- فایل اضافه شد: `application/session/GridSession.ts` (interface)
- فایل اضافه شد: `infrastructure/session/DefaultGridSession.ts`
- فایل تغییر یافته: `bootstrap/index.ts` / `bootstrap/type.ts` — `session` در composition root
- هدف: facade رسمی session به‌جای وابستگی مستقیم UI به Engine
- نتیجه: `createERPTable` هم `controller` و هم `session` برمی‌گرداند؛ controller نازک‌تر و session-aware است

### PR-18 — Session-centric view / keyboard intents

- فایل اضافه شد: `application/session/ViewIntent.ts`
- فایل تغییر یافته: `infrastructure/ui/UITableKeyboardHandler.ts` — فقط `ViewIntent` می‌فرستد
- `DefaultGridSession.dispatchViewIntent` / `handleKeydown` + Undo/Redo از Ctrl+Z/Y
- هدف: keyboard/view commands از مسیر session عبور کنند نه engine خام
- نتیجه: Adapter کیبورد به port نازک `ViewIntentDispatcher` وابسته است

### PR-19 — ColumnSchema → ColumnDefinition + bindings

- فایل اضافه شد: `domain/types/ColumnDefinition.ts`
- فایل اضافه شد: `infrastructure/columns/mapColumnSchema.ts`
- فایل اضافه شد: `infrastructure/__tests__/map-column-schema.spec.ts`
- `createERPTable` خروجی `columnDefinitions` و `columnBindings` می‌دهد
- هدف: جدا کردن تعریف دامنه از renderer/style میزبانی React
- نتیجه: Core بدون `className`/`style`/`displayFormat`؛ bindingها در Adapter می‌مانند

### PR-20 — ERP voucher integration harness

- فایل اضافه شد: `bootstrap/__tests__/erp-harness.spec.ts`
- سناریو: seed ردیف کالا → ویرایش qty → history → add line via session → undo stack → column mapping
- نتیجه: مسیر runtime واقعی Phase 3 در یک harness یکپارچه verify شد

### PR-21 — IndexedDbEventStore

- فایل‌های اضافه شده:
  - `infrastructure/eventStore/KvDatabase.ts` — abstraction + `MemoryKvDatabase` + `openIndexedDbDatabase`
  - `infrastructure/eventStore/IndexedDbEventStore.ts`
  - `infrastructure/__tests__/indexed-db-event-store.spec.ts`
  - `bootstrap/__tests__/indexeddb-wiring.spec.ts`
- تغییر: `CreateERPTableConfig.eventStore?` برای تزریق store پایدار
- هدف: persistence مرورگر با همان قرارداد OCCی `InMemoryEventStore`
- نتیجه: append/read/readAll/subscribe پایدار؛ تست‌ها با memory backend؛ wiring واقعی در `createERPTable`

### PR-22 — Snapshot strategy

- فایل‌های اضافه شده:
  - `application/ports/SnapshotStore.ts`
  - `infrastructure/snapshot/InMemorySnapshotStore.ts`
  - `infrastructure/snapshot/SnapshotStrategy.ts`
  - `infrastructure/__tests__/snapshot-strategy.spec.ts`
- هدف: هر N رویداد (پیش‌فرض ۲۰۰) یک snapshot؛ load = snapshot + events بعد از version
- نتیجه: catch-up بدون replay کامل از صفر

### PR-23 — Benchmark و performance budget

- فایل‌های اضافه شده:
  - `infrastructure/perf/benchmark.ts`
  - `infrastructure/__tests__/performance-budget.spec.ts`
- بودجه‌ها: InMemory append، IndexedDb (memory backend) append، selector noop notify
- نتیجه: CI guard برای جلوگیری از رگرسیون میانگین/حداکثر latency

### PR-24 — Event catalog و Public API docs

- فایل‌های اضافه شده:
  - `application/events/eventCatalog.ts`
  - `application/__tests__/event-catalog.spec.ts`
  - `docs/event-catalog.md`
  - `docs/public-api.md`
- هدف: قرارداد پایدار برای pluginها و مصرف‌کننده‌های host
- نتیجه: توکن‌های undoable/plugin مستند و تست‌شده

### PR-25 — Packaging / publish path

- فایل‌های اضافه شده:
  - `package.json` (`@fallahi/erp-table` v0.4.0، exports، scripts)
  - `scripts/build-stub.mjs` — stub dist برای مسیر publish تا bundler واقعی در monorepo
- exportهای عمومی در `index.ts` گسترش یافت (EventStoreها، Snapshot، catalog، benchmark)
- نتیجه: `npm run build` و `npm test` در package تعریف شد؛ stub build موفق

### PR-26 — ViewportCalculator / virtualization (Core)

- فایل‌های اضافه شده:
  - `domain/value-objects/Viewport.ts` — VO بدون DOM (`scrollOffset`, `viewportSize`, `rowHeight`, `overscan`)
  - `engine/ViewportCalculator.ts` — `scrollOffset` → `VisibleRange`؛ project dense/sparse
  - `engine/SparseRowIndex.ts` — Map + ordered ids برای ۱۰۰k ردیف
  - `engine/__tests__/viewport-calculator.spec.ts` — شامل تست ۱۰۰k و budget
  - `bootstrap/__tests__/viewport-session.spec.ts`
- فایل‌های تغییر یافته:
  - `application/session/ViewIntent.ts` — `CHANGE_VIEWPORT`
  - `infrastructure/session/DefaultGridSession.ts` — state viewport + `getVisibleRange` / `projectVisibleRows`
  - `application/events/eventCatalog.ts` + `docs/event-catalog.md` — `VIEWPORT_CHANGED`
  - `domain/types/GridEvent.ts` — `ViewportChangedPayload`
  - `index.ts` — export عمومی
- هدف: منطق virtual scroll در Core؛ pagination فعلی ERP شکسته نشود
- نتیجه:
  - پنجرهٔ مرئی O(window) است نه O(n)
  - تست ۱۰۰k: `visibleCount < 30` و budget میانگین < ۵ms
  - Adapter با `session.dispatchViewIntent({ type: 'CHANGE_VIEWPORT', scrollOffset })` اسکرول می‌کند

### PR-27 — VirtualList React adapter

- فایل‌های اضافه شده:
  - `ui/virtual/virtualWindow.ts` — helper خالص `buildVirtualWindow` (بدون DOM)
  - `ui/virtual/useVirtualWindow.ts` — hook همگام با `GridSession` viewport
  - `ui/virtual/VirtualList.tsx` — لیست مجازی با spacer بالا/پایین + فقط ردیف‌های مرئی
  - `ui/virtual/index.ts`
  - `ui/virtual/__tests__/virtual-window.spec.ts`
  - `ui/virtual/__tests__/virtual-list-session.spec.ts`
- فایل‌های تغییر یافته:
  - `ui/useERPTable.ts` — `getViewport` / `getVisibleRange` / `projectVisibleRows` / `changeViewport`
  - `index.ts` — export عمومی `VirtualList` / `useVirtualWindow` / `buildVirtualWindow`
  - `docs/public-api.md`
  - `package.json` — اسکریپت test شامل `ui/virtual/__tests__`
- هدف: Adapter React نازک روی Core viewport؛ DesktopTable صفحه‌بندی‌شده دست‌نخورده ماند
- نتیجه:
  - اسکرول → `CHANGE_VIEWPORT` → فقط پنجرهٔ مرئی render می‌شود
  - برای ۵۰k آیتم، تعداد ردیف render‌شده ≪ ۱٪ کل

### PR-28 — Real tsup publish path

- فایل‌های اضافه/جایگزین:
  - `publish/entry.ts` — entry بسته‌بندی بدون UIهای host-coupled
  - `publish/entry.d.ts` — typings عمومی curated
  - `tsup.config.ts` — ESM + CJS + sourcemap؛ copy DTS پس از build
  - `tsconfig.json` / `tsconfig.build.json`
  - `scripts/verify-dist.mjs` — جلوگیری از برگشت به stub
  - `infrastructure/Repositories/noopRemoteApi.ts` — default بدون `@services`
  - `ui/hostTypes.ts` — حذف وابستگی `@type/elementType` از مسیر package
- فایل‌های تغییر یافته:
  - `package.json` → v0.5.0؛ `build: tsup`؛ devDeps: tsup/typescript/react/@types/react
  - `bootstrap/index.ts` — default `NoopRemoteApi` به‌جای `FetchRemoteApi`
  - `bootstrap/builders` / `bootstrap/type` — `RemoteApi` port
- حذف: `scripts/build-stub.mjs`
- هدف: مسیر publish واقعی برای `@fallahi/erp-table`
- نتیجه:
  - `npm run build` → bundle واقعی (~206KB)
  - `npm run verify:dist` پاس
  - Host ERP همچنان از `index.ts` محلی با ERPTable/CellRenderer استفاده می‌کند؛ پکیج از `publish/entry` می‌آید

### PR-29 — Excel/PDF plugins on EVENT_CATALOG

- فایل‌های اضافه:
  - `application/plugins/GridPlugin.ts` — قرارداد `GridPlugin` / `GridQueryPort`
  - `application/plugins/PluginHost.ts` — ثبت پلاگین + `requestExport`
  - `application/plugins/createEngineGridQuery.ts` — adapter Engine → query
  - `application/ports/PdfRenderer.ts` — Port تا jsPDF وارد Core نشود
  - `packages/plugins/excel/**` — `ExcelExportPlugin`, `buildXlsxBlob`, facade imperative
  - `packages/plugins/pdf/**` — `PdfExportPlugin`, `TextPdfRenderer`
  - `docs/rfc/RFC-001-pdf-export.md`
  - تست‌ها: `packages/plugins/{excel,pdf}/__tests__`
- فایل‌های تغییر یافته:
  - `infrastructure/excel/exportActiveCollectionToExcel.ts` → re-export پایدار برای toolbar ERP
  - `bootstrap/index.ts` / `bootstrap/type.ts` — `config.plugins` + `result.pluginHost`
  - `application/events/eventCatalog.ts` + `docs/event-catalog.md` — `XLSX_*` / `PDF_*`
  - `domain/types/GridEvent.ts` — payloadهای export
  - `publish/entry.ts` / `entry.d.ts` / `index.ts` / `docs/public-api.md`
- هدف: استخراج I/O خروجی از Domain؛ Subscribe به `EXPORT_REQUESTED` روی view stream
- نتیجه:
  - پلاگین‌ها Domain را mutate نمی‌کنند
  - toolbar فعلی با مسیر imperative همچنان کار می‌کند
  - Host می‌تواند `plugins: [new ExcelExportPlugin(), new PdfExportPlugin()]` پاس دهد

### PR-30 — Redo ROW_ADDED با restore هویت ردیف

- فایل‌های اضافه/تغییر:
  - `domain/entities/Table.ts` — `restoreAddedRow({ rowId, cells, … })`
  - `application/commands` — `RESTORE_ADDED_ROW`
  - `application/handlers/rowCommandsHandler.ts` — `RestoreAddedRowCommandHandler`
  - `application/undo/CellUndoStack.ts` — snapshot سلول‌ها روی `ROW_ADDED`؛ redo → `RESTORE_ADDED_ROW`
  - `application/TableAppService.ts` — capture snapshot از repo پس از add؛ wiring handler
  - `bootstrap/builders/index.ts` — ثبت handler + `setRepository`
- تست‌ها:
  - unit stack / domain `restoreAddedRow`
  - integration: add → edit → undo×2 → redo → همان `rowId`
- هدف: بستن شکاف Redo که فقط `ADD_EMPTY_ROW` می‌زد و هویت ردیف را عوض می‌کرد
  - نتیجه: undo/redo چرخهٔ add ردیف، id و مقادیر snapshot را حفظ می‌کند

### PR-31 — DesktopTable → VirtualList (opt-in)

- فایل‌های اضافه:
  - `ui/desktop/ERPTableVirtualBody.tsx` — tbody مجازی با spacer + `ERPTableRow` فقط برای پنجرهٔ مرئی
  - `ui/desktop/__tests__/desktop-virtual-body.spec.ts`
- فایل‌های تغییر یافته:
  - `engine/ViewStateBuilder.ts` / `tableEngine` / `UITableController` — `getAllUIRows()` (بدون slice صفحه‌بندی)
  - `ui/desktop/DesktopTable.tsx` — prop `virtualization` + `session`؛ pagination مخفی در حالت مجازی
  - `ui/desktop/useERPTableLayout.ts` — `syncPageSize: false` وقتی مجازی است
  - `ui/index.tsx` (`ERPTable`) — پاس‌دادن `virtualization` / `session`
  - `docs/public-api.md`
- هدف: مهاجرت تدریجی بدون شکستن ERP؛ پیش‌فرض همچنان pagination
- نتیجه:
  - `<ERPTable virtualization tableHeight={…} />` مسیر مجازی را فعال می‌کند
  - همان `GridSession` / `CHANGE_VIEWPORT` که VirtualList استفاده می‌کند

### PR-32 — Grid search + error nav با Desktop مجازی

- فایل‌های تغییر یافته:
  - `ui/gridSearch/utils.ts` — `revealRow` / `computeVirtualScrollOffset`؛ مجازی → `CHANGE_VIEWPORT` + `scrollTop`؛ صفحه‌بندی → `CHANGE_PAGE`
  - `ui/desktop/DesktopTable.tsx` — `data-erp-table-key` برای پیدا کردن scroll root
  - `ui/desktop/ERPTableHeader.tsx` — navigate خطا از طریق `revealRow`
  - `infrastructure/ui/UITableController.ts` — `getTableKey()`
  - تست: `ui/gridSearch/__tests__/navigate-to-match.spec.ts`
- هدف: بعد از PR-31، جستجو/خطا فقط pagination را فرض نکند
  - نتیجه: در حالت `virtualization`، match به viewport اسکرول می‌شود و ردیف فعال می‌شود

### PR-33 — Paste dual-write + undo

- فایل‌های اضافه/تغییر:
  - `application/commands` — `PASTE_ROW`
  - `application/handlers/rowCommandsHandler.ts` — `PasteRowCommandHandler` (`table.addRow`)
  - `application/TableAppService.ts` / `bootstrap/builders` — wiring
  - `engine/tableEngine.ts` — `executePasteAction`: batch `PASTE_ROW` (+ `ROW_DELETED` برای cut) با یک `correlationId`
  - `engine/managers/RowManager.ts` — paste از مسیر Engine مستقیم حذف شد
  - تست integration در `bootstrap/__tests__/create-erp-table.spec.ts`
- هدف: Paste دیگر Domain را بدون EventStore/Undo دور نزند
- نتیجه:
  - copy → paste چند ردیف = یک undo unit
  - EventStore رویدادهای `ROW_ADDED` با `correlationId` مشترک می‌گیرد
  - محدودیت باقی: undoی restore منابع پس از **cut** هنوز نیست (فقط cloneهای paste undo می‌شوند)

### PR-34 — Undo cut-delete در واحد paste

- فایل‌های تغییر یافته:
  - `application/undo/CellUndoStack.ts` — `ROW_DELETED` entry با `mode: soft|hard`
  - `application/TableAppService.ts` — snapshot قبل از delete؛ ثبت `ROW_DELETED` / `NEW_ROW_REMOVED`
  - `application/events/eventCatalog.ts` + docs — undoable برای delete/remove
  - تست unit + integration cut→paste→undo
- هدف: بستن شکاف PR-33 برای cut
- نتیجه:
  - soft delete: undo با toggle `ROW_DELETED` منبع را برمی‌گرداند
  - hard remove: undo با `RESTORE_ADDED_ROW` + snapshot
  - در واحد correlation، اول منابع restore می‌شوند بعد cloneها حذف

### PR-35 — Automatic publish DTS

- فایل‌های تغییر یافته:
  - `tsup.config.ts` — `dts: true` با emit خودکار از `publish/entry.ts` (بدون copy curated)
  - `scripts/verify-dist.mjs` — چک exportهای عمومی شامل PluginHost / Excel / PDF
  - `package.json` — مسیر تست pluginها صریح (Windows-safe)
  - `tsconfig.json` — `lib: ES2022` + include برای `packages/plugins`
  - `engine/tableEngine.ts` — narrow امن برای paste action قبل از DTS
  - `application/events/index.ts` — `NewRowRemovedEvent` در اتحاد `TableEvent`
  - `domain/types/GridEvent.ts` — `NEW_ROW_REMOVED` در alias حذف ردیف
  - `application/handlers/cellCommandsHandler.ts` — endpoint/col schema ایمن‌تر
- فایل حذف‌شده: `publish/entry.d.ts` (جایگزین با `dist/index.d.ts` خودکار ~76KB)
- هدف:
  - بستن شکاف curated typings و هم‌تراز کردن types با surface واقعی publish
- نتیجه:
  - `npm run build` + `verify:dist` پاس
  - DTS از graph entry ساخته می‌شود؛ checker در tsup با `strict: false` تنظیم شده تا type debt قدیمی UI میزبان بسته‌بندی را نبشکند

### PR-36 — Strict publish typecheck

- فایل‌های تغییر یافته:
  - `tsup.config.ts` — `dts: true` بدون `strict: false` (هم‌تراز با tsconfig پروژه)
  - `tsconfig.publish.json` — typecheck محدود به publish graph
  - `package.json` — اسکریپت `typecheck:publish` + گارد در `prepublishOnly`
  - `application/handlers/cellCommandsHandler.ts` — `setColumnSchema` با base typed (`col ?? colMeta`) تا `visibility` الزامی بماند
  - `bootstrap/builders/index.ts` — cast امن `displayFormat` + `r.values ?? {}`
  - `engine/managers/NavigationManager.ts` — narrow امن `dependsOn`
  - `docs/public-api.md` — اشاره به strict DTS و `typecheck:publish`
- هدف:
  - پایدار کردن emit تایپ‌ها روی سطح publish بدون شل کردن checker
- نتیجه:
  - `npm run typecheck:publish` پاس
  - `npm run build` (strict DTS) + `verify:dist` پاس
  - بدهی typecheck UI میزبان عمداً خارج از این گارد مانده است

### PR-37 — Desktop virtualization default-on

- فایل‌های تغییر یافته / اضافه:
  - `ui/desktop/resolveDesktopVirtualization.ts` — قرارداد پیش‌فرض: on وقتی session هست؛ `false` = pagination
  - `ui/desktop/DesktopTable.tsx` / `ui/index.tsx` — حذف default `false`؛ استفاده از resolver
  - `ui/desktop/index.ts` — export resolver
  - `ui/desktop/__tests__/desktop-virtual-body.spec.ts` — تست پیش‌فرض / opt-out
  - `docs/public-api.md` — مستند default-on + escape hatch
- هدف:
  - ERP جدید بدون prop اضافه مسیر مجازی را بگیرد
  - hostهای نیازمند pagination با `virtualization={false}` سازگار بمانند
- نتیجه:
  - پیش‌فرض مجازی وقتی `session` آماده است
  - بدون session همچنان pagination/body کلاسیک

### PR-38 — Host UI type-debt boundary

- فایل‌های اضافه/تغییر:
  - `types/host-shims.d.ts` — stubهای ambient برای antd / next-intl / atoms / services / slices
  - `tsconfig.json` — include کامل `ui/**` + shims
  - `package.json` — `typecheck:host-ui` + گارد در `prepublishOnly`
  - `ui/useERPTable.ts` — import نسبی داخل پکیج (حذف alias `@components/organisms/erp-table/...`)
  - null-safety در `ERPTableFooter` / headers / `scrollToMatch` / `useEngineSelector` / `fetchRemoteApi`
  - `@ts-nocheck` فقط روی host-glue سنگین: `cellRenderer/*`، `ERPTableDynamicSelect`، `useERPGrid`، voucher description
- هدف:
  - `tsc` ریشه بدون monorepo ERP پاس شود
  - مرز publish سخت‌گیر بماند؛ بدهی UI میزبان ایزوله و قابل پیگیری شود
- نتیجه:
  - `npm run typecheck:host-ui` پاس
  - publish typecheck / build / tests همچنان پاس

---

## Phase Completion Audit (EXECUTION_PLAN ↔ WORKLOG)

هدف این بخش: اثبات پوشش **۱۰۰٪** فازهای اجرایی نسبت به گزارش کار؛ هیچ PR طرح‌شده بدون گزارش، و هیچ گزارش داخل بازهٔ طرح بدون ردیف پلن.

### Summary

| فاز | PRهای طرح | گزارش WORKLOG | Exit criteria | وضعیت |
|-----|-----------|---------------|---------------|--------|
| Phase 1 | PR-1 … PR-4 | موجود | برآورده | ✅ 100% |
| Phase 2 | PR-5 … PR-15b | موجود | برآورده | ✅ 100% |
| Phase 3 | PR-16 … PR-20 | موجود | برآورده | ✅ 100% |
| Phase 4 | PR-21 … PR-25 | موجود | برآورده | ✅ 100% |
| Phase 5 Hardening | PR-26 … PR-38 | موجود | برآورده | ✅ 100% |
| **کل طرح** | **PR-1 … PR-38** | **کامل** | **بسته** | **✅ 100%** |

### Traceability Matrix

| PR | فاز | عنوان کوتاه در WORKLOG | Verify مرتبط |
|----|-----|-------------------------|--------------|
| PR-1 | 1 | Characterization Tests | domain specs |
| PR-2 | 1 | Domain Boundary Cleanup | domain isolation |
| PR-3 | 1 | Command Separation | command-categories |
| PR-4 | 1 | First Dual-write | event store start |
| PR-5 | 2 | Service-level Dual-write | dual-write.spec |
| PR-6 | 2 | Changelog Projection | changelog-projection |
| PR-7 | 2 | Runtime Wiring | createERPTable wiring |
| PR-8 | 2 | Controller Changelog API | UITableController |
| PR-9 | 2 | Hook Changelog Facade | useERPTable |
| PR-10 | 2 | Changelog Subscription | subscribe API |
| PR-11 | 2 | History Panel ViewModel | history-panel |
| PR-12 | 2 | History Severity/Category | history model |
| PR-13 | 2 | Real previousValue | cell events |
| PR-14 | 2 | Global Stream readAll | EventStore |
| PR-15 | 2 | Undo/Redo CELL_CHANGED | cell-undo-stack |
| PR-15b | 2 | ROW_ADDED undo + correlationId | undo batch |
| PR-16 | 3 | Selector-based subscription | table-store-selector |
| PR-17 | 3 | Thin adapter / GridSession | session |
| PR-18 | 3 | Session-centric intents | viewport-session |
| PR-19 | 3 | ColumnDefinition mapping | map-column-schema |
| PR-20 | 3 | ERP harness | erp-harness |
| PR-21 | 4 | IndexedDbEventStore | indexed-db-event-store |
| PR-22 | 4 | Snapshot strategy | snapshot-strategy |
| PR-23 | 4 | Perf budget | performance-budget |
| PR-24 | 4 | Event catalog / public API | event-catalog |
| PR-25 | 4 | Packaging / publish path | verify:dist |
| PR-26 | 5 | ViewportCalculator | viewport-calculator |
| PR-27 | 5 | VirtualList adapter | virtual-list/window |
| PR-28 | 5 | Real tsup publish | build + verify:dist |
| PR-29 | 5 | Excel/PDF plugins | plugin specs |
| PR-30 | 5 | ROW_ADDED restore identity | undo/restore |
| PR-31 | 5 | Desktop virtual opt-in | desktop-virtual-body |
| PR-32 | 5 | Search reveal + virtual | navigate-to-match |
| PR-33 | 5 | Paste dual-write + undo | create-erp-table paste |
| PR-34 | 5 | Cut-delete undo in paste unit | cut-paste undo |
| PR-35 | 5 | Automatic publish DTS | build DTS |
| PR-36 | 5 | Strict publish typecheck | typecheck:publish |
| PR-37 | 5 | Virtualization default-on | resolveDesktopVirtualization |
| PR-38 | 5 | Host UI type-debt boundary | typecheck:host-ui |

### Closure Statement

- مقایسهٔ `EXECUTION_PLAN.md` و این WORKLOG نشان می‌دهد طرح اجرایی به **اجرای ۱۰۰٪** رسیده است.
- مورد جا‌ماندهٔ فاز وجود ندارد.
- موارد باقی‌مانده صرفاً backlog اختیاری خارج از Scope طرح‌اند (peer deps host-glue / مهاجرت pagination hostهای قدیمی).

---

## Verification Log

آخرین اجرای تست ثبت‌شده:

- `25` فایل تست و `104` تست بعد از `PR-38` (همه پاس)
- `npm run typecheck:publish` + `npm run typecheck:host-ui` + `npm run build` + `verify:dist` بعد از بستن طرح (پاس؛ re-verify در تکمیل گزارش)

---

## Current Architectural Gains

- EventStore / Snapshot / budgets / catalog
- Viewport + VirtualList + **Desktop virtual-by-default** + search reveal
- Paste/cut از AppService با dual-write و undo واحد
- مسیر npm واقعی با tsup + **strict auto DTS** + `typecheck:publish` + `typecheck:host-ui`
- Plugin Excel/PDF + PluginHost
- Undo/Redo سلول + ROW_ADDED هویت + paste/cut batch
- طرح اجرایی Phase 1–5 بسته شده است

---

## Remaining Gaps (خارج از طرح اجرایی)

- فایل‌های host-glue هنوز `@ts-nocheck` دارند تا peer deps واقعی (antd / atoms / redux) اضافه شوند — **اختیاری**
- hostهای قدیمی که به pagination وابسته‌اند باید صریحاً `virtualization={false}` بگذارند — **اختیاری / مهاجرت محصول**
- sticky cell-overlap هنوز chrome دمو است؛ API هسته برای merge/sticky نداريم — جزئیات در `docs/demo-playground-report.md`
- DatePicker جلالی فقط در playground؛ هنوز peer/CellRenderer رسمی نیست

---

## Next Planned Work

> منبع حقیقت چک‌باکس‌ها: `EXECUTION_PLAN.md` Phase 6+.

**الان:** PR-42 — `ERPTableProps.theme` + `style={theme.toCssVars()}` روی ریشه. تم تیره و portal در PR-43/44.

ترتیب فازها: 6 theming foundation → 7 theming API (دکمه تیره در محصول) → 8 API honesty + SparseRowIndex روی virtual → 9 decouple arianERP + multiSelect اختیاری → 10 cell registry → 11 column chrome (resize / pin index / reorder) → 12 a11y → 13 Persian PDF با Vazirmatn → 14 voucher polish.

تصمیم باز برای ایجنت نمانده (D1–D12 قفل). شکستن جدید غیر از D1/D11 را بپرس.
