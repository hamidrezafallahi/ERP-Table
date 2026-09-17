# WORKLOG.md — گزارش کار v2

این فایل گزارش کار اجرایی پروژه است: چه چیزی **واقعاً** ساخته شده، با چه سطحی از اطمینان verify شده، و چه چیزی فقط ادعا بوده است.

بازچینی‌شده در ۱۴۰۵/۰۶/۲۰ (۱۱ سپتامبر ۲۰۲۶) پس از داوری سخت‌گیرانه در برابر `ag-grid-react`.

| مرجع | فایل |
|------|------|
| داوری، کارت امتیاز، ضروریات بازار | [`docs/ag-grid-gap-analysis.md`](./docs/ag-grid-gap-analysis.md) |
| فازها و چک‌باکس PR | [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) |
| ورود ایجنت | [`docs/agent-handoff.md`](./docs/agent-handoff.md) |
| گزارش کار PR-1 … PR-71 (آرشیو کامل) | [`docs/worklog-archive-v0.5.md`](./docs/worklog-archive-v0.5.md) |
| طرح اجرایی Phase 1–15 (آرشیو) | [`docs/execution-plan-archive-v0.5.md`](./docs/execution-plan-archive-v0.5.md) |

### قاعدهٔ ثبت در این فایل

یک قابلیت فقط وقتی «انجام‌شده» ثبت می‌شود که:

1. کد runtime داشته باشد (نه export بدون مصرف‌کننده)،
2. مصرف‌کنندهٔ عمومی بتواند بدون خواندن سورس آن را روشن کند،
3. یک تست در CI آن را نگه دارد.

هر چیز دیگری در بخش **بدهی و شکاف** می‌رود، نه در **انجام‌شده**.

---

## Current Snapshot

- **نسخهٔ منتشرشده روی npm:** `persian-data-grid@0.5.0` (۱۰ سپتامبر ۲۰۲۶) — track محلی `0.13.0-next.0` (PR-134؛ کانال `next` با تگ `v0.13.0-next.0`)
- **طرح فعال:** `EXECUTION_PLAN.md` v2 — **Phase 16–25 ✅ تمام** (طرح اجرایی فیچر بسته)
- **PR بعدی برای ایجنت:** هیچ PR تیک‌نخورده‌ای در مسیر v2 نیست. `PR-132` ⏸ تعویق D22. کار بعدی فقط تگ `1.0.0` (اگر gate سبز) یا فاز/RFC جدید.
- **آخرین PR تمام‌شده:** `PR-141` — قالب PDF سند؛ بعد: قفل **D22 تعویق**
- **گِیت اجباری:** `PR-72` … `PR-75` ✅
- **Phase 16:** ✅ PR-72 … PR-80 (نسخهٔ npm هنوز `0.5.0` تا انتشار 0.6.0)
- **Phase 17:** ✅ PR-81 … PR-88
- **Phase 18:** ✅ PR-89 … PR-96
- **Phase 19:** ✅ PR-97 … PR-103
- **Phase 20:** ✅ PR-104 … PR-109
- **Phase 21:** ✅ PR-110 … PR-116
- **Phase 22:** ✅ PR-117 … PR-122 — **RFC-002 Accepted**
- **Phase 23:** ✅ PR-123 … PR-128
- **Phase 24:** ✅ PR-129…131 + PR-133…135 — PR-132 ⏸ تعویق D22
- **Phase 25:** ✅ PR-136…141
- **بلوکر:** ندارد. `D22` قفلِ تعویق. `release-gate` باید سبز باشد (سقف ۶۵KB؛ بدون اجبار monorepo).


### تصمیم‌های قفل‌شدهٔ ۱۴۰۵/۰۶/۲۰ (خلاصه — جزئیات در `EXECUTION_PLAN.md`)

| کد | تصمیم |
|----|--------|
| D13 | `ERPTable` → `DataGrid`؛ نام‌های قدیمی یک نسخه alias منسوخ |
| D14 | `rowData: T[]` + `columnDefs: ColumnDef<T>[]` اضافه؛ `columns`/`rows` منسوخ ولی کارکن |
| D15 | Excel/PDF/فونت/adapter به subpath؛ `.` ≤ ۶۵ KB gzip |
| D16 | CSS با import صریح؛ تزریق خودکار حذف؛ `sideEffects: ["**/*.css"]` |
| D17 | مجازی‌سازی ردیف پیش‌فرض **روشن** |
| D18 | `Ctrl+C/X/V` استاندارد؛ `Alt+*` alias منسوخ؛ `Home`/`End` اضافه |
| D19 | pin هر ستون (`start`/`end` با آگاهی RTL) — جانشین D10 |
| D20 | `aggFunc` + grouping تک‌سطحی **باز** با گِیت RFC-002؛ pivot/chart/tree چندسطحی بسته |
| D21 | `DateAdapter` تعویض‌پذیر؛ جلالی پیش‌فرض، Gregorian ارائه شود |
| D22 | **قفل تعویق** — monorepo تا پس از `1.0.0`؛ تک‌پکیج React می‌ماند |
| D23 | مستندات انگلیسی منبع، فارسی ترجمه |
| D24 | `createGrid()` sync + `grid.ready`؛ `createERPTable()` alias منسوخ |
| D25 | `0.6 … 0.13` با CHANGELOG و MIGRATION؛ `1.0.0` فقط با `release-gate` سبز |
- **طرح قدیم:** Phase 1 … Phase 15 (PR-1 … PR-71) بسته و آرشیو شده — فقط bugfix

### امتیاز فعلی

| محور | امتیاز | مرجع |
|------|--------|------|
| Data Grid عمومی (در برابر ag-grid = ۹۶) | **۷۵٫۵ / ۱۰۰** | `docs/ag-grid-gap-analysis.md` §۲ |
| تمایز سازمانی/فارسی (در برابر ag-grid = ۱۶) | **۹۲ / ۱۰۰** | همان §۲ |

هدف `1.0.0`: محور اول ≥ ۷۰، محور دوم ≥ ۹۰.

---

## بخش ۱ — سرمایهٔ واقعی (verify‌شده، قابل اتکا)

این‌ها نتیجهٔ PR-1 … PR-71 هستند و **پایهٔ همهٔ فازهای بعدی**. بازنویسی نمی‌شوند.

### ۱.۱ معماری لایه‌ای با مرزهای واقعی

| لایه | فایل‌ها | خط (تقریبی) | وابستگی React |
|------|---------|-------------|----------------|
| `domain/` | ۱۳ | ۱,۴۱۶ | ❌ هیچ |
| `application/` | ۱۹ | ۳,۲۵۳ | ❌ هیچ |
| `engine/` | ۱۳ | ۲,۴۵۳ | ⚠️ فقط `import type` + وابستگی `UIRow` به `ui/type` |
| `infrastructure/` | ۲۰ | ۲,۶۳۲ | ❌ هیچ |
| `ui/` | ۸۱ | ۸,۳۵۸ | ✅ React |
| `packages/plugins/` | ۱۸ | ۳,۲۱۲ | ❌ هیچ |
| **جمع** | **۱۷۰** | **~۲۲,۳۱۳** | |

- `ApplicationTableCommand` از `EngineTableCommand` جدا است (PR-3).
- `ColumnSchema` دامنه‌ای است و React را نشت نمی‌دهد (PR-2).
- **محدودیت شناخته‌شده:** `engine/type.ts:9` به `ui/type` وابسته است و مانع headless واقعی است → `PR-132`.

### ۱.۲ Event sourcing کامل

- `EventStore` port + `InMemoryEventStore` با OCC و version stamping + `IndexedDbEventStore` روی `KvDatabase` (PR-4، PR-14، PR-21).
- dual-write در سطح `TableAppService` برای همهٔ Application commandها (PR-5).
- `ChangelogProjection` با hydrate از `readAll` و dedupe بر `eventId` (PR-6، PR-14).
- `SnapshotStore` + `SnapshotStrategy` (هر N رخداد، پیش‌فرض ۲۰۰) — **opt-in** با `config.snapshotStore` (PR-22، PR-50).
- `EVENT_CATALOG` مستند و تست‌شده (PR-24).
- **این چیزی است که ag-grid ندارد.** حفظ و محصولی‌سازی در `PR-136` … `PR-138`.

### ۱.۳ Undo/Redo دامنه‌ای

- `CellUndoStack` روی `previousValue` واقعی رخداد (PR-13، PR-15).
- پوشش: `CELL_CHANGED`، `ROW_ADDED`، `ROW_DELETED` (soft/hard).
- batch با `correlationId` ⇒ paste/cut چند ردیفی = **یک واحد undo** (PR-15b، PR-33، PR-34).
- Redo افزودن ردیف هویت `rowId` و مقادیر را با `RESTORE_ADDED_ROW` حفظ می‌کند (PR-30).
- **محدودیت:** عمق stack نامحدود است (`application/undo/CellUndoStack.ts:199-204`) — بدهی حافظه در نشست طولانی.

### ۱.۴ ویرایش سلول و validation

- ۱۱ نوع فیلد: `index`, `text`, `textArea`, `number`, `price`, `select`, `selectOption`, `date`, `static`, `description`, `checkbox` (`domain/types/ColumnSchema.ts:15-26`).
- `selectOption` ریموت با اسکرول بی‌نهایت گزینه‌ها (`ui/cellRenderer/ERPTableDynamicSelect.tsx`).
- رجیستری کامپوننت سلول عمومی: `components` prop + `columnDefs[].render` (PR-54 … PR-57).
- `asyncValidator` واقعاً await می‌شود و خطا در همان `CellError` map می‌نشیند (PR-47، `engine/tableEngine.ts:696-718`).
- RBAC سطح ردیف و `permissionPolicy` در دامنه.

### ۱.۵ تم

- `GridTheme.withParams` + `toCssVars()` + `themeErp` / `themeErpDark` (PR-41 … PR-44).
- توکن معنایی روی `.erp-table`؛ وراثت متغیرها در portal (PR-43).
- `rowHeight` از `theme.params` (پیش‌فرض ۴۰، D12) (PR-45).
- **CSS:** منبع حقیقت `ui/styles/erp-table.css`؛ `injectStyles.ts` تولیدشده (PR-77). مصرف‌کننده `import 'persian-data-grid/styles.css'` یا `injectGridStyles()`.

### ۱.۶ صادرات و واردات

- **xlsx واقعی OOXML** (نه CSV با پسوند xlsx): `packages/plugins/excel/src/buildXlsxBlob.ts` با ZIP خودی روی `fflate`. export + import + دکمهٔ تولبار (PR-29، PR-68).
- **PDF فارسی با رندرر خودنوشت:** CIDFontType2 / Identity-H، shaping RTL، فونت Vazirmatn (OFL) embedded، **بدون jsPDF** (PR-65، PR-66). دکمهٔ تولبار (PR-67).
- `PluginHost` + `GridPlugin` روی `EXPORT_REQUESTED` در stream view؛ پلاگین دامنه را mutate نمی‌کند (PR-29).

### ۱.۷ دسترس‌پذیری پایه

- `role="grid"` / `row` / `gridcell` / `columnheader`، `aria-colindex` / `aria-rowindex` یک‌پایه (در مجازی: ایندکس مطلق)، `aria-selected`، `aria-activedescendant` (PR-62، PR-63).
- `aria-label` روی دکمه‌های آیکونی تولبار از `messages`؛ `:focus-visible` با `--erp-accent` (PR-64).
- **محدودیت:** فوکوس تک‌tab-stop کامل و live region هنوز نیستند → `PR-124` / `PR-125`.

### ۱.۸ مسیر انتشار

- `tsup` واقعی، ESM + CJS + sourcemap، DTS خودکار strict از `publish/entry.ts` (PR-28، PR-35، PR-36).
- `typecheck:publish` (graph انتشار) + `typecheck:host-ui` + `verify:dist` در `prepublishOnly` (PR-36، PR-38).
- `"sideEffects": ["**/*.css"]` — JS بدون عارضهٔ جانبی؛ CSS با import صریح نگه داشته می‌شود (PR-77 / D16).
- `NoopRemoteApi` پیش‌فرض ⇒ نصب پکیج به ERP وصل نمی‌شود (D1، PR-51).
- `multiSelectConfig` اختیاری (D11، PR-53).

### ۱.۹ فرهنگ مهندسی

- `docs/public-api-honesty.md` + `docs/__tests__/public-api-honesty.spec.ts`: تست‌های grep که مستندات را با کد هم‌خوان نگه می‌دارند (PR-46). این الگو در `PR-75` گسترش می‌یابد تا **هر** ادعای README را بپوشاند.

---

## بخش ۲ — بدهی و شکاف (وضعیت صادقانه)

مرجع کامل با شاهد کد: `docs/ag-grid-gap-analysis.md` §۳.

### ۲.۱ فیچرهای Tier 0 که **وجود ندارند**

| شکاف | شاهد | PR رفع |
|------|------|--------|
| مرتب‌سازی / فیلتر | sort + quick + column filter UI زنده؛ فیلتر سفارشی رجیستری نیست | PR-95 … |
| فیلتر ستون / quick filter حذف‌کننده | هیچ filter model در ریپو نیست؛ `GridSearchPanel` فقط find & navigate | PR-92 … PR-95 |
| کلیپ‌بورد سیستم و paste از Excel | `application/handlers/rowCommandsHandler.ts:123-140` فقط `table.addRow` | PR-106، PR-107 |
| انتخاب بازهٔ سلولی، fill handle | مدل انتخاب فقط ردیف است | PR-104، PR-105، PR-108 |
| مجازی‌سازی ستون | همهٔ ستون‌های visible در هر ردیف رندر می‌شوند | PR-98 |
| مدل ردیف server-side / infinite | همهٔ ردیف‌ها در حافظه | PR-96، PR-102 |
| مدل دادهٔ جنریک `rowData: T[]` | `rowData`/`columnDefs` هست؛ `store`/`actor`/`tableKey` اختیاری (PR-83). `DataGrid<TRow>` نام و ژنریک کامل = PR-87/88 | PR-84 … PR-88 |
| props رخداد React و `apiRef` | رخدادها PR-85؛ `GridApi` / `apiRef` PR-86 | — |
| هدر چندسطحی | ✅ PR-113 | — |
| منوی ستون | ✅ PR-114 | — |
| `columnState` persist | ✅ PR-115 | — |
| auto-size / flex | ✅ PR-112 | — |
| pin دلخواه | ✅ PR-110 | — |
| `Home` / `End` / `Ctrl+C` استاندارد | ✅ PR-109 — `docs/keyboard.md` | — |
| لغو ویرایش با `Esc` | ✅ session draft + cancel | PR-126 ✅ |
| aggregation عمومی | فوتر فقط `sum` هاردکد (`ui/desktop/ERPTableFooter.tsx:32-42`) | PR-118، PR-119 |
| CSV | ندارد | PR-122 |

### ۲.۲ تناقض کد ↔ مستندات (ثبت‌شده، باید رفع شود)

1. **مجازی‌سازی پیش‌فرض:** کد پیش‌فرض خاموش است؛ کامنت و README در PR-74/75 هم‌خوان شدند. تغییر رفتار → `PR-97` (D17).
2. **`styles.css`:** export + حذف auto-inject (PR-77). بدون import CSS یا `injectGridStyles()` گرید بدون استایل است.
3. **`files` / docs در npm:** ادعای غلط در PR-75 تصحیح شد (`files: ["dist"]`).
4. **README Features:** در PR-75 بازنویسی صادقانه + تست CI برای هر گلوله.
5. **`handleSelectAllRows`:** در PR-74 تأیید شد که به دکمهٔ تولبار وصل است.

### ۲.۳ بدهی بسته‌بندی (اندازه‌گیری واقعی، ۱۲ سپتامبر ۲۰۲۶)

| مورد | مقدار | هدف |
|------|-------|------|
| `dist/index.js` | **۲۱۳٫۴ KB خام / ۴۶٫۶ KB gzip** (PR-77) | ≤ ۶۵ KB gzip ✅ |
| `dist/index.cjs` | ۲۲۴٫۰ KB / ۴۷٫۳ KB gzip | — |
| `dist/index.d.ts` | ۱۳٫۸ KB | — |
| `dist/styles.css` | ۱۹٫۷ KB خام / ۴٫۰۶ KB gzip | منبع = `erp-table.css` ✅ |
| فونت Vazirmatn | فقط `./plugins/pdf/fonts/vazirmatn` (~۷۰ KB gzip) | جدا ✅ |
| subpath exports | `.` + headless + excel + pdf + vazirmatn + arian-erp + styles.css | ۷ subpath ✅ |
| `sideEffects` | `["**/*.css"]` | PR-77 ✅ |
| سقف اندازه در CI | **دارد** — `size-limit` سقف `.` = ۶۵ KB gzip | PR-73/76 ✅ |
| پلاگین‌ها | `"private": true`، اشاره به سورس TS | پکیج واقعی (PR-132) |

