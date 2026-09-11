# EXECUTION_PLAN.md

## Purpose

این فایل نسخهٔ اجرایی `ARCHITECTURE.md` است: فازها را به PRهای کوچک، قابل‌اجرا، و کم‌ریسک می‌شکند تا توسعهٔ تدریجی جدول بدون شکستن ERP فعلی جلو برود.

مرجع معماری: `ARCHITECTURE.md`  
مرجع اجرا و verify: `WORKLOG.md`  
ورود ایجنت: `docs/agent-handoff.md`

---

## Active Track (بخوان؛ فاز ۱–۵ بسته است)

- **فاز ۱ تا ۵ (PR-1 … PR-38): بسته — دست نزن مگر bugfix.**
- **کار جاری: ندارد — Phase 15 (PR-71) بسته است. فاز بعدی فقط با RFC / تأیید کاربر.**
- تصمیم‌های قفل‌شدهٔ ۱۴۰۵/۰۶/۲۰ (۱۱ سپتامبر ۲۰۲۶) در بخش Open Decisions.

---

## Ground Rules

- منطق فعلی ERP نباید بی‌دلیل حذف یا بازنویسی شود.
- هر قدم باید کوچک، تست‌پذیر، و قابل برگشت باشد.
- اول Domain و Application پایدار می‌شوند، بعد Adapter و UI.
- هر PR باید یا مرز معماری را تمیزتر کند یا قابلیت جدیدی را بدون شکستن رفتار موجود اضافه کند.

---

## Status Summary

| محدوده | PR | وضعیت |
|--------|----|--------|
| Phase 1–5 (طرح قبلی) | PR-1 … PR-38 | ✅ بسته |
| Phase 6 Theming foundation | PR-39 … PR-41 | ✅ کامل |
| Phase 7 Theming API | PR-42 … PR-45 | ✅ کامل |
| Phase 8 Public API honesty | PR-46 … PR-50 | ✅ کامل |
| Phase 9 Decouple arianERP | PR-51 … PR-53 | ✅ کامل (شکستن D1 و D11) |
| Phase 10 Cell registry | PR-54 … PR-57 | ✅ کامل |
| Phase 11 Column chrome | PR-58 … PR-61 | ✅ کامل |
| Phase 12 Accessibility | PR-62 … PR-64 | ✅ کامل |
| Phase 13 Persian PDF | PR-65 … PR-67 | ✅ کامل |
| Phase 14 Voucher polish | PR-68 … PR-70 | ✅ کامل |
| Phase 15 Search marks in registered cells | PR-71 | ✅ کامل |

Verify آخرین طرح بسته: WORKLOG پس از PR-38 — تست‌ها + `typecheck:publish` + `typecheck:host-ui` + `build` + `verify:dist`.

---

## Open Decisions

وضعیت: **قفل** یعنی ایجنت اجرا کند. **باز** دیگر در D1–D12 نیست. شکستن عمومی جدید (غیر از D1 و D11) باید قبل از کد تأیید شود (`ask_each`).

