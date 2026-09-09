# WORKLOG.md

## Purpose

این فایل گزارش کار اجرایی پروژه است: چه چیزی انجام شده، چرا انجام شده، و با چه سطحی از اطمینان verify شده است.

---

## Current Snapshot

- آخرین کار انجام‌شده: **ERPTable published chrome — self-contained UI matching ERP host (pagination default, CSS tokens, FetchRemoteApi)**
- وضعیت کلی: کتابخانه آمادهٔ `npm i @fallahi/erp-table` با همان ظاهر و منطق صفحات ERP (voucher / cheque / inventory / bank)
- تغییرات فقط در `C:\fallahi\erp table`

---

## Completed Work

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

> هیچ کار اجباری از EXECUTION_PLAN باقی نمانده است.

Backlog اختیاری (Phase 6+ / ادامهٔ دمو در صورت تصمیم جداگانه):

1. جایگزینی تدریجی `@ts-nocheck` host-glue با peer deps تایپی واقعی
2. مهاجرت تدریجی hostهای قدیمی در صورت نیاز به pagination
3. API sticky/overlap یا merge سلول در کتابخانه
4. optional peer برای `react-persian-range-picker` در CellRenderer
5. VirtualList reveal برای نتایج `SET_GRID_SEARCH`
6. Column drag UI روی `COLUMN_REORDERED`
