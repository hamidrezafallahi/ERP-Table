# EXECUTION_PLAN.md — طرح اجرایی v2 (مسیر ۰٫۵ → ۱٫۰)

این فایل از صفر بازچینی شده است (۱۴۰۵/۰۶/۲۰ — ۱۱ سپتامبر ۲۰۲۶) بر اساس داوری سخت‌گیرانهٔ [`docs/ag-grid-gap-analysis.md`](./docs/ag-grid-gap-analysis.md).

| مرجع | فایل |
|------|------|
| داوری و کارت امتیاز | `docs/ag-grid-gap-analysis.md` |
| گزارش کار و verify | `WORKLOG.md` |
| ورود ایجنت | `docs/agent-handoff.md` |
| طرح قبلی (بسته، فقط تاریخ) | `docs/execution-plan-archive-v0.5.md` |
| گزارش کار قبلی (آرشیو) | `docs/worklog-archive-v0.5.md` |

---

## Active Track

- **طرح v2 کامل شد** (Phase 16–25). فیچر جدید فقط با فاز/RFC تازه.
- **D22 قفل:** monorepo تا پس از `1.0.0` تعویق — `PR-132` بلوکر نیست.
- **گِیت اجباری:** `PR-72` تا `PR-75` ✅. `release-gate` باید سبز باشد قبل از تگ `1.0.0`.
- طرح قدیم **Phase 1 … Phase 15 (PR-1 … PR-71)** بسته و آرشیو شده است. بازنویسی نکن؛ فقط bugfix.
- شمارهٔ PR از `PR-72` ادامه می‌یابد تا تاریخچهٔ git و WORKLOG قابل ردیابی بماند.

### امتیاز پایه و هدف

| مقطع | امتیاز کارت (از ۱۰۰) | نسخه |
|------|----------------------|------|
| امروز | **۳۵** | `0.5.0` |
| پایان Phase 17 | ۴۲ | `0.7.0` |
| پایان Phase 19 | ۵۸ | `0.9.0` |
| پایان Phase 21 | ۷۲ | `0.11.0` |
| پایان Phase 24 | **۸۰** | `1.0.0` |

---

## Ground Rules

1. یک PR = یک برش کوچک، تست‌پذیر، قابل برگشت. از فاز نپر.
2. هر PR یا مرز معماری را تمیزتر می‌کند یا قابلیت Tier 0 اضافه می‌کند. «بازاریابی» PR نیست.
3. **هیچ ادعای README/docs بدون تست متناظر در CI مجاز نیست.** اگر فیچری تست ندارد، از مستندات حذف می‌شود.
4. `domain/` و `application/` هرگز React یا DOM import نمی‌کنند. این تنها مزیت معماری ماست؛ آن را نمی‌سوزانیم.
5. هر شکستن API عمومی باید به یک کد `D` در Open Decisions وصل باشد و **قفل** شده باشد. اگر **باز** است: کد نزن، بپرس.
6. هر PR فیچرمحور باید هزینهٔ bundle خودش را در `size-limit` اعلام کند. افزایش بی‌بودجه = PR رد.
7. الگوریتم مسیر گرم باید **O(window)** یا **O(log n)** باشد، نه O(n). اگر O(n) ناگزیر است، باید memoize و invalidate صریح داشته باشد.
8. بعد از هر PR: چک‌باکس `[x]`، بخش جدید در `WORKLOG.md`، اجرای Verify همان PR و ثبت خروجی.

---

## Status Summary

| فاز | موضوع | PR | نسخه | وضعیت |
|-----|--------|----|------|--------|
| ۱–۱۵ | طرح قدیم (آرشیو) | PR-1 … PR-71 | ≤ 0.5.0 | ✅ بسته |
| **۱۶** | Truth, Packaging, CI | PR-72 … PR-80 | 0.6.0 | ✅ |
| ۱۷ | مدل دادهٔ جنریک + zero-config | PR-81 … PR-88 | 0.7.0 | ✅ |
| ۱۸ | عملیات داده (sort / filter) | PR-89 … PR-96 | 0.8.0 | ✅ |
| ۱۹ | مقیاس (virtual، infinite، O(n)) | PR-97 … PR-103 | 0.9.0 | ✅ |
| ۲۰ | کلیپ‌بورد و بازهٔ سلولی | PR-104 … PR-109 | 0.10.0 | ✅ |
| ۲۱ | همتراز ستون و هدر | PR-110 … PR-116 | 0.11.0 | ✅ |
| ۲۲ | Aggregation و grouping (RFC) | PR-117 … PR-122 | 0.12.0 | ✅ |
| ۲۳ | a11y، کیبورد استاندارد، i18n | PR-123 … PR-128 | 0.13.0 | ✅ |
| ۲۴ | مستندات، اکوسیستم، `1.0.0` | PR-129 … PR-135 | 1.0.0 | ✅ (PR-132 ⏸ تعویق D22) |
| ۲۵ | خندق رقابتی (audit UI، sync، هم‌ویرایشی) | PR-136 … PR-141 | 1.1+ | ✅ PR-136…141 |

---

## Open Decisions

**قفل** = ایجنت اجرا کند. **باز** = قبل از کد از کاربر بپرس و بایست.

تصمیم‌های `D1 … D12` در آرشیو طرح قبلی هستند. بعضی از آن‌ها در این طرح **جانشین** می‌شوند (ستون جانشینی).

تصمیم‌های زیر در ۱۴۰۵/۰۶/۲۰ توسط کاربر گرفته شدند.

| کد | موضوع | تصمیم | جانشین |
|----|--------|--------|--------|
| D13 | نام سطح عمومی | **قفل:** `ERPTable` → `DataGrid`. همهٔ نام‌های قدیمی (`ERPTable`, `ERPTableProps`, `useERPTable`, `themeErp*`, `--erp-*`, `.erp-table`) **یک نسخه به‌عنوان alias با `@deprecated` باقی بمانند**. حذف در `1.0.0`. | — |
| D14 | مدل داده | **قفل:** مسیر جنریک `rowData: T[]` + `columnDefs: ColumnDef<T>[]` اضافه شود. `columns` / `rows` / `RowInput` فعلی **منسوخ ولی کارکن** بمانند (هاست ERP نشکند). دو مسیر تا `1.0.0` هم‌زیستی دارند. | — |
| D15 | تقسیم bundle | **قفل:** Excel / PDF / فونت / adapter از `.` بیرون بروند به subpath exports. هدف `.` ≤ ۶۵ KB gzip. | — |
| D16 | CSS | **قفل:** `import 'persian-data-grid/styles.css'` مسیر توصیه‌شده؛ `injectGridStyles()` صریح برای هاست بدون bundler CSS؛ تزریق خودکار سطح ماژول حذف شود؛ `sideEffects: ["**/*.css"]`. | — |
| D17 | مجازی‌سازی پیش‌فرض | **قفل: روشن.** `resolveDesktopVirtualization` وقتی session هست `true` بدهد. `virtualization={false}` تنها راه pagination. فصل مهاجرت اجباری. | — |
| D18 | میانبر کلیپ‌بورد | **قفل:** `Ctrl+C/X/V` استاندارد شود؛ `Alt+C/X/V` فعلی به‌عنوان alias با `@deprecated` بماند. `Home`/`End`/`Ctrl+Home`/`Ctrl+End` اضافه شوند. | — |
| D19 | Pin ستون | **قفل:** `pinned: 'start' \| 'end' \| null` برای **هر ستون** با معنای منطقی RTL. | جانشین D10 |
| D20 | محدودهٔ aggregation / grouping | **قفل:** `aggFunc` عمومی + **row grouping تک‌سطحی** باز است، مشروط به تأیید `RFC-002` در `PR-117`. **pivot، نمودار یکپارچه، tree چندسطحی همچنان بسته.** | جانشین «خارج از محدوده» |
| D21 | تقویم | **قفل:** `DateAdapter` تعویض‌پذیر؛ `jalaliAdapter` پیش‌فرض، `gregorianAdapter` ارائه شود. افزودنی است، نه شکستن. | — |
| D22 | monorepo | **قفل ۱۴۰۵/۰۶/۲۶:** تعویق تا پس از `1.0.0`. تک‌پکیج React می‌ماند؛ `@persian-data-grid/core` جدا نمی‌شود. headless واقعی = بدهی بعدی. | — |
| D23 | زبان مستندات | **قفل: انگلیسی منبع، فارسی ترجمه.** `public-api-honesty` دوزبانه شود. دلیل: بازار npm. | — |
| D24 | امضای composition root | **قفل:** `createGrid()` sync با `grid.ready` برای hydrate تنبل. `createERPTable()` async به‌عنوان alias منسوخ بماند (پیرو D13/D14). | — |
| D25 | semver | **قفل:** `0.6 … 0.13` با CHANGELOG و `MIGRATION.md` در هر نسخه. `1.0.0` فقط با سبز شدن `scripts/release-gate.mjs` (PR-135). alias های منسوخ در `1.0.0` حذف می‌شوند. | — |

