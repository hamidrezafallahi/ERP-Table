# WORKLOG.md

## Purpose

این فایل گزارش کار اجرایی پروژه است: چه چیزی انجام شده، چرا انجام شده، و با چه سطحی از اطمینان verify شده است.

---

## Current Snapshot

- آخرین PR انجام‌شده: `PR-12`
- وضعیت کلی: `Phase 1 complete`, `Phase 2 in progress`
- آخرین نتیجهٔ تست ثبت‌شده: **8 فایل تست / 41 تست / همه پاس**

---

## Completed Work

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

---

## Verification Log

آخرین اجرای تست ثبت‌شده:

- `7` فایل تست و `32` تست بعد از `PR-10`
- `8` فایل تست و `35` تست بعد از `PR-11`
- `8` فایل تست بعد از `PR-12`

تست‌های مهم موجود:

- `domain/__tests__/table-domain.behavior.spec.ts`
- `application/__tests__/command-categories.spec.ts`
- `application/__tests__/dual-write.spec.ts`
- `infrastructure/__tests__/in-memory-event-store.spec.ts`
- `infrastructure/__tests__/changelog-projection.spec.ts`
- `infrastructure/__tests__/ui-table-controller.spec.ts`
- `infrastructure/__tests__/history-panel-view-model.spec.ts`
- `bootstrap/__tests__/create-erp-table.spec.ts`

---

## Current Architectural Gains

- Domain از React و bootstrap کمتر نشت می‌گیرد
- EventStore وارد runtime واقعی شده
- changelog و history هم queryable هستند هم subscribable
- لایهٔ UI به event payload خام کمتر وابسته شده
- composition root الان capabilityهای event-driven را واقعاً می‌سازد، نه فقط در سطح type

---

## Remaining Gaps

- `previousValue` هنوز در مسیر service-level history به‌شکل کامل و پایدار برای همهٔ سناریوها enforce نشده
- `Undo/Redo` هنوز پیاده نشده
- `readAll()` / global event position به‌شکل رسمی وجود ندارد
- selector-based subscriptions برای performance هنوز وجود ندارد
- `IndexedDbEventStore` و snapshot strategy هنوز شروع نشده

---

## Next Planned Work

### PR-13

ثبت `previousValue` واقعی در همهٔ eventهای مربوط به تغییر سلول.
