# Gap Analysis — `persian-data-grid` vs `ag-grid-react`

سند داوری سخت‌گیرانه. تاریخ: ۱۴۰۵/۰۶/۲۰ (۱۱ سپتامبر ۲۰۲۶). نسخهٔ زیر داوری: `persian-data-grid@0.5.0`.

هدف این سند **تعریف و تحسین نیست**. هدف این است که قبل از انتشار جدی، فاصلهٔ واقعی با رهبر بازار اندازه‌گیری شود تا `EXECUTION_PLAN.md` روی داده بنا شود نه روی حس.

> قاعدهٔ داوری: هر «دارم» فقط وقتی قبول است که **کد runtime** داشته باشد و **مصرف‌کنندهٔ عمومی** بتواند بدون خواندن سورس آن را روشن کند. export بدون UI، ادعای داکیومنت بدون کد، و فیچر پشت `@ts-nocheck` = «ندارم».

---

## ۰. مختصات بازار

| پکیج | دانلود هفتگی (۱۱ سپتامبر ۲۰۲۶) | مدل |
|------|-------------------------------|------|
| `@tanstack/react-table` | ۱۴,۸۸۶,۱۰۸ | headless، MIT |
| `@mui/x-data-grid` | ۲,۱۵۱,۴۱۴ | MIT core + Pro/Premium تجاری |
| `ag-grid-react` | ۱,۷۱۲,۷۵۰ | Community MIT + Enterprise تجاری |
| `react-data-grid` | ۴۳۰,۹۰۴ | MIT |
| `@glideapps/glide-data-grid` | ۲۳۹,۸۴۴ | canvas، MIT |
| `handsontable` | ۲۴۰,۵۵۳ | تجاری |
| **`persian-data-grid`** | **۱۲۹** | MIT، یک نسخه (`0.5.0`، منتشرشده ۱۰ سپتامبر ۲۰۲۶) |

نتیجهٔ بی‌رحمانه: تو با ag-grid رقابت نمی‌کنی. تو با **«چرا این را به‌جای TanStack Table + چند کامپوننت انتخاب کنم؟»** رقابت می‌کنی. پاسخ فعلی کتابخانه به این سؤال ضعیف است، و این سند می‌گوید چرا.

---

## ۱. ضروریات بازار — چک‌لیست مرجع

این فهرست از تقاطع فیچرست AG Grid Community/Enterprise، MUI X Data Grid، و انتظارات استاندارد یک Data Grid در ۲۰۲۶ ساخته شده است.

### Tier 0 — بدون این‌ها اسم «Data Grid» روی پکیج دروغ است

| # | ضرورت | چرا Tier 0 |
|---|--------|------------|
| T0-1 | مرتب‌سازی ستون (کلیک هدر، multi-sort، comparator سفارشی) | اولین کاری که هر کاربر روی هر جدولی می‌کند |
| T0-2 | فیلتر ستون (متن/عدد/تاریخ/set) + quick filter که **ردیف را حذف کند** | دومین کار |
| T0-3 | مجازی‌سازی ردیف، **پیش‌فرض روشن** | بدون آن پکیج در ۱۰k ردیف می‌میرد |
| T0-4 | مجازی‌سازی ستون (پنجرهٔ افقی) | جدول ۸۰ ستونی سازمانی بدون آن غیرقابل استفاده است |
| T0-5 | ویرایش سلول + رجیستری ادیتور + validation | — |
| T0-6 | انتخاب ردیف (single/multi/checkbox/select-all) | — |
| T0-7 | ناوبری کیبورد **استاندارد** (arrows، Tab، Enter، Home/End، PageUp/Down) | — |
| T0-8 | کلیپ‌بورد سیستم: `Ctrl+C` / `Ctrl+V` با TSV، **paste از Excel** | در گریدهای مالی درخواست شمارهٔ یک |
| T0-9 | resize / reorder / hide / pin ستون (چپ و راست) | — |
| T0-10 | صفحه‌بندی (client و server) | — |
| T0-11 | مدل دادهٔ جنریک: `rowData: T[]` + `columnDefs: ColumnDef<T>[]` + `getRowId` | بدون این، مصرف‌کننده باید دادهٔ خودش را به شکل تو ترجمه کند |
| T0-12 | API رخداد و imperative: `onCellValueChanged`، `onSelectionChanged`، `apiRef` | — |
| T0-13 | تم/CSS variables + تم تیره + قابلیت override | — |
| T0-14 | دسترس‌پذیری: `role="grid"`، ARIA، `aria-sort`، مدیریت فوکوس | — |
| T0-15 | SSR-safe + Next.js App Router | — |
| T0-16 | بستهٔ ماژولار و tree-shakable با بودجهٔ اندازه | — |
| T0-17 | مستندات انگلیسی + API reference + مثال اجرایی | بدون این، هیچ‌کس بیرون از ایران نصب نمی‌کند |
| T0-18 | حالت server-side: sort/filter/page روی سرور | — |

