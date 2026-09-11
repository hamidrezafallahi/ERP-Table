# Public API honesty

این سند inventory است، نه roadmap تبلیغاتی. هر ردیف با grep در همین ریپو قابل تأیید است. **رفتار runtime در PR-46 عوض نشده.**

مخاطب: میزبان ERP و ایجنت بعدی. وقتی یک شکاف سیم شد، همین فایل و تست `docs/__tests__/public-api-honesty.spec.ts` را با هم به‌روز کن.

Related: [`public-api.md`](./public-api.md) (سطح صادرات)، [`cell-components.md`](./cell-components.md) (ثبت ادیتور)، [`event-catalog.md`](./event-catalog.md) (توکن رویداد)، [`EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) Phase 8+.

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
| Pin ستون `index` | **live** (PR-59) | `position: sticky; inset-inline-start: 0` روی سلول index در header / body / footer (و spacer مجازی per-column). **D10: فقط `index`.** هیچ `pinnedColumns` روی `ERPTableProps`. | — |
| `role="grid"` | **live** (PR-62) | `<table role="grid">` دسکتاپ و موبایل. هدر `columnheader`، سلول `gridcell`، `aria-colindex` / `aria-rowindex` (مجازی: ایندکس مطلق مجموعه، نه ایندکس DOM). `aria-selected` هنوز PR-63. | PR-63 |
| `TextPdfRenderer` / `PdfExportPlugin` | **stub** (کیفیت) | PDF با `/BaseFont /Helvetica` و متن لاتین حداکثر ۴۰ سطر. فونت فارسی (Vazirmatn) embed نیست. | Phase 13 PR-65+ (D3, D9) |

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
- Desktop virtualization **opt-in** (`virtualization={true}`) با `SparseRowIndex` — pagination پیش‌فرض عوض نشد
- Excel export/import plugin روی `EXPORT_REQUESTED`
- Theming: `theme` / `themeErp` / `themeErpDark` / portal vars (Phase 6–7)
- `controller.getAllUIRows()` — کل collection فعال، بدون slice صفحه
- Snapshot opt-in: `createERPTable({ snapshotStore })` (D7)
- Default `remoteApi` = `NoopRemoteApi` (PR-51 / D1). ERP injects `FetchRemoteApi`.
- `multiSelectConfig` optional (PR-53 / D11); omit = no choose-from-list chrome
- `ColumnSchema.render` / `ColumnViewBinding.render` (PR-54); omit = built-in FieldType editor
- `ERPTableProps.components` (PR-55); override e.g. `checkbox`, other FieldTypes keep the switch
- `FieldType.textArea` (PR-56) via `DEFAULT_CELL_COMPONENTS` / `TextAreaCell`; Enter in the textarea does not move the active cell
- Column resize (PR-58): drag the desktop `<th>` edge; session `columnWidths` only (not EventStore)
- Index column pin (PR-59 / D10): sticky `inset-inline-start` on the `index` cell; no arbitrary column pin API
- `COLUMN_REORDERED` (PR-61): AppService + header drag on desktop `<th>` + EventStore; `setColumns` keeps domain `order`
- `role="grid"` (PR-62): desktop + mobile table; `aria-rowindex` is the absolute collection index (virtual window included). Active-cell `aria-selected` is PR-63

---

## Out of scope (not missing features)

grouping، pivot، tree، chart، SSRM، column menu شبیه AG، range selection سلولی، فرمول. این کتابخانه ویرایشگر اقلام سند است. RFC جدا لازم است؛ در این فایل «شکاف API» حساب نمی‌شوند.