### ۲.۴ بدهی تایپ و کوپلینگ

| مورد | مقدار | PR |
|------|-------|-----|
| `any` در سورس قابل‌انتشار | **صفر** در publish graph (ESLint error) | PR-79 ✅ |
| `as any` در سورس قابل‌انتشار | **صفر** در publish graph | PR-79 ✅ |
| `any` نشت‌کرده به `dist/**/*.d.ts` | **صفر** (`verify:dist`) | PR-79 ✅ |
| `@ts-nocheck` در `ui/**` | **صفر** (host-glue به `examples/host-arian-erp/`) | PR-74 ✅ |
| `arianERP` در سطح عمومی | **صفر** در `.` — فقط `./adapters/arian-erp` | PR-80 ✅ |
| `ColumnDef<TRow>` / `rowData` | **دارد** — `columnDefs`+`rowData`+`getRowId`؛ `columns`/`rows` منسوخ ولی کارکن | PR-81 ✅ / PR-82 ✅ |
| نام‌های `ERP*` در سطح عمومی | ۱۳ شناسه + توکن `--erp-*` + کلاس `.erp-table` | PR-87 (D13) |
| وابستگی `engine` → `ui/type` | `engine/type.ts:9` | PR-132 |

### ۲.۵ بدهی زیرساخت و اعتماد

| مورد | وضعیت | PR |
|------|-------|-----|
| CI (GitHub Actions) | **دارد** (PR-72) — ماتریس Node 18/20/22 | PR-72 ✅ |
| بودجهٔ اندازه | **دارد** (۱۷۵ KB gzip روی `.`) | PR-73 ✅ |
| تست e2e | Playwright harness + CI job (`yarn e2e`) | ✅ PR-133 |
| رگرسیون بصری | ندارد | PR-133 |
| تست a11y واقعی (axe) | **live** (PR-123) | — |
| بودجهٔ perf گرید | ندارد (فقط append رخداد) | PR-100 |
| `CHANGELOG.md` / `CONTRIBUTING.md` / `SECURITY.md` | **دارد** (PR-78) | PR-78 ✅ |
| `MIGRATION.md` | جدول master D13–D22 + `npx persian-data-grid-codemod` | ✅ PR-131 |
| `OFL.txt` در `files` پکیج npm | **دارد** — `LICENSE` + `OFL.txt` | PR-78 ✅ |
| API reference تولیدشده | VitePress `website/public/api` از TypeDoc روی `publish/entry.ts` | ✅ PR-129 |
| مستندات انگلیسی‌محور | سایت en منبع + fa ترجمه؛ honesty دوزبانه (D23) | ✅ PR-129 |

---

## بخش ۳ — Verification Log

### آخرین وضعیت verify‌شده (PR-83، ۱۵ سپتامبر ۲۰۲۶)

| دستور | نتیجه |
|-------|-------|
| `yarn test` | ۶۲ فایل / ۲۹۵ تست — پاس |
| `yarn typecheck:publish` | پاس |
| `yarn typecheck:host-ui` | پاس |
| `yarn lint:publish` | پاس |
| `yarn build` + `yarn verify:dist` | index gzip ۴۷٫۲ KB / ۶۵ |
| `yarn size` | `.` ۴۸٫۳۶ KB / ۶۵ KB (از ۴۸٫۱۹؛ defaults + in-memory path) |
| مرورگر | SSR `renderToStaticMarkup(<ERPTable />)` بدون IndexedDB؛ دمو هنوز `store` می‌دهد |

### آنچه این ۲۹۵ تست **نمی‌سنجد**

sort، filter، کلیپ‌بورد سیستم، ویرایش تمام‌ردیف دسکتاپ، صحت aggregation فوتر، جدول کامل میانبرهای کیبورد، ۱۰۰k ردیف دامنهٔ واقعی (فقط ریاضیات projection تست شده)، toggle ستون در runtime، a11y واقعی، اندازهٔ bundle، هیچ e2e.

---

## بخش ۴ — تاریخچهٔ فشرده (PR-1 … PR-71)

جزئیات کامل هر PR در [`docs/worklog-archive-v0.5.md`](./docs/worklog-archive-v0.5.md).

| فاز | PR | موضوع | نتیجه |
|-----|----|--------|-------|
| ۱ | PR-1 … PR-4 | پاک‌سازی دامنه، تفکیک command، dual-write اولیه | ✅ |
| ۲ | PR-5 … PR-15b | changelog projection، history، `previousValue`، undo پایه | ✅ |
| ۳ | PR-16 … PR-20 | selector subscription، `GridSession`، `ColumnDefinition`، harness ERP | ✅ |
| ۴ | PR-21 … PR-25 | IndexedDB، snapshot، بودجهٔ رخداد، event catalog، بسته‌بندی | ✅ |
| ۵ | PR-26 … PR-38 | viewport/virtualization، پلاگین Excel/PDF، paste/cut undo، DTS strict، مرز typecheck | ✅ |
| ۶–۷ | PR-39 … PR-45 | توکن معنایی، `GridTheme`، تم تیره، density | ✅ |
| ۸ | PR-46 … PR-50 | honesty audit، `asyncValidator`، `SparseRowIndex` در مسیر گرم، snapshot opt-in | ✅ |
| ۹ | PR-51 … PR-53 | جداسازی arianERP، `NoopRemoteApi` پیش‌فرض، `multiSelectConfig` اختیاری | ✅ |
| ۱۰ | PR-54 … PR-57 | رجیستری سلول، `components` map، `textArea`، مستندات توسعه‌پذیری | ✅ |
| ۱۱ | PR-58 … PR-61 | resize ستون، pin ستون index، `COLUMN_REORDERED`، drag هدر | ✅ |
| ۱۲ | PR-62 … PR-64 | `role="grid"`، سلول فعال، `aria-label` تولبار | ✅ |
| ۱۳ | PR-65 … PR-67 | Vazirmatn، پیش‌فرض PDF فارسی، دکمهٔ تولبار | ✅ |
| ۱۴ | PR-68 … PR-70 | import اکسل تولبار، فوتر/جستجو با توکن، حذف `@ts-nocheck` سلول | ✅ |
| ۱۵ | PR-71 | `mark` جستجو در `textArea` و شرح ردیف | ✅ |

**درس‌های ثبت‌شده از این ۷۱ PR:**

1. طرح قبلی روی **تمیزی معماری** بهینه شده بود، نه روی **ضروریات بازار**. نتیجه: event sourcing درجه‌یک و صفر sort. طرح v2 این را برعکس می‌کند.
2. تست grep روی مستندات ایدهٔ خوبی بود ولی کافی نبود — چون فقط چیزهایی را می‌گرفت که **در سند نوشته شده بودند**، نه چیزهایی که در README ادعا شده بودند.
3. «default-on» در گزارش کار ثبت شد ولی کد آن را نکرد (PR-37). **بدون CI، گزارش کار قابل اعتماد نیست.** به همین دلیل `PR-72` اولین PR طرح جدید است.

---

## الگوی ثبت PR جدید

هر PR از `PR-72` به بعد با این قالب ثبت شود:

```markdown
### PR-N — <عنوان کوتاه> (تاریخ)

- **فایل‌ها:** ...
- **هدف:** ...
- **انجام شد:** ...
- **محدودیت آگاهانه / نشد:** ...
- **اثر روی کارت امتیاز:** دستهٔ X از a به b
- **Verify:** <دستور> → <نتیجهٔ عددی>
- **بعدی:** PR-N+1
```

---

## Completed Work (طرح v2)

### PR-72 — CI pipeline (۱۴۰۵/۰۶/۲۰ — ۱۱ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `README.md` (badge)
- **هدف:** گِیت اعتماد قبل از هر فیچر — تست/typecheck/build روی هر push و PR؛ publish با provenance روی tag
- **انجام شد:**
  - workflow `CI` با ماتریس Node `18` / `20` / `22`، کش yarn، مراحل: install → test → typecheck:publish → typecheck:host-ui → build → verify:dist
  - workflow `Release` روی tag `v*` با `yarn prepublishOnly` سپس `npm publish --provenance --access public` (نیاز به `secrets.NPM_TOKEN`)
  - badge CI در بالای README
- **محدودیت آگاهانه / نشد:**
  - ریپو `yarn.lock` دارد و `package-lock.json` ندارد؛ به‌جای `npm ci` از `yarn install --frozen-lockfile` استفاده شد (معادل reproducible install). کش Actions هم `yarn` است نه `npm`.
  - لینک run سبز GitHub Actions فقط بعد از push/PR روی remote ثبت می‌شود — تا قبل از push، verify لوکال معادل مراحل CI است.
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ (اعتماد) ۲ → ۳ (CI هست؛ هنوز e2e/axe/size-limit کامل نیست → PR-73 و بعد)
- **Verify (لوکال، معادل job CI):**
  - `yarn test` → ۵۲ فایل / ۲۲۸ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn build` → پاس (ESM 583.22 KB / CJS 590.25 KB / DTS 93.79 KB)
  - `yarn verify:dist` → `dist verification ok`
- **بعدی:** `PR-73` — بودجهٔ اندازه (size-limit)

### PR-73 — بودجهٔ اندازه / size budget (۱۴۰۵/۰۶/۲۰ — ۱۱ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `.size-limit.js`, `scripts/sizeBudget.mjs`, `scripts/verify-dist.mjs`, `docs/__tests__/size-budget.spec.ts`, `package.json`, `.github/workflows/ci.yml`, `yarn.lock`
- **هدف:** رگرسیون اندازهٔ bundle را قبل از فیچرهای جدید قفل کن؛ سقف امروز ۱۷۵ KB gzip (اندازه‌گیری پایه ≈ ۱۷۰ KB)
- **انجام شد:**
  - `size-limit` + `@size-limit/file` با `gzip: true`؛ سقف `.` = ۱۷۵ KB
  - ورودی‌های جدا برای subpathهای آیندهٔ PR-76 (فقط وقتی فایل `dist` موجود باشد فعال می‌شوند)
  - `verify-dist.mjs`: حداقل ۵ KB + حداکثر خام ۸۰۰ KB + حداکثر gzip ۱۷۵ KB
  - اسکریپت `yarn size`؛ گام CI و `prepublishOnly`
  - تست: payload سنگین مصنوعی ⇒ `checkGzipUnderLimit` قرمز (مسیر شکست CI)
- **محدودیت آگاهانه / نشد:** سقف هنوز ۱۷۵ KB است نه ۶۵ KB — شکستن bundle کار `PR-76` است. مسیرهای future در `.size-limit.js` تا build شدن subpath فقط در سورس اعلام شده‌اند.
- **اثر روی کارت امتیاز:** دستهٔ ۹ (بسته‌بندی) ۱٫۵ → ۲٫۵؛ دستهٔ ۱۰ (اعتماد) ۳ → ۳٫۵
- **Verify:**
  - `yarn size` → Size 173.86 kB gzipped / limit 175 kB — پاس
  - `yarn verify:dist` → `index.js` raw 587.0 KB, gzip 169.8 KB؛ `index.cjs` gzip 170.2 KB — پاس
  - `yarn test` → ۵۳ فایل / ۲۳۴ تست — پاس
- **بعدی:** `PR-74` — حذف کد مرده و رفع تناقض کد/کامنت

### PR-74 — حذف کد مرده و رفع تناقض کد/کامنت (۱۴۰۵/۰۶/۲۰ — ۱۱ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `ui/desktop/DesktopTable.tsx`, `ui/desktop/groupActionButtons.tsx`, `types/host-shims.d.ts`, `tsconfig.json`, `tsconfig.publish.json`, `examples/host-arian-erp/*`, `docs/__tests__/pr74-cleanup.spec.ts`, `docs/public-api-honesty.md`, `docs/components.md`
- **هدف:** سه بدهی مستند gap analysis را ببند؛ صفر `@ts-nocheck` در `ui/**`
- **انجام شد:**
  1. کامنت `virtualization` با رفتار واقعی (`virtualization === true && !!session`، پیش‌فرض خاموش) هم‌خوان شد
  2. `handleSelectAllRows` از قبل به دکمهٔ تولبار وصل بود — تأیید + کامنت؛ حذف نشد
  3. `useERPGrid` و `useVoucherDescription` به `examples/host-arian-erp/` منتقل شدند؛ از `ui/` خارج شدند
  4. `host-shims.d.ts` به یک stub برای `@services/customBaseQuery` کوچک شد
  5. تست `pr74-cleanup.spec.ts` برای جلوگیری از برگشت
- **محدودیت آگاهانه / نشد:** رفتار مجازی‌سازی هنوز خاموش است (D17/PR-97). نام رویداد UI `TOGGLE_ROW_SELECTED` همچنان گمراه‌کننده است ولی به `TOGGLE_SELECT_ALL_ROWS` می‌رود — rename خارج از دامنهٔ این PR
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ (اعتماد) ۳٫۵ → ۴ (کد مرده/تناقض کامنت بسته؛ صداقت docs هنوز PR-75)
- **Verify:**
  - `yarn typecheck:host-ui` → پاس
  - `yarn typecheck:publish` → پاس
  - `yarn test` → ۵۴ فایل / ۲۳۸ تست — پاس
  - grep `@ts-nocheck` در `ui/**` → صفر
- **بعدی:** `PR-75` — پاک‌سازی صداقت مستندات

### PR-75 — پاک‌سازی صداقت مستندات (۱۴۰۵/۰۶/۲۰ — ۱۱ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `README.md`, `docs/public-api.md`, `docs/__tests__/public-api-honesty.spec.ts`, `package.json` (description)
- **هدف:** هر ادعای بی‌پشتوانه در README/public-api را حذف یا تصحیح کن؛ برای هر گلولهٔ Features یک assertion در CI
- **انجام شد:**
  - حذف وعدهٔ `persian-data-grid/styles.css` و ادعای `files` شامل `docs/`
  - بازنویسی Features: «Cell keyboard navigation» به‌جای Excel-like؛ VirtualList به‌عنوان opt-in با pagination پیش‌فرض
  - هم‌خوانی بخش فارسی README و `package.json` description
  - تست‌های PR-75: منفی برای ادعاهای غلط + مثبت برای هر ۷ گلولهٔ Features در برابر کد
- **محدودیت آگاهانه / نشد:** `styles.css` هنوز ساخته نشده (PR-77). کلیپ‌بورد Excel هنوز نیست (Phase 20). مجازی‌سازی هنوز پیش‌فرض خاموش است (PR-97).
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ (اعتماد) ۴ → ۴٫۵؛ گِیت `PR-72`…`PR-75` بسته شد
- **Verify:** `yarn test` → ۵۴ فایل / ۲۴۲ تست — پاس
- **بعدی:** `PR-76` — شکستن bundle / subpath exports (D15)

### PR-76 — شکستن bundle / subpath exports (D15) (۱۴۰۵/۰۶/۲۰ — ۱۱ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `tsup.config.ts`, `publish/{entry,headless,plugins/*,adapters/*}.ts`, `package.json` (exports/typesVersions), `MIGRATION.md`, `scripts/verify-dist.mjs`, `.size-limit.js`, `packages/plugins/pdf/src/{PdfExportPlugin,VazirmatnPdfRenderer}.ts`, `docs/__tests__/subpath-exports.spec.ts`, demo aliases, honesty docs
- **هدف:** D15 — Excel/PDF/فونت/adapter به subpath؛ `.` ≤ ۶۵ KB gzip؛ alias منسوخ روی root
- **انجام شد:**
  - ورودی‌های tsup: `index`, `headless`, `plugins/excel`, `plugins/pdf`, `plugins/pdf/fonts/vazirmatn`, `adapters/arian-erp` + کپی `styles.css`
  - `splitting: true`؛ `fflate` و `react-persian-range-picker` external
  - فونت از پیش‌فرض `PdfExportPlugin` جدا شد → `createVazirmatnPdfExportPlugin` روی font subpath
  - `VazirmatnPdfRenderer(fontBytes)` اجباری؛ root re-export با `@deprecated`
  - `createGrid` alias موقت روی `./headless` (= `createERPTable`)
  - `MIGRATION.md` فصل 0.6.0؛ تست قرارداد `import()` هر subpath
- **محدودیت آگاهانه / نشد:** هزینهٔ کامل دانلود UI+chunk هنوز ≈ ۹۰ KB gzip است؛ متریک PR فایل `dist/index.js` است (۴۶٫۳ KB). auto-inject CSS هنوز هست (PR-77). `createGrid` sync واقعی = D24.
- **اثر روی کارت امتیاز:** دستهٔ ۹ (بسته‌بندی) ۲٫۵ → ۵
- **Verify:**
  - `yarn size` → `.` ۴۷٫۴۴ KB / ۶۵ KB؛ font ۷۰٫۳۱ KB؛ styles ۴٫۱۶ KB — پاس
  - `yarn verify:dist` → index gzip ۴۶٫۳ KB — پاس
  - `yarn test` → ۵۵ فایل / ۲۴۷ تست — پاس
  - `yarn typecheck:publish` → پاس
- **بعدی:** `PR-77` — CSS صریح و `sideEffects` (D16)

### PR-77 — CSS صریح و `sideEffects` (D16) (۱۴۰۵/۰۶/۲۱ — ۱۲ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `ui/styles/erp-table.css`, `ui/styles/injectStyles.ts` (generated), `scripts/generate-inject-styles.mjs`, `ui/index.tsx`, `publish/entry.ts`, `package.json`, `scripts/verify-dist.mjs`, `demo/src/main.tsx`, `demo/vite.config.ts`, `MIGRATION.md`, README/`docs/public-api.md`/`docs/getting-started.md`/`docs/agent-handoff.md`, `ui/styles/__tests__/inject-styles.spec.ts`
- **هدف:** D16 — `import 'persian-data-grid/styles.css'` مسیر توصیه‌شده؛ `injectGridStyles()` برای هاست بدون bundler CSS؛ حذف تزریق خودکار؛ `"sideEffects": ["**/*.css"]`؛ یک منبع حقیقت برای CSS
- **انجام شد:**
  - `erp-table.css` منبع است؛ `yarn generate:inject-styles` فایل `injectStyles.ts` را می‌سازد (قبل از `yarn build`)
  - حذف `injectERPTableStyles()` از سطح ماژول و از رندر `ERPTable`
  - `injectGridStyles()` + alias منسوخ `injectERPTableStyles` از `.` export می‌شوند
  - دمو CSS را صریح import می‌کند؛ بدون import / بدون `injectGridStyles()` گرید **unstyled** است (مستند + تست)
  - `sideEffects` از `true` به `["**/*.css"]`