### Tier 1 — تمایز رقابتی

| # | ضرورت |
|---|--------|
| T1-1 | انتخاب بازهٔ سلولی (range selection) چندبازه‌ای |
| T1-2 | fill handle (کشیدن گوشه + تشخیص سری) |
| T1-3 | گروه‌بندی ردیف + aggregation (`sum`/`avg`/`min`/`max`/custom) |
| T1-4 | Tree data / master-detail |
| T1-5 | Pivot |
| T1-6 | هدر چندسطحی (column groups) |
| T1-7 | منوی ستون + tool panel / sidebar |
| T1-8 | ذخیره/بازگردانی چیدمان (`columnState`) |
| T1-9 | ردیف‌های pin شدهٔ بالا/پایین |
| T1-10 | خروجی CSV / Excel / PDF |
| T1-11 | auto-size + flex ستون |
| T1-12 | context menu سفارشی |
| T1-13 | i18n و locale pack |
| T1-14 | حالت‌های loading / overlay / skeleton |
| T1-15 | wrapper چند فریم‌ورک (Vue / Angular / vanilla) |
| T1-16 | نمودار یکپارچه |

### Tier 2 — جایی که *تو* می‌توانی از ag-grid جلو بزنی

| # | فرصت | وضعیت ag-grid |
|---|------|----------------|
| T2-1 | Event sourcing + audit trail واقعی (چه کسی، کِی، از چه به چه) | **ندارد** |
| T2-2 | Offline-first با IndexedDB + snapshot + replay | **ندارد** |
| T2-3 | Undo/Redo دامنه‌ای با batch روی `correlationId` | محدود به ویرایش سلول |
| T2-4 | تقویم جلالی/شمسی به‌عنوان شهروند درجه‌یک | فقط Gregorian + locale |
| T2-5 | PDF فارسی/RTL با فونت embedded و رندرر مستقل | **ندارد** (باید خودت بسازی) |
| T2-6 | RBAC سطح ردیف/سلول در هستهٔ دامنه | **ندارد** |
| T2-7 | ویرایش هم‌زمان (presence + CRDT روی stream رخداد) | **ندارد** |
| T2-8 | همه‌چیز MIT (خروجی Excel، range، grouping بدون لایسنس) | Enterprise پول می‌گیرد |

---

## ۲. کارت امتیاز

وزن‌ها جمعشان ۱۰۰ است. امتیاز ag-grid = Community + Enterprise با هم (چون کاربر آن را یک محصول می‌بیند).