| کد | موضوع | تصمیم | منبع |
|----|--------|--------|------|
| D1 | پیش‌فرض `RemoteApi` | **قفل:** `NoopRemoteApi`. `FetchRemoteApi` فقط export برای inject میزبان. | ۱۴۰۵/۰۶/۲۰ |
| D2 | `COLUMN_REORDERED` | **قفل:** کامل سیم شود (handler + drag هدر). | ۱۴۰۵/۰۶/۲۰ |
| D3 | PDF | **قفل:** رندرر فارسی واقعی (فونت + جدول). نه نمونهٔ Helvetica. | ۱۴۰۵/۰۶/۲۰ |
| D4 | Semver در 0.6 | **قفل:** هر شکستن جدا تأیید شود. تأییدشده: D1، D11. | ۱۴۰۵/۰۶/۲۰ |
| D5 | `asyncValidator` | **قفل: اجرا شود** در `TableEngine.validation` (await). | ۱۴۰۵/۰۶/۲۰ |
| D6 | `SparseRowIndex` | **قفل: در همین Phase 8 وارد مسیر مجازی شود** (نه unexport). | ۱۴۰۵/۰۶/۲۰ |
| D7 | `SnapshotStrategy` در bootstrap | **قفل: opt-in** با `config.snapshotStore`؛ پیش‌فرض عوض نشود. | ۱۴۰۵/۰۶/۲۰ |
| D8 | تم تیره | **قفل: دکمه در chrome محصول `ERPTable`** تا صفحات ERP میزبان هم داشته باشند. دمو همان دکمه را نشان می‌دهد. | ۱۴۰۵/۰۶/۲۰ |
| D9 | فونت PDF فارسی | **قفل: Vazirmatn / OFL.** IRANSans embed نشود. | ۱۴۰۵/۰۶/۲۰ |
| D10 | Pin ستون | **قفل: فقط ستون `index`.** ستون دلخواه = RFC جدا. | ۱۴۰۵/۰۶/۲۰ |
| D11 | `multiSelectConfig` اجباری | **قفل: اختیاری** (شکستن نوع تأیید شد). نبودن = مخفی شدن دکمه. | ۱۴۰۵/۰۶/۲۰ |
| D12 | `rowHeight` پیش‌فرض | **قفل: ۴۰px** حتی بعد از Theming API. | ۱۴۰۵/۰۶/۲۰ |

### خارج از محدوده تا RFC جدا

grouping، pivot، tree data، chart، SSRM، column menu شبیه AG، range selection سلولی، فرمول صفحه‌گسترده. این کتابخانه ویرایشگر اقلام سند است.

---

## Phase 1

### Goal

پاک‌سازی هسته، تثبیت رفتار دامنه، جداسازی مرزها، و آماده‌سازی Event Store اولیه.

### PR Breakdown

- [x] `PR-1` Characterization tests برای `Table` / `Row` / `Cell`
- [x] `PR-2` جداسازی `ColumnSchema` از وابستگی مستقیم به React در Domain
- [x] `PR-3` جداسازی `ApplicationTableCommand` از `EngineTableCommand`
- [x] `PR-4` Dual-write اولیه برای `CHANGE_CELL_VALUE` به `InMemoryEventStore`

### Phase 1 Exit Criteria

- تست‌های دامنه وجود داشته باشند
- Domain از `bootstrap/type` و React نشت نداشته باشد
- Commandهای دامنه از UI commandها جدا شده باشند
- Event Store حداقلی برای شروع مهاجرت فعال باشد

### Phase 1 Status

- **Completed (100%)**

---

## Phase 2

### Goal

تبدیل تغییرات به جریان Event-Driven واقعی، ساخت read model، changelog، و APIهای تاریخچه برای UI.

### PR Breakdown

- [x] `PR-5` انتقال dual-write به سطح `TableAppService` برای همهٔ Application commandها
- [x] `PR-6` ساخت `ChangelogProjection`
- [x] `PR-7` wiring واقعی `InMemoryEventStore` و `ChangelogProjection` در `createERPTable`
- [x] `PR-8` expose کردن changelog از طریق `UITableController`
- [x] `PR-9` facade سطح hook در `useERPTable`
- [x] `PR-10` subscription API برای changelog
- [x] `PR-11` ساخت `HistoryPanelViewModel` برای تبدیل raw eventها به آیتم‌های قابل‌نمایش
- [x] `PR-12` افزودن `HistorySeverity` و `HistoryCategory`
- [x] `PR-13` ثبت `previousValue` واقعی در همهٔ eventهای مربوط به تغییر سلول
- [x] `PR-14` اضافه‌کردن `readAll()` یا global stream abstraction برای projectionهای سراسری
- [x] `PR-15` شروع `Undo/Redo` برای `CELL_CHANGED`
- [x] `PR-15b` بستن شکاف Phase 2: Undo برای `ROW_ADDED` + batch با `correlationId`

### Phase 2 Exit Criteria

- همهٔ Application commandهای مهم به EventStore نوشته شوند
- changelog و history API در runtime واقعی در دسترس باشند
- UI بتواند بدون وابستگی به rerender اصلی جدول، history را subscribe کند
- پایهٔ Undo/Redo از روی eventها آماده باشد

