# EXECUTION_PLAN.md

## Purpose

این فایل نسخهٔ اجرایی `ARCHITECTURE.md` است: فازها را به PRهای کوچک، قابل‌اجرا، و کم‌ریسک می‌شکند تا توسعهٔ تدریجی جدول بدون شکستن ERP فعلی جلو برود.

مرجع معماری: `ARCHITECTURE.md`

---

## Ground Rules

- منطق فعلی ERP نباید بی‌دلیل حذف یا بازنویسی شود.
- هر قدم باید کوچک، تست‌پذیر، و قابل برگشت باشد.
- اول Domain و Application پایدار می‌شوند، بعد Adapter و UI.
- هر PR باید یا مرز معماری را تمیزتر کند یا قابلیت جدیدی را بدون شکستن رفتار موجود اضافه کند.

---

## Status Summary

- وضعیت فعلی: **در میانهٔ فاز ۲**
- آخرین PR انجام‌شده: **PR-12**
- قدم منطقی بعدی: **PR-13**

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

- **Completed**

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
- [ ] `PR-13` ثبت `previousValue` واقعی در همهٔ eventهای مربوط به تغییر سلول
- [ ] `PR-14` اضافه‌کردن `readAll()` یا global stream abstraction برای projectionهای سراسری
- [ ] `PR-15` شروع `Undo/Redo` برای `CELL_CHANGED`

### Phase 2 Exit Criteria

- همهٔ Application commandهای مهم به EventStore نوشته شوند
- changelog و history API در runtime واقعی در دسترس باشند
- UI بتواند بدون وابستگی به rerender اصلی جدول، history را subscribe کند
- پایهٔ Undo/Redo از روی eventها آماده باشد

### Phase 2 Status

- **In Progress**

---

## Phase 3

### Goal

تقویت wrapper React و نزدیک شدن به شکل نهایی `useGrid` / `GridSession`.

### Planned PRs

- [ ] `PR-16` selector-based subscription برای جلوگیری از rerenderهای غیرضروری
- [ ] `PR-17` تفکیک بیشتر `UITableController` به adapter نازک
- [ ] `PR-18` حرکت تدریجی keyboard/view commands به session-centric API
- [ ] `PR-19` mapping رسمی `ColumnSchema -> ColumnDefinition + bindings`
- [ ] `PR-20` harness یا integration واقعی‌تر با سناریوی ERP

### Phase 3 Exit Criteria

- Adapter React نازک‌تر شود
- UI history و view state را از facade رسمی بگیرد
- وابستگی‌های host-specific از مسیر core بیشتر جدا شوند

### Phase 3 Status

- **Not Started**

---

## Phase 4

### Goal

عملکرد، Undo/Redo کامل‌تر، pluginها، و آماده‌سازی مسیر انتشار.

### Planned PRs

- [ ] `PR-21` `IndexedDbEventStore`
- [ ] `PR-22` snapshot strategy
- [ ] `PR-23` benchmark و performance budget
- [ ] `PR-24` plugin-friendly event catalog / public API docs
- [ ] `PR-25` مسیر بسته‌بندی و publish

### Phase 4 Status

- **Not Started**

---

## Next Step

### PR-13

ثبت `previousValue` واقعی در همهٔ eventهای مربوط به تغییر سلول تا Undo و history هر دو از همان payload پایدار استفاده کنند.

---

## Notes

- این فایل intentionally اجرایی است، نه معماری.
- اگر مسیر واقعی توسعه تغییر کند، این فایل باید قبل از ادامهٔ PR بعدی به‌روزرسانی شود.