| # | دسته | وزن | ag-grid | persian-data-grid | شکاف |
|---|------|-----|---------|-------------------|------|
| ۱ | عملیات داده (sort / filter / quick filter) | ۱۵ | ۱۵ | **۱۰** | −۵ |
| ۲ | مقیاس و row models (virtual ردیف/ستون، SSRM، infinite) | ۱۴ | ۱۴ | **۱۴** | ۰ |
| ۳ | ویرایش و validation | ۱۱ | ۱۰ | **۹** | −۱ |
| ۴ | انتخاب و کلیپ‌بورد | ۱۰ | ۱۰ | **۸٫۵** | −۱٫۵ |
| ۵ | قابلیت‌های ستون | ۹ | ۹ | **۹** | ۰ |
| ۶ | کیبورد و دسترس‌پذیری | ۸ | ۸ | **۷** | −۱ |
| ۷ | تم و سفارشی‌سازی | ۷ | ۷ | **۴٫۵** | −۲٫۵ |
| ۸ | طراحی API و TypeScript DX | ۱۱ | ۹ | **۵** | −۴ |
| ۹ | بسته‌بندی / bundle / ماژولاریتی | ۸ | ۷ | **۱٫۵** | −۵٫۵ |
| ۱۰ | مستندات / اکوسیستم / اعتماد | ۷ | ۷ | **۷** | ۰ |
| | **جمع** | **۱۰۰** | **۹۶** | **۷۵٫۵** | **−۲۰٫۵** |

### محور مکمل — تمایز (Tier 2)

| دسته | وزن | ag-grid | persian-data-grid |
|------|-----|---------|-------------------|
| Audit / event sourcing | ۲۵ | ۰ | ۲۳ |
| Offline-first / persistence | ۲۰ | ۰ | ۲۰ |
| Undo/Redo دامنه‌ای | ۱۵ | ۸ | ۱۳ |
| جلالی / RTL / PDF فارسی | ۲۵ | ۸ | ۲۲ |
| RBAC دامنه‌ای | ۱۵ | ۰ | ۱۰ |
| **جمع** | **۱۰۰** | **۱۶** | **۸۸** |

**خواندن درست این دو جدول:** به‌عنوان «Data Grid عمومی» تو ۵۵ از ۱۰۰ هستی. به‌عنوان «گرید سند مالی فارسی با audit و offline» تو ۸۱ از ۱۰۰ هستی و ag-grid ۱۶. این یعنی استراتژی درست **بردن نبرد دوم و رسیدن به کف قابل‌قبول در نبرد اول** است، نه clone کردن ag-grid.

---

## ۳. داوری دسته‌به‌دسته (با شاهد کد)

### ۱) عملیات داده — ۱۰/۱۵ ⚠️

- **مرتب‌سازی ستون (هدر) زنده است.** `applySort` خالص + `SET_SORT_MODEL` روی `SparseRowIndex` / `getAllUIRows` (PR-89/90). کلیک هدر: asc → desc → none؛ Shift+Click multi-sort؛ `aria-sort`؛ آستانهٔ ۵px در برابر drag reorder (PR-91).
- **فیلتر ستون زنده است (PR-92/94/95).** `applyFilter` / `FilterModel` + `SET_FILTER_MODEL` روی ایندکس UI. آیکن فیلتر هدر → پاپ‌اور با `useThemePortalStyle`؛ `floatingFilter` اختیاری؛ نشانگر `data-pdg-filter-active`. رجیستری `filterComponents` + `ColumnDef.filter` سفارشی (PR-95).
- **`quickFilterText` زنده است (PR-93).** ردیف‌های نامطابق از ایندکس UI حذف می‌شوند.
- **`GridSearchPanel` فیلتر نیست.** find & navigate است؛ ردیف را مخفی نمی‌کند (`ui/gridSearch/utils.ts`).
- **aggregation فقط sum هاردکد** است (`ui/desktop/ERPTableFooter.tsx:32-42`).

> مربی: این تنها دسته‌ای است که به‌تنهایی می‌تواند انتشار را شکست بدهد. کسی که `npm i persian-data-grid` می‌کند، در ۳۰ ثانیهٔ اول روی هدر کلیک می‌کند. اگر چیزی نشود، بقیهٔ ۲۲ هزار خط کد دیده نمی‌شود.

### ۲) مقیاس و row models — ۱۴/۱۴ ✅

- مجازی‌سازی ردیف **پیش‌فرض روشن است** (PR-97 / D17): `resolveDesktopVirtualization` وقتی session هست `true` می‌دهد مگر `virtualization={false}`.

