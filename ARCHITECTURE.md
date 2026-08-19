# ARCHITECTURE.md

# ERP Grid Core — معماری کتابخانهٔ مستقل گرید سازمانی

> مخاطب: تیم ۱۰ نفرهٔ موازی (Domain / Application / Engine / Adapters / Plugins)  
> وضعیت سند: **Target Architecture** برای استخراج کتابخانه از هستهٔ فعلی `erp table`  
> الگوی بسته‌بندی: `C:\fallahi\Persian-range-picker`  
> هستهٔ دامنه: `C:\fallahi\erp table`  
> نسخهٔ سند: `1.0.0` — ۱۴۰۵/۰۵/۲۷ (۱۸ اوت ۲۰۲۶)

---

## ۰. حکم معماری (Executive Decision)

این گرید یک **کامپوننت UI** نیست. یک **Bounded Context** است با Aggregate ریشهٔ `Table`، جریان **Command → Domain Event → Projection → Adapter**.

تصمیم‌های قطعی:

| تصمیم | انتخاب | چرا |
|--------|--------|-----|
| استقلال از فریم‌ورک | Core بدون React/Angular/Vue/DOM | درس `dateEngine` در Range Picker: هستهٔ خالص، UI فقط Adapter |
| سبک رویداد | **CQRS + Event Store (append-only)** + Observer روی Projection | Event Sourcing کامل برای ۱۰۰k ردیف گران است؛ Observer خالص Undo/Audit نمی‌دهد |
| Virtualization | Viewport در Core محاسبه می‌شود؛ DOM فقط در Adapter | Core نباید `window` / `document` ببیند |
| همزمانی ویرایش | Optimistic Concurrency روی Cell (`expectedVersion`) | قفل سراسری جدول، throughput را می‌کشد |
| DI | Composition Root دستی (`createGrid`) | بدون IoC سنگین؛ همان الگوی `createERPTable` |

**ضدالگوهای فعلی که این سند اصلاح می‌کند** (از کد زنده):

- `bootstrap/type.ts` و `engine/type.ts` به `React` وابسته‌اند → نشت Presentation به Domain.
- `TableStore.setState` Observer است، نه Event Store → Undo/Redo و تراکنش پایدار نیست.
- `getVisibleRows()` صفحه‌بندی `slice` است، نه Virtual Scrolling.
- `ColumnSchema` در Domain از `bootstrap` وارد می‌شود → Dependency Rule نقض شده.
- Commandهای UI (`ACTIVE_CELL`) با Commandهای دامنه (`CHANGE_CELL_VALUE`) در یک Union مخلوط‌اند.

---

## ۱. معرفی سطح بالا (High-Level Overview)

گریدهای رایج (AG Grid، Handsontable، TanStack Table) یا به React/DOM قفل‌اند، یا state را داخل کامپوننت نگه می‌دارند. این کتابخانه از آن‌ها جداست چون **دامنهٔ جدول ERP** را به‌عنوان مدل کسب‌وکار نگه می‌دارد، نه به‌عنوان درخت کامپوننت.

در ERP، جدول فقط «نمایش لیست» نیست. موجودیت‌هایی مثل سند، ردیف کالا، سطح واحد، وضعیت ردیف (`Add` / `Update` / `Delete` / `None`)، فیلدهای تغییرکرده، و قوانین دسترسی، همه **Invariants دامنه** هستند. این‌ها امروز در `Table` / `Row` / `Cell` / `Collection` پیاده شده‌اند و باید بدون UI زنده بمانند.

رویدادمحور بودن یعنی هر تغییر معنادار (ویرایش سلول، افزودن ردیف، سورت، فیلتر، جابه‌جایی Viewport) یک **Event با هویت و نسخه** است، نه یک `setState`. این سه قابلیت سازمانی را ممکن می‌کند:

1. **Undo/Redo و Audit** از روی همان لاگ، نه از روی کپی state.
2. **چند Adapter همزمان** (React Hook، Angular Service، حتی Worker) روی یک Core.
3. **پلاگین‌ها** (Excel/PDF) بدون دست‌کاری Entity — فقط Subscribe به Bus.

الگوی Range Picker اینجا ترجمه می‌شود: `dateEngine` ≡ `packages/core`؛ `DatePicker`/`RangePicker` ≡ `packages/react` و Adapterهای دیگر. Public API از یک Barrel کنترل‌شده (`src/index.ts`) بیرون می‌آید؛ مصرف‌کننده به فایل داخلی دسترسی ندارد.

```
                    ┌─────────────────────────────────────┐
   Host App (ERP)   │  createGrid(config)  Composition Root│
                    └─────────────────┬───────────────────┘
                                      │
           Command                    ▼                    Projection
  Adapter ──────► Application ──► Domain (Table) ──► EventStore ──► ViewModel
  (React/NG/Vue)     Use Cases         │                  │            │
                                       └── DomainEvent ───┘            │
                                                                       ▼
                                                                 Adapter render
                                                              (فقط پنجرهٔ مرئی)
```

---