### Phase 2 Status

- **Completed (100%)**

---

## Phase 3

### Goal

تقویت wrapper React و نزدیک شدن به شکل نهایی `useGrid` / `GridSession`.

### Planned PRs

- [x] `PR-16` selector-based subscription برای جلوگیری از rerenderهای غیرضروری
- [x] `PR-17` تفکیک بیشتر `UITableController` به adapter نازک
- [x] `PR-18` حرکت تدریجی keyboard/view commands به session-centric API
- [x] `PR-19` mapping رسمی `ColumnSchema -> ColumnDefinition + bindings`
- [x] `PR-20` harness یا integration واقعی‌تر با سناریوی ERP

### Phase 3 Exit Criteria

- Adapter React نازک‌تر شود
- UI history و view state را از facade رسمی بگیرد
- وابستگی‌های host-specific از مسیر core بیشتر جدا شوند

### Phase 3 Status

- **Completed (100%)**

---

## Phase 4

### Goal

عملکرد، Undo/Redo کامل‌تر، pluginها، و آماده‌سازی مسیر انتشار.

### Planned PRs

- [x] `PR-21` `IndexedDbEventStore`
- [x] `PR-22` snapshot strategy
- [x] `PR-23` benchmark و performance budget
- [x] `PR-24` plugin-friendly event catalog / public API docs
- [x] `PR-25` مسیر بسته‌بندی و publish

### Phase 4 Exit Criteria

- EventStore بادوام مرورگر و snapshot strategy موجود باشند
- بودجهٔ عملکرد قابل اندازه‌گیری باشد
- catalog / public API مستند باشد
- مسیر publish واقعی (نه stub) موجود باشد

### Phase 4 Status

- **Completed (100%)**

---

## Phase 5 — Hardening & Productization

### Goal

بستن شکاف‌های پس از فاز ۴ که در مسیر واقعی توسعه به‌عنوان «قدم بعدی» اجرا شدند: virtualization، plugins، paste/cut undo، DTS سخت‌گیر، و مرز typecheck UI میزبان.

### Planned / Executed PRs

- [x] `PR-26` ViewportCalculator / virtualization Core
- [x] `PR-27` VirtualList React adapter
- [x] `PR-28` Real tsup publish path
- [x] `PR-29` Excel/PDF plugins روی EVENT_CATALOG + PluginHost
- [x] `PR-30` Redo `ROW_ADDED` با restore هویت ردیف
- [x] `PR-31` Desktop virtualization (ابتدا opt-in)
- [x] `PR-32` Grid search / error nav با مسیر مجازی
- [x] `PR-33` Paste dual-write + undo واحد
- [x] `PR-34` Undo cut-delete در واحد paste
- [x] `PR-35` DTS خودکار publish
- [x] `PR-36` Strict typecheck سطح publish
- [x] `PR-37` Desktop virtualization default-on
- [x] `PR-38` مرز type debt UI میزبان (`typecheck:host-ui` + shims)

### Phase 5 Exit Criteria

- Desktop/virtual مسیر محصولی داشته باشد (default-on + escape hatch)
- Paste/cut از AppService با dual-write و undo واحد کار کند
- Publish با auto DTS سخت‌گیر و verify قابل تکرار باشد
- typecheck publish و host-ui در CI/prepublish قابل اجرا باشد

### Phase 5 Status

- **Completed (100%)**

---

## Plan Closure — Phase 1–5 only

- طرح اجرایی اولیه برای فازهای ۱ تا ۵ **بسته شده** است (PR-1 … PR-38).
- کار جدید فقط از **Phase 6** و شمارهٔ PR-39 به بعد.

### Out of Scope از طرح ۱–۵ (هنوز اختیاری مگر وارد فاز ۱۴ شود)

1. جایگزینی تدریجی `@ts-nocheck` host-glue با peer deps تایپی واقعی
2. مهاجرت hostهای قدیمی به `virtualization={false}` صریح

---

## Protocol for agents