### خارج از محدوده تا RFC جدا

pivot، نمودار یکپارچه، فرمول صفحه‌گسترده، tree data چندسطحی، tool panel کامل، wrapper Angular/Vue.

دلیل: این‌ها امتیاز کارت را کمتر از هزینه‌شان بالا می‌برند. اول Tier 0.

### قاعدهٔ alias منسوخ (پیرو D13، D14، D18، D24)

هر نام قدیمی که alias می‌شود باید هم‌زمان: (۱) `@deprecated` با اشاره به جانشین، (۲) یک تست که هر دو مسیر کار می‌کنند، (۳) یک ردیف در جدول `MIGRATION.md`، (۴) ورودی codemod در `PR-131`. alias بدون این چهار مورد = PR رد.

---

## Phase 16 — Truth, Packaging, CI (نسخه `0.6.0`)

### Goal

قبل از یک خط فیچر جدید: **ادعاها را با کد هم‌خوان کن، bundle را بشکن، و CI بگذار.** این فاز امتیاز فیچری کم اضافه می‌کند (۳۵ → ۳۹) ولی همهٔ فازهای بعد به آن وابسته‌اند.

اثر هدف روی کارت: دستهٔ ۹ (بسته‌بندی) ۱٫۵ → ۵؛ دستهٔ ۱۰ (اعتماد) ۲ → ۴.

### PR-72 — CI pipeline

- [x] `PR-72` `.github/workflows/ci.yml`: روی `push` و `pull_request` اجرا کن — `npm ci`، `npm test`، `npm run typecheck:publish`، `npm run typecheck:host-ui`، `npm run build`، `npm run verify:dist`. ماتریس Node `18/20/22`. کش npm. badge در README.
- همچنین `.github/workflows/release.yml` با `npm publish --provenance` روی tag.
- **نکن:** تغییر کد محصول.
- **Verify:** workflow روی یک PR آزمایشی سبز شود. اسکرین‌شات/لینک run در WORKLOG.

### PR-73 — بودجهٔ اندازه (size budget)

- [x] `PR-73` `size-limit` (یا `esbuild --analyze` + اسکریپت خودی) اضافه کن. `.size-limit.json` با ورودی‌های جدا برای هر subpath آیندهٔ Phase. **سقف امروز را همان ۱۷۵ KB gzip ثبت کن** تا رگرسیون بگیرد؛ سقف را در PR-76 پایین می‌آوریم. `scripts/verify-dist.mjs` را از «حداقل ۵ KB» به «حداقل + حداکثر» ارتقا بده. به CI وصل کن.
- **Verify:** افزودن یک import سنگین آزمایشی باید CI را قرمز کند.

### PR-74 — حذف کد مرده و رفع تناقض کد/کامنت

- [x] `PR-74` سه مورد مستند در gap analysis:
  1. `ui/desktop/DesktopTable.tsx:33-35` — کامنت «Default true when session is present» با `resolveDesktopVirtualization` نمی‌خواند. **کامنت را با رفتار واقعی هم‌خوان کن** (تغییر رفتار در D17/PR-97 است، نه اینجا).
  2. `ui/desktop/groupActionButtons.tsx:72-74` — `handleSelectAllRows` تعریف شده و در JSX وصل نیست. یا وصل کن یا حذف کن.
  3. `ui/cellRenderer/descriptionComponent/useVoucherDescription.tsx` و `ui/useERPGrid.ts` — host-glue بدون مصرف‌کننده در مسیر پکیج. به `examples/host-arian-erp/` منتقل کن یا حذف. `types/host-shims.d.ts` را به همان اندازه کوچک کن.
- **Verify:** `npm test`، `typecheck:host-ui`، و grep: هیچ `@ts-nocheck` در `ui/**` باقی نماند.

### PR-75 — پاک‌سازی صداقت مستندات

- [x] `PR-75` هر ادعای نادرست را حذف یا تصحیح کن:
  - `docs/public-api.md:44` — `persian-data-grid/styles.css` وجود ندارد. یا ادعا را حذف کن یا در PR-77 بساز (ترتیب: حذف حالا، اضافه بعداً).
  - `docs/public-api.md:17` — ادعای `files` شامل `docs/`. غلط است.
  - `README.md` — «render only visible rows for tens of thousands of lines» (مجازی خاموش است) و «Excel-like keyboard» (کلیپ‌بورد Excel نیست). بازنویسی صادقانه.
  - `docs/__tests__/public-api-honesty.spec.ts` را گسترش بده: برای **هر** گلولهٔ فیچر در README یک assertion که کد متناظر وجود دارد.
- **Verify:** `npm test`؛ تست جدید باید با حذف عمدی یک فیچر قرمز شود.

### PR-76 — شکستن bundle: subpath exports (D15)

- [x] `PR-76` **D15 قفل — اجرا کن.** ورودی‌های tsup را چند‌گانه کن:

| subpath | محتوا |
|---------|-------|
| `.` | گرید React + engine + domain + application |
| `./headless` | `createGrid` / `GridSession` / engine بدون React |
| `./plugins/excel` | `ExcelExportPlugin` / `ExcelImportPlugin` / `fflate` |
| `./plugins/pdf` | `PdfExportPlugin` / رندرر (بدون بایت فونت) |
| `./plugins/pdf/fonts/vazirmatn` | بایت‌های فونت، فقط با import صریح |
| `./adapters/arian-erp` | `FetchRemoteApi` و منطق `persist:arianERP` |
| `./styles.css` | CSS استخراج‌شده |

`exports` map و `typesVersions` را کامل کن. `splitting: true` با chunk مشترک.

- **هدف قابل‌اندازه‌گیری:** `.` ≤ **۶۵ KB gzip**. سقف `size-limit` را همین بگذار.
- **نکن:** حذف export از `.` بدون alias منسوخ‌شده. هر جابه‌جایی باید یک فصل در `MIGRATION.md` داشته باشد.
- **Verify:** `npm run build`، `size-limit` سبز، و یک تست قرارداد که هر subpath را `import()` می‌کند و export کلیدی را چک می‌کند.

### PR-77 — CSS صریح و رفع `sideEffects` (D16)