## ۲. دیاگرام لایه‌ها (Layered Diagram)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PRESENTATION (Adapters) — React / Angular / Vue / Headless               │
│  useGrid | GridService | dispatch(UIIntent) | subscribe(ViewModel)       │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ UIIntent (نه Domain Event)
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ APPLICATION — Use Cases / Command Bus / Policies orchestration           │
│  ChangeCellValueHandler | AddRowHandler | ApplySortHandler | ExportPdf   │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ calls aggregate methods
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ DOMAIN — Aggregates / Entities / Value Objects / Domain Events / Policies│
│  Table | Collection | Row | Cell | CellValue | PermissionPolicy          │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ events + ports (interfaces only)
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE — EventStore, Repository, RemoteApi, AuditLogger, Clock   │
│  InMemoryEventStore | IndexedDbEventStore | FetchRemoteApi               │
└──────────────────────────────────────────────────────────────────────────┘
```

**قانون وابستگی (Dependency Rule):** فلش‌ها فقط به داخل است. Domain هیچ `import` از Application / Infrastructure / Adapter ندارد. Application فقط Port تعریف می‌کند. Infrastructure Port را پیاده می‌کند. Adapter فقط به Public API هسته وابسته است.

---

### ۲.۱ Presentation (Adapters)

این لایه **حالت دامنه را مالک نیست**. کارش تبدیل Intent کاربر (کلیک، کیبورد، اسکرول) به Command و تبدیل ViewModel به پیکسل است. در کد فعلی، نقش آن بین `ui/`، `UITableController` و `useERPTable` پخش شده؛ در هدف، `UITableController` به یک Adapter نازک تبدیل می‌شود که فقط `grid.dispatch` و `grid.subscribe` صدا می‌زند.

رویدادها اینجا **تولید نمی‌شوند**؛ Intent تولید می‌شود (`UI_CELL_CHANGE`, `UI_SCROLL`). Adapter پس از Subscribe، Projection را می‌گیرد (`visibleRows`, `activeCell`, `selection`) و re-render می‌کند. Virtual DOM / Change Detection فریم‌ورک فقط روی پنجرهٔ مرئی اجرا می‌شود، نه روی ۱۰۰k ردیف.

قرارداد این لایه: صفر منطق اعتبارسنجی، صفر محاسبهٔ `RowState`. اگر سلولی غیرقابل‌ویرایش است، Core باید `CellEditRejected` بدهد و Adapter فقط پیام را نشان دهد.

---

### ۲.۲ Application (Use Cases)

این لایه معادل `TableAppService` + Handlers فعلی است: یک Command را می‌گیرد، Policy را اعمال می‌کند، Aggregate را صدا می‌زند، Eventها را به EventStore می‌سپارد، Projection را به‌روز می‌کند. `switch (command.type)` در `TableAppService` باید به **Command Bus** با Handler ثبت‌شده تبدیل شود تا ۱۰ توسعه‌دهنده بتوانند Handler جدید اضافه کنند بدون merge conflict روی یک فایل غول‌پیکر.

جریان رویداد در این لایه: Command وارد Bus می‌شود → Handler مربوطه (مثلاً `ChangeCellValueHandler`) Repository/EventStore را می‌خواند → متد دامنه `table.changeCell(...)` را صدا می‌زند → آرایهٔ `DomainEvent[]` برمی‌گردد → `eventStore.append(streamId, events, expectedVersion)` → `projection.apply(events)` → `eventBus.publish(events)`. Application هرگز View را مستقیم mutate نمی‌کند.

Commandهای UI خالص (فوکوس سلول، انتخاب ردیف، اسکرول) **Use Case دامنه نیستند**. آن‌ها به `ViewStateService` در Application می‌روند و Event نوع `View` تولید می‌کنند؛ وارد Invariants حسابداری نمی‌شوند.

---

### ۲.۳ Domain

Aggregate ریشه `Table` است؛ `Collection` مرز سند/جزئیات است؛ `Row` موجودیت با هویت پایدار است؛ `Cell` موجودیت وابسته است. Value Objectها (`CellValue`, `ColumnId`, `RowId`, `Pagination` امروز، `Viewport` فردا) بدون هویت‌اند و با `equals` مقایسه می‌شوند.

رویدادها از داخل متدهای Aggregate ساخته می‌شوند (`new CellChanged(...)` در `Cell.changeValue` امروز). این درست است و باید بماند. آنچه باید عوض شود: Domain نباید `ColumnSchema` را از `bootstrap` وارد کند. تعریف ستون یک Value Object دامنه است (`ColumnDefinition`) بدون `ReactNode` و بدون `CSSProperties`.

Invariantهای حیاتی همین‌جا می‌مانند: حداقل یک ردیف در حالت `Added`، یکتا بودن مقدار در ستون `isUnique`، تغییر `RowState` فقط از مسیر `changeFields`، عدم ویرایش ستون `editable === false`. نقض Invariant = `DomainError` با کد پایدار (همان الگوی `DomainError` فعلی).

---

### ۲.۴ Infrastructure

پیاده‌سازی Portها: ذخیرهٔ Event، Snapshot Aggregate، فراخوانی API راه دور، لاگ حسابرسی، زمان و شناسه. امروز `CachedTableRepository` کل `Table` را به‌صورت state ذخیره می‌کند. در هدف، منبع حقیقت **Event Stream** است و Repository یک Facade است: `load` = آخرین Snapshot + Replay رویدادهای بعدی.

رویدادها از Application به Infrastructure می‌آیند (`append`)، نه برعکس. Infrastructure حق ندارد Handler دامنه را صدا بزند. اگر IndexedDB در مرورگر است، Adapter آن را تزریق می‌کند؛ Core پیش‌فرض `InMemoryEventStore` دارد تا در Node و تست بدون DOM کار کند.

برای ۱۰۰k ردیف، `save(table)` کامل در هر کلیدزنی ممنوع است. Infrastructure فقط Event جدید و در صورت نیاز Snapshot دوره‌ای (هر N رویداد یا هر M میلی‌ثانیه) می‌نویسد.

---

### ۲.۵ جریان رویداد بین لایه‌ها (Sequence)

```
User edits cell
  → Adapter.dispatch({ type: "ChangeCellValue", rowId, columnId, value, expectedVersion })
  → CommandBus → ChangeCellValueHandler
  → PermissionPolicy.canChangeCell
  → table.changeCell(RowId, ColumnId, CellValue)  // Domain
  → [CellChanged] (+ اختیاری DynamicDataRequested)
  → EventStore.append(stream: "table/{tableId}", events, expectedVersion)
  → TableProjector.apply(CellChanged) → ViewModel.rows[i].cells[j]
  → EventBus.publish(CellChanged)
  → Adapter subscriber → setState(viewModel) / markForCheck()
  → Plugin ExportPdf ignores this event
```

اگر `expectedVersion` با نسخهٔ Stream نخواند: `CellEditConflicted` منتشر می‌شود؛ Adapter تصمیم UI (toast / merge) می‌گیرد. Core داده را silently overwrite نمی‌کند.

---

## ۳. مدل داده (Data Modeling — DDD)

### ۳.۱ نقشهٔ Aggregate

```
Table (Aggregate Root)           id: TableId
 ├─ activeCollection: CollectionName
 ├─ collections: Map<CollectionName, Collection>
 ├─ viewport: Viewport                 // جایگزین عملی pagination برای 100k
 ├─ version: StreamVersion             // OCC
 │
 Collection (Entity داخل Aggregate)
 ├─ name: CollectionName
 ├─ columns: Map<ColumnId, ColumnDefinition>
 ├─ rows: Map<RowId, Row>
 │
 Row (Entity)
 ├─ id: RowId
 ├─ rowState: RowState                 // Add | Update | Delete | None
 ├─ changeFields: Set<ColumnId>
 ├─ collection: CollectionName
 ├─ visibilityCondition: Record<Flag, boolean>
 ├─ cells: Map<ColumnId, Cell>
 │
 Cell (Entity وابسته به Row — هویت ترکیبی RowId+ColumnId)
 ├─ value: CellValue
 ├─ originalValue: CellValue
 ├─ display: CellDisplay
 └─ version: CellVersion               // برای concurrent edit روی همان سلول