1. `WORKLOG.md` → Current Snapshot. اگر PR جاری نیمه‌کاره است همان را تمام کن.
2. این فایل → اولین چک‌باکس خالی Phase 6+.
3. اگر PR به تصمیم **باز** وابسته است و در جدول بالا قفل نیست: کد ننویس؛ بپرس.
4. شکستن پیش‌فرض/نوع عمومی غیر از D1: قبل از کد تأیید بگیر.
5. بعد از اتمام PR: چک‌باکس را `[x]` کن، یک بخش در `WORKLOG.md` اضافه کن، دستورات Verify همان PR را اجرا و نتیجه را بنویس.
6. ظاهر صفحات سند ERP را بی‌دلیل عوض نکن مگر PR صراحتاً تم/a11y باشد.

---

## Phase 6 — Theming foundation (بدون تغییر ظاهر)

### Goal

لایهٔ توکن معنایی زیر CSS فعلی. ERP پیکسل‌به‌پیکسل یکی بماند. هنوز prop `theme` نیست.

زمینه: `ui/styles/injectStyles.ts` و `ui/styles/erp-table.css` **دو کپی** از یک پالت‌اند (`--erp-gray-3` نه `--erp-header-bg`). هگز هاردکد در pagination/modal/toast.

### PR-39 — Semantic aliases

- [x] `PR-39` روی `.erp-table` متغیرهای نقش اضافه کن: `--erp-bg`, `--erp-fg`, `--erp-accent`, `--erp-header-bg`, `--erp-row-stripe`, `--erp-row-selected`, `--erp-border`, `--erp-danger`, `--erp-search-match`, `--erp-font`, `--erp-row-height`, `--erp-font-size`, `--erp-radius`. هر کدام به مقدار فعلی پالت alias شود (`--erp-bg: var(--erp-main-white)`). هر دو فایل CSS را هم‌زمان عوض کن.
- **نکن:** JSX، prop جدید، تم تیره.
- **Verify:** `yarn test` + مقایسهٔ چشمی دمو سند (zebra آبی، هدر خاکستری). بدون diff بصری.

### PR-40 — Kill hardcoded hex

- [x] `PR-40` `#fff` / `#d9d9d9` / toast `#2c8440` / overlay rgba در `injectStyles.ts` و `erp-table.css` را به `var(--erp-*)` ببر. کلاس‌های utility موجود (`bg-blue-blue11`) به توکن معنایی معادل وصل شوند نه hex جدید.
- **Verify:** همان دمو + grep `#[0-9a-fA-F]{3,8}` در `ui/styles/` فقط در تعریف توکن پالت مجاز است.

### PR-41 — `GridTheme` + `themeErp`

- [x] `PR-41` ماژول `ui/theme/GridTheme.ts`: نوع `ThemeParams`، کلاس `GridTheme` با `withParams` و `toCssVars()`. `themeErp` = مقادیر امروز. تست واحد: `withParams` immutable است؛ `toCssVars()` کلیدهای `--erp-*` را می‌دهد. از `index.ts` / `publish/entry.ts` export کن. هنوز به `ERPTable` وصل نکن.
- **Verify:** تست theme + `yarn typecheck:publish`.

### Phase 6 Exit

مصرف‌کننده هنوز `theme=` ندارد. CSS معنایی است. `themeErp.toCssVars()` با ظاهر فعلی یکی است.

---

## Phase 7 — Theming API

### Goal

تم یک شیء Typed است که به ریشهٔ جدول می‌رسد. Portalها هم inherit می‌کنند. دکمهٔ تیره در chrome محصول (D8).

### PR-42 — prop + host context

- [x] `PR-42` `ERPTableProps.theme?: GridTheme` پیش‌فرض `themeErp`. `style={theme.toCssVars()}` روی ریشهٔ `.erp-table`. `theme` را در `ERPTableHostProvider` بگذار. `useERPTableTheme()` برای primitives.
- **نکن:** تم تیره؛ عوض کردن `rowHeight` موتور.
- **Verify:** در دمو `withParams({ accentColor: 'hotpink' })` دکمه‌ها/لینک‌های آبی را عوض کند. بدون prop ظاهر ERP ثابت.

