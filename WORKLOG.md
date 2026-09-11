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

- **نسخهٔ منتشرشده روی npm:** `persian-data-grid@0.5.0` (۱۰ سپتامبر ۲۰۲۶) — ۱۲۹ دانلود در هفته
- **طرح فعال:** `EXECUTION_PLAN.md` v2 — **Phase 16** (Truth, Packaging, CI)
- **PR بعدی برای ایجنت:** `PR-77` — CSS صریح و رفع `sideEffects` (D16)
- **آخرین PR تمام‌شده:** `PR-76` — شکستن bundle: subpath exports (D15)
- **گِیت اجباری:** `PR-72` … `PR-75` ✅
- **بلوکر:** ندارد. `D13 … D21` و `D23 … D25` در ۱۴۰۵/۰۶/۲۰ **قفل** شدند. تنها تصمیم باز `D22` (monorepo) است که به `PR-132` در Phase 24 مربوط می‌شود — راه کل Phase 16 تا 23 باز است.

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
| D22 | **باز** — monorepo، قبل از `PR-132` بپرس |
| D23 | مستندات انگلیسی منبع، فارسی ترجمه |
| D24 | `createGrid()` sync + `grid.ready`؛ `createERPTable()` alias منسوخ |
| D25 | `0.6 … 0.13` با CHANGELOG و MIGRATION؛ `1.0.0` فقط با `release-gate` سبز |
- **طرح قدیم:** Phase 1 … Phase 15 (PR-1 … PR-71) بسته و آرشیو شده — فقط bugfix

### امتیاز فعلی

| محور | امتیاز | مرجع |
|------|--------|------|
| Data Grid عمومی (در برابر ag-grid = ۹۶) | **۳۵ / ۱۰۰** | `docs/ag-grid-gap-analysis.md` §۲ |
| تمایز سازمانی/فارسی (در برابر ag-grid = ۱۶) | **۸۱ / ۱۰۰** | همان §۲ |

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
- **بدهی:** CSS در **دو فایل تکرار شده** (`ui/styles/injectStyles.ts` و `ui/styles/erp-table.css`) و دستی sync می‌شود → `PR-77`.

### ۱.۶ صادرات و واردات

- **xlsx واقعی OOXML** (نه CSV با پسوند xlsx): `packages/plugins/excel/src/buildXlsxBlob.ts` با ZIP خودی روی `fflate`. export + import + دکمهٔ تولبار (PR-29، PR-68).
- **PDF فارسی با رندرر خودنوشت:** CIDFontType2 / Identity-H، shaping RTL، فونت Vazirmatn (OFL) embedded، **بدون jsPDF** (PR-65، PR-66). دکمهٔ تولبار (PR-67).
- `PluginHost` + `GridPlugin` روی `EXPORT_REQUESTED` در stream view؛ پلاگین دامنه را mutate نمی‌کند (PR-29).

### ۱.۷ دسترس‌پذیری پایه

- `role="grid"` / `row` / `gridcell` / `columnheader`، `aria-colindex` / `aria-rowindex` یک‌پایه (در مجازی: ایندکس مطلق)، `aria-selected`، `aria-activedescendant` (PR-62، PR-63).
- `aria-label` روی دکمه‌های آیکونی تولبار از `messages`؛ `:focus-visible` با `--erp-accent` (PR-64).
- **محدودیت:** تست a11y فقط **grep متنی روی سورس** است، نه axe → `PR-123`.

### ۱.۸ مسیر انتشار

- `tsup` واقعی، ESM + CJS + sourcemap، DTS خودکار strict از `publish/entry.ts` (PR-28، PR-35، PR-36).
- `typecheck:publish` (graph انتشار) + `typecheck:host-ui` + `verify:dist` در `prepublishOnly` (PR-36، PR-38).
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
| مرتب‌سازی ستون | `engine/ViewStateBuilder.ts:110-116` ترتیب سخت به سلول `index` | PR-89 … PR-91 |
| فیلتر ستون / quick filter حذف‌کننده | هیچ filter model در ریپو نیست؛ `GridSearchPanel` فقط find & navigate | PR-92 … PR-95 |
| کلیپ‌بورد سیستم و paste از Excel | `application/handlers/rowCommandsHandler.ts:123-140` فقط `table.addRow` | PR-106، PR-107 |
| انتخاب بازهٔ سلولی، fill handle | مدل انتخاب فقط ردیف است | PR-104، PR-105، PR-108 |
| مجازی‌سازی ستون | همهٔ ستون‌های visible در هر ردیف رندر می‌شوند | PR-98 |
| مدل ردیف server-side / infinite | همهٔ ردیف‌ها در حافظه | PR-96، PR-102 |
| مدل دادهٔ جنریک `rowData: T[]` | مصرف‌کننده باید `RowInput.values` بسازد | PR-81 … PR-82 |
| props رخداد React و `apiRef` | فقط `onReady` + `onToast` | PR-85، PR-86 |
| هدر چندسطحی، منوی ستون، auto-size، pin دلخواه | — | PR-110 … PR-115 |
| `Home` / `End` / `Ctrl+C` استاندارد | `UITableKeyboardHandler.ts` از `Alt+C/X/V` استفاده می‌کند | PR-109 |
| لغو ویرایش با `Esc` | commit فوری روی change | PR-126 |
| aggregation عمومی | فوتر فقط `sum` هاردکد (`ui/desktop/ERPTableFooter.tsx:32-42`) | PR-118، PR-119 |
| CSV | ندارد | PR-122 |