- **محدودیت آگاهانه / نشد:** اندازهٔ `dist/index.js` تقریباً ثابت ماند (۴۷٫۴۴ → ۴۷٫۷۳ KB در `size-limit`) چون `injectGridStyles` هنوز CSS را در entry جاسازی می‌کند. tree-shake واقعی در bundler مصرف‌کننده است، نه در فایل size-limit. codemod alias در `PR-131`.
- **اثر روی کارت امتیاز:** دستهٔ ۹ (بسته‌بندی) ۵ → ۶
- **Verify:**
  - `yarn test` → ۵۶ فایل / ۲۵۷ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn verify:dist` → `index.js` raw ۲۱۳٫۴ KB، gzip ۴۶٫۶ KB / ۶۵ KB؛ `index.cjs` gzip ۴۷٫۳ KB؛ `dist/styles.css` = `erp-table.css` — پاس
  - `yarn size` → `.` ۴۷٫۷۳ KB / ۶۵ KB؛ font ۷۰٫۳۱ KB؛ styles ۴٫۱۶ KB — پاس
- **بعدی:** `PR-78` — انطباق لایسنس و فراداده پکیج

### PR-78 — انطباق لایسنس و فراداده پکیج (۱۴۰۵/۰۶/۲۲ — ۱۳ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `package.json` (`files`, `keywords`), `OFL.txt` (root copy), `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/{bug,feature,config}.yml`, `scripts/prepend-pdf-ofl-banner.mjs`, `scripts/verify-dist.mjs`, `publish/plugins/pdf.ts`, `publish/plugins/pdf-fonts-vazirmatn.ts`, `docs/__tests__/package-metadata.spec.ts`, README / `docs/public-api.md`
- **هدف:** انطباق لایسنس فونت و اعتماد پکیج npm — `LICENSE` + Vazirmatn `OFL.txt` در tarball؛ اسناد جامعه؛ keywords بازار
- **انجام شد:**
  - `files`: `["dist", "LICENSE", "OFL.txt"]`؛ root `OFL.txt` با `packages/plugins/pdf/fonts/OFL.txt` هم‌خوان است
  - banner `/*! Vazirmatn … SIL Open Font License 1.1 */` روی `dist/plugins/pdf.{js,cjs}` و `vazirmatn.{js,cjs}` بعد از tsup
  - `CHANGELOG.md` (Keep a Changelog، ورودی 0.6.0)، `CONTRIBUTING.md`، `SECURITY.md`، قالب issue
  - keywords: حذف `erp grid` / `erp` / `excel-like`؛ جایگزینی با datagrid / jalali / rtl / offline-first / excel-export / …
  - `yarn verify:dist` حالا `npm pack --dry-run` را چک می‌کند
- **محدودیت آگاهانه / نشد:**
  - `funding` اختیاری بود و اضافه نشد (URL حامی نداریم)
  - نسخهٔ npm هنوز `0.5.0` است؛ 0.6.0 تا پایان Phase 16 (`PR-80`) bump نمی‌شود
  - banner با اسکریپت post-tsup است نه `tsup.banner` سراسری، تا `index.js` اندازه نگیرد
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ (اعتماد) ۴٫۵ → ۵٫۵
- **Verify:**
  - `yarn test` → ۵۷ فایل / ۲۶۲ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn verify:dist` → index gzip ۴۶٫۶ KB / ۶۵؛ `npm pack` شامل LICENSE و OFL.txt — پاس
  - `yarn size` → `.` ۴۷٫۷۳ KB / ۶۵ KB؛ font ۷۰٫۵۹ KB — پاس
  - `npm pack --dry-run` → `LICENSE`، `OFL.txt` در فهرست ۸۲ فایل
- **بعدی:** `PR-79` — صفر `any` در سطح عمومی

### PR-79 — صفر `any` در سطح عمومی (۱۴۰۵/۰۶/۲۲ — ۱۳ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `application/ports/RemoteApi.ts`, `domain/types/ColumnSchema.ts`, `domain/value-objects/index.ts`, `ui/type.ts`, `engine/type.ts`, `infrastructure/Repositories/fetchRemoteApi.ts`, handlers/engine/UI consumers of those types, `eslint.config.js`, `scripts/verify-dist.mjs`, `docs/__tests__/no-explicit-any.spec.ts`, CI
- **هدف:** هیچ `any` در تایپ‌های عمومی و publish graph؛ گِیت ESLint + `verify:dist` روی `.d.ts`
- **انجام شد:**
  - `RemoteApi.request<TResponse = unknown>(… params?: Record<string, unknown>)`
  - `IMultiSelectConfig.onAdd(rows: Record<string, unknown>[])`؛ `IRule` / `ColumnSchema` بدون `any`
  - جایگزینی `as any` در engine/application/UI با narrowing / `unknown` / تایپ واقعی
  - `yarn lint:publish` = ESLint `@typescript-eslint/no-explicit-any: error` روی همان includeی `tsconfig.publish.json` (بدون تست‌ها)
  - گام CI + `prepublishOnly`؛ `verify:dist` همهٔ `dist/**/*.d.ts` را بعد از حذف کامنت اسکن می‌کند
- **محدودیت آگاهانه / نشد:**
  - `any` در `**/*.spec.ts` و `examples/host-arian-erp/` ماند — خارج از publish graph
  - `ListConfig.returnValue` حالا یک ردیف می‌گیرد نه آرایه (امضای قبلی با مصرف‌کننده نمی‌خواند)
  - اندازهٔ `.` ۴۷٫۷۳ → ۴۸٫۰۱ KB gzip از narrowing در UI؛ هنوز زیر ۶۵
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۳ → ۴؛ دستهٔ ۱۰ (اعتماد) ۵٫۵ → ۶
- **Verify:**
  - `yarn test` → ۵۸ فایل / ۲۶۵ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۶٫۹ KB / ۶۵؛ published d.ts صفر `any` — پاس
  - `yarn size` → `.` ۴۸٫۰۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-80` — پاک کردن arianERP از سطح عمومی

### PR-80 — پاک کردن arianERP از سطح عمومی (۱۴۰۵/۰۶/۲۲ — ۱۳ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `publish/entry.ts`, `index.ts`, `publish/headless.ts`, `bootstrap/{index,type}.ts`, `infrastructure/eventStore/eventStoreName.ts`, `infrastructure/eventStore/IndexedDbEventStore.ts`, `scripts/verify-dist.mjs`, `MIGRATION.md`, `examples/host-arian-erp/host-arian-erp.md`, README / `docs/public-api.md` / getting-started / components, `docs/__tests__/{host-arian-erp,subpath-exports,public-api-honesty}.spec.ts`
- **هدف:** `arianERP` از bundle اصلی بیرون برود؛ نام IndexedDB خنثی شود بدون از دست رفتن دادهٔ 0.5.x
- **انجام شد:**
  - `FetchRemoteApi` فقط از `persian-data-grid/adapters/arian-erp`؛ ریشه و `index.ts` دیگر export نمی‌کنند
  - پیش‌فرض IndexedDB: `persian-data-grid-events:{store}`؛ `eventStoreName` / `LEGACY_EVENT_STORE_PREFIX` برای `erp-table-events`
  - قرارداد هاست از `docs/host-arian-erp.md` به `examples/host-arian-erp/host-arian-erp.md`
  - فصل مهاجرت 0.6.0 در `MIGRATION.md`؛ `verify:dist` grep `arianERP` روی `dist/index.js`
- **محدودیت آگاهانه / نشد:**
  - کپی خودکار بین دو دیتابیس IndexedDB وجود ندارد — هاست باید `eventStoreName` بدهد
  - نسخهٔ npm هنوز `0.5.0` است؛ bump به 0.6.0 جدا از این PR است
  - این یک شکستن 0.6.0 است، نه alias منسوخ (verify صفر `arianERP` روی `.` را اجبار می‌کند)
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۴ → ۴٫۵؛ دستهٔ ۹ (بسته‌بندی) ۶ → ۶٫۵
- **Verify:**
  - `yarn test` → ۵۹ فایل / ۲۷۱ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۶٫۹ KB / ۶۵؛ `arianERP` در `dist/index.js` صفر — پاس
  - `yarn size` → `.` ۴۸٫۰۳ KB / ۶۵ KB؛ `./adapters/arian-erp` ۹۳۹ B — پاس
- **بعدی:** `PR-81` — `ColumnDef<TRow>` جنریک (D14)

### PR-81 — `ColumnDef<TRow>` جنریک (۱۴۰۵/۰۶/۲۲ — ۱۳ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `domain/types/ColumnDef.ts`, `domain/types/ColumnSchema.ts` (`columnDef` stash), `infrastructure/columns/mapColumnDef.ts`, `infrastructure/__tests__/map-column-def.spec.ts`, `domain/types/column-def.typecheck.ts`, `publish/entry.ts`, `publish/headless.ts`, `index.ts`, `bootstrap/type.ts`, `docs/public-api.md`, `docs/getting-started.md`, `MIGRATION.md`
- **هدف:** نوع جنریک بازار (`field` / `headerName` / `valueGetter`) بدون شکستن مسیر `ColumnSchema` و بدون دست زدن به `CellRenderer`
- **انجام شد:**
  - `ColumnDef<TRow, TValue>` در domain (بدون React) با `FilterDef` / `ColumnPinned` / `ColumnCellRenderer`
  - mapper دوطرفه `toColumnDef` / `toColumnSchema`؛ round-trip `ColumnSchema` idempotent؛ extras روی `schema.columnDef`
  - `@ts-expect-error` برای `field` نامعتبر؛ export از `.` و `headless`
- **محدودیت آگاهانه / نشد:**
  - `ERPTable` / `createERPTable` هنوز `columns: ColumnSchema[]` می‌گیرند — `rowData`/`columnDefs` در PR-82
  - `valueGetter` / `comparator` / `filter` هنوز در engine مصرف نمی‌شوند (Phase 18)
  - `ColumnSchema` منسوخ نشد (مسیر جدید هنوز runtime گرید را تغذیه نمی‌کند)
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۴٫۵ → ۵
- **Verify:**
  - `yarn test` → ۶۰ فایل / ۲۷۹ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۶٫۹ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۸٫۰۵ KB / ۶۵ KB — پاس
- **بعدی:** `PR-82` — `rowData: TRow[]` + `getRowId`

### PR-82 — `rowData` + `getRowId` (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `domain/entities/Row.ts`, `domain/entities/Table.ts`, `infrastructure/rows/mapRowData.ts`, `infrastructure/__tests__/map-row-data.spec.ts`, `bootstrap/{index,type,builders}.ts`, `engine/{tableEngine,ViewStateBuilder}.ts`, `infrastructure/ui/UITableController.ts`, `ui/{index,useERPTable}.tsx`, `ui/desktop/{eRPTableRow,ERPTableBody}.tsx`, `publish/{entry,headless}.ts`, `index.ts`, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** مصرف‌کننده `rowData: T[]` بدهد بدون ساخت `RowInput`؛ هویت پایدار با `getRowId`؛ به‌روز شدن آرایه جدول را reset نکند
- **انجام شد:**
  - `Row.data` / `Row.sourceId` همان مرجع میزبان (بدون کلون عمیق) تا `valueGetter` کار کند
  - adapter `mapRowDataToRowInputs` + `applyHostRowDataToTable`؛ پیش‌فرض `getRowId` = ایندکس آرایه
  - `createERPTable` / `ERPTable` می‌پذیرند `columnDefs` + `rowData` + `getRowId`؛ `columns`/`rows` با `@deprecated` کار می‌کنند (D14)
  - diff روی `applyHostRowData`: فقط ردیف عوض‌شده سلول/UIRow جدید می‌گیرد؛ بقیه همان instance
  - `ERPTableRow` memo دیگر به هویت کل `table` وابسته نیست تا re-render همان ردیف ممکن باشد
- **محدودیت آگاهانه / نشد:**
  - `store` / `tableKey` / `actor` هنوز اجباری‌اند (PR-83)
  - IndexedDB فیلد `data` را persist نمی‌کند — میزبان باید دوباره `rowData` بدهد
  - اگر `columnDefs` ستون `index` نداشته باشد یک ستون `#` مخفی برای ترتیب ساخته می‌شود
  - ژنریک انتها‌به‌انتها روی `DataGrid<TRow>` کار `PR-88` است
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۵ → ۶
- **Verify:**
  - `yarn test` → ۶۱ فایل / ۲۸۶ تست — پاس (۱۰۰۰ ردیف بدون `RowInput`؛ تغییر یک ردیف ⇒ یک UIRow بازنویسی)
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۷٫۱ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۸٫۱۹ KB / ۶۵ KB — پاس
- **بعدی:** `PR-83` — props اختیاری‌سازی و zero-config

### PR-83 — zero-config `store` / `tableKey` / `actor` (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `bootstrap/defaults.ts`, `bootstrap/{index,type}.ts`, `bootstrap/__tests__/zero-config.spec.ts`, `ui/{useERPTable,index}.tsx`, `publish/{entry,headless}.ts`, `index.ts`, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** `<ERPTable rowData columnDefs />` بدون IndexedDB و بدون actor/tableKey اجباری
- **انجام شد:**
  - بدون `store` → `LocalTableRepository` + `InMemoryEventStore`؛ `indexedDB.open` صدا زده نمی‌شود
  - بدون `actor` → `DEFAULT_GRID_ACTOR` (`anonymous` / `admin`، همهٔ دسترسی‌ها)
  - بدون `tableKey` → `pdg-…`؛ در React با `useRef` برای عمر کامپوننت پایدار است
  - وقتی `store` داده شود همان مسیر durable قبلی (IndexedDB + `CachedTableRepository`)
  - SSR `<ERPTable />` بدون prop اضافه رندر می‌شود و IndexedDB را لمس نمی‌کند
- **محدودیت آگاهانه / نشد:**
  - `createERPTable` هنوز async است (hydrate تنبل = D24 / PR-84)
  - نام عمومی هنوز `ERPTable` است نه `DataGrid` (PR-87)
  - ژنریک انتها‌به‌انتها `DataGrid<TRow>` کار PR-88 است
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۶ → ۶٫۵
- **Verify:**
  - `yarn test` → ۶۲ فایل / ۲۹۵ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۷٫۲ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۸٫۳۶ KB / ۶۵ KB — پاس
- **بعدی:** `PR-84` — `createGrid` sync + hydrate تنبل (D24)