### PR-43 — Portal inheritance

- [x] `PR-43` modal / tooltip / dropdown / toast که `createPortal(..., document.body)` می‌شوند vars را از دست می‌دهند. یا portal داخل `.erp-table`، یا همان `toCssVars()` روی overlay. بدون این، تم تیره در فاز بعد می‌شکند.
- **Verify:** select باز + مودال multi-select با `accentColor` غیرپیش‌فرض.

### PR-44 — `themeErpDark` + دکمه در محصول (D8)

- [x] `PR-44` `themeErpDark` از `themeErp.withParams(...)`. دکمهٔ روشن/تیره در تولبار `ERPTable` (مثلاً `GroupActionButtons`) تا صفحات ERP میزبان بدون کار اضافه همان دکمه را ببینند. `themeToggle?: boolean` پیش‌فرض `true`؛ `false` مخفی می‌کند. اگر host `theme` پاس دهد، آن منبع حقیقت است و دکمه بین `themeErp` / `themeErpDark` جابه‌جا می‌شود مگر host تم سفارشی قفل کند (مستند کن). دمو جداگانه UI موازی نسازد — همان chrome.
- **Verify:** LiveGridPreview و `ERPTable` بدون wrapper دمو هر دو دکمه دارند؛ مودال/tooltip هم تیره (وابسته به PR-43).

### PR-45 — density از تم (D12)

- [x] `PR-45` `rowHeight` و فونت سلول از `theme.params` خوانده شود (الان ۴۰ در virtual body و `createERPTable` pageSize). `tableHeight / rowHeight` برای pageSize. **پیش‌فرض `themeErp.params.rowHeight` باید ۴۰ بماند.**
- **Verify:** بدون `withParams` ارتفاع سطر = ۴۰. `rowHeight: 48` در دمو فاصلهٔ سطر مجازی و pagination را عوض کند.

### Phase 7 Exit

```tsx
<ERPTable theme={themeErp.withParams({ accentColor: '#1d4ed8' })} />
```
و CSS `.erp-table { --erp-accent: ... }` هر دو کار کنند.

### Phase 7 Status

- **Completed (100%)** — PR-42 … PR-45

---

## Phase 8 — Public API honesty

### Goal

سطح عمومی با واقعیت کد یکی شود. فیچر مرده یا سیم می‌شود یا از ادعا می‌افتد.

### PR-46 — Audit only

- [x] `PR-46` سند `docs/public-api-honesty.md`: هر export / command که handler یا UI ندارد (`CLEAR_ROW_SELECTION`, `SET_UNIT_LEVEL`, `COLUMN_REORDERED` تا Phase 11، `asyncValidator` تا PR-47، `SparseRowIndex` تا PR-49 خارج از مسیر رندر، `SnapshotStrategy` تا PR-50 خارج از bootstrap). بدون تغییر رفتار.
- **Verify:** سند با grep در ریپو هم‌خوان است.

### PR-47 — `asyncValidator` (D5 قفل: اجرا)

- [x] `PR-47` `TableEngine.validation` / `isValidCell` قوانین `asyncValidator` را await کنند. خطا در همان `CellError` map. مسیر sync فعلی نباید رگرسیون کند. UI هدر خطا بعد از settle شدن Promise به‌روز شود.
- **Verify:** تست با validator ردکننده و یکی resolveکننده؛ ویرایش سلول معمولی بدون rule async همان‌قدر سریع بماند.

### PR-48 — `CLEAR_ROW_SELECTION` / `SET_UNIT_LEVEL`

- [x] `PR-48` `CLEAR_ROW_SELECTION` handler واقعی + تست؛ `SET_UNIT_LEVEL` / `ChangeUnitLevelHandler` / `addColumns([])` حذف شد. توکن catalog `UNIT_COLUMN_ADDED` reserved ماند (بدون emitter).
- **Verify:** هیچ `type:` بدون `case` در engine/AppService برای commandهای exportشده (`COLUMN_REORDERED` تا Phase 11 در honesty).