```

`Table` تنها Aggregateای است که از بیرون صدا زده می‌شود. هیچ Handlerای مستقیم `row.cells.set` نمی‌کند.

### ۳.۲ Aggregates / Entities / Value Objects

| نوع DDD | نام | هویت | مسئولیت |
|---------|-----|------|---------|
| Aggregate Root | `Table` | `TableId` | مرز تراکنش؛ انتشار Event؛ OCC |
| Entity | `Collection` | `CollectionName` داخل Table | مالک ستون‌ها و ردیف‌های یک سند/جزئیات |
| Entity | `Row` | `RowId` | چرخهٔ حیات ردیف و `changeFields` |
| Entity | `Cell` | (`RowId`, `ColumnId`) | مقدار / نمایش / مقدار اصلی |
| Value Object | `CellValue` | — | مقدار خام سلول؛ `equals` |
| Value Object | `CellDisplay` | — | مقدار نمایشی (لیبل سلکت، متن فرمت‌شده) |
| Value Object | `ColumnId` | — | شناسهٔ ستون؛ string معتبر غیرخالی |
| Value Object | `RowId` | — | شناسهٔ پایدار ردیف (number امروز؛ در Core جدید `string \| number` با Brand) |
| Value Object | `ColumnDefinition` | — | جایگزین `ColumnSchema` بدون React |
| Value Object | `Viewport` | — | `scrollOffset`, `rowHeight`, `viewportSize`, `overscan` |
| Value Object | `VisibleRange` | — | `startIndex`, `endIndex` |
| Value Object | `SortSpec` | — | `columnId` + `direction` |
| Value Object | `FilterSpec` | — | predicate خالص روی `CellValue` |
| Value Object | `RowState` | — | `Added` / `Modified` / `Deleted` / `Unchanged` |
| Value Object | `Actor` | — | `userId` + `roles` |
| Value Object | `Pagination` | — | سازگاری با APIهای صفحه‌ای موجود ERP؛ در UI بزرگ با Viewport جایگزین می‌شود |
| Policy | `PermissionPolicy` | — | `canChangeCell` / `canAddRow` / `canDeleteRow` |
| Domain Event | `CellChanged`, `RowAdded`, … | eventId | واقعیت رخ‌داده |
| Domain Error | `DomainError` | `code` | نقض Invariant با کد پایدار |

### ۳.۳ `ColumnDefinition` (جایگزین `ColumnSchema`)

فیلدهای مجاز در Core (بدون DOM/React):

```ts
type FieldType =
  | 'index' | 'text' | 'number' | 'price'
  | 'select' | 'selectOption' | 'date'
  | 'static' | 'description' | 'checkbox';

interface ColumnDefinition {
  readonly fieldName: string;
  readonly fieldCaption: string;
  readonly fieldType: FieldType;
  readonly fieldCollection?: string;
  readonly order?: number;
  readonly editable?: boolean;
  readonly isUnique?: boolean;
  readonly hidden?: boolean;
  readonly rules?: ValidationRule[];
  readonly options?: ReadonlyArray<{ label: string; value: string | number }>;
  readonly visibility: ColumnVisibilityRule;
  readonly dynamicSource?: DynamicSourceConfig; // فقط URL و کلیدها، نه JSX
  readonly computed?: ComputedColumnConfig;
}
```

Renderer و `style` و `indexOptions` که امروز `ReactNode` برمی‌گردانند به **Adapter** منتقل می‌شوند:

```ts
// packages/react
interface ColumnViewBinding {
  fieldName: string;
  render?: (ctx: CellRenderContext) => React.ReactNode;
  className?: string;
  minWidth?: number;
}
```

### ۳.۴ جداسازی View State از Domain State

| متعلق به Domain (Event Store دامنه) | متعلق به View (Event Store نما یا حافظه) |
|-------------------------------------|------------------------------------------|
| مقدار سلول، RowState، changeFields | activeCell، selectedRows، expandedRows |
| ساختار ستون، Collection فعال | gridSearch query، mobileEditor |
| ترتیب منطقی ردیف (`index`) | Viewport / scrollOffset |
| | SortSpec / FilterSpec اعمال‌شده روی Projection |

سورت و فیلتر **دادهٔ حسابداری را عوض نمی‌کنند**؛ روی Projection اعمال می‌شوند مگر محصول صراحتاً «Persist sort as user preference» بخواهد — آن‌وقت یک Event جدا (`SortApplied`) در stream تنظیمات کاربر ذخیره می‌شود، نه در stream سند.

---

## ۴. مدیریت حالت (State Management — Event Sourcing)

### ۴.۱ چرا به‌جای `setState`

`TableStore.setState` فعلی یک Observer کلاسیک است: state را جایگزین می‌کند و Subscriber را خبر می‌کند. برای UI کافی است، برای ERP کافی نیست:

- تاریخچهٔ تغییرات سلول گم می‌شود.
- Undo یعنی نگه داشتن کپی عمیق `Table.clone()` — برای ۱۰۰k ردیف غیرقابل‌قبول.
- دو تب / دو کاربر روی یک سلول، last-write-wins بی‌صدا.
- پلاگین و Adapter دوم باید به همان object state بچسبند.

مدل هدف: **Event را بنویس، State را از Event بساز.**

```
Command  →  DomainEvent[]  →  EventStore.append
                                ├─ Projector  →  TableReadModel
                                ├─ AuditLogger
                                └─ UndoStack (اشاره‌گر روی event index)