- [x] `PR-77` **D16 قفل — اجرا کن.** `injectERPTableStyles()` خودکار در سطح ماژول را بردار (`ui/styles/injectStyles.ts:651`). دو مسیر پشتیبانی شود:
  1. `import 'persian-data-grid/styles.css'` (توصیه‌شده، tree-shake friendly)
  2. `injectGridStyles()` صریح برای هاست‌هایی که bundler CSS ندارند
  `"sideEffects": ["**/*.css"]` بگذار. تکرار CSS در دو فایل را با **یک منبع حقیقت** جایگزین کن: `erp-table.css` منبع باشد و `injectStyles.ts` از آن تولید شود (اسکریپت build، نه کپی دستی). این بدهی Phase 6 است.
- **Verify:** تست: build دو فایل CSS همسان تولید کند؛ اپ نمونه بدون import CSS بدون استایل رندر شود (رفتار مستند)؛ `size-limit` بعد از tree-shaking کاهش نشان دهد.

### PR-78 — انطباق لایسنس و فراداده پکیج

- [x] `PR-78` `OFL.txt` و `LICENSE` را در `files` پکیج npm اضافه کن. بلوک لایسنس فونت را در banner بستهٔ `plugins/pdf` بگذار. `CHANGELOG.md` (Keep a Changelog)، `CONTRIBUTING.md`، `SECURITY.md`، `.github/ISSUE_TEMPLATE/`، `funding` (اختیاری). `keywords` را از `erp grid` به کلمات بازار واقعی بچرخان.
- **Verify:** `npm pack --dry-run` فهرست فایل‌ها را نشان دهد؛ `OFL.txt` در آن باشد.

### PR-79 — صفر `any` در سطح عمومی

- [x] `PR-79` ۶۶ مورد `any` و ۱۸ مورد `as any` را در سورس قابل‌انتشار هدف بگیر. اولویت: تایپ‌هایی که به `dist/index.d.ts` نشت می‌کنند — `application/ports/RemoteApi.ts` (`TResponse = any`, `Record<string, any>`), `ui/type.ts:28` (`onAdd: (e: any) => void`). `unknown` + type guard به‌جای `any`. ESLint rule `@typescript-eslint/no-explicit-any` روی `publish` graph با `error`.
- **Verify:** `typecheck:publish`؛ grep روی `dist/index.d.ts` برای ` any` صفر برگردد؛ lint در CI.

### PR-80 — پاک کردن arianERP از سطح عمومی

- [x] `PR-80` `FetchRemoteApi` (با `persist:arianERP` و کوکی `_auth`) از `.` به `./adapters/arian-erp` منتقل شود. `erp-table-events:` به‌عنوان نام DB با `config.store` قابل تنظیم شود و پیش‌فرضش نام خنثی بگیرد (مهاجرت دادهٔ IndexedDB موجود مستند شود). `docs/host-arian-erp.md` به `examples/` برود.
- **نکن:** شکستن هاست ERP فعلی بدون فصل مهاجرت.
- **Verify:** grep `arianERP` روی `dist/index.js` صفر برگردد.

### Phase 16 Exit Criteria

- CI سبز روی سه نسخهٔ Node.
- `.` ≤ ۶۵ KB gzip؛ Excel/PDF/فونت فقط با import صریح.
- صفر `any` در `dist/index.d.ts`؛ صفر `@ts-nocheck` در `ui/`.
- صفر ادعای بی‌تست در README و `docs/`.
- `npm pack` شامل LICENSE و OFL.
- `CHANGELOG.md` با ورودی `0.6.0`.

---

## Phase 17 — مدل دادهٔ جنریک و مسیر zero-config (نسخه `0.7.0`)

### Goal

**بزرگ‌ترین مانع ورود را بردار.** امروز مصرف‌کننده باید دادهٔ خودش را به `RowInput.values` ترجمه کند و `store` / `tableKey` / `actor` بدهد. این فاز `<DataGrid rowData columnDefs />` را می‌سازد بدون کشتن مسیر ERP موجود.

اثر هدف: دستهٔ ۸ (API/DX) ۳ → ۷.

### PR-81 — `ColumnDef<TRow>` جنریک (D14)

- [x] `PR-81` **D14 قفل — اجرا کن.** نوع جدید در `domain/types/ColumnDef.ts`:

```ts
interface ColumnDef<TRow, TValue = unknown> {
  colId?: string;
  field?: keyof TRow & string;
  headerName?: string;
  type?: FieldType;                      // سازگار با FieldType فعلی
  valueGetter?: (p: { data: TRow }) => TValue;
  valueSetter?: (p: { data: TRow; newValue: TValue }) => boolean;
  valueFormatter?: (p: { value: TValue; data: TRow }) => string;
  comparator?: (a: TValue, b: TValue) => number;   // مصرف در Phase 18
  editable?: boolean | ((p: { data: TRow }) => boolean);
  width?: number; minWidth?: number; flex?: number;
  hide?: boolean; pinned?: 'start' | 'end' | null;
  sortable?: boolean; filter?: FilterDef | false;
  cellRenderer?: CellComponent<TRow>;    // پل به رجیستری موجود
}
```

`ColumnSchema` فعلی با یک mapper دوطرفه در `infrastructure/columns/` حفظ شود.

- **نکن:** دست زدن به `CellRenderer` در این PR.
- **Verify:** تست mapper دوطرفه (`ColumnSchema ↔ ColumnDef`) idempotent؛ `typecheck:publish`.

### PR-82 — `rowData: TRow[]` + `getRowId`

- [x] `PR-82` adapter `rowData → Row` دامنه‌ای. `getRowId?: (row: TRow) => string` با پیش‌فرض ایندکس. `Row` دامنه باید `data: TRow` اصلی را نگه دارد (بدون کلون عمیق) تا `valueGetter` کار کند. diff پایدار برای وقتی `rowData` عوض می‌شود (بدون reset کل جدول).
- **Verify:** تست: ۱۰۰۰ ردیف `{id, name, price}` بدون `RowInput`؛ تغییر یک ردیف در آرایه فقط همان ردیف را re-render کند.

### PR-83 — props اختیاری‌سازی و zero-config

- [x] `PR-83` `store` / `tableKey` / `actor` اختیاری شوند:
  - بدون `store` ⇒ بدون IndexedDB، بدون EventStore پایدار (in-memory).
  - بدون `actor` ⇒ actor پیش‌فرض با همهٔ دسترسی‌ها.
  - بدون `tableKey` ⇒ کلید تولیدشدهٔ پایدار در عمر کامپوننت.
  این یعنی `<DataGrid rowData={rows} columnDefs={cols} />` تنها فرم لازم است.
- **نکن:** عوض کردن رفتار وقتی این props داده شده‌اند.
- **Verify:** تست: رندر بدون هیچ prop اضافه؛ assert که `indexedDB` لمس نشده.

### PR-84 — `createGrid` sync + hydrate تنبل (D24)

- [x] `PR-84` **D24 قفل — اجرا کن.** `createERPTable` را به `createGrid` تغییر نام بده (alias منسوخ بماند) و امضایش را sync کن: نمونه فوراً برگردد، بارگذاری EventStore/snapshot تنبل و قابل `await grid.ready`. این جلوی «`useEffect` + `await` + race» در مصرف‌کننده را می‌گیرد.
- **Verify:** تست: `createGrid()` بدون `await` قابل render است؛ `grid.ready` resolve می‌شود.

### PR-85 — props رخداد React

- [x] `PR-85` رخدادهای استاندارد روی `DataGrid`: `onCellValueChanged`، `onRowValueChanged`، `onSelectionChanged`، `onCellFocused`، `onRowDataUpdated`، `onGridReady`. همه مشتق از stream رخداد موجود (`EVENT_CATALOG`) — منبع حقیقت دوگانه نساز.
- **Verify:** تست: ویرایش سلول دقیقاً یک `onCellValueChanged` با `{oldValue, newValue, colId, rowId, data}` بدهد.

### PR-86 — `apiRef` imperative