### PR-49 — `SparseRowIndex` در مسیر مجازی (D6 قفل)

امروز `ERPTableVirtualBody` همهٔ `getAllUIRows()` را کپی و sort می‌کند؛ `SparseRowIndex` فقط در تست viewport است. باید وارد مسیر گرم شود.

- [x] `PR-49` ایندکس تنک در engine/session برای ردیف‌های UI (ترتیب = ستون `index`). `useVirtualWindow` / `buildVirtualWindowFromSparse` / `ERPTableVirtualBody` پنجره را از `SparseRowIndex.projectVisible` می‌گیرند. add/delete/reorder ایندکس را invalidate می‌کند. pagination پیش‌فرض اجباری نشد. export عمومی ماند.
- **Verify:** `yarn test` + تست دسکتاپ مجازی + ۱۰۰k window.

### PR-50 — Snapshot opt-in (D7)

- [x] `PR-50` `CreateERPTableConfig.snapshotStore?` + `SnapshotStrategy` فقط وقتی پاس داده شد. پیش‌فرض رفتار امروز (dual-write repository). مستند در `docs/public-api.md`.
- **Verify:** تست bootstrap بدون store = بدون snapshot؛ با store = catch-up.

### Phase 8 Exit

README/catalog چیزی را «هست» نمی‌گوید که runtime ندارد.

---

## Phase 9 — Decouple arianERP (شکستن D1 و D11 تأییدشده)

### Goal

پکیج npm به `persist:arianERP` وابسته نباشد. میزبان ERP یک خط inject می‌کند.

**شکستن تأییدشده:** (۱) بدون `remoteApi` دیگر Fetch نمی‌زند — D1. (۲) `multiSelectConfig` اختیاری می‌شود — D11. قبل از merge در پیام PR به میزبان ERP یادآوری کن.

### PR-51 — default `NoopRemoteApi`

- [x] `PR-51` در `bootstrap/index.ts` و مسیر UI: default = `NoopRemoteApi` در همهٔ محیط‌ها. `FetchRemoteApi` export بماند. تست: بدون config، request نمی‌شود. `docs/public-api.md` مثال ERP: `remoteApi={new FetchRemoteApi()}`.
- **Verify:** `create-erp-table.spec` + `typecheck:publish`. دمو اگر select پویا می‌خواهد باید Fetch یا mock بدهد.

### PR-52 — آداپتور میزبان مستند

- [x] `PR-52` `docs/host-arian-erp.md`: کوکی `_auth`، `persist:arianERP`، `Defaults`. کد داخل `FetchRemoteApi` بماند تا ERP بتواند import کند؛ فقط دیگر default نیست.
- **Verify:** README نصب دیگر قول نمی‌دهد که بدون config به ERP وصل می‌شود.

### PR-53 — `multiSelectConfig` اختیاری (D11 قفل)

- [x] `PR-53` `ERPTableProps.multiSelectConfig` اختیاری. نبودن = دکمه و مودال multi-select رندر نشوند. نوع / docs هم‌خوان. شکستن نوع در ۱۴۰۵/۰۶/۲۰ تأیید شد.
- **Verify:** `<ERPTable>` بدون `multiSelectConfig` در `typecheck:publish` / نمونهٔ دمو. صفحات با config فعلی نشکند.

### Phase 9 Exit

`npm i persian-data-grid` بدون localStorage ERP کار می‌کند. select پویا فقط با `remoteApi`.

---

## Phase 10 — Cell registry (در UI را باز کن)

### Goal

FieldType جدید بدون فورک `ui/cellRenderer/index.tsx`. `ColumnViewBinding.render` مصرف شود.

### PR-54 — bind `render`

- [x] `PR-54` مسیر دسکتاپ/موبایل: اگر binding/render یا `returnDisplayValue` هست، قبل از switch `FieldType` رندر شود. تست: ستون با `render` سفارشی.
- **Verify:** ستون‌های موجود بدون render رفتار قبلی.

### PR-55 — `components` map