```

### ۴.۲ قرارداد Event

هر رویداد، صرف‌نظر از لایه، این شکل را دارد:

```ts
interface GridEvent<TType extends string = string, TPayload = unknown> {
  readonly eventId: string;          // ulid / uuid
  readonly type: TType;
  readonly tableId: string;
  readonly streamId: string;         // "table/{id}" | "table/{id}/view"
  readonly version: number;          // نسخهٔ stream بعد از append
  readonly occurredAt: number;       // epoch ms از ClockPort
  readonly actorId: string;
  readonly payload: TPayload;
  readonly correlationId?: string;   // برای تراکنش چندفرمانی
  readonly causationId?: string;     // event/command مسبب
}
```

نام‌گذاری نوع Event: **گذشتهٔ ساده + SCREAMING_SNAKE** در wire، PascalCase در کلاس:

| کلاس دامنه | `type` پایدار | Payload |
|------------|----------------|---------|
| `CellChanged` | `CELL_CHANGED` | `{ rowId, columnId, newValue, previousValue }` |
| `DisplayChanged` | `DISPLAY_CHANGED` | `{ rowId, columnId, newValue }` |
| `RowAdded` | `ROW_ADDED` | `{ rowId, afterRowId?, initialValues }` |
| `RowDeleted` | `ROW_DELETED` | `{ rowId }` |
| `RowRemoved` | `ROW_REMOVED` | `{ rowId }` — ردیف Added که هرگز persist نشده |
| `RowRestored` | `ROW_RESTORED` | `{ rowId }` |
| `RowReordered` | `ROW_REORDERED` | `{ draggedRowId, droppedRowId, position }` |
| `ColumnReordered` | `COLUMN_REORDERED` | `{ sourceIndex, destIndex }` |
| `SortApplied` | `SORT_APPLIED` | `{ specs: SortSpec[] }` |
| `FilterApplied` | `FILTER_APPLIED` | `{ specs: FilterSpec[] }` |
| `ViewportChanged` | `VIEWPORT_CHANGED` | `{ scrollOffset, viewportSize }` |
| `CellEditConflicted` | `CELL_EDIT_CONFLICTED` | `{ rowId, columnId, expected, actual }` |
| `ExportRequested` | `EXPORT_REQUESTED` | `{ format: 'pdf' \| 'xlsx', collectionScope }` |

`previousValue` برای Undo ضروری است؛ Event فعلی `CellChanged` آن را ندارد و باید در فاز ۱ اضافه شود.

### ۴.۳ EventStore

```ts
interface EventStore {
  append(streamId: string, events: GridEvent[], expectedVersion: number): Promise<AppendResult>;
  read(streamId: string, fromVersion?: number): Promise<GridEvent[]>;
  readAll(fromPosition?: number): Promise<GridEvent[]>; // برای projection سراسری
  subscribe(streamId: string, onEvent: (e: GridEvent) => void): Unsubscribe;
}
```

پیاده‌سازی‌ها:

| کلاس | فاز | کاربرد |
|------|-----|--------|
| `InMemoryEventStore` | ۱ | تست و Node |
| `IndexedDbEventStore` | ۲ | persistence مرورگر (جایگزین `indexedDbTableRepository`) |
| `HttpEventStore` | ۴ اختیاری | همگام‌سازی سرور |

`AppendResult` یا `{ ok: true, version }` است یا `{ ok: false, conflict: ConcurrencyConflict }`. هیچ `try/catch` خاموشی در Store مجاز نیست.

### ۴.۴ Snapshot و Replay

برای ۱۰۰k ردیف، Replay کامل از رویداد صفر در هر کلید ممنوع است.

```
هر 200 رویداد دامنه (قابل تنظیم) → Snapshot { tableId, version, payload: TableSnapshot }
load(tableId) = lastSnapshot + events where version > snapshot.version
```

`TableSnapshot` همان شکل `TableSnapShot` فعلی است (ردیف‌ها + cells + rowState + changeFields) ولی بدون وابستگی به Engine UI.

### ۴.۵ Undo / Redo

Undo **عکس Event** است، نه «state قبلی».

```
Undo stack = pointer روی نسخهٔ stream دامنه
Undo CELL_CHANGED → apply CellChanged(row, col, previousValue)  [compensating]
Redo → replay event اصلی
```

قواعد:

- Undo فقط Eventهای دامنه را برمی‌گرداند، نه `VIEWPORT_CHANGED`.
- `ROW_REMOVED` (ردیف جدید حذف‌شده) compensating ندارد اگر garbage شده باشد؛ در stack به‌صورت no-op علامت می‌خورد.
- تراکنش چندسلولی (`correlationId` یکسان، مثلاً Paste) یک واحد Undo است.

### ۴.۶ Observer روی Projection (نه روی Domain)

UI به EventStore وصل نمی‌شود. به `GridSession` وصل می‌شود:

```ts
interface GridSession {
  dispatch(command: GridCommand): Promise<void>;
  getViewModel(): GridViewModel;
  subscribe(listener: (vm: GridViewModel, events: GridEvent[]) => void): Unsubscribe;
  undo(): Promise<void>;
  redo(): Promise<void>;
}
```

این همان نقش `TableStore.subscribe` امروز است، با این فرق که `setState` عمومی وجود ندارد. تنها راه تغییر، `dispatch` است.

### ۴.۷ Concurrent Edits

سطح همزمانی: **سلول**، نه کل جدول.

1. هر `CELL_CHANGED` نسخهٔ سلول را یکی بالا می‌برد.
2. Command فیلد `expectedCellVersion` دارد.
3. اگر نسخه نخواند → Event `CELL_EDIT_CONFLICTED` + state دامنه عوض نمی‌شود.
4. Occupancy اختیاری (فاز ۴): `CellOccupied { actorId, expiresAt }` برای نمایش «در حال ویرایش» در Adapter؛ Core آن را Invariant حسابداری نمی‌داند.

دو کاربر روی دو سلول مختلف: بدون تعارض. دو کاربر روی یک سلول: تعارض صریح.

---

## ۵. اتصال‌دهنده‌های فریم‌ورک (Framework Adapters)

### ۵.۱ هسته — `CoreGrid` (بدون فریم‌ورک)

```ts
// packages/core — pseudo-code
export function createGrid(config: CreateGridConfig): GridSession {
  const clock = config.clock ?? systemClock;
  const ids = config.ids ?? ulidGenerator;
  const eventStore = config.eventStore ?? new InMemoryEventStore();
  const eventBus = config.eventBus ?? new InMemoryEventBus();
  const remoteApi = config.remoteApi ?? noopRemoteApi;
  const audit = config.audit ?? consoleAuditLogger;
  const policy = config.permissionPolicy ?? allowAllPolicy;

  const commandBus = new CommandBus();
  registerCoreHandlers(commandBus, { eventStore, remoteApi, audit, policy, clock, ids });

  const projector = new TableProjector();
  const session = new GridSessionImpl({ commandBus, eventStore, eventBus, projector, tableId: config.tableId });

  session.dispatch({ type: 'RegisterTable', columns: config.columns, rows: config.rows, actor: config.actor });
  return session;
}
```

### ۵.۲ React — `useGrid`

```ts
// packages/react — pseudo-code
export function useGrid(config: CreateGridConfig): UseGridResult {
  const sessionRef = useRef<GridSession | null>(null);
  if (!sessionRef.current) {
    sessionRef.current = createGrid(config); // Core؛ نه Redux
  }

  const [viewModel, setViewModel] = useState(() => sessionRef.current!.getViewModel());

  useEffect(() => {
    const session = sessionRef.current!;
    return session.subscribe((vm) => setViewModel(vm));
  }, []);

  useEffect(() => () => sessionRef.current?.dispose(), []);

  const dispatch = useCallback((command: GridCommand) => {
    return sessionRef.current!.dispatch(command);
  }, []);

  return { ready: true, viewModel, dispatch, undo: sessionRef.current.undo, redo: sessionRef.current.redo };
}

// مصرف در ERP
function VoucherGrid(props: ErpGridProps) {
  const { viewModel, dispatch } = useGrid({
    tableId: props.tableKey,
    actor: props.actor,
    columns: mapErpColumns(props.columnConfig), // ColumnDefinition خالص
    rows: props.rows,
    remoteApi: props.remoteApi,
    eventStore: props.eventStore,
  });

  return (
    <VirtualList
      startIndex={viewModel.visibleRange.startIndex}
      endIndex={viewModel.visibleRange.endIndex}
      onScroll={(offset) => dispatch({ type: 'ChangeViewport', scrollOffset: offset })}
      onCellCommit={(rowId, columnId, value) =>
        dispatch({ type: 'ChangeCellValue', rowId, columnId, newValue: value, expectedCellVersion: viewModel.cellVersion(rowId, columnId) })
      }
    />
  );
}
```

نکته نسبت به `useERPTable` فعلی: Hook دیگر `createERPTable` را با dependency به `next-intl` / Redux صدا نمی‌زند. آن وابستگی‌ها در **Host App** می‌مانند و از طریق Port تزریق می‌شوند.

### ۵.۳ Angular — `GridService`

```ts
// packages/angular — pseudo-code
@Injectable()
export class GridService implements OnDestroy {
  private session!: GridSession;
  readonly viewModel$ = new BehaviorSubject<GridViewModel | null>(null);

  init(config: CreateGridConfig): void {
    this.session = createGrid(config);
    this.session.subscribe((vm) => this.viewModel$.next(vm));
  }

  dispatch(command: GridCommand): Promise<void> {
    return this.session.dispatch(command);
  }

  ngOnDestroy(): void {
    this.session.dispose();
  }
}