### PR-84 — `createGrid` sync + hydrate تنبل (D24) (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `bootstrap/{index,type}.ts`, `bootstrap/__tests__/create-grid.spec.ts`, `ui/useERPTable.ts`, `publish/{entry,headless}.ts`, `index.ts`, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** `createGrid()` بدون `await` نمونه بدهد؛ EventStore/snapshot روی `grid.ready` hydrate شود؛ `createERPTable` alias منسوخ بماند
- **انجام شد:**
  - `createGrid(cfg)` sync است؛ `store` / `tableKey` / `ready` فوراً روی handle هستند
  - `await grid.ready` همان شیء را با `engine` / `controller` / `session` پر می‌کند
  - `await createERPTable(cfg)` ≡ `await createGrid(cfg).ready` (`@deprecated`)
  - `useERPTable` در render `createGrid` می‌سازد و hydrate را با `grid.ready` دنبال می‌کند (نه `useEffect` + `await createERPTable`)
  - ردیف مهاجرت + ورودی codemod برای PR-131 در `MIGRATION.md`
- **محدودیت آگاهانه / نشد:**
  - قبل از `ready` فیلدهای `engine` / `controller` روی handle خالی‌اند — باید `await grid.ready`
  - نام عمومی هنوز `ERPTable` است نه `DataGrid` (PR-87)
  - رخدادهای React (`onCellValueChanged` و …) کار PR-85 است
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۶٫۵ → ۷
- **Verify:**
  - `yarn test` → ۶۳ فایل / ۳۰۰ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۷٫۳ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۸٫۳۸ KB / ۶۵ KB — پاس
- **بعدی:** `PR-85` — props رخداد React از `EVENT_CATALOG`

### PR-85 — props رخداد React از `EVENT_CATALOG` (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `application/events/hostGridEvents.ts`, `application/events/eventCatalog.ts`, `ui/host/{bindGridHostEvents,useGridHostEvents}.ts`, `ui/{index,useERPTable}.tsx`, `publish/{entry,headless}.ts`, `index.ts`, tests, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** `onCellValueChanged` و رخدادهای استاندارد React بدون bus دوم
- **انجام شد:**
  - ویرایش سلول دقیقاً یک `onCellValueChanged` با `{oldValue, newValue, colId, rowId, data}` از `CELL_CHANGED`
  - همان رخداد → `onRowValueChanged`؛ `ROW_*` کاتالوگ → `onRowDataUpdated`
  - `onSelectionChanged` / `onCellFocused` از view store موجود (`selectedRows` / `activeCell`)
  - `onGridReady({ api })` هم‌زمان با `onReady`؛ `api` هنوز `UITableController` است (PR-86)
  - headless: `subscribeCatalogHostEvents` / `bindGridHostEvents`
- **محدودیت آگاهانه / نشد:**
  - `onSortChanged` نیست (sort = Phase 18)
  - `onGridReady.api` هنوز `GridApi` نیست (PR-86)
  - نام عمومی هنوز `ERPTable` است (PR-87)
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۷ → ۷٫۵
- **Verify:**
  - `yarn test` → ۶۵ فایل / ۳۱۰ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۸٫۱ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۹٫۲۸ KB / ۶۵ KB — پاس
- **بعدی:** `PR-86` — `apiRef` / `GridApi`

### PR-86 — `apiRef` / `GridApi` (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `infrastructure/ui/createGridApi.ts`, `engine/tableEngine.ts`, `infrastructure/ui/UITableController.ts`, `bootstrap/{index,type}.ts`, `ui/{index,useERPTable}.tsx`, `ui/host/{bindGridHostEvents,assignRef}.ts`, `publish/{entry,headless}.ts`, `index.ts`, tests, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** `apiRef` / `onGridReady.api` / `grid.api` با سطح حداقلی مستند؛ کلاس `UITableController` از `.` بیرون
- **انجام شد:**
  - `GridApi`: `getRowNode`، `setRowData`، `refreshCells`، `getSelectedRows`، `deselectAll`، `startEditingCell`، `stopEditing`، `exportDataAsExcel`، `undo`، `redo`، `getColumnState`، `applyColumnState`
  - `ERPTable apiRef` هنگام hydrate پر و هنگام unmount خالی می‌شود؛ `onGridReady({ api })` همان `GridApi` است
  - `createGrid().ready` فیلد `api` را روی همان handle می‌گذارد
  - `UITableController` روی `.` فقط `export type`؛ کلاس روی `persian-data-grid/headless` مانده؛ `onReady(controller)` یک نسخه کار می‌کند
  - `exportDataAsExcel` از `pluginHost.requestExport({ format: 'xlsx' })` می‌رود (بدون کشیدن excel به `.`)
- **محدودیت آگاهانه / نشد:**
  - `applyColumnState.hide` ✅ PR-111 (`setColumnVisible`)
  - ویرایش سلول = فوکوس `activeCell`، نه حالت edit جدا
  - ژنریک انتها‌به‌انتها `DataGrid<TRow>` هنوز PR-88 است (`api` از `createGrid` هنوز `GridApi<unknown>` است)
  - نام عمومی هنوز `ERPTable` است (PR-87)
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۷٫۵ → ۸
- **Verify:**
  - `yarn test` → ۶۶ فایل / ۳۲۲ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۸٫۲ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۹٫۴ KB / ۶۵ KB — پاس
- **بعدی:** `PR-87` — تغییر نام سطح عمومی (D13)

### PR-87 — تغییر نام سطح عمومی (D13) (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `ui/{index,useERPTable}.tsx`, `ui/theme/GridTheme.ts`, `ui/styles/erp-table.css`, `scripts/codemod-v0.7.mjs`, `scripts/codemod-v0.7.fixture.tsx`, `publish/entry.ts`, `index.ts`, tests, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** نام‌های عمومی با پکیج هم‌خوان شوند؛ نام‌های قدیمی یک نسخه alias منسوخ بمانند
- **انجام شد:**
  - `DataGrid` / `DataGridProps` / `useGrid` / `themeDefault` / `themeDark` مسیر canonical
  - `ERPTable === DataGrid`، `themeErp === themeDefault`، `useERPTable === useGrid` (`@deprecated`)
  - ریشهٔ گرید `className="pdg-grid erp-table"`؛ توکن‌های `--pdg-*` با `--erp-*: var(--pdg-*)`
  - `scripts/codemod-v0.7.mjs` روی fixture؛ `createERPTable` / `injectERPTableStyles` بازنویسی نمی‌شوند
- **محدودیت آگاهانه / نشد:**
  - نام فایل‌های داخلی (`ERPTableHeader.tsx`, `useERPTable.ts`, `erp-table.css`) عوض نشد
  - `useERPTableTheme` / `ERPTableHostProvider` / `createERPTable` / `injectERPTableStyles` در دامنهٔ D13 نیستند
  - سلکتورهای descendant هنوز `.erp-table …` هستند (ریشه هر دو کلاس را دارد)
  - دمو هنوز نام‌های قدیمی را مصرف می‌کند (alias زنده است)
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۸ → ۸٫۵
- **Verify:**
  - `yarn test` → ۶۷ فایل / ۳۲۷ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۸٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۹٫۹ KB / ۶۵ KB — پاس
- **بعدی:** `PR-88` — ژنریک انتها-به-انتها و مسیر ۶۰ ثانیه

### PR-88 — ژنریک انتها-به-انتها و مسیر ۶۰ ثانیه (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `bootstrap/{type,index}.ts`, `ui/{index,useERPTable,data-grid-generics.typecheck}.tsx`, `ui/host/{bindGridHostEvents,useGridHostEvents}.ts`, `application/events/hostGridEvents.ts`, `domain/types/ColumnDef.ts`, docs / `MIGRATION.md` / `CHANGELOG.md` / README
- **هدف:** `DataGrid<TRow>` کامل جنریک؛ استنتاج از `rowData`؛ مسیر ۶۰ ثانیه در getting-started
- **انجام شد:**
  - `CreateERPTableConfig<TRow>` / `createGrid<TRow>` / `useGrid<TRow>` / `DataGridProps<TRow>`
  - `rowData`، `columnDefs`، `getRowId`، رخدادها، `apiRef`، `grid.api` همه `TRow` را حمل می‌کنند
  - `ColumnField<TRow>`: بدون ژنریک `field` آزاد است؛ با `Invoice` کلید تایپ‌شده است
  - `ui/data-grid-generics.typecheck.tsx`: استنتاج بدون annotation + `@ts-expect-error` + `expectTypeOf`
  - `docs/getting-started.md` با مسیر ۶۰ ثانیه (`DataGrid<Invoice> rowData columnDefs onCellValueChanged`)
- **محدودیت آگاهانه / نشد:**
  - `Row.data` در دامنه هنوز `unknown` است؛ مرز `GridApi` / رخدادها cast می‌کند
  - `valueGetter` روی مسیر ERP (`columns`/`rows`) تایپ میزبان ندارد
  - sort / filter هنوز Phase 18 است (`onSortChanged` نیست)
- **اثر روی کارت امتیاز:** دستهٔ ۸ (API/DX) ۸٫۵ → ۹٫۵؛ جمع کارت ۳۵ → **۳۷**
- **Verify:**
  - `yarn test` → ۶۷ فایل / ۳۲۹ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۸٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۹٫۹ KB / ۶۵ KB — پاس
- **بعدی:** `PR-89` — `SortModel` در هسته (Phase 18)

### PR-89 — `SortModel` در هسته (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/dataOps/sortModel.ts`, `engine/__tests__/sort-model.spec.ts`, `publish/{entry,headless}.ts`, `index.ts`, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** تابع خالص `applySort` برای multi-sort پایدار؛ بدون لمس `ViewStateBuilder`
- **انجام شد:**
  - `SortModel` / `applySort(rowIds, sortModel, accessor)` در `engine/dataOps`
  - پیش‌فرض بر پایهٔ `FieldType` (عدد/قیمت، متن با `Intl.Collator('fa')`، تاریخ جلالی، checkbox)
  - override با `accessor.getComparator` (`ColumnDef.comparator`)
  - null/blank همیشه آخر؛ `index` tie-breaker نهایی؛ ورودی mutate نمی‌شود
  - تست: پایدار، multi-sort، null آخر، `آ < ا < ب`، رقم فارسی، ۱۰۰k زیر بودجه (avg ≤ ۲۰۰ms)
- **محدودیت آگاهانه / نشد:**
  - `ViewStateBuilder.sortRows` هنوز فقط `index` است (PR-90)
  - هدر / `aria-sort` / `SET_SORT_MODEL` نیست (PR-91)
  - `onSortChanged` نیست
- **اثر روی کارت امتیاز:** دستهٔ ۱ (عملیات داده) ۲ → ۳؛ جمع کارت ۳۷ → **۳۸**
- **Verify:**
  - `yarn test` → ۶۸ فایل / ۳۴۳ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۸٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۹٫۹۵ KB / ۶۵ KB — پاس
- **بعدی:** `PR-90` — وصل sort به ایندکس ردیف

### PR-90 — وصل sort به ایندکس ردیف (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/{type,ViewStateBuilder,tableEngine}.ts`, `application/commands/index.ts`, `infrastructure/ui/{uiEvents,UITableController}.ts`, `engine/__tests__/sort-index.spec.ts`, docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** `SortModel` ترتیب `SparseRowIndex` / `getAllUIRows` را عوض کند؛ بدون رگرسیون ترتیب `index`؛ invalidate فقط روی sort/data
- **انجام شد:**
  - `sortModel` روی `TableState` / `TableViewState` (session-only، مثل `columnWidths`)
  - `SET_SORT_MODEL` / `UI_SET_SORT_MODEL` / `controller.setSortModel`
  - `ViewStateBuilder.ensureUiRowIndex` و `sortRows` از `applySort`؛ مدل خالی ⇒ ترتیب `index`
  - `CHANGE_CELL_VALUE` ایندکس را فقط اگر ستون در sortModel (یا `index`) باشد invalidate می‌کند
  - صفحه‌بندی از کل ردیف‌های مرتب‌شده slice می‌شود
- **محدودیت آگاهانه / نشد:**
  - کلیک هدر / `aria-sort` / نشانگر multi-sort نیست (PR-91)
  - `onSortChanged` و EventStore برای sort نیست
  - `GridApi.setSortModel` هنوز اضافه نشده (می‌تواند در PR-91 بیاید)
- **اثر روی کارت امتیاز:** دستهٔ ۱ (عملیات داده) ۳ → ۴؛ جمع کارت ۳۸ → **۳۹**
- **Verify:**
  - `yarn test` → ۶۹ فایل / ۳۵۰ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۸٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۴۹٫۹۵ KB / ۶۵ KB — پاس
- **بعدی:** `PR-91` — UI مرتب‌سازی هدر

### PR-91 — UI مرتب‌سازی هدر (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/dataOps/sortModel.ts`, `ui/desktop/ERPTableHeader.tsx`, `ui/styles/erp-table.css` (+ inject), `infrastructure/ui/createGridApi.ts`, `engine/__tests__/header-sort.spec.ts`, demo / docs / `MIGRATION.md` / `CHANGELOG.md`
- **هدف:** کلیک هدر asc→desc→none؛ Shift+Click multi-sort؛ `aria-sort`؛ بدون شکستن drag reorder
- **انجام شد:**
  - `cycleSortModel` / `ariaSortForColumn` / `shouldCommitHeaderSortClick` (آستانهٔ ۵px) / `isHeaderColumnSortable`
  - هدر دسکتاپ: `aria-sort`، آیکن، نشانگر اولویت multi-sort، `sortable: false` و `index` غیرقابل‌sort
  - کلیک در برابر درگ: pointer move ≥ ۵px یا `dragstart` ⇒ sort نمی‌شود؛ reorder HTML5 باقی است
  - `GridApi.getSortModel` / `setSortModel`
  - راهنمای دمو برای دو ستون sortable
- **محدودیت آگاهانه / نشد:**
  - `onSortChanged` هنوز نیست
  - هدر موبایل sort ندارد (بدون drag؛ عمداً خارج از Verify دسکتاپ)
  - فیلتر / quick filter هنوز نیست (PR-92+)
- **اثر روی کارت امتیاز:** دستهٔ ۱ (عملیات داده) ۴ → ۵؛ جمع کارت ۳۹ → **۴۰**
- **Verify:**
  - `yarn test` → ۷۰ فایل / ۳۶۳ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۹٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۰٫۸۸ KB / ۶۵ KB — پاس
- **بعدی:** `PR-92` — `FilterModel` در هسته

### PR-92 — `FilterModel` در هسته (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/dataOps/filterModel.ts`, `engine/__tests__/filter-model.spec.ts`, exports (`index` / publish), docs / `MIGRATION.md` / `CHANGELOG.md`, `scripts/verify-dist.mjs` + `docs/__tests__/no-explicit-any.spec.ts` (string-literal `'any'` ≠ TS `any`)
- **هدف:** تابع خالص `applyFilter` با همهٔ عملگرهای مشخص‌شده + نرمال رقم/ي‌ك؛ بدون وصل به ایندکس/UI
- **انجام شد:**
  - `FilterModel` / text / number (با نمادهای =≠<>…) / date / set / boolean / custom
  - AND/OR در سطح ستون؛ ستون‌ها با AND
  - `normalizeFilterText` + `collectUniqueFilterValues`
  - تست هر عملگر + نرمال + بودجهٔ ۱۰۰k
- **محدودیت آگاهانه / نشد:**
  - به `ViewStateBuilder` / SparseRowIndex وصل نیست (مثل PR-89 قبل از PR-90)
  - UI فیلتر و quick filter نیستند (PR-93/94)
- **اثر روی کارت امتیاز:** دستهٔ ۱ (عملیات داده) ۵ → ۶؛ جمع کارت ۴۰ → **۴۱**
- **Verify:**
  - `yarn test` → ۷۱ فایل / ۳۷۶ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۹٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۰٫۹ KB / ۶۵ KB — پاس
- **بعدی:** `PR-93` — quick filter واقعی

### PR-93 — quick filter واقعی (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/dataOps/quickFilter.ts`, `engine/ViewStateBuilder.ts`, `engine/tableEngine.ts`, `engine/type.ts`, commands / UI / `GridApi`, `bootstrap` / `useGrid`, demo, docs, `engine/__tests__/quick-filter*.spec.ts`
- **هدف:** `quickFilterText` ردیف را حذف کند؛ ایندکس متن با invalidate تدریجی؛ `GridSearchPanel` جدا بماند
- **انجام شد:**
  - `QuickFilterIndex` (blob + inverted tokens) + `applyQuickFilter`
  - `SET_QUICK_FILTER_TEXT` / prop / `api.setQuickFilter` روی SparseRowIndex / pagination
  - patch تک‌ردیفی روی ویرایش سلول؛ rebuild فقط روی add/delete/collection
  - دمو: نوار «فیلتر سریع» جدا از «جستجو»