- [x] `PR-55` `ERPTableProps.components?: Partial<Record<FieldType, CellComponent>>` + کلیدهای آزاد برای type سفارشی. Registry در host context. CellRenderer از registry می‌خواند، سپس switch داخلی به‌عنوان fallback.
- **Verify:** جایگزینی `checkbox` از بیرون؛ بقیه ستون‌ها دست‌نخورده.

### PR-56 — `textArea` از روی registry

- [x] `PR-56` نوع `textArea` را از کامنت درآور و به‌صورت ثبت پیش‌فرض registry پیاده کن — اثبات که FieldType جدید = فایل جدید نه جراحی switch. schema `FieldType` را به‌روز کن.
- **Verify:** دمو یک ستون چندخطی؛ Enter در textarea ناوبری سلول را نمی‌شکند.

### PR-57 — docs extensibility

- [x] `PR-57` `docs/cell-components.md` + مثال در `docs/public-api.md`.
- **Verify:** یک تازه‌وارد بدون خواندن CellRenderer بتواند editor ثبت کند.

### Phase 10 Exit

ادعای توسعه‌پذیری UI دیگر دروغ نیست.

---

## Phase 11 — Column chrome (نیچ سند، نه AG)

D2 قفل: reorder ستون کامل. D10: pin فقط index مگر خلافش گفته شود.

### PR-58 — resize ستون

- [x] `PR-58` drag لبهٔ `<th>`؛ عرض در view state (نه لزوماً EventStore دامنه). `minWidth` کف. ذخیرهٔ عرض = View event اختیاری.
- **Verify:** resize بعد از rerender می‌ماند در جلسه؛ overflow افقی درست.

### PR-59 — pin ستون index

- [x] `PR-59` sticky ایندکس در محصول (نه فقط CSS دمو). **D10: فقط ستون `index`، نه pin دلخواه.** virtual body spacerها را خراب نکند. `virtualization` و pagination هر دو.
- **Verify:** اسکرول افقی؛ ستون ردیف ثابت. دمو overlap قدیمی را با API محصول یکی کن یا حذف کن.

### PR-60 — `COLUMN_REORDERED` engine + handler

- [x] `PR-60` `Table.reorderColumns` را از engine/AppService صدا بزن. dual-write + catalog. تست دامنه موجود را به integration وصل کن.
- **Verify:** dispatch command ترتیب `getColumns` را عوض می‌کند.

### PR-61 — drag هدر

- [x] `PR-61` UI درگ هدر مثل درگ ردیف. از PR-60 استفاده می‌کند. کیبورد: بعداً در a11y اگر جا شد.
- **Verify:** جابه‌جایی ستون تاریخ/قیمت در دمو؛ refresh schema از host ترتیب دامنه را overwrite نکند مگر صریح.

### Phase 11 Exit

resize + pin index + reorder ستون در ERPTable.

---

## Phase 12 — Accessibility baseline

### Goal

`role="grid"` حداقلی تا ادعای سازمانی در برابر Community کاملًا خالی نباشد. کامل WCAG هدف این فاز نیست.

### PR-62 — roles

- [x] `PR-62` روی `<table>` یا معادل: `role="grid"`, ردیف `row`, سلول `gridcell`, هدر `columnheader`, `aria-colindex` / `aria-rowindex` (در مجازی: ایندکس مطلق نه ایندکس DOM).
- **Verify:**axe یا بازرسی دستی DevTools روی دمو ۱۰ سطر.

### PR-63 — active cell

- [x] `PR-63` سلول فعال: `aria-selected` یا `aria-activedescendant` روی grid. چک‌باکس ردیف `aria-label` (الگوی `DemoIndexCol` را به محصول بیاور).
- **Verify:** یک screen reader یا میانبر موجود هنوز کار می‌کند.

### PR-64 — toolbar buttons

- [x] `PR-64` دکمه‌های GroupAction بدون متن آشکار، `aria-label` از `messages`. فوکوس قابل‌رؤیت را `outline-none` بی‌جایگزین نگذار.
- **Verify:** Tab روی تولبار.

### Phase 12 Exit