```7:15:ui/desktop/resolveDesktopVirtualization.ts
export function resolveDesktopVirtualization(
  virtualization: boolean | undefined,
  session: GridSession | null | undefined,
): boolean {
  if (!session) return false;
  if (virtualization === false) return false;
  return true;
}
```

- **مجازی‌سازی ستون زنده است (PR-98).** `calculateColumnViewport` / `ViewportCalculator.calculateColumns` با عرض تجمعی و binary search؛ `ColumnWindowProvider` مشترک برای هدر/بدنه/فوتر؛ pin ایندکس همیشه mount؛ spacer افقی RTL-aware.
- **قرارداد infinite/serverSide زنده است (PR-96 + PR-102).** `rowModelType` + `GridDatasource.getRows`؛ کش بلوکی LRU (`cacheBlockSize` / `maxBlocksInCache`)؛ `api.refreshServerSide()`؛ sort/filter کش را پاک می‌کند؛ placeholder بارگذاری (`__pdgLoading`).
- **مسیرهای گرم O(n) حذف شدند (PR-99).** `SparseRowIndex.posById` + `neighbor`؛ جستجو از `QuickFilterIndex`؛ فوتر از `ColumnTotalsIndex`.
- **harness perf ۱۰۰k زنده است (PR-100).** اعداد در `docs/performance.md` و README.
- **حافظهٔ ۱۰۰k×۲۰ زیر ۳۰۰ MB است (PR-101).** lazy host cells؛ اندازه‌گیری **۲۱۵ MB**.
- **overlay loading / no-rows + skeleton infinite زنده است (PR-103).** `loading`؛ `loadingOverlayComponent` / `noRowsOverlayComponent`؛ ردیف‌های `__pdgLoading` اسکلتون می‌شوند.

> مربی: «۱۰۰k ردیف» را در README ادعا نکن تا یک تست با ۱۰۰k ردیف دامنهٔ واقعی + اسکرول + ویرایش در CI سبز نشود.

### ۳) ویرایش و validation — ۹/۱۱ ✅ نقطهٔ قوت نسبی

- ۱۱ نوع فیلد (`domain/types/ColumnSchema.ts:15-26`) شامل `price`، `selectOption` ریموت با اسکرول بی‌نهایت، `description`، `textArea`.
- رجیستری کامپوننت سلول واقعی است (`ui/cellRenderer/cellRegistry.ts:36-63`) و `components` prop عمومی است.
- `asyncValidator` واقعاً await می‌شود (`engine/tableEngine.ts:696-718`).
- **چرخهٔ ادیتور (PR-126):** draft نشست‌محور؛ `Esc` لغو بدون EventStore؛ `Enter`/`Tab` تأیید + حرکت؛ `singleClickEdit` / `stopEditingWhenCellsLoseFocus` / `editType: 'fullRow'` روی دسکتاپ.
- **کمبودها:** ادیتور فرمول/spreadsheet و ویرایش هم‌زمان (presence) خارج از scope.
### ۴) انتخاب و کلیپ‌بورد — ۸٫۵/۱۰ ✅

- انتخاب ردیف multi + shift/ctrl + checkbox دارد (`engine/managers/SelectionManager.ts:37-143`).
- **انتخاب بازهٔ سلولی زنده است (PR-104/105).** Shift/Ctrl+click، Shift+arrow، Ctrl+A؛ `--pdg-range-*` روی سلول‌های visible.
- **کپی/چسباندن کلیپ‌بورد سیستم زنده است (PR-106/107).** `Ctrl+C` → TSV + HTML؛ `Ctrl+V` → parse TSV/CSV (نقل‌قول/چندخطی)، tile روی بازه، `pasteAddsRows`، ارقام/تاریخ فارسی، `PASTE_CELLS` batch + یک undo.
- **Fill handle زنده است (PR-108).** مربع گوشهٔ پایین بازه؛ درگ عمودی/افقی؛ سری عددی و تاریخ جلالی؛ `Ctrl+درگ` = کپی خالص؛ یک undo.
- **`Alt+C/X/V` alias منسوخ برای row-clone** — `Ctrl+C/X/V` استاندارد (PR-109):