- [x] `PR-86` `apiRef?: Ref<GridApi<TRow>>` با سطح حداقلی و **مستند**: `getRowNode`، `setRowData`، `refreshCells`، `getSelectedRows`، `deselectAll`، `startEditingCell`، `stopEditing`، `exportDataAsExcel`، `undo`، `redo`، `getColumnState`، `applyColumnState`. `UITableController` پیاده‌سازی زیرین بماند ولی از سطح عمومی `.` بیرون برود.
- **Verify:** تست هر متد + `typecheck:publish`.

### PR-87 — تغییر نام سطح عمومی (D13)

- [x] `PR-87` **D13 قفل — اجرا کن.** `ERPTable` → `DataGrid`. `ERPTableProps` → `DataGridProps`. `useERPTable` → `useGrid`. `themeErp` → `themeDefault`، `themeErpDark` → `themeDark`. توکن CSS `--erp-*` → `--pdg-*` با لایهٔ alias برای یک نسخه. کلاس `.erp-table` → `.pdg-grid` با alias. **همهٔ نام‌های قدیمی به‌عنوان alias منسوخ (`@deprecated`) یک نسخه باقی بمانند.** فصل مهاجرت در `MIGRATION.md`.
- **Verify:** تست: هم `ERPTable` و هم `DataGrid` رندر شوند؛ codemod ساده (`scripts/codemod-v0.7.mjs`) روی fixture کار کند.

### PR-88 — ژنریک انتها-به-انتها و مستندسازی

- [x] `PR-88` `DataGrid<TRow>` کامل جنریک شود: `rowData`، `columnDefs`، `onCellValueChanged`، `apiRef` همه `TRow` را حمل کنند. تست تایپ (`*.typecheck.tsx`) برای استنتاج بدون annotation صریح. `docs/getting-started.md` بازنویسی: مسیر ۶۰ ثانیه.
- **Verify:** `typecheck:publish`؛ تست تایپ برای `TRow` نادرست باید خطا بدهد (`expectTypeOf`).

### Phase 17 Exit Criteria

```tsx
import { DataGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

type Invoice = { id: string; title: string; amount: number; date: string };

<DataGrid<Invoice>
  rowData={invoices}
  columnDefs={[
    { field: 'title', headerName: 'شرح' },
    { field: 'amount', type: 'price' },
    { field: 'date', type: 'date' },
  ]}
  onCellValueChanged={e => save(e.data)}
/>
```

- بدون `store` / `actor` / `tableKey` کار کند و به IndexedDB دست نزند.
- `ERPTable` قدیمی با هشدار منسوخ‌شدن کار کند.
- `MIGRATION.md` + codemod موجود باشد.

---

## Phase 18 — عملیات داده: sort و filter (نسخه `0.8.0`)

### Goal

بزرگ‌ترین شکاف فیچری. **در هسته (pure) پیاده شود، نه در UI** تا headless و server-side هم از آن استفاده کنند.

اثر هدف: دستهٔ ۱ ۲ → ۱۲.

### PR-89 — `SortModel` در هسته

- [x] `PR-89` `engine/dataOps/sortModel.ts`: تابع خالص `applySort(rowIds, sortModel, accessor)`. `SortModel = { colId, sort: 'asc'|'desc' }[]` (multi-sort مرتب). comparator پیش‌فرض بر پایهٔ `FieldType` (عدد، متن با `Intl.Collator('fa')`، تاریخ جلالی، boolean) و override با `ColumnDef.comparator`. مرتب‌سازی **پایدار (stable)**. ستون `index` به‌عنوان tie-breaker نهایی تا رفتار سند حفظ شود.
- **نکن:** لمس `ViewStateBuilder.sortRows` در این PR؛ فقط تابع خالص + تست.
- **Verify:** تست: پایداری، multi-sort، `null` آخر، collation فارسی (`آ` < `ا` < `ب`)، ۱۰۰k ردیف زیر بودجه.

### PR-90 — وصل sort به ایندکس ردیف

- [x] `PR-90` `ViewStateBuilder` / `SparseRowIndex` ترتیب را از `SortModel` بگیرند. بدون sortModel ⇒ همان ترتیب `index` امروز (بدون رگرسیون رفتار سند). ایندکس فقط با تغییر sortModel یا داده invalidate شود، نه با هر notify.
- **Verify:** تست: dispatch `SET_SORT_MODEL` ترتیب `getAllUIRows` را عوض کند؛ ویرایش یک سلول ایندکس را بازنسازی نکند مگر ستون sort باشد.

### PR-91 — UI مرتب‌سازی هدر

- [x] `PR-91` کلیک هدر: asc → desc → none. `Shift+Click` برای multi-sort با نشانگر اولویت. آیکن و `aria-sort` روی `<th>`. `sortable: false` رعایت شود. ستون `index` قابل sort نباشد. تعامل با drag reorder موجود نشکند (کلیک ≠ درگ، آستانهٔ حرکت).
- **Verify:** تست DOM: کلیک → `aria-sort="ascending"`؛ درگ ۵px sort را trigger نکند؛ دمو دو ستون.

### PR-92 — `FilterModel` در هسته

- [x] `PR-92` `engine/dataOps/filterModel.ts`: تابع خالص `applyFilter(rowIds, filterModel, accessor)`.

| نوع | عملگرها |
|-----|---------|
| `text` | contains، notContains، equals، startsWith، endsWith، blank، notBlank |
| `number` | =، ≠، <، ≤، >، ≥، inRange، blank |
| `date` (جلالی) | equals، before، after، inRange، blank |
| `set` | in / notIn با شمارش مقادیر یکتا |
| `boolean` | true / false / any |

ترکیب `AND` / `OR` در سطح ستون. `customFilter?: (value, row) => boolean`. نرمال‌سازی ارقام فارسی/عربی/لاتین و `ی/ك` عربی در مقایسهٔ متن (بازار ایران این را لازم دارد و ag-grid ندارد).

- **Verify:** تست هر عملگر + نرمال‌سازی رقم/حرف + ۱۰۰k زیر بودجه.

### PR-93 — quick filter واقعی

- [x] `PR-93` `quickFilterText?: string` که **ردیف را حذف کند** (نه mark). ایندکس معکوس متن روی ردیف با invalidate تدریجی تا O(n) هر کلید نباشد. `GridSearchPanel` موجود به‌عنوان قابلیت جدا («جستجو و پیمایش») بماند و در docs از filter تفکیک شود.
- **Verify:** تست: `quickFilterText` تعداد ردیف را کم کند؛ بودجهٔ تایپ ۱۰ کاراکتر روی ۵۰k ردیف.

### PR-94 — UI فیلتر: منوی ستون + floating filter

- [x] `PR-94` آیکن فیلتر روی هدر → پاپ‌اور (با وراثت تم portal از PR-43). ردیف `floatingFilter` اختیاری زیر هدر. نشانگر «فیلتر فعال». `apiRef.setFilterModel` / `getFilterModel`.
- **Verify:** تست DOM برای هر نوع فیلتر + تم تیره + RTL.

### PR-95 — کامپوننت فیلتر سفارشی

- [x] `PR-95` رجیستری فیلتر مانند رجیستری سلول: `filterComponents?: Record<string, FilterComponent>` و `ColumnDef.filter: 'text' | 'number' | ... | MyFilter`. مستند در `docs/cell-components.md` یا فایل جدید.
- **Verify:** تست: فیلتر سفارشی «فقط مبالغ رُند» روی دمو.

### PR-96 — قرارداد datasource سمت سرور

- [x] `PR-96` وقتی `rowModelType: 'serverSide' | 'infinite'` است، sort/filter محلی اعمال نشود و به‌جایش callback بزند:

```ts
interface GridDatasource<TRow> {
  getRows(p: {
    startRow: number; endRow: number;
    sortModel: SortModel; filterModel: FilterModel;
  }): Promise<{ rows: TRow[]; lastRow?: number }>;
}
```

فقط **قرارداد + حالت `infinite` سادهٔ صفحه‌ای** در این PR؛ مدل بلوکی کامل در PR-102.

- **Verify:** تست: تغییر sort دقیقاً یک `getRows` با `sortModel` درست بزند.

### Phase 18 Exit Criteria

- کلیک هدر مرتب می‌کند؛ `Shift+Click` multi-sort.
- هر پنج نوع فیلتر با UI کار می‌کند و `filterModel` قابل خواندن/نوشتن است.
- `quickFilterText` ردیف حذف می‌کند.
- نرمال‌سازی ارقام و حروف فارسی در sort و filter تست دارد.
- همهٔ منطق در `engine/dataOps/` خالص و بدون DOM است.

---

## Phase 19 — مقیاس (نسخه `0.9.0`)

### Goal

ادعای «۱۰۰k ردیف» را **واقعی و تست‌شده** کن.

اثر هدف: دستهٔ ۲ ۴ → ۱۲.

### PR-97 — مجازی‌سازی پیش‌فرض روشن (D17)

- [x] `PR-97` **D17 قفل — اجرا کن.** `resolveDesktopVirtualization` واقعاً وقتی session هست پیش‌فرض `true` بدهد. `virtualization={false}` تنها راه pagination بماند. صفحه‌بندی و مجازی‌سازی نباید هم‌زمان فرض شوند. تعامل با pin ستون index و spacerها تست شود.
- **نکن:** حذف مسیر pagination — هاست‌های ERP به آن وابسته‌اند.
- **Verify:** تست: بدون prop، ردیف‌های render شده ≪ کل؛ `virtualization={false}` صفحه‌بندی بدهد؛ فصل مهاجرت در `MIGRATION.md`.

### PR-98 — مجازی‌سازی ستون

- [x] `PR-98` پنجرهٔ افقی: `ViewportCalculator` را دو‌بعدی کن (`ColumnViewport` با عرض‌های تجمعی و جست‌وجوی دودویی). ستون‌های pin شده همیشه رندر شوند. spacer چپ/راست با آگاهی RTL. هدر، بدنه و فوتر باید **یک** پنجرهٔ ستون مشترک داشته باشند.
- **Verify:** تست: ۲۰۰ ستون، `<th>` رندرشده < ۲۵؛ اسکرول افقی سلول اشتباه ندهد؛ pin سالم بماند.

### PR-99 — حذف O(n) از مسیر گرم

- [x] `PR-99` چهار مورد مستند در gap analysis:
  1. `ViewStateBuilder.ensureUiRowIndex` — sort کامل روی هر invalidate → ایندکس مرتب افزایشی (insert/remove در O(log n)).
  2. `NavigationManager` ناوبری عمودی — sort کل ردیف‌ها → همسایهٔ بعدی از ایندکس مرتب در O(1).
  3. `ui/gridSearch/utils.ts` — اسکن O(n) هر کوئری → ایندکس متن از PR-93.
  4. `ERPTableFooter` — O(n × cols) در هر render → aggregation افزایشی روی رخداد تغییر سلول.
- **Verify:** بودجهٔ perf جدید: هر کلید جهت‌نما روی ۱۰۰k ردیف < ۲ms؛ تست باید با برگرداندن هر بهینه‌سازی قرمز شود.

### PR-100 — بودجهٔ perf واقعی گرید

- [x] `PR-100` `infrastructure/__tests__/performance-budget.spec.ts` امروز فقط append رخداد را می‌سنجد. یک harness جدید: **۱۰۰k ردیف دامنهٔ واقعی hydrate شده**، سپس اندازه‌گیری mount اولیه، اسکرول ۱۰۰۰ گام، ۱۰۰ ویرایش سلول، sort، filter. بودجه در JSON جدا تا در CI قابل تنظیم باشد. نتیجه در README به‌صورت عدد منتشر شود (نه صفت).
- **Verify:** CI روی runner استاندارد سبز؛ عدد در `docs/performance.md`.

### PR-101 — مصرف حافظه و ردیف‌های جدا از DOM

- [x] `PR-101` پروفایل حافظهٔ ۱۰۰k ردیف. اگر `Row`/`Cell` دامنه هر سلول را object می‌کند، مدل ستونی یا lazy cell در نظر بگیر. هدف مستند: < ۳۰۰ MB برای ۱۰۰k × ۲۰ ستون.
- **Verify:** تست حافظه با `process.memoryUsage()` و آستانه؛ اگر ناپایدار بود، skip با ثبت عدد در WORKLOG.

### PR-102 — مدل ردیف بلوکی (infinite / server-side)

- [x] `PR-102` روی قرارداد PR-96: کش بلوکی (اندازهٔ بلوک قابل تنظیم)، حالت loading سطر، `lastRow` نامعلوم، حذف بلوک با LRU، `apiRef.refreshServerSide()`. sort/filter به سرور واگذار شود.
- **Verify:** تست با datasource فیک: اسکرول تنها بلوک‌های لازم را بخواهد؛ تغییر فیلتر کش را دور بریزد.

### PR-103 — حالت‌های loading و overlay

- [x] `PR-103` `loading?: boolean`، overlay «بدون ردیف»، overlay «در حال بارگذاری»، skeleton ردیف در مدل infinite، `noRowsOverlayComponent` / `loadingOverlayComponent` قابل تعویض.
- **Verify:** تست DOM هر سه حالت + تم تیره.

### Phase 19 Exit Criteria

- مجازی‌سازی ردیف و ستون پیش‌فرض روشن.
- عدد منتشرشده برای ۱۰۰k ردیف در `docs/performance.md` با تست CI.
- هیچ O(n) در مسیر کلید/اسکرول/ویرایش.
- مدل infinite با datasource کار کند.

---

## Phase 20 — کلیپ‌بورد و بازهٔ سلولی (نسخه `0.10.0`)

### Goal

**بالاترین ROI کل طرح.** «Excel-like» از شعار به واقعیت.

اثر هدف: دستهٔ ۴ ۳ → ۹.

### PR-104 — مدل بازهٔ سلولی

- [x] `PR-104` `engine/selection/cellRange.ts`: `CellRange = { startRow, endRow, colIds }`، چند بازه، anchor + focus، `Shift+Arrow` گسترش، `Shift+Click`، `Ctrl+Click` بازهٔ جدید، `Ctrl+A` کل. تابع خالص؛ بدون DOM.
- **Verify:** تست واحد گسترش/ادغام/نرمال‌سازی بازه‌ها.

### PR-105 — UI بازهٔ سلولی

- [x] `PR-105` رندر حاشیه و پس‌زمینهٔ بازه با توکن تم (`--pdg-range-bg`, `--pdg-range-border`). سازگار با مجازی‌سازی ردیف و ستون (بازه‌ای که از پنجره بیرون است باید حاشیهٔ درست بدهد). `apiRef.getCellRanges()` / `addCellRange()`.
- **Verify:** تست DOM + دمو؛ اسکرول وسط بازه ظاهر را نشکند.

### PR-106 — کپی به کلیپ‌بورد سیستم

- [x] `PR-106` `Ctrl+C` (D18) بازهٔ انتخابی را بنویسد: `text/plain` با TSV و `text/html` با `<table>` تا در Excel/Word فرمت حفظ شود. `valueFormatter` اعمال شود یا مقدار خام — با گزینهٔ `copyFormattedValue`. شامل/بدون هدر با `copyHeadersToClipboard`. رویداد `onClipboardCopy` برای override هاست.
- **Verify:** تست با `navigator.clipboard` mock: TSV درست، ارقام فارسی به لاتین برای Excel (تنظیم‌پذیر)، تست دستی round-trip در Excel و ثبت در WORKLOG.