گرید برای AT یک جدول است نه `<div>` خام. کامل‌بودن AG را ادعا نکن.

---

## Phase 13 — Persian PDF (D3 قفل)

### Goal

خروجی PDF خوانای RTL برای سند فارسی. `TextPdfRenderer` Helvetica دیگر پیش‌فرض محصول نیست.

**فونت قفل D9: Vazirmatn (OFL).** فایل فونت را در plugin با مجوز OFL بگذار؛ IRANSans embed نکن.

### PR-65 — فونت و shaping

- [x] `PR-65` Port `PdfRenderer` را با جدول + Vazirmatn پر کن (jsPDF یا pdfkit یا موتور خودی — وابستگی در plugin نه core). RTL. subset فونت اگر حجم bundle مهم است.
- **Verify:** سند نمونه با «اقلام سند» و قیمت؛ متن فارسی در PDF خوانا باشد. سقف ۸×۴۰ برداشته یا مستند بزرگ شود.

### PR-66 — جایگزینی پیش‌فرض

- [x] `PR-66` `TextPdfRenderer` را `legacy` یا تست‌only کن. `PdfExportPlugin` پیش‌فرض = رندرر فارسی. RFC-001 را به‌روز کن.
- **Verify:** تست plugin؛ دمو دکمهٔ PDF فارسی.

### PR-67 — تولبار محصول

- [x] `PR-67` دکمهٔ PDF روی دسکتاپ وقتی plugin ثبت شده. موبایل اختیاری.
- **Verify:** ERPTable با `plugins: [new PdfExportPlugin()]` فایل می‌دهد.

### Phase 13 Exit

PDF برای فارسی قابل انتشار است.

---

## Phase 14 — Voucher polish

### Goal

نیچ سند را تمام کن؛ به AG تبدیل نشو.

### PR-68 — Excel import در تولبار

- [x] `PR-68` import الان دمو/imperative است. دکمه در `GroupActionButtons` وقتی `ExcelImportPlugin` ثبت است.
- **Verify:** round-trip export → import روی دمو.

### PR-69 — `rowHeight` / search / footer با تم

- [x] `PR-69` جمع‌بندی نشتی‌های Phase 7: فوتر اعداد، highlight جستجو، از توکن معنایی. اگر چیزی ماند در WORKLOG بنویس.
- **Verify:** تم تیره دمو فوتر و mark را نشکند.

### PR-70 — بستن `@ts-nocheck` سلول در حد امن

- [x] `PR-70` فقط اگر بدون peer antd ممکن است: `cellRenderer` را از nocheck درآور. اگر blocked، در WORKLOG دلیل بگذار و PR را لغو نکن — skip با توضیح.
- **Verify:** `typecheck:host-ui`.

### Phase 14 Exit

کتابخانه برای صفحات سند بسته‌تر است. inquiry/pivot همچنان خارج از محدوده.

---

## Phase 15 — Search marks in registered cells

### Goal

باقی‌ماندهٔ PR-69: `mark` جستجو داخل `textArea` / سلول ثبت‌شده، نه فقط حلقهٔ زرد.

### PR-71 — mark در textArea و description

- [x] `PR-71` `CellRenderContext.searchQuery` / `isCurrentSearchMatch`. `TextAreaCell` و `description` حتی با سلول فعال `mark.erp-search-hit` بگذارند. Host با `highlightIfCurrentSearch`. grouping/pivot نه.
- **Verify:** جستجوی «شرح ردیف» در دمو تم تیره یک `mark.erp-search-hit` بسازد؛ `yarn test`؛ `typecheck:host-ui`.

### Phase 15 Exit

جستجو روی شرح ردیف هم mark دارد. سلول custom غیرمتنی (چک‌باکس) همچنان فقط ring.

---

## Notes

- این فایل اجرایی است، نه بازاریابی.
- فاز ۱–۵ تاریخچه است. وضعیت زنده = Active Track + چک‌باکس‌های Phase 6+.
- بعد از هر فاز، Exit را در `WORKLOG.md` با تاریخ و دستور verify ثبت کن.
