# EXECUTION_PLAN.md

## Purpose

این فایل نسخهٔ اجرایی `ARCHITECTURE.md` است: فازها را به PRهای کوچک، قابل‌اجرا، و کم‌ریسک می‌شکند تا توسعهٔ تدریجی جدول بدون شکستن ERP فعلی جلو برود.

مرجع معماری: `ARCHITECTURE.md`  
مرجع اجرا و verify: `WORKLOG.md`

---

## Ground Rules

- منطق فعلی ERP نباید بی‌دلیل حذف یا بازنویسی شود.
- هر قدم باید کوچک، تست‌پذیر، و قابل برگشت باشد.
- اول Domain و Application پایدار می‌شوند، بعد Adapter و UI.
- هر PR باید یا مرز معماری را تمیزتر کند یا قابلیت جدیدی را بدون شکستن رفتار موجود اضافه کند.

---

## Status Summary

- **وضعیت کلی طرح اجرایی: ۱۰۰٪ کامل**
- فازهای اجباری ۱ تا ۵: همه **Completed**
- آخرین PR پوشش‌داده‌شده در طرح: **PR-38**
- محدودهٔ باقی‌مانده فقط **Backlog اختیاری خارج از طرح اجرایی** است (نه شکاف فاز)

### Completion Verdict

| محدوده | پوشش | وضعیت |
|--------|------|--------|
| Phase 1 (PR-1 … PR-4) | WORKLOG PR-1 … PR-4 | ✅ 100% |
| Phase 2 (PR-5 … PR-15b) | WORKLOG PR-5 … PR-15b | ✅ 100% |
| Phase 3 (PR-16 … PR-20) | WORKLOG PR-16 … PR-20 | ✅ 100% |
| Phase 4 (PR-21 … PR-25) | WORKLOG PR-21 … PR-25 | ✅ 100% |
| Phase 5 Hardening (PR-26 … PR-38) | WORKLOG PR-26 … PR-38 | ✅ 100% |
| **جمع طرح اجرایی** | **PR-1 … PR-38** | **✅ 100%** |

Verify ثبت‌شده در WORKLOG: `25` فایل تست / `104` تست + `typecheck:publish` + `typecheck:host-ui` + `build` + `verify:dist`.

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

## Plan Closure

- طرح اجرایی `EXECUTION_PLAN` برای فازهای ۱ تا ۵ **بسته شده** است.
- هیچ PR علامت‌خوردهٔ طرح بدون گزارش متناظر در `WORKLOG` باقی نمانده است.
- هیچ گزارش WORKLOG در بازهٔ PR-1 … PR-38 بدون ردیف متناظر در این پلن باقی نمانده است.

### Out of Scope (اختیاری — خارج از طرح اجرایی)

این موارد **شکاف فاز نیستند**؛ backlog محصولی/مهندسی بعد از بستن طرح‌اند:

1. جایگزینی تدریجی `@ts-nocheck` host-glue با peer deps تایپی واقعی (antd / next-intl / atoms)
2. مهاجرت تدریجی hostهای قدیمی ERP که هنوز به pagination وابسته‌اند (`virtualization={false}`)

---

## Notes

- این فایل intentionally اجرایی است، نه معماری.
- پس از بستن طرح، تغییر وضعیت فقط با افزودن فاز جدید (Phase 6+) یا تغییر صریح Scope انجام می‌شود.