### PR-107 — چسباندن از Excel

- [x] `PR-107` `Ctrl+V`: TSV/CSV را parse کن (شامل مقادیر نقل‌قول‌شده و چندخطی)، به بازهٔ مقصد tile کن، **ردیف کم بیاید ⇒ ردیف اضافه کن** (با `pasteAddsRows` قابل خاموش‌کردن). همهٔ تغییرها یک `correlationId` بگیرند تا **یک واحد undo** شوند (زیرساختش از PR-15b/PR-33 موجود است). parse تاریخ جلالی و مبلغ با جداکنندهٔ فارسی. سلول‌های `editable: false` رد شوند با گزارش.
- **Verify:** تست: چسباندن ۵۰۰×۱۰ سلول ⇒ یک undo؛ رقم فارسی «۱۲۳٫۴۵۶» درست parse شود؛ تاریخ «۱۴۰۵/۰۶/۲۰» درست بنشیند.

### PR-108 — fill handle

- [x] `PR-108` مربع گوشهٔ پایین بازه؛ درگ عمودی/افقی کپی کند. تشخیص سری برای عدد و تاریخ جلالی (`۱, ۲, ۳` و `۱۴۰۵/۰۱/۳۱ → ۱۴۰۵/۰۲/۳۱`). `Ctrl+درگ` کپی خالص. یک واحد undo.
- **Verify:** تست سری عددی، سری تاریخ جلالی، کپی متن، undo واحد.

### PR-109 — مجموعهٔ میانبر استاندارد (D18)

- [x] `PR-109` **D18 قفل — اجرا کن.** `Ctrl+C/X/V` استاندارد؛ `Alt+C/X/V` فعلی به‌عنوان alias با `@deprecated` در docs. افزودن `Home` / `End` / `Ctrl+Home` / `Ctrl+End` / `Ctrl+Shift+Arrow`. جدول کامل میانبرها در `docs/keyboard.md` + تست برای هر ردیف جدول.
- **Verify:** تست پارامتری روی جدول میانبرها (هیچ ردیف مستند بدون تست).

### Phase 20 Exit Criteria

- کپی از گرید → چسباندن در Excel با فرمت درست.
- کپی از Excel → چسباندن در گرید با افزودن ردیف و یک undo.
- fill handle با سری جلالی.
- `docs/keyboard.md` با تست برای هر میانبر.

---

## Phase 21 — همتراز ستون و هدر (نسخه `0.11.0`)

### Goal

بستن دستهٔ ۵. همهٔ این‌ها Tier 0/Tier 1 و کم‌ریسک‌اند چون engine ستون از Phase 11 موجود است.

اثر هدف: دستهٔ ۵ ۳٫۵ → ۸.

### PR-110 — pin هر ستون (D19)

- [x] `PR-110` **D19 قفل — اجرا کن (جانشین D10).** `ColumnDef.pinned: 'start' | 'end' | null` با معنای منطقی RTL (`start` = راست در RTL). سه ناحیهٔ رندر (pin start / scrollable / pin end) در هدر، بدنه، بدنهٔ مجازی، و فوتر. سازگار با مجازی‌سازی ستون PR-98.
- **Verify:** تست: pin دو ستون در دو طرف + اسکرول افقی + RTL و LTR.

### PR-111 — hide/show ستون در runtime

- [x] `PR-111` `apiRef.setColumnVisible(colId, visible)` + `columnDefs[].hide` واکنشی. رعایت قواعد `visibility` دامنه‌ای موجود (RBAC) — یعنی هاست نتواند ستونی را نشان دهد که سیاست منع کرده.
- **Verify:** تست: مخفی‌کردن ستون، ایندکس ARIA درست بماند، RBAC override نشود.

### PR-112 — auto-size و flex

- [x] `PR-112` `autoSizeColumns()` با اندازه‌گیری متن خارج از جریان (canvas `measureText` برای اجتناب از reflow)، `sizeColumnsToFit()`، `ColumnDef.flex`. دابل‌کلیک روی هندل resize = auto-size همان ستون.
- **Verify:** تست: auto-size روی محتوای بلند فارسی عرض بزرگ‌تر بدهد؛ `flex: 1` جمع عرض = عرض کانتینر.

### PR-113 — هدر چندسطحی (column groups)

- [x] `PR-113` `ColumnGroupDef { headerName, children, marryChildren? }`. هدر چندردیفه با `colspan`، باز/بستن گروه، `aria-colspan`. reorder در سطح گروه.
- **Verify:** تست: دو سطح گروه + `aria` درست + reorder داخل گروه.

### PR-114 — منوی ستون

- [x] `PR-114` منوی `⋮` روی هدر: sort asc/desc/none، فیلتر، مخفی‌کردن، pin start/end/none، auto-size، «تنظیم ستون‌ها». آیتم‌ها قابل تنظیم با `columnMenuItems` و افزودن آیتم سفارشی هاست.
- **Verify:** تست DOM هر آیتم + کیبورد (فلش/Enter/Esc) + تم تیره.

### PR-115 — `columnState` ذخیره و بازگردانی

- [x] `PR-115` `getColumnState()` / `applyColumnState()` شامل عرض، ترتیب، pin، hide، sort. persist اختیاری در همان EventStore (رخداد `COLUMN_STATE_CHANGED`) یا `localStorage` با کلید `stateKey`. این کاری است که کاربران سازمانی همیشه می‌خواهند و امروز عرض ستون فقط در حافظهٔ جلسه است.
- **Verify:** تست: resize + reorder + reload ⇒ همان چیدمان.

### PR-116 — ردیف‌های pin بالا/پایین

- [x] `PR-116` `pinnedTopRowData` / `pinnedBottomRowData`. کاربرد سند: ردیف «جمع کل» و ردیف «ورود سریع». باید از مجازی‌سازی مستقل رندر شوند.
- **Verify:** تست: ردیف pin شده با اسکرول جابه‌جا نشود؛ فوتر aggregation نشکند.

### Phase 21 Exit Criteria

- pin دوطرفه، hide runtime، auto-size، flex، هدر گروهی، منوی ستون، `columnState` پایدار، ردیف pin شده.
- همه با مجازی‌سازی ستون و RTL تست شده.

---

## Phase 22 — Aggregation و grouping (نسخه `0.12.0`) — نیازمند RFC

### Goal

فوتر امروز فقط `sum` هاردکد است. این فاز aggregation عمومی و **grouping تک‌سطحی** را باز می‌کند (D20). pivot و tree چندسطحی همچنان خارج از محدوده.

### PR-117 — RFC-002: aggregation و grouping

- [x] `PR-117` `docs/rfc/RFC-002-aggregation-grouping.md`: مدل داده، اثر روی EventStore (آیا گروه رخداد دارد؟)، اثر روی undo، اثر روی مجازی‌سازی (ردیف گروه در پنجره)، اثر روی صادرات Excel/PDF. **بدون تأیید این RFC، PR-118 به بعد شروع نشود.**
- **Verify:** تأیید کاربر ثبت‌شده در WORKLOG.

### PR-118 — موتور aggregation

- [x] `PR-118` `engine/dataOps/aggregation.ts`: `aggFunc: 'sum'|'avg'|'min'|'max'|'count'|'first'|'last'| ((values) => unknown)`. محاسبهٔ **افزایشی** روی رخداد تغییر سلول (نه بازمحاسبهٔ کامل). دقت پول: جمع با عدد صحیح ریال یا decimal، نه float.
- **Verify:** تست: جمع ۱۰۰k مبلغ بدون خطای float؛ ویرایش یک سلول O(1) جمع را به‌روز کند.