- **محدودیت آگاهانه / نشد:**
  - `FilterModel` ستونی هنوز به ایندکس وصل نیست (PR-94)
  - `GridSearchPanel` از ایندکس متن (PR-99) استفاده می‌کند؛ هنوز فیلتر ردیف نیست (find-and-navigate)
- **اثر روی کارت امتیاز:** دستهٔ ۱ (عملیات داده) ۶ → ۷؛ جمع کارت ۴۱ → **۴۲**
- **Verify:**
  - `yarn test` → ۷۳ فایل / ۳۸۵ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۴۹٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۰٫۹۶ KB / ۶۵ KB — پاس
- **بعدی:** `PR-94` — UI فیلتر: منوی ستون + floating filter

### PR-94 — UI فیلتر: منوی ستون + floating filter (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/{type,ViewStateBuilder,tableEngine}.ts`, `engine/dataOps/filterModel.ts`, commands / UI / `GridApi`, `ui/desktop/{ERPTableHeader,ColumnFilterPopover,DesktopTable}.tsx`, `ui/index.tsx`, styles, demo, docs
- **هدف:** آیکن فیلتر هدر → پاپ‌اور تم‌دار؛ floatingFilter؛ نشانگر فعال؛ `api.setFilterModel`
- **انجام شد:**
  - `SET_FILTER_MODEL` روی SparseRowIndex (قبل از quick filter، قبل از sort)
  - پاپ‌اور portal با `useThemePortalStyle` برای text/number/date/boolean/set
  - `data-pdg-filter-active` + `floatingFilter` prop؛ دمو با floatingFilter
  - `api.getFilterModel` / `setFilterModel`
- **محدودیت آگاهانه / نشد:**
  - رجیستری فیلتر سفارشی هنوز نیست (PR-95)
  - منوی ستون کامل AG-style (pin/hide/…) نیست