```123:140:application/handlers/rowCommandsHandler.ts
// PasteRowCommandHandler → table.addRow(sourceRowId)
```

هیچ `navigator.clipboard` یا `ClipboardEvent` در مسیر گرید نیست. یعنی **کپی از Excel و paste در گرید کار نمی‌کند** — دقیقاً کاری که کاربر سند حسابداری روزی ۵۰ بار می‌خواهد.

- انتخاب همهٔ ردیف‌ها: `TOGGLE_SELECT_ALL_ROWS` در engine هست ولی هدر `TOGGLE_PAGE_ROW_SELECTED` می‌زند (`ui/desktop/ERPTableHeader.tsx:48-52`)، و `handleSelectAllRows` در `ui/desktop/groupActionButtons.tsx:72-74` تعریف شده ولی در JSX وصل نشده — **کد مرده**.

> مربی: کلیپ‌بورد Excel تک‌بزرگ‌ترین ROI در کل این سند است. Tier 0، پیاده‌سازی حدوداً یک هفته، و تنها چیزی است که «شبیه Excel» را از شعار به واقعیت تبدیل می‌کند.

### ۵) قابلیت‌های ستون — ۹/۹ ✅

| فیچر | وضعیت |
|------|-------|
| resize | ✅ `ui/desktop/ColumnResizeHandle.tsx` |
| reorder با drag | ✅ `ui/desktop/ERPTableHeader.tsx:85-120` |
| pin | ✅ `ColumnDef.pinned: 'start' \| 'end'` — سه ناحیه + مجازی‌سازی (PR-110 / D19) |
| hide/show | ✅ `api.setColumnVisible` / `ColumnDef.hide` — RBAC `visibility.never` قفل (PR-111) |
| auto-size / flex | ✅ `api.autoSizeColumns` / `sizeColumnsToFit` + `ColumnDef.flex` — canvas off-DOM (PR-112) |
| هدر چندسطحی | ✅ `ColumnGroupDef` + `ColumnGroupHeaderRows` — دو سطح، `aria-colspan`، collapse (PR-113) |
| منوی ستون | ✅ `columnMenuItems` + `ColumnMenuPopover` — sort/filter/hide/pin/auto-size/configure (PR-114) |
| `columnState` save/restore | ✅ `getColumnState` / `applyColumnState` (pin+sort) + `stateKey` localStorage + `COLUMN_STATE_CHANGED` (PR-115) |

### ۶) کیبورد و دسترس‌پذیری — ۷/۸ ✅

- میانبرهای استاندارد در `infrastructure/ui/UITableKeyboardHandler.ts` + [`docs/keyboard.md`](keyboard.md) با تست پارامتری (PR-109).
- `Ctrl+C/X/V` کلیپ‌بورد سیستم؛ `Alt+C/X/V` alias منسوخ row-clone. `Home`/`End`/`Ctrl+Home`/`Ctrl+End`/`Ctrl+Shift+Arrow` زنده.
- `role="grid"` / `gridcell` / `aria-colindex` / `aria-rowindex` / `aria-activedescendant` هست (Phase 12).
- **تست a11y واقعی (PR-123):** `ui/desktop/__tests__/grid-a11y.spec.tsx` با `jsdom` + `axe-core`؛ صفر serious/critical روی sort/filter/group/pin/menu. گروه ⇒ `role=treegrid`.

### ۷) تم و سفارشی‌سازی — ۴٫۵/۷ ⚠️

- `GridTheme.withParams` + `toCssVars()` + `themeErpDark` + وراثت portal: طراحی تمیز.
- **اما:** CSS در **دو فایل تکرار شده** (`ui/styles/injectStyles.ts` و `ui/styles/erp-table.css`) و باید دستی sync بمانند — بدهی ساختاری.
- تزریق CSS اجباری و side-effect در سطح ماژول است:

```642:651:ui/styles/injectStyles.ts
export function injectERPTableStyles(): void {
  if (typeof document === 'undefined') return;
  ...
}
injectERPTableStyles();
```

- `docs/public-api.md:44` وجود `persian-data-grid/styles.css` را وعده می‌دهد. **این export وجود ندارد** (`package.json:38-44`).

### ۸) طراحی API و TypeScript DX — ۵/۱۱ ⚠️

این دسته از «فیچر ندارم» بدتر است، چون **مانع ورود** است.

- **هیچ جنریکی روی ردیف نیست.** ~~مصرف‌کننده `rowData: Invoice[]` ندارد؛ باید `RowInput` با `values: Record<string, unknown>` بسازد.~~ **رفع PR-88:** `DataGrid<TRow>` / `createGrid<TRow>`؛ `TRow` از `rowData` استنتاج می‌شود؛ `field` نادرست خطای تایپ است. مسیر ERP (`columns`/`rows`) هنوز کار می‌کند. `Row.data` در دامنه `unknown` مانده.
- **props اجباری زیاد:** ~~`store`، `tableKey`، `actor`، `columns`، `rows`~~ — **رفع جزئی PR-83:** این‌ها optional‌اند؛ بدون `store` IndexedDB باز نمی‌شود.
- **`createERPTable` async است** — ~~composition root با `await`.~~ **رفع شده در PR-84:** `createGrid()` sync است؛ hydrate با `await grid.ready`. `createERPTable` alias منسوخ.
- **سطح عمومی متورم:** حدود ۹۰+ سمبل در یک barrel تخت؛ `TableEngine`، `IndexedDbEventStore`، `runBenchmark`، `SparseRowIndex` همه در یک import.
- **بدهی تایپ:** ۶۶ مورد `any` و ۱۸ مورد `as any` در سورس قابل‌انتشار؛ حتی در تایپ‌های عمومی:

```16:21:dist/index.d.ts
interface RemoteApi {
    request<TResponse = any>(input: {
        endpoint: string;
        params?: Record<string, any>;
```

- **ناسازگاری نام:** ~~پکیج `persian-data-grid` است، کامپوننت `ERPTable`، توکن‌ها `--erp-*`.~~ **رفع جزئی PR-87:** `DataGrid` / `themeDefault` / `--pdg-*` / `.pdg-grid` زنده‌اند؛ نام‌های قدیمی alias منسوخ‌اند.
- **رخدادهای React ناقص:** ~~`onReady` و `onToast` هست؛ `onCellValueChanged` / `onSelectionChanged` نیست.~~ **رفع PR-85 + PR-86:** `onCellValueChanged` / `onRowValueChanged` / `onSelectionChanged` / `onCellFocused` / `onRowDataUpdated` / `onGridReady` زنده‌اند. `apiRef` / `GridApi` زنده‌اند. `onSortChanged` هنوز نیست (Phase 18).

> مربی: اگر فقط یک دسته را می‌توانستی درست کنی، همین است. مدل دادهٔ جنریک و مسیر zero-config، **پیش‌نیاز** دیده‌شدن همهٔ فیچرهای دیگرت است.

### ۹) بسته‌بندی و bundle — ۱٫۵/۸ ❌ بحرانی

اندازه‌گیری واقعی روی `dist` ساخته‌شده در ۱۱ سپتامبر ۲۰۲۶:

| فایل | حجم |
|------|-----|
| `dist/index.js` (ESM) | ۵۸۷٫۰ KB خام / **۱۷۱٫۱ KB gzip** |
| `dist/index.cjs` | ۵۹۴٫۱ KB |
| `dist/index.d.ts` | ۹۴٫۰ KB |