### PR-119 — فوتر از مدل aggregation

- [x] `PR-119` `ERPTableFooter` از `ColumnDef.aggFunc` بخواند، نه از منطق sum هاردکد. چند ردیف فوتر (`جمع`، `میانگین`) با `footerRows`.
- **Verify:** تست: ستون با `aggFunc: 'avg'`؛ ستون بدون aggFunc خالی بماند.

### PR-120 — موتور grouping تک‌سطحی

- [x] `PR-120` `groupBy: colId | colId[]` (فعلاً یک سطح فعال، API آمادهٔ چندسطح). ردیف گروه با مقدار aggregation، باز/بسته، `groupDefaultExpanded`. ایندکس ردیف باید ردیف‌های گروه را در ترتیب مسطح بشناسد تا مجازی‌سازی نشکند.
- **Verify:** تست: گروه‌بندی بر «نوع کالا»، جمع هر گروه درست، ۱۰۰k ردیف زیر بودجه.

### PR-121 — UI grouping

- [x] `PR-121` ردیف گروه با chevron، تودرتویی، `aria-expanded` / `aria-level`، انتخاب گروه ⇒ انتخاب فرزندان.
- **Verify:** تست DOM + a11y + کیبورد (فلش راست/چپ باز/بسته).

### PR-122 — صادرات با گروه و جمع

- [x] `PR-122` Excel و PDF ردیف گروه و جمع‌ها را منتقل کنند. Excel با گروه‌بندی بومی (outline) اگر ممکن است. CSV هم اضافه شود (`./plugins/csv`، سبک، Tier 1 گمشده).
- **Verify:** تست round-trip؛ باز کردن فایل در Excel و ثبت در WORKLOG.

### Phase 22 Exit Criteria

- `aggFunc` عمومی و افزایشی.
- grouping تک‌سطحی با UI و a11y.
- CSV/Excel/PDF گروه و جمع را حمل کنند.

---

## Phase 23 — a11y، کیبورد استاندارد، i18n (نسخه `0.13.0`)

### Goal

دستهٔ ۶ و بخشی از دستهٔ ۷. تبدیل ادعای a11y از grep به تست واقعی.

### PR-123 — تست a11y واقعی

- [x] `PR-123` `ui/desktop/__tests__/grid-a11y.spec.ts` امروز فقط grep سورس است. با `jsdom` + `axe-core` تست واقعی بنویس: گرید ۲۰ ردیف، حالت‌های sort/filter/group/pin، مودال‌ها، منوی ستون. صفر violation سطح `serious`/`critical`.
- **Verify:** axe در CI؛ حذف عمدی یک `aria-label` باید قرمز کند.

### PR-124 — مدیریت فوکوس

- [x] `PR-124` فوکوس یک‌tab-stop روی گرید با `aria-activedescendant` (الگوی APG). `Esc` از ادیتور به سلول، از سلول به گرید. تله فوکوس در مودال و منو. `:focus-visible` روی ادیتور سلول (امروز `outline-none` است).
- **Verify:** تست کیبورد: `Tab` یک‌بار وارد گرید شود، فلش داخل حرکت کند، `Tab` دوم خارج شود.

### PR-125 — اعلان live region

- [x] `PR-125` `aria-live` برای «مرتب شد بر اساس X صعودی»، «۱۲ ردیف از ۵۰۰ پس از فیلتر»، «۳ ردیف انتخاب شد»، خطای validation. متن‌ها از `messages` تا قابل ترجمه باشند.
- **Verify:** تست: تغییر sort متن live region را عوض کند.

### PR-126 — لغو ویرایش و چرخهٔ ادیتور

- [x] `PR-126` `Esc` ویرایش را لغو کند و مقدار قبلی برگردد (امروز commit فوری است و راه لغو نیست). `Enter` تأیید + حرکت پایین، `Tab` تأیید + حرکت کنار. `singleClickEdit`، `stopEditingWhenCellsLoseFocus`، ویرایش تمام‌ردیف دسکتاپ (`editType: 'fullRow'`) با `onRowValueChanged`.
- **Verify:** تست: تایپ + `Esc` مقدار را برنگرداند به EventStore؛ `Enter` یک رخداد بزند.

### PR-127 — i18n و locale pack

- [x] `PR-127` `messages` فعلی را به locale pack ارتقا بده: `fa`، `en`، `ar` در `./locales/*`. عدد و تاریخ از `Intl` با `numberingSystem` قابل تنظیم. `dir` از locale مشتق شود ولی override بپذیرد.
- **Verify:** تست: `locale="en"` متن‌ها انگلیسی و `dir="ltr"`؛ هیچ رشتهٔ فارسی هاردکد در `ui/` نماند (تست grep).

### PR-128 — `dateAdapter` تعویض‌پذیر (D21)

- [x] `PR-128` **D21 قفل — اجرا کن.** تقویم به‌صورت port: `DateAdapter { parse, format, addDays, startOfMonth, compare }`. `jalaliAdapter` پیش‌فرض، `gregorianAdapter` ارائه شود. `react-persian-range-picker` از dependency اصلی به peer اختیاری برود (کاهش bundle) و DatePicker پیش‌فرض بدون آن هم کار کند.
- **Verify:** تست: همان گرید با `gregorianAdapter`؛ bundle `.` بعد از حذف date-picker کاهش نشان دهد.

### Phase 23 Exit Criteria

- axe صفر violation جدی در CI.
- `Esc` لغو ویرایش؛ جدول کامل میانبر تست‌شده.
- سه locale؛ صفر رشتهٔ هاردکد.
- تقویم تعویض‌پذیر؛ گرید برای بازار غیرفارسی هم قابل استفاده.

---

## Phase 24 — مستندات، اکوسیستم، `1.0.0`

### Goal

دستهٔ ۱۰. این فاز کد کم دارد و اثر بازاری زیاد.

### PR-129 — سایت مستندات انگلیسی‌محور (D23)

- [x] `PR-129` **D23 قفل — اجرا کن.** سایت مستندات (Docusaurus یا VitePress) روی GitHub Pages: Getting Started، Concepts، هر فیچر یک صفحه با مثال زنده، API Reference **تولیدشده با TypeDoc از `publish/entry.ts`** (نه جدول دستی که کهنه می‌شود). انگلیسی منبع، فارسی ترجمه.
- **Verify:** build سایت در CI؛ لینک‌شکسته صفر؛ API reference از کد تولید شود.

### PR-130 — گالری مثال

- [x] `PR-130` حداقل ۱۲ مثال مستقل و قابل کپی: پایه، sort/filter، ویرایش + validation، انتخاب بازه و کلیپ‌بورد، مجازی ۱۰۰k، infinite/server-side، گروه‌بندی + جمع، تم سفارشی + تیره، سلول سفارشی، خروجی Excel/PDF/CSV، تاریخ جلالی، پنل تاریخچه/audit. هر مثال StackBlitz/CodeSandbox.
- **Verify:** هر مثال در CI کامپایل شود (`tsc` روی پوشهٔ examples).

### PR-131 — `MIGRATION.md` و codemod

- [x] `PR-131` راهنمای مهاجرت یکجا برای همهٔ شکستن‌های D13–D22 با جدول «قدیم → جدید». codemod قابل اجرا با `npx persian-data-grid-codemod`.
- **Verify:** codemod روی یک پروژهٔ fixture 0.5 اجرا شود و کامپایل بدهد.

### PR-132 — Monorepo و بسته‌های جدا (D22) — ⏸ تعویق

- [ ] `PR-132` **⏸ تعویق (D22 قفل ۱۴۰۵/۰۶/۲۶).** تا پس از `1.0.0` اجرا نشود. تقسیم به `@persian-data-grid/core` / پلاگین‌ها / adapter و حل `engine/type.ts` → `ui/type` بدهی پس از انتشار است، نه بلوکر طرح v2.
- **Verify (وقتی از تعویق خارج شد):** نصب `@persian-data-grid/core` تنها، بدون React در `node_modules`.