### ۲.۲ تناقض کد ↔ مستندات (ثبت‌شده، باید رفع شود)

1. **مجازی‌سازی پیش‌فرض:** کد پیش‌فرض خاموش است؛ کامنت و README در PR-74/75 هم‌خوان شدند. تغییر رفتار → `PR-97` (D17).
2. **`styles.css`:** export در PR-76 اضافه شد؛ حذف auto-inject → `PR-77`.
3. **`files` / docs در npm:** ادعای غلط در PR-75 تصحیح شد (`files: ["dist"]`).
4. **README Features:** در PR-75 بازنویسی صادقانه + تست CI برای هر گلوله.
5. **`handleSelectAllRows`:** در PR-74 تأیید شد که به دکمهٔ تولبار وصل است.

### ۲.۳ بدهی بسته‌بندی (اندازه‌گیری واقعی، ۱۱ سپتامبر ۲۰۲۶)

| مورد | مقدار | هدف |
|------|-------|------|
| `dist/index.js` | **۲۱۳٫۳ KB خام / ۴۶٫۳ KB gzip** (PR-76) | ≤ ۶۵ KB gzip ✅ |
| `dist/index.cjs` | ۲۲۳٫۸ KB | — |
| `dist/index.d.ts` | ۱۳٫۶ KB | — |
| فونت Vazirmatn | فقط `./plugins/pdf/fonts/vazirmatn` (~۷۰ KB gzip) | جدا ✅ |
| subpath exports | `.` + headless + excel + pdf + vazirmatn + arian-erp + styles.css | ۷ subpath ✅ |
| `sideEffects` | `true` (tree-shaking خاموش) | `["**/*.css"]` (PR-77) |
| سقف اندازه در CI | **دارد** — `size-limit` سقف `.` = ۶۵ KB gzip | PR-73/76 ✅ |
| پلاگین‌ها | `"private": true`، اشاره به سورس TS | پکیج واقعی (PR-132) |

### ۲.۴ بدهی تایپ و کوپلینگ

| مورد | مقدار | PR |
|------|-------|-----|
| `any` در سورس قابل‌انتشار | ۶۶ | PR-79 |
| `as any` | ۱۸ | PR-79 |
| `any` نشت‌کرده به `dist/index.d.ts` | دارد (`RemoteApi.request<TResponse = any>`) | PR-79 |
| `@ts-nocheck` در `ui/**` | **صفر** (host-glue به `examples/host-arian-erp/`) | PR-74 ✅ |
| `arianERP` در سطح عمومی | `FetchRemoteApi` با `persist:arianERP` و کوکی `_auth` | PR-80 |
| نام‌های `ERP*` در سطح عمومی | ۱۳ شناسه + توکن `--erp-*` + کلاس `.erp-table` | PR-87 (D13) |
| وابستگی `engine` → `ui/type` | `engine/type.ts:9` | PR-132 |

### ۲.۵ بدهی زیرساخت و اعتماد

| مورد | وضعیت | PR |
|------|-------|-----|
| CI (GitHub Actions) | **دارد** (PR-72) — ماتریس Node 18/20/22 | PR-72 ✅ |
| بودجهٔ اندازه | **دارد** (۱۷۵ KB gzip روی `.`) | PR-73 ✅ |
| تست e2e | ندارد | PR-133 |
| رگرسیون بصری | ندارد | PR-133 |
| تست a11y واقعی (axe) | ندارد (فقط grep) | PR-123 |
| بودجهٔ perf گرید | ندارد (فقط append رخداد) | PR-100 |
| `CHANGELOG.md` / `CONTRIBUTING.md` / `SECURITY.md` | ندارد | PR-78 |
| `MIGRATION.md` | ندارد | PR-131 |
| `OFL.txt` در `files` پکیج npm | **ندارد** — ریسک انطباق لایسنس | PR-78 |
| API reference تولیدشده | ندارد (جدول دستی) | PR-129 |
| مستندات انگلیسی‌محور | مختلط؛ `public-api-honesty.md` فقط فارسی | PR-129 (D23) |

---

## بخش ۳ — Verification Log

### آخرین وضعیت verify‌شده (`0.5.0`، ۱۱ سپتامبر ۲۰۲۶)

| دستور | نتیجه |
|-------|-------|
| `yarn test` | ۵۲ فایل / ۲۲۸ تست — پاس |
| `yarn typecheck:publish` | پاس |
| `yarn typecheck:host-ui` | پاس |
| `yarn build` (tsup ESM+CJS+DTS) | پاس |
| `yarn verify:dist` | پاس (فقط حداقل اندازه) |
| مرورگر `localhost:5175` | تم تیره، جستجوی شرح ردیف → `mark.erp-search-hit.is-current` |

### آنچه این ۲۲۸ تست **نمی‌سنجد**

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