- **فونت Vazirmatn در bundle اصلی است.** `packages/plugins/pdf/src/vazirmatnBytes.ts` = ۹۴٫۸ KB سورس base64. هر کسی که `ERPTable` را import کند، فونت PDF را می‌گیرد **حتی اگر هرگز PDF نگیرد**.
- **Excel (fflate) و PDF هم در bundle اصلی هستند.** پلاگین‌ها `"private": true` هستند و به سورس TS اشاره می‌کنند (`packages/plugins/excel/package.json:1-10`) — پکیج مستقل npm نیستند.
- **`"sideEffects": true`** ⇒ bundler هیچ export استفاده‌نشده‌ای را حذف نمی‌کند. `treeshake: true` در `tsup.config.ts` بی‌اثر می‌شود.
- **فقط یک subpath** در exports map. نه `./headless`، نه `./plugins/excel`، نه `./styles.css`.
- `scripts/verify-dist.mjs:29-35` فقط حداقل ۵ KB را چک می‌کند. **سقف اندازه ندارد.**
- **هیچ CI نیست.** `.github/workflows` وجود ندارد.

مقایسه: `@tanstack/react-table` حدود ۱۵ KB gzip است و ag-grid ماژولار است. ۱۷۱ KB gzip برای گریدی که sort ندارد، غیرقابل‌دفاع است.

### ۱۰) مستندات و اعتماد — ۷/۷ ✅

- سایت VitePress (`website/`) با انگلیسی منبع و فارسی ترجمه زنده است (PR-129 / D23).
- گالری ۱۲ مثال + StackBlitz و `yarn examples:typecheck` (PR-130).
- `persian-data-grid-codemod` + جدول مهاجرت D13–D22 (PR-131).
- Playwright e2e در CI: edit/undo، clipboard، ۱۰۰k scroll، sort/filter، Excel، تم/RTL captures (PR-133).
- سیاست semver (D25) + changesets + کانال `next` (`0.13.0-next.0`) + provenance و GitHub Release از CHANGELOG (PR-134).
- `scripts/release-gate.mjs` معیار §۴ را enforce می‌کند؛ امروز **قرمز** (diff <۹۰، bundle>۶۰KB، D22) تا `1.0.0` (PR-135).
- `<GridHistoryPanel />` محصولی: تایم‌لاین، فیلتر severity/category، پرش به سلول، restore مقدار قبلی (PR-136).
- `<GridOfflineStatus />` نشانگر آنلاین/آفلاین + صف تغییرات معلق؛ بازیابی پس از remount از repo/EventStore (PR-137).
- `SyncPort` + `<GridSyncPanel />`: push/pull، تعارض سلول، سیاست‌های LWW / serverWins / manual (PR-138).
- Presence + `<GridPresencePanel />`: کرسر کاربران دیگر با BroadcastChannel / transport تعویض‌پذیر (PR-139).
- هنوز: monorepo (PR-132 / D22 باز)، PDF قالب سند (PR-141).

---

## ۴. جمع‌بندی مربی

### نقاط مثبت واقعی (اینها را حفظ کن، اینها سرمایه‌اند)

1. **معماری.** Domain / Application / Engine / Infrastructure / UI با مرزهای واقعی. `domain` و `application` هیچ import از React ندارند. هیچ‌کدام از رقبا این را ندارند.
2. **Event sourcing واقعی** با dual-write، `readAll`، projection، snapshot، و IndexedDB پایدار. این یک قابلیت audit سازمانی است که ag-grid Enterprise هم نمی‌فروشد.
3. **Undo/Redo دامنه‌ای** با `correlationId` برای batch کردن paste/cut و حفظ هویت ردیف در redo.
4. **رندرر PDF فارسی خودنوشت** (CIDFontType2 / Identity-H، shaping RTL، بدون jsPDF). این کار سختی است و کسی آن را مجانی نمی‌دهد.
5. **xlsx واقعی OOXML** (نه CSV با پسوند xlsx) با import و export.
6. **RBAC و RowState در دامنه**، `asyncValidator`، رجیستری سلول قابل‌گسترش.
7. **فرهنگ مهندسی:** `docs/public-api-honesty.md` و تست‌های grep که مستندات را با کد هم‌خوان نگه می‌دارند. این نادر و ارزشمند است.

### نقاط منفی به ترتیب کشندگی