@Component({ /* ... */ })
export class GridComponent {
  constructor(private readonly grid: GridService) {}
  vm$ = this.grid.viewModel$;
}
```

Angular فقط `NgZone` را برای Change Detection دور `subscribe` می‌پیچد. Core از Zone.js خبر ندارد.

### ۵.۴ Vue — `useGrid` (Composition API)

```ts
// packages/vue — pseudo-code
export function useGrid(config: CreateGridConfig) {
  const session = createGrid(config);
  const viewModel = ref(session.getViewModel());
  const stop = session.subscribe((vm) => { viewModel.value = vm; });
  onUnmounted(() => { stop(); session.dispose(); });
  return { viewModel, dispatch: session.dispatch.bind(session) };
}
```

### ۵.۵ نقشهٔ Adapter فعلی → هدف

| امروز | هدف |
|--------|------|
| `createERPTable` | `createGrid` در `packages/core` |
| `UITableController` | کلاس نازک `ReactGridAdapter` / حذف تدریجی |
| `useERPTable` | `useGrid` در `packages/react` |
| `useERPGrid` | **Host App** — صفحهٔ ERP؛ جزو کتابخانه نیست |
| `TableEngine.dispatch` | `GridSession.dispatch` |
| `TableStore.subscribe` | `GridSession.subscribe` |

---

## ۶. راهنمای توسعه برای ایجنت‌ها و اعضای جدید (Dev Guide)

فرض: ده نفر همزمان کار می‌کنند. هر Feature یک **برش عمودی نازک** است، نه یک لایهٔ افقی. قبل از کد، Event و Command را در RFC یک‌صفحه‌ای در `docs/rfc/` ثبت کنید.

### ۶.۱ قرارداد نام‌گذاری (Naming Conventions)

| عنصر | قاعده | مثال درست | مثال غلط |
|------|--------|-----------|----------|
| فایل کلاس | PascalCase = نام کلاس | `ChangeCellValueHandler.ts` | `cellHandler.ts` |
| فایل پوشهٔ عمومی | kebab-case برای package | `packages/core` | `packages/Core` |
| Entity / VO / Error | PascalCase اسم | `ColumnDefinition` | `IColumn` |
| Command | فعل امری + `Command` | `ChangeCellValueCommand` | `CellChange` |
| Command `type` | PascalCase بدون پسوند | `'ChangeCellValue'` | `'CHANGE_CELL_VALUE'` در Core جدید * |
| Domain Event کلاس | گذشته + بدون Event اجباری | `CellChanged` | `ChangeCell` |
| Event `type` wire | `SCREAMING_SNAKE` پایدار | `'CELL_CHANGED'` | `'cellChanged'` |
| Handler | `{CommandName}Handler` | `ExportPdfHandler` | `PdfHelper` |
| Port | بدون پیشوند `I` | `EventStore` | `IEventStore` |
| Adapter پیاده‌سازی | `{Tech}{Port}` | `IndexedDbEventStore` | `Store2` |
| Plugin | `{Capability}Plugin` | `PdfExportPlugin` | `pdf.ts` |
| تست | `{Sut}.spec.ts` کنار فایل یا در `__tests__` | `CellChanged.spec.ts` | `test1.ts` |

\* مهاجرت: در فاز ۱، Union فعلی `CHANGE_CELL_VALUE` با alias نگه داشته می‌شود تا Host ERP نشکند. Public API جدید PascalCase است. فایل `docs/event-catalog.md` منبع حقیقت است.

پیشوندها:

- Domain Event: بدون پیشوند.
- UI Intent (فقط Adapter): `UI_` (`UI_CELL_CHANGE`) — هرگز وارد EventStore دامنه نمی‌شود.
- Plugin Event: `{PLUGIN}_{PAST}` مثل `PDF_EXPORT_COMPLETED`.

### ۶.۲ ساختار پوشه (Folder Structure)

الگوی Range Picker: یک Public Barrel، هستهٔ خالص جدا، Adapter جدا، `exports` در `package.json`. برای ۱۰ نفر، **monorepo** اجباری است تا conflict روی `src/index.ts` کم شود.

```
erp-grid/
├── package.json                  # workspaces
├── ARCHITECTURE.md               # این سند
├── docs/
│   ├── event-catalog.md
│   ├── rfc/                      # RFC-001-pdf-export.md
│   └── public-api.md
├── packages/
│   ├── core/                     # صفر وابستگی UI — تیم Domain+App
│   │   ├── src/
│   │   │   ├── index.ts          # تنها Public API هسته
│   │   │   ├── domain/
│   │   │   │   ├── entities/     # Table.ts Row.ts Cell.ts Collection.ts
│   │   │   │   ├── value-objects/
│   │   │   │   ├── events/
│   │   │   │   ├── policies/
│   │   │   │   └── errors/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   ├── handlers/     # یک فایل = یک Handler
│   │   │   │   ├── ports/
│   │   │   │   └── bus/          # CommandBus.ts
│   │   │   ├── engine/           # Projector, ViewportCalculator, GridSession
│   │   │   └── bootstrap/        # createGrid.ts
│   │   └── package.json          # name: "@erp/grid-core"
│   ├── react/                    # تیم Adapter React
│   │   ├── src/index.ts
│   │   └── package.json          # peer: react, dep: @erp/grid-core
│   ├── angular/                  # فاز ۳+ 
│   ├── vue/                      # فاز ۳+
│   └── plugins/
│       ├── excel/                # از infrastructure/excel فعلی
│       └── pdf/
├── examples/
│   └── erp-harness/              # اتصال به دادهٔ واقعی ERP — فاز ۳
└── tests/
    └── public-api.spec.ts        # مثل publicApi.test.ts در Range Picker