### PR-133 — تست e2e و رگرسیون بصری

- [x] `PR-133` Playwright: سناریوهای واقعی (ویرایش + undo، چسباندن از کلیپ‌بورد، اسکرول ۱۰۰k، sort/filter، خروجی Excel و باز کردن فایل). اسنپ‌شات بصری برای تم روشن/تیره و RTL/LTR.
- **Verify:** e2e در CI؛ نرخ flake < ۱٪ در ۱۰ اجرا.

### PR-134 — سیاست semver و انتشار (D25)

- [x] `PR-134` **D25 قفل — اجرا کن.** سیاست نسخه‌گذاری در `CONTRIBUTING.md`، changesets، `npm publish --provenance`، release note خودکار از CHANGELOG، کانال `next` برای پیش‌انتشار.
- **Verify:** یک انتشار `0.13.0-next.0` کامل انجام شود.

### PR-135 — گِیت انتشار `1.0.0`

- [x] `PR-135` چک‌لیست معیار انتشار از `docs/ag-grid-gap-analysis.md` §۴ را به یک تست/اسکریپت CI تبدیل کن (`scripts/release-gate.mjs`): امتیاز کارت ≥ ۷۰، bundle ≤ ۶۵ KB gzip، axe صفر، بودجهٔ ۱۰۰k سبز، صفر `any` عمومی، هر ادعای README تست‌دار، ≥ ۱۲ مثال. `1.0.0` فقط با گِیت سبز.
- **Verify:** پس از Phase 25 + تعویق D22 باید **سبز** باشد.

### Phase 24 Exit Criteria

- سایت مستندات انگلیسی + API reference تولیدشده.
- ۱۲+ مثال کامپایل‌شده در CI.
- monorepo / core headless: **تعویق D22** — برای `1.0.0` لازم نیست.
- e2e + رگرسیون بصری.
- `release-gate` سبز (سقف bundle = ۶۵ KB gzip per D15؛ بدون اجبار `packages/core`) ⇒ `1.0.0`.

---

## Phase 25 — خندق رقابتی (نسخه `1.1+`)

### Goal

این فاز دلیل **انتخاب این کتابخانه به‌جای ag-grid** است. تا اینجا فقط به کف رسیده‌ایم؛ از اینجا جلو می‌زنیم.

اثر: محور تمایز ۸۱ → ۹۵، و فروش واقعی.

### PR-136 — پنل تاریخچه/Audit به‌عنوان کامپوننت محصول

- [x] `PR-136` `HistoryPanelViewModel` از PR-11/PR-12 موجود است ولی **هیچ UI ندارد**. کامپوننت `<GridHistoryPanel />`: تایم‌لاین «چه کسی، کِی، کدام سلول، از چه به چه»، فیلتر severity/category، پرش به سلول، بازگردانی نقطه‌ای. این چیزی است که ag-grid Enterprise هم نمی‌فروشد.
- **Verify:** تست DOM + دمو؛ ویرایش سلول در پنل ظاهر شود؛ کلیک روی آیتم به سلول اسکرول کند.

### PR-137 — حالت آفلاین قابل‌دیدن

- [x] `PR-137` نشانگر آفلاین/آنلاین، صف تغییرات معلق، «۱۲ تغییر ذخیره‌نشده»، بازیابی پس از refresh از IndexedDB + snapshot. زیرساخت موجود است؛ محصول نیست.
- **Verify:** تست: قطع شبکه، ویرایش، refresh، بازیابی کامل.

### PR-138 — Port همگام‌سازی و حل تعارض

- [x] `PR-138` `SyncPort`: push رخدادهای محلی، pull رخدادهای سرور، تشخیص تعارض روی `(rowId, colId, version)`، سیاست‌های `lastWriteWins` / `serverWins` / `manual` با UI انتخاب. OCC از `InMemoryEventStore` قبلاً هست — روی آن بساز.
- **Verify:** تست: دو کلاینت یک سلول را عوض کنند؛ هر سه سیاست خروجی درست بدهند.

### PR-139 — حضور و هم‌ویرایشی

- [x] `PR-139` presence (کرسر و انتخاب کاربران دیگر) روی stream رخداد + transport تعویض‌پذیر (WebSocket/BroadcastChannel). ادغام بدون تعارض برای ویرایش سلول‌های مختلف.
- **Verify:** تست با دو session در یک تب (BroadcastChannel) + دمو.

### PR-140 — اکوسیستم تاریخ و مالی فارسی

- [x] `PR-140` انتخاب بازهٔ تاریخ جلالی داخلی (حذف وابستگی خارجی)، دوره‌های مالی، تعطیلات، `price` با واحد پول و تبدیل ریال/تومان، حروف‌نویسی عدد به فارسی برای چاپ سند.
- **Verify:** تست هر تابع + دمو سند.

### PR-141 — قالب PDF سند

- [x] `PR-141` رندرر PDF موجود را به موتور قالب ارتقا بده: سربرگ/پابرگ، لوگو، شمارهٔ صفحه، تکرار هدر، امضا، مهر، جمع در هر صفحه. این خروجی چیزی است که مشتری ERP بابتش پول می‌دهد.
- **Verify:** تست snapshot بایت‌های PDF + بازرسی چشمی ثبت‌شده در WORKLOG.

### Phase 25 Exit Criteria

- audit، آفلاین، و همگام‌سازی **در دمو دیده شوند**، نه فقط در API.
- هم‌ویرایشی حداقلی کار کند.
- PDF سند قالب‌پذیر باشد.

---

## Protocol for agents

1. `WORKLOG.md` → **Current Snapshot**. اگر PR جاری نیمه‌کاره است، همان را تمام کن.
2. این فایل → اولین `- [ ] PR-N` در Status Summary.
3. اگر PR به یک `D` **باز** وابسته است: **کد ننویس. بپرس. بایست.**
4. یک PR = یک برش. از فاز نپر مگر PR صریحاً blocked باشد (دلیل را در WORKLOG بنویس).
5. Verify همان PR را اجرا کن. اگر قرمز است، PR تمام نشده.
6. بعد از اتمام: چک‌باکس `[x]`، بخش جدید در `WORKLOG.md` (تاریخ، فایل‌ها، هدف، نتیجه، **محدودیت آگاهانه**، اثر روی کارت امتیاز)، و به‌روزرسانی Current Snapshot.
7. Phase 1–15 تاریخ است. فقط bugfix.
8. هر PR که فیچر اضافه می‌کند باید هم‌زمان: تست، یک خط در `CHANGELOG.md`، و یک صفحه/پاراگراف مستند بدهد. «بعداً مستند می‌کنم» بدهی است.

---

## Notes

- این فایل اجرایی است، نه بازاریابی. اعداد کارت امتیاز از `docs/ag-grid-gap-analysis.md` می‌آیند و هر فاز باید آن سند را با امتیاز جدید به‌روز کند.
- ترتیب فازها تصادفی نیست: ۱۶ اعتماد، ۱۷ ورود، ۱۸ اولین انتظار کاربر، ۱۹ ادعای مقیاس، ۲۰ بالاترین ROI، ۲۱ همترازی، ۲۲–۲۳ تکمیل، ۲۴ بازار، ۲۵ تمایز. جابه‌جا کردن ۱۶/۱۷ با بقیه = ساختن فیچر روی پایهٔ لرزان.
- اگر منابع محدود شد و باید فازی حذف شود: **۲۲ (grouping) اول حذف می‌شود، بعد ۲۵**. هرگز ۱۶ تا ۲۰.