| رتبه | مشکل | اثر |
|------|------|-----|
| ۱ | ~~مدل دادهٔ غیرجنریک + props اجباری سنگین~~ **رفع جزئی PR-83…PR-88** (جنریک + zero-config)؛ sort/filter هنوز نیست | شروع ۵ دقیقه‌ای ممکن است؛ پکیج هنوز در ۳۰ ثانیهٔ sort رد می‌شود |
| ۲ | نبود sort و filter | پکیج در ۳۰ ثانیهٔ اول رد می‌شود |
| ۳ | نبود کلیپ‌بورد Excel | ادعای «Excel-like» دروغ است |
| ۴ | ۱۷۱ KB gzip + فونت اجباری + `sideEffects: true` | در بررسی bundle رد می‌شود |
| ۵ | ~~نبود overlay loading / no-rows~~ **رفع PR-103** | — |
| ۶ | ناسازگاری نام `persian-data-grid` ↔ `ERPTable` / `--erp-*` | بی‌اعتمادی در نگاه اول |
| ۷ | ادعاهای نادرست در README و docs | بی‌اعتمادی در نگاه دوم |
| ۸ | نبود CI، CHANGELOG، semver | «این پروژه رها می‌شود؟» |
| ۹ | نبود مستندات انگلیسی و API reference | بازار جهانی صفر |
| ۱۰ | `any` و `as any` در تایپ‌های عمومی | برای تیم TypeScript-first ناقابل |

### قابل توسعه است؟

**بله، و این سند نظر خوش‌بینانه نیست — قضاوت ساختاری است.** دلیل: گران‌ترین بخش یک Data Grid معماری هسته، مدل رخداد، و undo است و تو آن‌ها را داری. چیزهایی که نداری (sort، filter، range، clipboard، column virtualization) **الگوریتم‌های شناخته‌شده روی هسته‌ای هستند که قبلاً ساخته‌ای**. یعنی از ۳۵ به ۷۵ رسیدن حدوداً ۳ تا ۴ ماه کار متمرکز است، نه بازنویسی.

### استراتژی پیشنهادی — «کف Tier 0، سقف Tier 2»

به ag-grid تبدیل نشو. pivot و chart نساز. به‌جایش:

> **«اولین Data Grid ری‌اکت با audit trail و offline-first که فارسی/جلالی را درست می‌فهمد.»**

سه شرط برای اینکه این جمله بخرد:
1. هر ضرورت **Tier 0** حداقل در سطح «کار می‌کند و مستند است» باشد. (فاز ۱۶–۲۱)
2. هر ادعای README یک تست در CI داشته باشد. (فاز ۱۶)
3. Tier 2 را به محصول قابل‌دیدن تبدیل کن، نه فقط API. پنل تاریخچه، حالت آفلاین، و PDF فارسی باید در دمو **دیده شوند**. (فاز ۲۵)

### معیار «آماده برای انتشار جدی»

انتشار `1.0.0` قبل از برآورده شدن این‌ها = آسیب به اعتبار:

- [ ] امتیاز کارت بالا ≥ ۷۰/۱۰۰
- [x] `Ctrl+C` / `Ctrl+V` با Excel round-trip در CI تست شود (PR-106/107)
- [ ] sort و filter روی هدر، با تست
- [ ] bundle اصلی ≤ ۶۰ KB gzip؛ Excel/PDF/فونت در subpath جدا
- [ ] `<DataGrid rowData={rows} columnDefs={cols} />` بدون هیچ prop دیگری کار کند
- [ ] تست ۱۰۰k ردیف واقعی (render + scroll + edit) در CI با بودجه
- [ ] CI سبز: test + typecheck + build + size-limit + axe
- [x] مستندات انگلیسی + API reference + مثال زنده روی VitePress (PR-129)
- [ ] هیچ ادعای README بدون تست متناظر
- [ ] صفر `any` در سطح عمومی

مسیر رسیدن: `EXECUTION_PLAN.md` از **Phase 16** به بعد.