- **اثر روی کارت امتیاز:** دستهٔ ۱ (عملیات داده) ۷ → ۹؛ جمع کارت ۴۲ → **۴۴**
- **Verify:**
  - `yarn test` → ۷۴ فایل / ۳۸۹ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۳٫۲ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۴٫۵۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-95` — کامپوننت فیلتر سفارشی

### PR-95 — کامپوننت فیلتر سفارشی (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `ui/filters/*`, `engine/dataOps/filterModel.ts`, `ColumnDef`/`FilterDef`, `ColumnFilterPopover`, `ERPTableHeader`, `ERPTableHost`, `ui/index.tsx`, demo Bed/`roundAmount`, docs
- **هدف:** رجیستری `filterComponents` مانند سلول؛ `ColumnDef.filter` کلید سفارشی
- **انجام شد:**
  - `resolveFilterUi` + `FilterComponent` / `FilterComponentMap` / `resolveFilterComponent`
  - پاپ‌اور هدر رندر سفارشی؛ `filterComponents` روی `DataGrid` و host
  - دمو «فقط مبالغ رُند» روی ستون Bed؛ مستند در `docs/cell-components.md`
- **محدودیت آگاهانه / نشد:**
  - floating filter فقط برای builtin؛ فیلتر سفارشی فقط پاپ‌اور ▽
  - datasource سمت سرور هنوز نیست (PR-96)
- **اثر روی کارت امتیاز:** دستهٔ ۱ (عملیات داده) ۹ → ۱۰؛ جمع کارت ۴۴ → **۴۵**
- **Verify:**
  - `yarn test` → ۷۵ فایل / ۳۹۵ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۳٫۶ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۴٫۹۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-96` — قرارداد datasource سمت سرور

### PR-96 — قرارداد datasource سمت سرور (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `application/ports/GridDatasource.ts`, `application/rowModel/attachServerRowModel.ts`, `engine/dataOps/rowModel.ts`, `ViewStateBuilder`, `TableEngine`, `bootstrap/{type,index}.ts`, docs
- **هدف:** وقتی `rowModelType: infinite|serverSide`، sort/filter محلی نزن؛ `getRows` بزن
- **انجام شد:**
  - `GridDatasource.getRows({ startRow, endRow, sortModel, filterModel })`
  - skip محلی در `ensureUiRowIndex` / `sortRows`؛ صفحهٔ جاری بدون slice دوباره
  - `attachServerRowModel` روی sort/filter/page؛ جایگزینی صفحه‌ای با `applyHostRowData`
- **محدودیت آگاهانه / نشد:**
  - کش بلوکی / loading row / LRU / `refreshServerSide` نیست (PR-102)
  - `serverSide` و `infinite` فعلاً یک رفتار صفحه‌ای دارند
- **اثر روی کارت امتیاز:** دستهٔ ۲ (مقیاس) ۴ → ۵؛ جمع کارت ۴۵ → **۴۶**
- **Verify:**
  - `yarn test` → ۷۷ فایل / ۴۰۱ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۳٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۴٫۹۴ KB / ۶۵ KB — پاس
- **بعدی:** `PR-97` — مجازی‌سازی پیش‌فرض روشن (D17)

### PR-97 — مجازی‌سازی پیش‌فرض روشن / D17 (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `ui/desktop/resolveDesktopVirtualization.ts`, `DesktopTable`, `ui/index.tsx`, demo, docs, `MIGRATION.md`
- **هدف:** وقتی session هست پیش‌فرض virtual on؛ `virtualization={false}` تنها راه pagination
- **انجام شد:**
  - `resolveDesktopVirtualization`: `session && virtualization !== false`
  - pagination و virtual متقابل در toolbar؛ spacer + index pin تست شده
  - فصل مهاجرت اجباری در `MIGRATION.md`
- **محدودیت آگاهانه / نشد:**
  - مجازی‌سازی ستون هنوز نیست (PR-98)
  - مسیر pagination حذف نشد — هاست ERP با `virtualization={false}`
- **اثر روی کارت امتیاز:** دستهٔ ۲ (مقیاس) ۵ → ۷؛ جمع کارت ۴۶ → **۴۸**
- **Verify:**
  - `yarn test` → ۷۷ فایل / ۴۰۷ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۳٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۴٫۹۵ KB / ۶۵ KB — پاس
- **بعدی:** `PR-98` — مجازی‌سازی ستون

### PR-98 — مجازی‌سازی ستون (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/ColumnViewport.ts`, `ViewportCalculator`, `ui/virtual/columnWindow.tsx`, `ColumnWindowCells`, DesktopTable/Header/Row/Footer/VirtualBody, docs
- **هدف:** پنجرهٔ افقی مشترک؛ pin ایندکس همیشه؛ spacer RTL
- **انجام شد:**
  - `calculateColumnViewport` با عرض تجمعی + binary search؛ `ViewportCalculator.calculateColumns`
  - `ColumnWindowProvider` روی scrollport دسکتاپ؛ هدر/بدنه/فوتر یک پنجره
  - تست ۲۰۰ ستون → window < ۲۵؛ pin + spacer
- **محدودیت آگاهانه / نشد:**
  - pin دلخواه ستون هنوز D19/PR-110 (فقط index)
  - `CHANGE_COLUMN_VIEWPORT` در session نیست — اندازهٔ محلی React
- **اثر روی کارت امتیاز:** دستهٔ ۲ (مقیاس) ۷ → ۹؛ جمع کارت ۴۸ → **۵۰**
- **Verify:**
  - `yarn test` → ۷۹ فایل / ۴۱۸ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۵٫۱ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۶٫۴ KB / ۶۵ KB — پاس
- **بعدی:** `PR-99` — حذف O(n) از مسیر گرم

### PR-99 — حذف O(n) از مسیر گرم (۱۴۰۵/۰۶/۲۴ — ۱۵ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/SparseRowIndex.ts`, `ColumnTotalsIndex.ts`, `ViewStateBuilder`, `NavigationManager`, `sortModel` (`findSortedInsertIndex`), `ui/gridSearch/utils.ts`, `ERPTableFooter`, `engine/__tests__/hot-path-pr99.spec.ts`
- **هدف:** چهار مسیر گرم بدون اسکن/مرتب‌سازی کامل روی هر کلید/جستجو/جمع
- **انجام شد:**
  - `posById` + `neighbor` / `indexOf` / `insertAt` / `replaceAll` روی SparseRowIndex
  - ناوبری عمودی O(1) از UI index؛ insert/remove افزایشی با binary search
  - جستجو از `QuickFilterIndex` + ترتیب UI؛ فوتر از `ColumnTotalsIndex` + `subscribeColumnTotals`
  - گارد سورس + بودجهٔ CI همسایهٔ ۱۰۰k < ۲ms
- **محدودیت آگاهانه / نشد:**
  - rebuild کامل ایندکس روی تغییر sort/filter model هنوز O(n log n) است (درست است)
  - harness perf ۱۰۰k ردیف hydrate → PR-100
- **اثر روی کارت امتیاز:** دستهٔ ۲ (مقیاس) ۹ → ۱۱؛ جمع کارت ۵۰ → **۵۲**
- **Verify:**
  - `yarn test` → ۸۰ فایل / ۴۲۲ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۴٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۶٫۰۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-100` — بودجهٔ perf واقعی گرید

### PR-100 — بودجهٔ perf واقعی گرید (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `infrastructure/perf/gridHarness.ts`, `grid-performance-budgets.json`, `grid-performance-budget.spec.ts`, `docs/performance.md`, README Performance, docs tests
- **هدف:** ۱۰۰k ردیف دامنهٔ واقعی + اندازه‌گیری hydrate/scroll/edit/sort/filter با بودجهٔ JSON و عدد منتشرشده
- **انجام شد:**
  - harness `createGrid` + ۸ ستون × ۱۰۰k؛ اسکرول ۱۰۰۰ گام؛ ۱۰۰ ویرایش؛ sort؛ filter
  - بودجهٔ قابل‌تنظیم در JSON؛ جدول عدد در `docs/performance.md` و README
- **محدودیت آگاهانه / نشد:**
  - اندازه‌گیری engine است نه paint مرورگر
  - حافظهٔ ۱۰۰k → PR-101؛ SSRM بلوکی → PR-102
- **اثر روی کارت امتیاز:** دستهٔ ۲ (مقیاس) ۱۱ → ۱۲؛ جمع کارت ۵۲ → **۵۳**
- **Verify:**
  - `yarn test` → ۸۲ فایل / ۴۲۸ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۴٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۶٫۰۷ KB / ۶۵ KB — پاس
- **بعدی:** `PR-101` — مصرف حافظه و ردیف‌های جدا از DOM

### PR-101 — مصرف حافظه و ردیف‌های جدا از DOM (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `domain/entities/Cell.ts`, `Row.ts`, `ColumnId.for`, `mapRowData`, `buildRows`/`buildCollections`, `memoryHarness.ts`, `grid-memory-budget.spec.ts`, docs
- **هدف:** < ۳۰۰ MB برای ۱۰۰k × ۲۰ ستون
- **انجام شد:**
  - lazy host cells روی مسیر `rowData` (فقط سلول `index`؛ بقیه روی `data`)
  - `Cell` بدون wrapper دائمی؛ `ColumnId.for`؛ `buildCollections` دیگر `getCell` نمی‌زند
  - اندازه‌گیری: **۲۱۵ MB** heap delta؛ avg cells/row = ۱
- **محدودیت آگاهانه / نشد:**
  - مسیر `rows`/`RowInput` بدون `data` همچنان eager است
  - SSRM بلوکی → PR-102
- **اثر روی کارت امتیاز:** دستهٔ ۲ (مقیاس) ۱۲ → ۱۳؛ جمع کارت ۵۳ → **۵۴**
- **Verify:**
  - `yarn test` → ۸۴ فایل / ۴۳۱ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۴٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۶٫۰۷ KB / ۶۵ KB — پاس
- **بعدی:** `PR-102` — مدل ردیف بلوکی

### PR-102 — مدل ردیف بلوکی infinite / server-side (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/dataOps/blockCache.ts`, `application/rowModel/attachServerRowModel.ts`, `createGridApi`, `bootstrap/{type,index}.ts`, `server-block-cache.spec.ts`, `block-cache.spec.ts`, docs
- **هدف:** کش بلوکی + LRU + loading + `refreshServerSide` روی قرارداد PR-96
- **انجام شد:**
  - `BlockCache` / `assembleBlockWindow`؛ `cacheBlockSize` / `maxBlocksInCache`
  - viewport اسکرول بلوک‌های لازم را می‌خواهد؛ placeholder `__pdgLoading`
  - فیلتر/سورت کش را پاک می‌کند؛ `api.refreshServerSide()`
- **محدودیت آگاهانه / نشد:**
  - overlay/skeleton UI → PR-103
  - `serverSide` و `infinite` هنوز یک مسیر کش دارند (بدون hierarchy)
- **اثر روی کارت امتیاز:** دستهٔ ۲ (مقیاس) ۱۳ → ۱۴؛ جمع کارت ۵۴ → **۵۵**
- **Verify:**
  - `yarn test` → ۸۶ فایل / ۴۳۹ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۴٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۶٫۰۷ KB / ۶۵ KB — پاس
- **بعدی:** `PR-103` — حالت‌های loading و overlay

### PR-103 — حالت‌های loading و overlay (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `ui/overlays/*`, `DesktopTable`, `MobileTable`, `eRPTableRow`, `ViewStateBuilder`, `erp-table.css`, `messages`, docs
- **هدف:** `loading` + no-rows + infinite skeleton + کامپوننت‌های قابل تعویض
- **انجام شد:**
  - `resolveGridOverlay` / `GridOverlays`؛ props روی `DataGrid`
  - اسکلتون برای `UIRow.loading` از `__pdgLoading`
  - CSS تم تیره برای shimmer؛ پیام‌های `general.loading`
- **محدودیت آگاهانه / نشد:**
  - قبل از `ready` هنوز `null` (hydrate)؛ overlay فقط بعد از mount
  - موبایل اسکلتون سلول ندارد (فقط overlay)
- **اثر روی کارت امتیاز:** دستهٔ ۲ قبلاً ۱۴/۱۴؛ Phase 19 ✅؛ جمع کارت **۵۵** (بدون تغییر)
- **Verify:**
  - `yarn test` → ۸۷ فایل / ۴۴۷ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۵٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۷٫۰۸ KB / ۶۵ KB — پاس
- **بعدی:** `PR-104` — مدل بازهٔ سلولی

### PR-104 — مدل بازهٔ سلولی (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/selection/cellRange.ts`, `cell-range.spec.ts`, `publish/headless.ts`, docs
- **هدف:** مدل خالص `CellRange` + anchor/focus + Shift/Ctrl/A
- **انجام شد:**
  - `CellRange { startRow, endRow, colIds }`؛ normalize/merge/overlap
  - `clickCell` / `shiftClickCell` / `ctrlClickCell` / `shiftArrowCell` / `selectAllCellRanges`
  - export روی `persian-data-grid/headless`
- **محدودیت آگاهانه / نشد:**
  - UI رندر / keyboard wiring → PR-105
  - کلیپ‌بورد → PR-106+
- **اثر روی کارت امتیاز:** مدل فقط؛ دستهٔ ۴ هنوز ۳/۱۰ تا PR-105
- **Verify:**
  - `yarn test` → ۸۸ فایل / ۴۵۹ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۵٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۷٫۰۸ KB / ۶۵ KB؛ `/headless` ۲٫۴۸ KB — پاس
- **بعدی:** `PR-105` — UI بازهٔ سلولی

### PR-105 — UI بازهٔ سلولی (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `CellRangeManager`, `cellRangePresentation`, `eRPTableRow`, keyboard/session, `createGridApi`, `erp-table.css`, docs
- **هدف:** رندر بازه + Shift/Ctrl/A + `getCellRanges` / `addCellRange`
- **انجام شد:**
  - state در `TableState.cellRangeSelection` → `view.cellRanges`
  - chrome `--pdg-range-bg` / `--pdg-range-border` روی سلول‌های visible
  - Shift+click/arrow، Ctrl+click، Ctrl+A؛ plain arrow sync تک‌سلول
- **محدودیت آگاهانه / نشد:**
  - clipboard / fill handle → PR-106+
  - Select dropdown هنوز modifier کلیک را forward نمی‌کند
- **اثر روی کارت امتیاز:** دستهٔ ۴ (انتخاب/کلیپ‌بورد) ۳ → **۵**؛ جمع ۵۵ → **۵۷**
- **Verify:**
  - `yarn test` → ۸۹ فایل / ۴۶۲ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۶٫۲ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۷٫۵۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-106` — کپی به کلیپ‌بورد سیستم

### PR-106 — کپی به کلیپ‌بورد سیستم (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `engine/selection/clipboardCopy.ts`, `infrastructure/ui/gridClipboard.ts`, keyboard/session/bootstrap, docs
- **هدف:** `Ctrl+C` → TSV + HTML برای Excel/Word
- **انجام شد:**
  - `buildClipboardPayload` خالص؛ `copyGridSelectionToClipboard` + `navigator.clipboard.write`
  - props: `copyFormattedValue`, `copyHeadersToClipboard`, `copyDigitsAsLatin`, `processCellForClipboard`, `onClipboardCopy`
  - `Ctrl+C` در keyboard؛ `Alt+C` همچنان row-clone mode
- **محدودیت آگاهانه / نشد:**
  - paste / fill handle → PR-107+
  - `Alt+C/X/V` هنوز alias منسوخ نشده (PR-109)
- **اثر روی کارت امتیاز:** دستهٔ ۴ (انتخاب/کلیپ‌بورد) ۵ → **۶**؛ جمع ۵۷ → **۵۸**
- **Verify:**
  - `yarn test` → ۹۱ فایل / ۴۷۴ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۶٫۲ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۷٫۵۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-107` — چسباندن از Excel

### PR-107 — چسباندن از Excel (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `clipboardPaste.ts`, `cellValueCoercion.ts`, `pasteCellsCommandsHandler.ts`, `gridClipboard.ts`, keyboard/session/bootstrap, docs
- **هدف:** `Ctrl+V` → parse TSV/CSV، tile روی بازه، یک undo
- **انجام شد:**
  - `parseDelimitedClipboardText` + `buildPastePlan`؛ ارقام/تاریخ فارسی
  - `PASTE_CELLS` batch handler؛ `pasteAddsRows`؛ `onClipboardPaste`
  - `Ctrl+V` استاندارد؛ `Alt+V` همچنان row-clone mode
- **محدودیت آگاهانه / نشد:**
  - fill handle → PR-108
  - `Alt+C/X/V` alias منسوخ → PR-109
- **اثر روی کارت امتیاز:** دستهٔ ۴ ۶ → **۷٫۵**؛ جمع ۵۸ → **۵۹٫۵**
- **Verify:**
  - `yarn test` → ۹۳ فایل / ۴۸۵ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۶٫۲ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۷٫۵۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-108` — fill handle

### PR-108 — fill handle (۱۴۰۵/۰۶/۲۵ — ۱۶ سپتامبر ۲۰۲۶)

- **فایل‌ها:** `fillHandle.ts`, `gridFillHandle.ts`, `FillHandle.tsx`, `eRPTableRow`, CSS, docs
- **هدف:** درگ گوشهٔ بازه؛ سری عددی/جلالی؛ Ctrl+درگ = کپی؛ یک undo
- **انجام شد:**
  - `buildFillUpdates` + `detectFillSeries` / `addJalaliMonths`
  - UI `.pdg-fill-handle` روی گوشهٔ پایین-راست بازه
  - `applyFillHandleDrag` → `PASTE_CELLS` batch + `pasteAddsRows`
- **محدودیت آگاهانه / نشد:**
  - پیش‌نمایش زنده حین درگ نیست
  - `Alt+C/X/V` alias → PR-109
- **اثر روی کارت امتیاز:** دستهٔ ۴ ۷٫۵ → **۸٫۵**؛ جمع ۵۹٫۵ → **۶۰٫۵**
- **Verify:**
  - `yarn test` → ۹۵ فایل / ۴۹۴ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۶٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۸٫۱۹ KB / ۶۵ KB — پاس
- **بعدی:** `PR-109` — میانبرهای استاندارد (D18)

### PR-109 — میانبرهای استاندارد (D18)

- **هدف:** `Ctrl+C/X/V` استاندارد؛ `Alt+C/X/V` alias منسوخ row-clone؛ `Home`/`End`/`Ctrl+Home`/`Ctrl+End`/`Ctrl+Shift+Arrow`؛ `docs/keyboard.md` + تست پارامتری
- **فایل‌ها:** `UITableKeyboardHandler`, `NavigationManager`, `cellRange`, `clipboardCut`, `gridClipboard`, `ViewIntent`, `DefaultGridSession`, `docs/keyboard.md`, `MIGRATION.md`, tests
- **انجام شد:**
  - `Ctrl+X` → cut (copy + clear cells، یک undo)
  - `Home`/`End` per row؛ `Ctrl+Home`/`Ctrl+End` grid corners
  - `Ctrl+Shift+Arrow` → extend range to edge
  - `@deprecated D18` on Alt+C/X/V؛ MIGRATION + codemod note
- **محدودیت آگاهانه / نشد:** —
- **اثر روی کارت امتیاز:** دستهٔ ۶ ۴٫۵ → **۷**؛ جمع ۶۰٫۵ → **۶۳**
- **Verify:**
  - `yarn test` → ۹۸ فایل / ۵۳۵ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۶٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۸٫۱۹ KB / ۶۵ KB — پاس
- **بعدی:** `PR-110` ✅

### PR-110 — pin هر ستون (D19)

- **هدف:** `ColumnDef.pinned: 'start' | 'end'` برای هر ستون؛ سه ناحیهٔ رندر؛ RTL-aware sticky؛ سازگار با مجازی‌سازی ستون
- **فایل‌ها:** `engine/dataOps/columnPin.ts`, `ui/columnPin.ts`, `columnWindow`, `ColumnWindowCells`, `ColumnViewport`, header/body/footer/virtual, CSS, docs/tests
- **انجام شد:**
  - partition start / scroll / end؛ offset تجمعی sticky
  - viewport محاسبه با `pinnedEndWidth`
  - index همیشه `start` (D19 جانشین D10)
- **محدودیت آگاهانه / نشد:** موبایل هنوز pin offset کامل ندارد (دسکتاپ + مجازی کامل)
- **اثر روی کارت امتیاز:** دستهٔ ۵ ۳٫۵ → **۵**؛ جمع ۶۳ → **۶۴٫۵**
- **Verify:**
  - `yarn test` → ۱۰۰ فایل / ۵۴۴ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۷٫۶ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۸٫۹۸ KB / ۶۵ KB — پاس
- **بعدی:** `PR-111` ✅

### PR-111 — hide/show ستون در runtime

- **هدف:** `api.setColumnVisible` + `ColumnDef.hide` واکنشی؛ RBAC `visibility.never` قابل override نیست
- **فایل‌ها:** `columnVisibility.ts`, `SET_COLUMN_VISIBLE`, `createGridApi`, `useERPTable`, `mapColumnDef`, `isInitiallyHidden`, docs/tests
- **انجام شد:**
  - `setColumnVisible` / `applyColumnState.hide`
  - `ColumnDef.hide` در create + effect واکنشی
  - `visibility.kind === 'never'` و index قفل
- **محدودیت آگاهانه / نشد:** منوی ستون برای hide هنوز PR-114
- **اثر روی کارت امتیاز:** دستهٔ ۵ ۵ → **۶**؛ جمع ۶۴٫۵ → **۶۵٫۵**
- **Verify:**
  - `yarn test` → ۱۰۱ فایل / ۵۵۲ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۷٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۹٫۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-112` ✅

### PR-112 — auto-size و flex

- **هدف:** `api.autoSizeColumns()` با canvas off-DOM؛ `sizeColumnsToFit()`؛ `ColumnDef.flex`؛ دابل‌کلیک هندل resize
- **فایل‌ها:** `columnAutoSize.ts`, `columnLayout.ts`, `columnMeasure.ts`, `columnWindow`, `ColumnResizeHandle`, `createGridApi`, `UITableController`, docs/tests
- **انجام شد:**
  - `autoSizeColumns(colIds?)` — header + cell text → `RESIZE_COLUMN`
  - `sizeColumnsToFit(containerWidth?)` — scale to scrollport
  - `ColumnDef.flex` via `columnDef` bridge؛ layout در `ColumnWindowProvider`
  - دابل‌کلیک `ColumnResizeHandle` → auto-size همان ستون
- **محدودیت آگاهانه / نشد:** flex فقط وقتی session width صریح ندارد؛ موبایل flex کامل نشده
- **اثر روی کارت امتیاز:** دستهٔ ۵ ۶ → **۷**؛ جمع ۶۵٫۵ → **۶۶٫۵**
- **Verify:**
  - `yarn test` → ۱۰۳ فایل / ۵۶۲ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۷٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۹٫۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-113` ✅

### PR-113 — column groups (هدر چندسطحی)

- **هدف:** `ColumnGroupDef { headerName, children, marryChildren? }`؛ هدر چندردیفه؛ collapse؛ `aria-colspan`؛ reorder در سطح گروه
- **فایل‌ها:** `ColumnGroupDef.ts`, `flattenColumnDefs.ts`, `columnGroups.ts`, `ColumnGroupHeaderRows.tsx`, `ERPTableHeader`, `ViewStateBuilder`, docs/tests
- **انجام شد:**
  - `ColDefOrGroup` در `columnDefs`؛ flatten به `ColumnSchema.columnGroup`
  - `ColumnGroupHeaderRows` با `aria-colspan` و toggle collapse (`TOGGLE_COLUMN_GROUP`)
  - drag گروه → `resolveGroupBlockReorder` + `COLUMN_REORDERED`
  - reorder ستون داخل گروه با drag موجود
- **محدودیت آگاهانه / نشد:** `marryChildren` فقط در metadata؛ موبایل بدون group header
- **اثر روی کارت امتیاز:** دستهٔ ۵ ۷ → **۸**؛ جمع ۶۶٫۵ → **۶۷٫۵**
- **Verify:**
  - `yarn test` → ۱۰۵ فایل / ۵۷۱ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn typecheck:host-ui` → پاس
  - `yarn lint:publish` → پاس
  - `yarn verify:dist` → gzip ۵۹٫۱ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۰٫۵۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-115` — `columnState` persist

### PR-114 — منوی ستون (⋮)

- **هدف:** منوی `⋮` روی هدر ستون: sort asc/desc/none، فیلتر، hide، pin start/end/none، auto-size، «تنظیم ستون‌ها»؛ `columnMenuItems` + `onColumnMenuAction` برای سفارشی‌سازی
- **فایل‌ها:** `columnMenu.ts`, `columnPinPolicy.ts`, `ColumnMenuPopover.tsx`, `ColumnsPanelPopover.tsx`, `ERPTableHeader`, `Table.setColumnPinned`, `SET_COLUMN_PIN`, docs/tests
- **انجام شد:**
  - `ColumnMenuPopover` با آیتم‌های built-in + keyboard (Arrow/Enter/Esc) + `useThemePortalStyle`
  - `ColumnsPanelPopover` برای toggle visibility همهٔ ستون‌ها
  - runtime pin via `SET_COLUMN_PIN` / `Table.setColumnPinned`
  - `columnMenuItems` trim/reorder defaults؛ custom items → `onColumnMenuAction`
- **محدودیت آگاهانه / نشد:** index column pin/hide غیرقابل تغییر؛ موبایل بدون ⋮ menu
- **اثر روی کارت امتیاز:** دستهٔ ۵ ۸ → **۹**؛ جمع ۶۷٫۵ → **۶۸٫۵**
- **Verify:**
  - `yarn test` → ۱۰۷ فایل / ۵۸۲ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۶۱٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۳٫۲۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-115` ✅

### PR-115 — `columnState` ذخیره و بازگردانی

- **هدف:** `getColumnState` / `applyColumnState` با pin + sort؛ persist اختیاری `stateKey` (localStorage) و رخداد `COLUMN_STATE_CHANGED`
- **فایل‌ها:** `columnState.ts`, `columnStatePersist.ts`, `createGridApi`, `bootstrap/index`, `ViewStateBuilder` (pin در fingerprint)، event catalog، docs/tests
- **انجام شد:**
  - `GridColumnState` شامل `pinned` / `sort` / `sortIndex`
  - `applyColumnState` اعمال pin + sort (علاوه بر width/hide/order)
  - `stateKey` → restore هنگام `createGrid`؛ debounce ذخیره در localStorage + emit EventStore
  - fingerprint ستون‌ها pin را هم invalidate می‌کند
- **محدودیت آگاهانه / نشد:** بدون `stateKey` persist نیست؛ restore از EventStore-only پیاده نشده
- **اثر روی کارت امتیاز:** دستهٔ ۵ کامل (`columnState` ✅)؛ جمع بدون تغییر **۶۸٫۵**
- **Verify:**
  - `yarn test` → ۱۰۹ فایل / ۵۹۰ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۶۱٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۳٫۲۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-116` ✅

### PR-116 — ردیف‌های pin بالا/پایین

- **هدف:** `pinnedTopRowData` / `pinnedBottomRowData` خارج از مجازی‌سازی؛ فوتر aggregation سالم
- **فایل‌ها:** `pinnedRows.ts`, `ERPTablePinnedRows.tsx`, `DesktopTable`, `gridRoles`, `erp-table.css`, docs/tests
- **انجام شد:**
  - sticky `tbody` بالا (زیر هدر) و پایین (بالای فوتر) با `--erp-pinned-*-offset`
  - display-only از host objects؛ وارد UI row index / sort / filter / selection نمی‌شوند
  - `aria-rowcount` / rowindex با offset پین
  - فوتر همچنان `ColumnTotalsIndex`
- **محدودیت آگاهانه / نشد:** موبایل بدون pinned rows؛ ویرایش روی ردیف پین نیست
- **اثر روی کارت امتیاز:** Phase 21 کامل؛ جمع بدون تغییر **۶۸٫۵**
- **Verify:**
  - `yarn test` → ۱۱۱ فایل / ۵۹۹ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۶۲٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۴٫۳۳ KB / ۶۵ KB — پاس
- **بعدی:** `PR-117` — RFC-002 (گِیت قبل از aggregation)

### PR-117 — RFC-002 (Accepted)

- **هدف:** سند تصمیم برای aggregation عمومی + grouping تک‌سطحی قبل از PR-118+
- **فایل‌ها:** `docs/rfc/RFC-002-aggregation-grouping.md`, `docs/__tests__/rfc-002.spec.ts`
- **انجام شد:**
  - مدل داده، EventStore (بدون رخداد group)، undo، مجازی‌سازی، export
  - **Accept کاربر** با پیام continue (۱۴۰۵/۰۶/۲۵) در WORKLOG ثبت شد
- **Verify:** تست RFC + Status=Accepted — پاس
- **بعدی:** `PR-118` ✅

### PR-118 — موتور aggregation

- **هدف:** `engine/dataOps/aggregation.ts` با aggFunc افزایشی و دقت عدد صحیح
- **فایل‌ها:** `aggregation.ts`, `ColumnDef.aggFunc`, `mapColumnDef`, publish exports, tests
- **انجام شد:**
  - `sum|avg|min|max|count|first|last` + custom fn
  - `toMinorUnits` / `ColumnAggIndex.patch` O(1) برای sum/avg/count
  - round-trip `aggFunc` روی ColumnDefBridge
- **محدودیت آگاهانه / نشد:** فوتر UI هنوز `ColumnTotalsIndex` (PR-119)؛ first/last/min-extreme → rebuild
- **اثر روی کارت امتیاز:** بدون تغییر تا فوتر/grouping وصل شود (**۶۸٫۵**)
- **Verify:**
  - `yarn test` → ۱۱۳ فایل / ۶۰۷ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۶۲٫۹ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۴٫۳۹ KB / ۶۵ KB — پاس
- **بعدی:** `PR-119` ✅

### PR-119 — فوتر از مدل aggregation

- **هدف:** `ERPTableFooter` از `ColumnDef.aggFunc`؛ چند ردیف با `footerRows`
- **فایل‌ها:** `ViewStateBuilder` (`ColumnAggIndex`), `ERPTableFooter`, `DesktopTable`, `footerRows` prop, tests
- **انجام شد:**
  - `getColumnAggs` / `subscribeColumnAggs` / `getColumnAggValue`
  - ستون با `aggFunc: 'avg'` → میانگین؛ بدون aggFunc → خالی (وقتی حداقل یک aggFunc هست)
  - legacy: بدون هیچ aggFunc → sum روی price/number
  - `footerRows` چندردیفه با override
- **محدودیت آگاهانه / نشد:** موبایل فوتر agg ساده؛ label فقط روی ستون index
- **اثر روی کارت امتیاز:** بدون تغییر (**۶۸٫۵**) تا grouping
- **Verify:**
  - `yarn test` → ۱۱۴ فایل / ۶۱۱ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۶۳٫۳ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۴٫۸۳ KB / ۶۵ KB — پاس
- **بعدی:** `PR-120` — grouping تک‌سطحی

### PR-120 — موتور grouping تک‌سطحی

- **هدف:** `groupBy` + ایندکس مسطح group/leaf با aggregation و expand/collapse (بدون UI chevron)
- **فایل‌ها:** `engine/dataOps/rowGrouping.ts`, `ViewStateBuilder`, `TableState`, commands/UI events, `GridApi`, `createGrid`/`useGrid` props, tests/docs
- **انجام شد:**
  - `buildGroupedFlatIndex` / `groupRowId` (negative sentinel) / `resolveActiveGroupField` (فقط سطح اول)
  - `SET_ROW_GROUP_COLUMNS` / `TOGGLE_ROW_GROUP` / `SET_GROUP_DEFAULT_EXPANDED` (session-only)
  - `getAllUIRows` شامل ردیف synthetic با `rowKind: 'group'` و سلول‌های agg
  - `groupBy` / `groupDefaultExpanded` روی `createGrid` و `useGrid`
  - تست نوع کالا + جمع گروه + ۱۰۰k collapsed زیر ۱۵s
- **محدودیت آگاهانه / نشد:** UI chevron / a11y = PR-121؛ export گروه = PR-122؛ چندسطح فعال نیست
- **اثر روی کارت امتیاز:** موتور grouping زنده؛ امتیاز UI تا PR-121
- **Verify:**
  - `yarn test` → ۱۱۵ فایل / ۶۲۳ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۶۳٫۴ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۴٫۹۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-121` — UI grouping

### PR-121 — UI grouping

- **هدف:** ردیف گروه با chevron، indent، a11y، کیبورد، انتخاب فرزندان
- **فایل‌ها:** `ERPTableGroupRow`, VirtualBody/Body (lazy), `UITableKeyboardHandler`, `SelectionManager`
- **انجام شد:**
  - `ERPTableGroupRow` با `aria-expanded` / `aria-level=1` و chevron
  - ArrowLeft جمع / ArrowRight باز روی ردیف گروه فعال
  - انتخاب گروه ⇒ انتخاب sentinel + همهٔ فرزندان
  - indent برگ‌ها با `paddingInlineStart` وقتی `groupBy` فعال است
  - lazy-load گروه برای بودجهٔ `.`
- **محدودیت آگاهانه / نشد:** export گروه/جمع = PR-122
- **اثر روی کارت امتیاز:** grouping UI زنده
- **Verify:**
  - `yarn test` → ۱۱۶ فایل / ۶۲۴ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۵۷٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۹٫۲۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-122` — صادرات با گروه و جمع (+ CSV)

### PR-122 — صادرات با گروه و جمع (+ CSV)

- **هدف:** `ExportSource` با kind/outline؛ Excel outline؛ PDF ردیف گروه؛ `./plugins/csv`
- **فایل‌ها:** `createEngineGridQuery`, `buildExportTable`/`buildXlsxBlob`, `packages/plugins/csv`, PluginHost format=csv
- **انجام شد:**
  - projection از flat UI index وقتی grouping فعال است
  - Excel `outlineLevel` روی `<row>`
  - PDF (TextPdfRenderer) پیشوند ▸ برای گروه
  - `CsvExportPlugin` + `buildCsvText` (ستون Group + BOM)
- **محدودیت آگاهانه / نشد:** Excel outline در Excel دستی باز نشده (فقط XML تست)؛ Vazirmatn PDF بدون bold اختصاصی گروه
- **اثر روی کارت امتیاز:** Phase 22 exit (agg + grouping + export)
- **Verify:**
  - `yarn test` → ۱۱۷ فایل / ۶۲۸ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۵۷٫۸ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۹٫۲۴ KB / ۶۵ KB؛ `./plugins/csv` ۱٫۴۶ KB — پاس
- **بعدی:** `PR-123` (Phase 23)

### PR-123 — تست a11y واقعی (axe-core)

- **هدف:** جایگزینی grep سورس با `jsdom` + `axe-core`؛ صفر violation سطح serious/critical؛ canary عمدی قرمز
- **فایل‌ها:** `ui/desktop/__tests__/grid-a11y.spec.tsx`, `DesktopTable` (treegrid), `eRPTableRow`/`MobileTableRow` (tabIndex=-1), `ERPTableFooter` (پایدارسازی rows)
- **انجام شد:**
  - axe روی گرید ۲۰ ردیف با sort/filter/pin/floatingFilter/footer؛ grouped → `role=treegrid`؛ منوی ستون؛ aria-rowcount
  - canary: دکمه بدون نام ⇒ serious|critical
  - `tabIndex={-1}` روی سلول‌ها (به‌جای index ستون > 0)
  - وقتی `rowKind=group` هست جدول `treegrid` می‌شود تا `aria-expanded`/`aria-level` معتبر باشند
  - رفع حلقهٔ بی‌نهایت فوتر: `resolveFooterRows` هر رندر آرایهٔ تازه می‌ساخت و `useEffect([rows])` را دوباره می‌زد
- **محدودیت آگاهانه / نشد:** مدیریت فوکوس تک‌tab-stop کامل = PR-124؛ live region = PR-125
- **اثر روی کارت امتیاز:** ادعای a11y از grep به DOM واقعی
- **Verify:**
  - `yarn vitest run ui/desktop/__tests__/grid-a11y.spec.tsx` → ۱۲ پاس
  - `yarn test` → ۱۱۷ فایل / ۶۳۴ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۵۸٫۰ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۹٫۳۴ KB / ۶۵ KB — پاس
- **بعدی:** `PR-124` — مدیریت فوکوس

### PR-124 — مدیریت فوکوس (APG)

- **هدف:** یک‌tab-stop روی گرید؛ Esc نردبان فوکوس؛ تله در مودال/منو؛ `:focus-visible` روی ادیتور
- **فایل‌ها:** `infrastructure/ui/focusTrap.ts`, `UITableKeyboardHandler`, `DesktopTable`/`MobileTable`, `ColumnMenuPopover`/`ColumnsPanelPopover`/`CustomModal`, `erp-table.css`, `grid-focus.spec.tsx`
- **انجام شد:**
  - `tabIndex={0}` + `aria-activedescendant` روی grid/treegrid؛ فوکوس اولیه اولین سلول
  - Tab در حالت ناوبری از گرید خارج می‌شود؛ Tab فقط هنگام فوکوس ادیتور سلول را جابه‌جا می‌کند
  - Esc: ادیتور → فوکوس گرید؛ فوکوس روی گرید → blur
  - `trapTabKey` در منوی ستون، پنل ستون‌ها، `CustomModal` (`role=dialog`)
  - کلاس `pdg-cell-editor` + حلقهٔ `:focus-visible`
- **محدودیت آگاهانه / نشد:** لغو ویرایش با Esc (بازگردانی مقدار) = PR-126؛ live region = PR-125
- **اثر روی کارت امتیاز:** الگوی APG فوکوس
- **Verify:**
  - `yarn vitest run ui/desktop/__tests__/grid-focus.spec.tsx` → پاس
  - `yarn test` → ۱۱۸ فایل / ۶۳۷ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۵۸٫۶ KB / ۶۵ — پاس
  - `yarn size` → `.` ۵۹٫۹۶ KB / ۶۵ KB — پاس
- **بعدی:** `PR-125` — اعلان live region

### PR-126 — لغو ویرایش و چرخهٔ ادیتور (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** draft نشست‌محور؛ `Esc` لغو بدون EventStore؛ `Enter` تأیید+پایین؛ `Tab` تأیید+کنار؛ props `singleClickEdit` / `stopEditingWhenCellsLoseFocus` / `editType: 'fullRow'`
- **فایل‌ها:** `engine/dataOps/cellEditSession.ts`, `engine/tableEngine.ts`, `ViewStateBuilder`, `UITableController`, `UITableKeyboardHandler`, `CellRenderer`, `createGridApi`, `bootstrap/{type,index}`, `engine/__tests__/cell-edit-session.spec.ts`, docs/keyboard/MIGRATION/CHANGELOG/gap-analysis
- **انجام شد:**
  - `cellEdit` روی `TableState` / view؛ typing → `patchDraft`؛ commit → `CHANGE_CELL_*`؛ cancel → discard
  - کیبورد: Esc cancel؛ Enter/Tab commit+move؛ F2 / double-click start؛ `api.stopEditing(cancel?)`
  - تست verify: Esc صفر `CELL_CHANGED` جدید؛ commit یک رخداد؛ fullRow + `onRowValueChanged`
- **محدودیت آگاهانه / نشد:** i18n locale pack = PR-127؛ `dateAdapter` = PR-128
- **اثر روی کارت امتیاز:** ویرایش ۷ → ۹؛ جمع ۶۸٫۵ → ۷۰٫۵
- **Verify:**
  - `yarn vitest run engine/__tests__/cell-edit-session.spec.ts` → پاس
  - `yarn test` → ۱۲۱ فایل / ۶۴۸ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۵۹٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۱٫۱ KB / ۶۵ KB — پاس
- **بعدی:** `PR-127` — i18n و locale pack

### PR-127 — i18n و locale pack (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** packs `fa`/`en`/`ar` روی `./locales/*`؛ Intl + `numberingSystem`؛ `dir` از locale با override؛ صفر رشتهٔ فارسی هاردکد در `ui/`
- **فایل‌ها:** `ui/locales/{fa,en,ar,types,index}.ts`, `ui/host/messages.ts`, `helper.ts`, DataGrid/host, chrome consumers, `publish/locales/*`, package exports, `locale-packs.spec.ts`
- **انجام شد:**
  - سه pack هم‌کلید؛ `resolveDirection` / `formatLocaleNumber` / `formatLocaleDate`
  - جایگزینی همهٔ رشته‌های UI هاردکد با `t(...)`
  - تست grep صفر فارسی در `ui/` (به‌جز `locales/` و fixtures)
- **محدودیت آگاهانه / نشد:** `DateAdapter` تعویض‌پذیر = PR-128
- **Verify:**
  - `yarn vitest run ui/locales/__tests__/locale-packs.spec.ts` → ۵ پاس
  - `yarn test` → ۱۲۲ فایل / ۶۵۳ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۵۹٫۷ KB / ۶۵ — پاس
  - `yarn size` → `.` ۶۱٫۱۷ KB / ۶۵ KB — پاس
- **بعدی:** `PR-128` — dateAdapter (D21)

### PR-128 — DateAdapter تعویض‌پذیر (D21) (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** port `DateAdapter`؛ `jalaliAdapter` / `gregorianAdapter`؛ DatePicker پیش‌فرض بدون peer؛ `react-persian-range-picker` اختیاری
- **فایل‌ها:** `application/ports/DateAdapter.ts`, `infrastructure/date/*`, `ui/primitives/DatePicker.tsx`, `ui/date/PersianRangeDatePicker.tsx`, host/`DataGrid`, `publish/date-picker-jalali.ts`, package peerDeps
- **انجام شد:**
  - parse/format/addDays/startOfMonth/compare برای جلالی و میلادی
  - ادیتور پیش‌فرض: `input type=date` (gregory) یا متن جلالی
  - subpath اختیاری `./date-picker-jalali`؛ `verify:dist` صفر reference در `.`
- **محدودیت آگاهانه / نشد:** تقویم اسلامی کامل به‌عنوان adapter سوم؛ سایت docs = PR-129
- **Verify:**
  - `yarn vitest run infrastructure/date/__tests__/date-adapter.spec.ts` → ۴ پاس
  - `yarn test` → ۱۲۳ فایل / ۶۵۷ تست — پاس
  - `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → gzip ۶۰٫۲ KB / ۶۵؛ صفر `react-persian-range-picker` در `.` — پاس
  - `yarn size` → `.` ۶۱٫۶۲ KB / ۶۵ KB — پاس
- **بعدی:** `PR-129` — سایت مستندات (Phase 24)

### PR-129 — سایت مستندات انگلیسی‌محور (D23) (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** VitePress روی GitHub Pages؛ Getting Started / Concepts / هر فیچر با مثال زنده؛ API Reference با TypeDoc از `publish/entry.ts`؛ انگلیسی منبع، فارسی ترجمه
- **فایل‌ها:** `website/` (VitePress + demos)، `typedoc.json`، `scripts/check-docs-links.mjs`، `docs/__tests__/docs-site.spec.ts`، `.github/workflows/ci.yml`، `package.json` scripts
- **انجام شد:**
  - `yarn docs:build` = TypeDoc → `website/public/api` + VitePress + لینک‌چک (۰ شکسته)
  - localeهای `root` (en) و `fa` (rtl)؛ ۱۱ صفحهٔ guide با `<LiveDemo>`
  - CI step `yarn docs:build`؛ honesty intro دوزبانه (D23)
- **محدودیت آگاهانه / نشد:** گالری ۱۲ مثال مستقل + StackBlitz = PR-130؛ deploy خودکار Pages هنوز دستی (`yarn deploy:docs`)
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ (مستندات/اعتماد) ۲ → ۴؛ جمع ۷۰٫۵ → **۷۲٫۵**
- **Verify:**
  - `yarn docs:build` → پاس؛ `docs link check: 0 broken relative links`
  - `yarn vitest run docs/__tests__/docs-site.spec.ts` → ۴ پاس
  - `yarn test` → ۱۲۴ فایل / ۶۶۱ تست — پاس
- **بعدی:** `PR-130` — گالری مثال

### PR-130 — گالری مثال (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** حداقل ۱۲ مثال مستقل و قابل‌کپی با لینک StackBlitz/CodeSandbox؛ `tsc` در CI
- **فایل‌ها:** `examples/gallery/**`, `docs/__tests__/examples-gallery.spec.ts`, CI `examples:typecheck`
- **انجام شد:**
  - ۱۲ ماژول: basic، sort/filter، editing+validation، selection/clipboard، virtual 100k، infinite/server، grouping+agg، theme dark، custom cell، export، jalali، history/audit
  - README با لینک StackBlitz per-file؛ `yarn examples:typecheck` در CI
- **محدودیت آگاهانه / نشد:** HistoryPanel محصولی = PR-136 (اینجا ViewModel API)؛ StackBlitz روی npm `0.5.0` است تا سورس محلی path-alias شود
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ ۴ → ۵؛ جمع ۷۲٫۵ → **۷۳٫۵**
- **Verify:**
  - `yarn examples:typecheck` → پاس
  - `yarn vitest run docs/__tests__/examples-gallery.spec.ts` → ۳ پاس
  - `yarn test` → ۱۲۵ فایل / ۶۶۴ تست — پاس
- **بعدی:** `PR-131` — MIGRATION.md و codemod

### PR-131 — MIGRATION.md و codemod (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** جدول قدیم→جدید برای D13–D22؛ `npx persian-data-grid-codemod`؛ fixture 0.5 بعد از codemod کامپایل شود
- **فایل‌ها:** `packages/codemod/**`, `MIGRATION.md` (master table), `scripts/codemod-fixture-0.5/**`, `scripts/codemod-v0.7.mjs` (compat), `docs/__tests__/codemod-v0.7.spec.ts`
- **انجام شد:**
  - پکیج `persian-data-grid-codemod` با bin CLI
  - بازنویسی D13/D15/D16/D18/D24 (+ CSS tokens)؛ D22 فقط در جدول به‌عنوان باز
  - Verify: transform + `tsc` روی fixture کپی‌شده
- **محدودیت آگاهانه / نشد:** D22 هنوز باز — قبل از PR-132 بپرس؛ انتشار جداگانهٔ پکیج codemod روی npm تا 1.0
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ بدون تغییر جمع **۷۳٫۵** (ابزار مهاجرت؛ امتیاز اکوسیستم در PR-134)
- **Verify:**
  - `yarn vitest run docs/__tests__/codemod-v0.7.spec.ts` → ۴ پاس (شامل tsc fixture)
  - `yarn test` → ۱۲۵ فایل / ۶۶۷ تست — پاس
- **بعدی:** `PR-132` — **D22 بپرس** یا `PR-133` e2e اگر monorepo را فعلاً رد کنیم

### PR-133 — تست e2e و رگرسیون بصری (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** Playwright برای ویرایش+undo، clipboard، اسکرول ۱۰۰k، sort/filter، Excel download؛ تم روشن/تیره و RTL/LTR
- **فایل‌ها:** `e2e/**`, `scripts/e2e-flake-check.mjs`, `.github/workflows/ci.yml` (job `e2e`), `docs/__tests__/e2e-playwright.spec.ts`
- **انجام شد:**
  - harness Vite روی پورت ۵۱۸۰؛ ۱۰ تست سبز لوکال
  - CI: `yarn playwright install --with-deps chromium` + `yarn e2e`
  - `yarn e2e:flake` برای ۱۰ اجرا (آستانهٔ <۱٪)
  - visual: theme/dir assert + PNG attach (پیکسل‌بیس‌لاین بین‌سیستمی در این PR عمداً سخت نشد)
- **محدودیت آگاهانه / نشد:** D22/PR-132 هنوز باز؛ pixel golden files چند-OS بعداً؛ لوکال از system Chrome (`channel: chrome`) به‌خاطر timeout دانلود Playwright browser
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ ۵ → ۶؛ جمع ۷۳٫۵ → **۷۴٫۵**
- **Verify:**
  - `yarn e2e` → ۱۰ پاس
  - `yarn vitest run docs/__tests__/e2e-playwright.spec.ts` → ۲ پاس
  - `yarn test` → ۱۲۶ فایل / ۶۶۹ تست — پاس
- **بعدی:** `PR-134` (D25 semver) یا تصمیم D22 برای `PR-132`

### PR-134 — سیاست semver و انتشار (D25) (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** سیاست نسخه‌گذاری در CONTRIBUTING، changesets، provenance، release note از CHANGELOG، کانال `next`؛ track `0.13.0-next.0`
- **فایل‌ها:** `CONTRIBUTING.md`, `.changeset/**`, `scripts/extract-changelog.mjs`, `scripts/release-next-dry.mjs`, `.github/workflows/release.yml`, `package.json` (`0.13.0-next.0`), `CHANGELOG.md`, `docs/__tests__/semver-release.spec.ts`
- **انجام شد:**
  - بخش Versioning (D25) + اسکriptهای `changeset*` / `release:notes` / `release:next:dry`
  - workflow: `--tag next` برای prerelease، `--tag latest` برای stable، provenance، GitHub Release از CHANGELOG
  - dry-run محلی بدون upload (`npm pack` + `publish --dry-run --ignore-scripts`)
- **محدودیت آگاهانه / نشد:** انتشار واقعی به npm نیاز به `NPM_TOKEN` + تگ `v0.13.0-next.0` دارد؛ D22/PR-132 هنوز باز؛ `release-gate` = PR-135
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ ۶ → ۶٫۵؛ جمع ۷۴٫۵ → **۷۵**
- **Verify:**
  - `yarn release:next:dry` → `persian-data-grid@0.13.0-next.0 (tag next)`
  - `yarn vitest run docs/__tests__/semver-release.spec.ts` → ۲ پاس
  - `yarn test` → ۱۲۷ فایل / ۶۷۱ تست — پاس
- **بعدی:** `PR-135` (release-gate؛ باید امروز قرمز باشد) یا تصمیم D22 برای `PR-132`

### PR-135 — گِیت انتشار `1.0.0` (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** `scripts/release-gate.mjs` از چک‌لیست §۴؛ امروز باید قرمز با دلیل دقیق؛ `1.0.0` فقط با گِیت سبز
- **فایل‌ها:** `scripts/release-gate.mjs`, `docs/__tests__/release-gate.spec.ts`, `.github/workflows/ci.yml` (`continue-on-error`), `package.json` `release:gate`
- **انجام شد:**
  - چک‌ها: امتیاز عمومی ≥۷۰، تمایز ≥۹۰، gzip ≤۶۵ و ≤۶۰ (§۴)، axe suite، بودجه ۱۰۰k، صفر `any` در `.d.ts`، honesty README، ≥۱۲ مثال، `packages/core` (D22)
  - خروجی امروز قرمز با ۳ FAIL مشخص
- **محدودیت آگاهانه / نشد:** گِیت در CI نرم است تا سبز شود؛ انتشار `1.0.0` هنوز ممنوع؛ D22/PR-132 باز
- **اثر روی کارت امتیاز:** دستهٔ ۱۰ ۶٫۵ → ۷؛ جمع ۷۵ → **۷۵٫۵**
- **Verify:**
  - `yarn release:gate` → RED — `scorecard-diff` (۸۱<۹۰)، `bundle-60kb` (۶۱۶۱۷>۶۱۴۴۰)، `monorepo-core`
  - `yarn vitest run docs/__tests__/release-gate.spec.ts` → ۲ پاس
  - `yarn test` → ۱۲۸ فایل / ۶۷۳ تست — پاس
- **بعدی:** `PR-132` فقط با تصمیم D22؛ وگرنه Phase 25 `PR-136`

### PR-136 — پنل تاریخچه/Audit محصولی (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** `<GridHistoryPanel />` روی `HistoryPanelViewModel`: تایم‌لاین، فیلتر severity/category، پرش به سلول، restore مقدار قبلی
- **فایل‌ها:** `ui/history/GridHistoryPanel.tsx`, CSS، locales fa/en/ar، `publish/entry.ts`, gallery `historyAudit.tsx`, `ui/history/__tests__/grid-history-panel.spec.tsx`
- **انجام شد:**
  - سابسکرایب به `getHistoryItems` / `subscribeHistoryItems`
  - کلیک → `revealRow` + `UI_ACTIVE_CELL`
  - Restore برای `CELL_CHANGED` با `previousValue` (پس از `cancelCellEdit`)
  - مثال گالری به کامپوننت محصولی مهاجرت کرد
- **محدودیت آگاهانه / نشد:** بازگردانی نقطه‌ای کاملِ event-stream (undo تا eventId) نیست — فقط restore مقدار قبلی سلول؛ D22/PR-132 باز
- **اثر روی کارت امتیاز:** Audit ۲۰ → ۲۳؛ تمایز ۸۱ → **۸۴**؛ عمومی بدون تغییر **۷۵٫۵**
- **Verify:**
  - `yarn vitest run ui/history/__tests__/grid-history-panel.spec.tsx` → ۱ پاس
  - `yarn size` → main **۶۳٫۴۶ KB** gzip (سقف ۶۵)
  - `yarn examples:typecheck` → پاس
  - `yarn test` → ۱۲۹ فایل / ۶۷۵ تست — پاس
- **بعدی:** `PR-137` آفلاین قابل‌دیدن

### PR-137 — حالت آفلاین قابل‌دیدن (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** نشانگر آنلاین/آفلاین، صف تغییرات معلق («N تغییر ذخیره‌نشده»)، بازیابی پس از refresh از IndexedDB/repo
- **فایل‌ها:** `application/offline/OfflineStatus.ts`, `infrastructure/offline/*`, `ui/offline/GridOfflineStatus.tsx`, gallery `offlineStatus.tsx`, تست‌ها
- **انجام شد:**
  - `OfflineStatus` + injectable `connectivity` / watermark
  - UI badge + pending queue؛ `api.getConnectivity` / `getPendingChangeCount` / `markPendingSynced`
  - Verify remount با shared `repo` + `eventStore` مقدار سلول را برمی‌گرداند
- **محدودیت آگاهانه / نشد:** همگام‌سازی واقعی سرور = PR-138 (`markSynced` فعلاً دستی/آمادهٔ SyncPort)؛ snapshot catch-up همچنان opt-in (D7)
- **اثر روی کارت امتیاز:** Offline ۱۶ → ۱۸؛ تمایز ۸۴ → **۸۶**
- **Verify:**
  - `yarn vitest run application/__tests__/offline-status.spec.ts ui/offline/__tests__` → ۴ پاس
  - `yarn size` → main **۶۴٫۰۲ KB** gzip (سقف ۶۵)
  - `yarn examples:typecheck` → پاس
  - `yarn release:gate` → RED (diff ۸۶<۹۰، bundle>۶۰KB، monorepo)
  - `yarn test` → ۱۳۱ فایل / ۶۸۰ تست — پاس
- **بعدی:** `PR-138` SyncPort

### PR-138 — Port همگام‌سازی و حل تعارض (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** push/pull رخدادها بین کلاینت‌ها، تشخیص تعارض سلول، سه سیاست LWW / serverWins / manual با UI
- **فایل‌ها:** `application/ports/SyncPort.ts`, `application/sync/*`, `infrastructure/sync/InMemorySyncHub.ts`, `ui/sync/GridSyncPanel.tsx`, gallery `syncConflicts.tsx`, تست‌ها
- **انجام شد:**
  - `GridSyncService` روی `OfflineStatus` + `EventStore` + `SyncTransport`
  - `createGrid({ syncTransport, syncConflictPolicy })`؛ `api.sync` / `setSyncPolicy` / `resolveSyncConflict`
  - `<GridSyncPanel />` روی `.`؛ `InMemorySyncHub` / `GridSyncService` روی `/headless` (سقف ۶۵KB)
  - تست دوکلاینته برای هر سه سیاست
- **محدودیت آگاهانه / نشد:** transport واقعی WebSocket نیست (hub حافظه‌ای برای تست/دمو)؛ presence = PR-139؛ D22/PR-132 باز
- **اثر روی کارت امتیاز:** Offline ۱۸ → ۲۰؛ تمایز ۸۶ → **۸۸**؛ عمومی بدون تغییر **۷۵٫۵**
- **Verify:**
  - `yarn vitest run application/__tests__/sync-port.spec.ts ui/sync/__tests__` → ۸ پاس
  - `yarn size` → main **۶۴٫۹۴ KB** gzip (سقف ۶۵؛ UI بعداً به `/sync` منتقل شد در PR-139)
  - `yarn examples:typecheck` → پاس
  - `yarn test` → ۱۳۳ فایل / ۶۸۹ تست — پاس
- **بعدی:** `PR-139` حضور و هم‌ویرایشی

### PR-139 — حضور و هم‌ویرایشی (۱۶ سپتامبر ۲۰۲۶)

- **هدف:** کرسر/فوکوس کاربران دیگر با transport تعویض‌پذیر؛ دو session در یک تب؛ ویرایش سلول‌های مختلف بدون تعارض
- **فایل‌ها:** `application/ports/PresencePort.ts`, `application/presence/*`, `infrastructure/presence/*`, `ui/presence/GridPresencePanel.tsx`, `publish/presence.ts` + `publish/sync.ts`, gallery `presencePeers.tsx`
- **انجام شد:**
  - `GridPresenceService` + `InMemoryPresenceHub` / `BroadcastChannel` (`presence: true`)
  - `api.getPresencePeers`؛ focus سلول از طریق controller broadcast می‌شود
  - UI روی `persian-data-grid/presence`؛ `GridSyncPanel` به `persian-data-grid/sync` منتقل شد تا سقف ۶۵KB حفظ شود
- **محدودیت آگاهانه / نشد:** WebSocket واقعی نیست؛ CRDT ادغام مقدار سلول نیست (فقط presence)؛ قالب PDF = PR-141؛ D22 باز
- **اثر روی کارت امتیاز:** تمایز بدون تغییر عددی بزرگ (presence Tier2)؛ عمومی **۷۵٫۵**؛ تمایز **۸۸**
- **Verify:**
  - `yarn vitest run application/__tests__/presence-port.spec.ts ui/presence/__tests__` → پاس
  - `yarn size` → main **۶۴٫۲۶ KB** gzip (سقف ۶۵)
  - `yarn examples:typecheck` → پاس
  - `yarn test` → ۱۳۵ فایل / ۶۹۳ تست — پاس
- **بعدی:** `PR-140` اکوسیستم تاریخ و مالی فارسی

### PR-140 — اکوسیستم تاریخ و مالی فارسی (۱۷ سپتامبر ۲۰۲۶)

- **هدف:** تقویم/بازهٔ جلالی داخلی بدون peer؛ دورهٔ مالی؛ تعطیلات؛ ریال/تومان؛ حروف‌نویسی فارسی؛ دمو سند
- **فایل‌ها:** `infrastructure/finance/*`, `infrastructure/date/jalaliCalendarModel.ts`, `ui/date/*`, `publish/finance.ts`, `publish/date-picker-jalali.ts`, gallery `documentFinance.tsx`, locales `date.*`
- **انجام شد:**
  - `persian-data-grid/finance`: `formatPrice` / `rialToToman` / `numberToPersianWords` / FY / holidays / `nextBusinessDay`
  - `persian-data-grid/date-picker-jalali`: `JalaliCalendar` + `PersianRangeDatePicker` / `PersianRangeDateCell` (بدون `react-persian-range-picker`)
  - `ColumnDef.currencyUnit` با formatter پیش‌فرض تومان/ریال
  - مثال گالری `16 · Document / finance`
- **محدودیت آگاهانه / نشد:** تعطیلات قمری متغیر سال‌به‌سال کامل نیستند (فقط ثابت شمسی + `extra`)؛ قالب PDF سند = PR-141؛ D22 باز
- **اثر روی کارت امتیاز:** جلالی/RTL/PDF ۲۲ → **۲۴**؛ تمایز ۸۸ → **۹۰**؛ عمومی **۷۵٫۵**
- **Verify:**
  - `yarn vitest run infrastructure/finance ui/date infrastructure/date docs/__tests__/subpath-exports docs/__tests__/public-api-honesty` → ۱۰۳ پاس
  - `yarn size` → main **۶۴٫۶۷ KB** gzip؛ `/finance` ۱٫۵۸ KB؛ `/date-picker-jalali` ۳٫۲۵ KB
  - `yarn examples:typecheck` / `yarn typecheck:publish` → پاس
  - `yarn verify:dist` → صفر `react-persian-range-picker` در `.`
- **بعدی:** `PR-141` قالب PDF سند

### PR-141 — قالب PDF سند (۱۷ سپتامبر ۲۰۲۶)

- **هدف:** ارتقای `VazirmatnPdfRenderer` به موتور قالب سند ERP (سربرگ/پابرگ/لوگو/شماره صفحه/تکرار هدر/امضا/مهر/جمع صفحه)
- **فایل‌ها:** `packages/plugins/pdf/src/documentTemplate.ts`, `VazirmatnPdfRenderer.ts`, `pdfBuilder.ts`, `PdfExportPlugin.ts`, `publish/plugins/pdf.ts`, gallery `documentPdf.tsx`, `__tests__/document-template.spec.ts`
- **انجام شد:**
  - `DocumentPdfTemplate` + `PdfExportPlugin({ template })`
  - لوگو JPEG (`/DCTDecode` XObject)، شمارهٔ صفحه، تکرار هدر جدول، جعبهٔ امضا/مهر، جمع ستونی در هر صفحه
  - تست snapshot با SHA-256 پایدار روی بایت‌های PDF + مارکرهای ساختاری
  - مثال گالری `17 · Document PDF`
- **محدودیت آگاهانه / نشد:** لوگو فقط JPEG (نه PNG)؛ مهر تصویری واقعی نیست (جعبهٔ برچسب‌دار)؛ D22/PR-132 باز
- **اثر روی کارت امتیاز:** جلالی/RTL/PDF ۲۴ → **۲۶**؛ تمایز ۹۰ → **۹۲**؛ عمومی **۷۵٫۵**
- **Verify:**
  - `yarn vitest run packages/plugins/pdf/__tests__` → ۸ پاس
  - بازرسی چشمی (content stream): لوگو `/Im1 Do`، دو صفحه، خطوط امضا، جمع صفحه، شمارهٔ صفحه — ثبت در تست SHA-256 پایدار
  - `yarn examples:typecheck` / `yarn typecheck:publish` → پاس
  - `yarn size` → main **۶۴٫۶۴ KB** gzip (سقف ۶۵)
  - `yarn verify:dist` → پاس
- **بعدی:** `PR-132` فقط پس از تصمیم **D22** (بپرس)

### D22 — تعویق monorepo (۱۷ سپتامبر ۲۰۲۶ / ۱۴۰۵/۰۶/۲۶)

- **هدف:** قفل تصمیم باز؛ بستن بلوکر طرح v2 بدون شکستن ساختار فعلی
- **فایل‌ها:** `EXECUTION_PLAN.md`, `WORKLOG.md`, `docs/agent-handoff.md`, `MIGRATION.md`, `scripts/release-gate.mjs`, `docs/__tests__/release-gate.spec.ts`, `docs/ag-grid-gap-analysis.md`
- **انجام شد:**
  - کاربر: monorepo فعلاً نه؛ تک‌پکیج React می‌ماند؛ headless جدا = بدهی بعدی
  - `PR-132` ⏸ تعویق تا پس از `1.0.0`
  - `release-gate`: `monorepo-core` waived؛ سقف سخت = ۶۵ KB (D15)؛ §۴ ۶۰ KB stretch waived
- **محدودیت آگاهانه / نشد:** `engine/type.ts` هنوز به `ui/type` وابسته است؛ `@persian-data-grid/core` ساخته نشد؛ تگ واقعی `1.0.0` روی npm جداگانه است
- **اثر روی کارت امتیاز:** بدون تغییر عددی (عمومی **۷۵٫۵**؛ تمایز **۹۲**)
- **Verify:**
  - `yarn release:gate` → **GREEN** — همهٔ چک‌ها PASS (monorepo waived؛ ۶۰KB stretch waived؛ ۶۵KB پاس)
  - `yarn vitest run docs/__tests__/release-gate.spec.ts` → ۲ پاس
- **بعدی:** تگ `1.0.0` اختیاری (نیاز `NPM_TOKEN`)؛ `PR-132` فقط اگر کاربر از تعویق D22 خارج کند