```

مالکیت پوشه (Code Ownership برای ۱۰ نفر):

| مسیر | تیم مالک | دیگران |
|------|----------|---------|
| `packages/core/src/domain/**` | Domain (۲ نفر) | PR اجباری |
| `packages/core/src/application/handlers/**` | Application (۲ نفر) | افزودن فایل جدید آزاد |
| `packages/core/src/engine/**` | Engine (۲ نفر) | Viewport / Projector |
| `packages/core/src/index.ts` | Architect (۱ نفر) | فقط از طریق RFC |
| `packages/react/**` | React Adapter (۲ نفر) | |
| `packages/plugins/**` | Plugins (۱ نفر) | بدون دست‌زدن به domain |

قانون: **Handler جدید = فایل جدید.** فایل `TableAppService.ts` دیگر switch بزرگ ندارد؛ فقط `commandBus.register(...)`.

### ۶.۳ تزریق وابستگی (Dependency Injection)

بدون Nest/Inversify در Core. Composition Root = `createGrid`.

**Tokens (ثابت‌های رشته‌ای پایدار):**

```ts
export const GRID_TOKENS = {
  EventStore: 'grid.EventStore',
  EventBus: 'grid.EventBus',
  TableRepository: 'grid.TableRepository',
  RemoteApi: 'grid.RemoteApi',
  AuditLogger: 'grid.AuditLogger',
  Clock: 'grid.Clock',
  IdGenerator: 'grid.IdGenerator',
  PermissionPolicy: 'grid.PermissionPolicy',
} as const;
```

**قواعد:**

1. Handler فقط در constructor Port می‌گیرد، هرگز `new IndexedDbEventStore`.
2. مقدار پیش‌فرض فقط در `createGrid` ساخته می‌شود.
3. تست واحد: Port را با Fake جایگزین می‌کند؛ تست Integration: `InMemoryEventStore`.
4. Adapter فریم‌ورک حق ندارد Port زیرساختی بسازد مگر Host آن را پاس دهد.
5. Plugin در `onRegister(ctx: GridPluginContext)` همان Portها را می‌گیرد؛ به Entity داخلی import نمی‌زند.

```ts
interface GridPluginContext {
  bus: EventBus;
  session: GridSession;
  query: GridQueryPort;      // فقط خواندن Projection
  tokens: typeof GRID_TOKENS;
}

interface GridPlugin {
  readonly name: string;
  register(ctx: GridPluginContext): void;
  dispose?(): void;
}
```

### ۶.۴ چک‌لیست افزودن Feature — مثال: Export به PDF

هدف: کاربر «خروجی PDF» می‌زند؛ فایل ساخته می‌شود؛ دامنهٔ جدول mutate نمی‌شود.

#### قدم ۱ — RFC

فایل `docs/rfc/RFC-00X-pdf-export.md`: Command، Eventها، مالک پوشه، آیا به دامنه دست می‌زند؟ (اینجا: خیر).

#### قدم ۲ — Command (Application)

فایل جدید: `packages/core/src/application/commands/ExportPdfCommand.ts`

```ts
export interface ExportPdfCommand {
  readonly type: 'ExportPdf';
  readonly tableId: string;
  readonly collectionScope: 'active' | 'all' | string[];
  readonly correlationId: string;
}
```

این Command را به Union `GridCommand` در `application/commands/index.ts` اضافه کنید — **تنها خطی که در فایل مشترک ویرایش می‌شود.** اگر conflict شد، Union را به `export type GridCommand = CellCommands | RowCommands | ExportCommands` بشکنید.

#### قدم ۳ — Eventها (catalog)

در `docs/event-catalog.md` و در `application/events` (یا `plugins/pdf` اگر Event فقط پلاگین است):

| type | کی | payload |
|------|----|---------|
| `EXPORT_REQUESTED` | بلافاصله پس از Command | `{ format: 'pdf', collectionScope }` |
| `PDF_EXPORT_COMPLETED` | موفقیت | `{ url \| blobId, rowCount }` |
| `PDF_EXPORT_FAILED` | شکست | `{ code, message }` |

`EXPORT_REQUESTED` می‌تواند در stream نما (`table/{id}/view`) باشد، نه stream سند — تا Undo سند، PDF را برنگرداند.

#### قدم ۴ — Handler یا Plugin؟

چون PDF I/O و باینری است، **Plugin** است نه Domain Handler.

- فایل: `packages/plugins/pdf/src/PdfExportPlugin.ts`
- ثبت: Host در `createGrid({ plugins: [new PdfExportPlugin({ renderer })] })`
- Plugin روی `EXPORT_REQUESTED` Subscribe می‌کند.
- داده را از `ctx.query.getSnapshot(scope)` می‌خواند — **همان `getSnapShot` فعلی روی Controller.**
- PDF را با Port `PdfRenderer` می‌سازد (تا jsPDF وارد Core نشود).

```ts
class PdfExportPlugin implements GridPlugin {
  readonly name = 'pdf-export';
  register(ctx: GridPluginContext): void {
    ctx.bus.subscribe('EXPORT_REQUESTED', async (e) => {
      if (e.payload.format !== 'pdf') return;
      const snapshot = ctx.query.getSnapshot(e.payload.collectionScope);
      try {
        const blob = await this.renderer.render(snapshot);
        ctx.bus.publish({ type: 'PDF_EXPORT_COMPLETED', /* ... */ });
      } catch (err) {
        ctx.bus.publish({ type: 'PDF_EXPORT_FAILED', /* ... */ });
      }
    });
  }
}
```

#### قدم ۵ — Adapter (دکمه)

در `packages/react` فقط:

```ts
dispatch({ type: 'ExportPdf', tableId, collectionScope: 'active', correlationId });
```

کامپوننت دکمه JSX را در Host یا در `packages/react/src/toolbar` بگذارید. **هیچ فایلی در `domain/entities` تغییر نمی‌کند.**

#### قدم ۶ — آنچه نباید تغییر کند

- `Table.ts` / `Row.ts` / `Cell.ts`
- `PermissionPolicy` مگر PDF نیاز به `canExport` داشته باشد — در آن صورت فقط یک متد اختیاری به Policy اضافه می‌شود، بدون شکستن Implementerهای موجود.
- Public API Core به‌جز export نوع Command.

#### قدم ۷ — تست

- واحد Plugin با `InMemoryEventBus` + Snapshot جعلی.
- `public-api.spec.ts`: `ExportPdf` از Barrel پلاگین export شده باشد.
- تست رگرسیون: `CELL_CHANGED` پس از ثبت پلاگین همچنان همان version را می‌سازد.

#### نگاشت سریع «اگر X می‌خواهم کدام فایل؟»

| می‌خواهم | فایل‌ها | Event دیسپچ |
|----------|---------|-------------|
| قانون جدید روی سلول | `domain/entities/Cell.ts` + تست + در صورت نیاز `DomainError` جدید | Event موجود یا `CellChanged` با payload غنی‌تر |
| عملیات جدید کسب‌وکار (مثلاً Duplicate) | `handlers/DuplicateRowHandler.ts` + command + متد روی `Table` | `ROW_ADDED` |
| میانبر کیبورد | فقط Adapter (`UITableKeyboardHandler` / React) | همان Command موجود |
| ستون محاسباتی | `ColumnDefinition.computed` + Handler `ApplyComputedColumn` | `CELL_CHANGED` مشتق |
| سورت | `engine/SortProjector.ts` | `SORT_APPLIED` |
| فیلتر | `engine/FilterProjector.ts` | `FILTER_APPLIED` |
| Virtual scroll bug | `engine/ViewportCalculator.ts` | `VIEWPORT_CHANGED` |
| ذخیره IndexedDB | `infrastructure` / package infra | هیچ Event دامنه‌ای جدید |
| Export Excel | `packages/plugins/excel` (کد فعلی `exportActiveCollectionToExcel.ts`) | `EXPORT_REQUESTED` format=`xlsx` |
| Export PDF | طبق همین بخش | `EXPORT_REQUESTED` / `PDF_EXPORT_*` |

---

## ۷. بسته‌بندی NPM (درس از Persian-range-picker)

| مورد در Range Picker | ترجمه برای Grid |
|----------------------|-----------------|
| `src/index.ts` Barrel + `export type` | هر package یک Barrel؛ تست `public-api.spec.ts` |
| `exports.import` / `require` + `types` | dual ESM + CJS در `core` و `react` |
| `files: ["dist"]` | فقط dist منتشر می‌شود |
| `peerDependencies: react` | فقط روی `@erp/grid-react`؛ **core بدون peer UI** |
| `external` در Rollup برای react | core: صفر UI external؛ react: `react`, `react-dom`, `@erp/grid-core` |
| `dateEngine` بدون JSX | `packages/core` معادل همان جداسازی |
| `demo/` جدا از library | `examples/erp-harness` |

پیشنهاد نام:

```json
{
  "name": "@erp/grid-core",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  }
}
```

```json
{
  "name": "@erp/grid-react",
  "peerDependencies": { "react": "^17 || ^18 || ^19" },
  "dependencies": { "@erp/grid-core": "workspace:*" }
}
```

Host فعلی ERP در فاز ۳ به‌جای مسیر نسبی `@components/organisms/erp-table` از `@erp/grid-react` استفاده می‌کند.

---

## ۸. فازبندی پروژه (Phasing & Roadmap)

تخمین‌ها **نفر-روز تقویمی تیم** است با فرض ۱۰ نفر که همه از روز اول full-time روی گرید نیستند. ظرفیت مؤثر فاز ۱–۲ حدود **۴ نفر موازی** است (بقیه روی Host ERP و پلاگین منتظر API پایدار می‌مانند). یک «روز» = ۸ ساعت، بدون تعطیلات.

ریسک عمومی: اگر `ColumnSchema` از React جدا نشود، فاز ۳ دوباره به Host قفل می‌شود.

---

### فاز ۱ — هسته و موجودیت‌های دامنه (بدون UI، بدون DOM)

**هدف:** `@erp/grid-core` که در Node و Vitest اجرا می‌شود؛ Entityها از نشت React پاک شده‌اند؛ Command/Event دامنه پایدار است.

**مدت پیشنهادی:** **۸ روز کاری** (تقویم: حدود ۱۰ تقویمی با بافر)  
**ظرفیت:** ۴ نفر موازی (Domain ×۲، Application ×۱، Bootstrap/API ×۱)

**خروجی قابل‌قبول (DoD):**

- `createGrid` بدون `document` / `react`.
- `ColumnDefinition` جایگزین وارد کردن `bootstrap/type` در Domain.
- تست واحد برای `changeCell`, `addRow`, `deleteRow`, `reorderRows`, `RowState` / `changeFields`.
- Barrel عمومی و `public-api.spec.ts`.
- Eventهای دامنه دارای `eventId`, `version`, `previousValue` برای سلول.

**گزارش کاری / Checklist**

| روز | مالک | کار | خروجی ملموس | Done وقتی |
|-----|------|-----|-------------|-----------|
| ۱ | Architect + Domain | جداسازی monorepo، tsconfig، قانون eslint «no react in core» | اسکلت `packages/core` | `import 'react'` در core بیلد را می‌شکند |
| ۱–۳ | Domain A | استخراج `Table`/`Row`/`Cell`/`Collection` از مسیر فعلی؛ حذف import به bootstrap | Entity خالص | تست clone / changeCell سبز |
| ۲–۴ | Domain B | VOها: `ColumnDefinition`, `Viewport` (فقط نوع)، `GridEvent` envelope | `value-objects/` کامل | هیچ `ReactNode` در domain |
| ۳–۵ | Application | یک Handler در یک فایل؛ CommandBus به‌جای switch | `ChangeCellValueHandler` مستقل | Handler با Fake repo تست می‌شود |
| ۴–۶ | Application | بقیه Handlerهای سلول/ردیف/جدول فعلی، بدون UI commands | handlers/* | `TableAppService` نازک یا حذف |
| ۵–۷ | API owner | `createGrid` + InMemory EventStore حداقل (append در حافظه، هنوز Projector کامل نه) | bootstrap | تست Node: create → changeCell → read events |
| ۷–۸ | همه | فریز Event Catalog دامنه، README هسته، مهاجرت alias برای `CHANGE_CELL_VALUE` | `docs/event-catalog.md` | Host هنوز می‌تواند type قدیمی بفرستد |

**خارج از محدوده فاز ۱:** React Hook، Virtual DOM، IndexedDB، PDF، Excel UI، `useERPGrid`.

---

### فاز ۲ — Event-Driven Bus و مدیریت حافظه (Virtualization Logic)

**هدف:** هر تغییر از Bus رد شود؛ Projection پنجرهٔ مرئی برای ≥۱۰۰٬۰۰۰ ردیف در حافظهٔ معقول؛ Undo دامنه.

**مدت پیشنهادی:** **۱۰ روز کاری**  
**ظرفیت:** ۴ نفر (Engine ×۲، Infra ×۱، App/Undo ×۱)

**خروجی قابل‌قبول (DoD):**

- `InMemoryEventStore` + `IndexedDbEventStore` با OCC (`expectedVersion`).
- `TableProjector` و `ViewportCalculator` بدون DOM: ورودی `scrollOffset` → `VisibleRange`.
- بنچمارک: ۱۰۰k ردیف، تغییر یک سلول < ۱۶ms روی Projection پنجره (نه روی کل آرایه).
- Undo/Redo برای `CELL_CHANGED` و `ROW_ADDED`.
- Commandهای View جدا از Commandهای Domain (`ChangeViewport`, `SetSelection`).

**گزارش کاری / Checklist**

| روز | مالک | کار | خروجی ملموس | Done وقتی |
|-----|------|-----|-------------|-----------|
| ۱–۳ | Engine A | EventBus + Projector از Event → ReadModel | `GridViewModel` | تست replay ۱۰ رویداد |
| ۲–۴ | Infra | IndexedDB stream + snapshot هر ۲۰۰ رویداد | `IndexedDbEventStore` | refresh صفحه، ردیف‌ها برمی‌گردند |
| ۳–۶ | Engine B | `ViewportCalculator` + ساختار ردیف تنک (Map + index array) | visible window | تست ۱۰۰k: فقط N ردیف در ViewModel.visibleRows |
| ۵–۷ | App | Undo stack از compensating events | `session.undo()` | تست: edit → undo → مقدار original |
| ۶–۸ | Engine A | Sort/Filter روی Projection نه روی Aggregate | `SORT_APPLIED` / `FILTER_APPLIED` | دامنه `RowState` عوض نمی‌شود |
| ۸–۹ | همه | OCC سلول: `CELL_EDIT_CONFLICTED` | نسخه روی Cell | دو dispatch با version کهنه، دومی fail |
| ۹–۱۰ | Perf | بنچمارک و پروفایل؛ حذف clone کامل Table از مسیر گرم | گزارش perf در `docs/` | معیار DoD ثبت شده |

**خارج از محدوده فاز ۲:** کامپوننت React لیست مجازی (فقط منطق)، پلاگین PDF.

---

### فاز ۳ — Wrapper React و یکپارچگی ERP

**هدف:** `useGrid` جایگزین مسیر `useERPTable` در یک صفحهٔ واقعی ERP شود؛ دادهٔ واقعی (header/detail، `RowState`، remote select) کار کند.

**مدت پیشنهادی:** **۹ روز کاری**  
**ظرفیت:** React Adapter ×۲، Host ERP ×۲، Core on-call ×۱

**خروجی قابل‌قبول (DoD):**

- `@erp/grid-react` با peer React ۱۷–۱۹ (همان بازهٔ Range Picker).
- یک صفحهٔ سند ERP روی harness سبز: load، edit، add row، delete، save snapshot به API موجود.
- کیبورد و انتخاب ردیف از `UITableKeyboardHandler` به Adapter منتقل شده، منطق در Core مانده.
- `useERPGrid` در Host می‌ماند (Redux/next-intl) و فقط Port به Core می‌دهد — وارد پکیج نمی‌شود.

**گزارش کاری / Checklist**

| روز | مالک | کار | خروجی ملموس | Done وقتی |
|-----|------|-----|-------------|-----------|
| ۱–۳ | React A | `useGrid` + subscribe + VirtualList ساده (div مطلق) | demo داخلی | اسکرول ۱۰۰k بدون freeze محسوس |
| ۲–۴ | React B | Cell renderer bindings (نه داخل Core) | `ColumnViewBinding` | select/date از Host تزریق می‌شود |
| ۳–۵ | Host A | نقشه `ColumnSchema` فعلی → `ColumnDefinition` + bindings | adapter در ERP app | بیلد Host بدون تغییر بیزینس |
| ۴–۷ | Host B | مسیر save: `getSnapshot` → API add/update موجود | سند واقعی ذخیره می‌شود | RowState Add/Update/Delete درست است |
| ۶–۸ | React A | parity دسکتاپ: focus سلول، reorder، search | جایگزین `DesktopTable` تدریجی | تست دستی چک‌لیست ERP |
| ۷–۹ | همه | رگرسیون موبایل: یا Adapter موبایل نازک یا نگهداری UI فعلی روی همان session | تصمیم در RFC | یک Core، دو پوسته |

**ریسک:** `resolveOn` / `computed` / `dynamicSource` امروز به `FetchRemoteApi` و شکل پاسخ ERP وابسته‌اند. در این فاز Port `RemoteApi` همان امضای فعلی می‌ماند؛ بازنویسی backend ممنوع.

---

### فاز ۴ — عملکرد، پلاگین‌ها، انتشار NPM

**هدف:** پکیج قابل انتشار؛ Excel موجود به‌صورت Plugin؛ PDF به‌صورت Plugin؛ مستند مصرف‌کننده؛ بنچمارک قفل‌شده.

**مدت پیشنهادی:** **۸ روز کاری**  
**ظرفیت:** Plugin ×۲، Perf ×۱، Docs/Release ×۱، Adapter Angular اختیاری ×۱

**خروجی قابل‌قبول (DoD):**

- `npm pack` برای `@erp/grid-core` و `@erp/grid-react` با `exports` و types.
- Plugin Excel (کد `exportActiveCollectionToExcel.ts`) و Plugin PDF طبق بخش ۶.۴.
- مستند: README مصرف، event-catalog، این ARCHITECTURE، نمونهٔ `createGrid`.
- بودجهٔ عملکرد: تعامل سلول در پنجرهٔ مرئی پایدار؛ حافظهٔ ReadModel پنجره O(visible+overscan) نه O(n) در ViewModel UI.

**گزارش کاری / Checklist**

| روز | مالک | کار | خروجی ملموس | Done وقتی |
|-----|------|-----|-------------|-----------|
| ۱–۳ | Plugin | Excel plugin + `EXPORT_REQUESTED` | خروجی xlsx از snapshot | تست بدون DOM Core |
| ۲–۴ | Plugin | PDF plugin + PdfRenderer port | RFC + پیاده‌سازی | چک‌لیست بخش ۶.۴ کامل |
| ۳–۵ | Perf | memo پنجره، جلوگیری از publish تمام Subscriberها با selector | `subscribe(selector)` | Adapter React فقط با تغییر visibleRows render می‌شود |
| ۴–۶ | Release | Rollup/tsup مثل Range Picker، dual package، public-api test | dist روی CI | `npm pack` شامل فقط dist |
| ۵–۷ | Docs | README + migration از `createERPTable` | `docs/public-api.md` | یک تازه‌وارد بدون mentorship یک demo می‌سازد |
| ۶–۸ | Optional | اسکلت `GridService` Angular | package خالی با README | compile می‌شود؛ الزامی برای v1 نیست |
| ۸ | Architect | نسخه `0.1.0` و freeze API | tag | breaking change فقط با RFC |

---

### نمای تقویم فشرده

| فاز | روز کاری | خروجی اصلی | وابستگی ورود تیم ۱۰نفره |
|-----|----------|------------|---------------------------|
| ۱ Core | ۸ | Entity + CommandBus + createGrid | ۴ نفر از روز ۱؛ بقیه RFC و Host mapping |
| ۲ Events + Virtualization | ۱۰ | EventStore + Viewport + Undo | Engine از روز ۱ فاز ۲؛ Plugin هنوز blocked |
| ۳ React + ERP | ۹ | useGrid روی دادهٔ واقعی | Adapter+Host؛ Domain فقط bugfix |
| ۴ Plugins + NPM | ۸ | Excel/PDF + publish | Plugin از روز ۱ فاز ۴ |
| **جمع** | **۳۵ روز کاری** | کتابخانهٔ v0.1 | حدود **۷ هفتهٔ تقویمی** با بافر ۲۰٪ ≈ **۸–۹ هفته** |

اگر فقط ۲ نفر کار کنند، همان محدوده حدود **۱۴–۱۶ هفته** است. موازی‌سازی واقعی از فاز ۳ به بعد است؛ فاز ۱ را عمداً باریک نگه دارید تا API نشکند.

---

## ۹. مرزها و ضدالگوها (برای جلوگیری از انحراف ۱۰ نفر)

**مجاز در Core:** TypeScript، Promise، ساختار داده، الگوریتم Viewport، EventStore این‌مemory.

**ممنوع در Core:** `react`, `react-dom`, `next/*`, `redux`, `document`, `window` (به‌جز پشت Clock/Id در Infra که خودشان هم بهتر است Port باشند)، CSS، JSX.

**ممنوع در Domain:** import از `application` / `bootstrap` / `ui` / `engine`.

**یک PR یک لایه را نشکند:** اگر Feature هم Entity و هم Hook لازم دارد، دو PR: اول Core+تست، بعد Adapter.

**Event جدید بدون ثبت در `event-catalog.md` merge نمی‌شود.**

---

## ۱۰. پیوست — موجودی کد فعلی (Source Mapping)

برای ایجنت‌هایی که از روی ریپو کار می‌کنند:

| مسیر فعلی | نقش بعدی |
|-----------|----------|
| `domain/entities/*` | `packages/core/src/domain/entities` (پاکسازی import) |
| `domain/events/index.ts` | envelope + `previousValue` |
| `domain/value-objects/index.ts` | + `ColumnDefinition` + `Viewport` |
| `domain/policies/index.ts` | Port Policy؛ متد اختیاری `canExport` |
| `application/handlers/*` | یک کلاس یک فایل؛ ثبت در Bus |
| `application/ports/*` | + `EventStore` + `Clock` + `IdGenerator` |
| `engine/tableEngine.ts` | شکستن به `GridSession` + managers |
| `engine/tableStore.ts` | حذف `setState` عمومی؛ جایگزین subscribe روی Projection |
| `engine/ViewStateBuilder.ts` | TableProjector |
| `infrastructure/ui/UITableController.ts` | نازک‌سازی → Adapter |
| `infrastructure/excel/*` | `packages/plugins/excel` |
| `bootstrap/index.ts` | `createGrid` |
| `ui/useERPTable.ts` | `packages/react` `useGrid` |
| `ui/useERPGrid.ts` | **نمی‌آید داخل پکیج** — Host ERP |
| `ui/desktop/*` `ui/mobile/*` | Adapter یا Host؛ منطق کسب‌وکار نه |

این سند قرارداد تیم است. هر انحراف آگاهانه باید RFC داشته باشد، نه «فعلاً در کامپوننت می‌نویسیم».
