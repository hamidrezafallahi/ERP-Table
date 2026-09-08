# Demo Playground Report

گزارش توسعهٔ playground (`npm run dev`) برای QA دستی قابلیت‌های جدول.

تاریخ: ۲۰۲۶-۰۹-۰۸ · محدوده: `demo/` (+ وابستگی dev برای DatePicker)

---

## خلاصه

Playground قبلاً فقط VirtualList + undo/add/export را نشان می‌داد و ستون‌ها hard-code بودند.
الان دکمه‌ها و نمونه‌های زیر در UI دیده می‌شوند و به APIهای منتشرشده / session وصل‌اند.

| # | قابلیت | دکمه / کنترل در دمو | وضعیت |
|---|--------|---------------------|--------|
| 1 | روی‌هم‌افتادگی سلول (sticky) | **روی‌هم‌افتادگی سلول** | پیاده در دمو |
| 2 | DatePicker ماسک‌دار جلالی | ستون Date | `react-persian-range-picker` · `showMask` |
| 3 | Drag & drop ردیف | دستهٔ **⋮⋮** | `ROW_REORDERED` |
| 4 | اکشن سمپل هر سطر | **کپی / حذف / +** | ViewIntent |
| 5 | صفحه‌بندی | **Pagination** + قبلی/بعدی/pageSize | `CHANGE_PAGE` / `CHANGE_PAGE_SIZE` |
| 6 | جستجو | نوار **جستجو** Find/Prev/Next | `SET_GRID_SEARCH` |
| 7 | گزارش توسعه | این فایل + `WORKLOG.md` | مستند شد |

---

## جزئیات پیاده‌سازی

### 1. روی‌هم‌افتادگی سلول‌ها

- در دمو با ستون‌های sticky (Drag / ID / Item) و اسکرول افقی شبیه‌سازی شده است.
- با روشن بودن toggle، جدول از اسکرول یکپارچه استفاده می‌کند تا sticky با VirtualList تداخل نکند؛ هنگام اسکرول افقی ستون‌های ثابت روی بقیه می‌افتند.
- **نکته برای توسعه بعدی:** این رفتار UI دمو است؛ هنوز API دامنه‌ای merge/rowSpan/colSpan برای «روی‌هم‌افتادگی سلول» در هسته وجود ندارد. اگر محصول نیاز به merge واقعی دارد، باید به‌عنوان feature جدا در domain/UI میزبان تعریف شود.

### 2. DatePicker ماسک‌دار (`react-persian-range-picker`)

- وابستگی: `devDependency` → `react-persian-range-picker@^1.1.1`
- کامپوننت: `demo/src/DemoDateCell.tsx`
- تنظیمات: `calendarType="jalali"` · `showMask` · `exportType="IsoString"`
- مقدار به سلول با `CHANGE_CELL_VALUE` روی `date` commit می‌شود.
- **توسعه بعدی:** اتصال به CellRenderer میزبان / peer optional؛ یا export adapter رسمی اگر بخواهید picker بخشی از پکیج منتشرشده باشد.

### 3. Drag and drop

- دستهٔ drag در ابتدای هر سطر؛ drop قبل/بعد با خط راهنما.
- Dispatch: `engine.dispatch({ type: 'ROW_REORDERED', draggedRowId, droppedRowId, position })`
- **توسعه بعدی:** column reorder UI هنوز در دمو نیست (`COLUMN_REORDERED` در دامنه هست).

### 4. اکشن‌های سمپل سطر (الگوی voucherTemplate / IndexCol)

- ستون `index` با `ensureDemoColumns()` **همیشه** اول لیست ستون‌هاست و جدا از data columns رندر می‌شود
- تمام منطق شماره سطر / drag / delete / options فقط داخل `demo/src/DemoIndexCol.tsx` (پورت `ui/desktop/indexCol.tsx`)
- منطق تکراری جداگانه (ستون Actions / drag جدا / نمایش id) حذف شد
- Drop روی خود سطر مثل `eRPTableRow` باقی مانده؛ شروع drag از handle داخل IndexCol

### 5. صفحه‌بندی

- حالت **Pagination** در مقابل **VirtualList**.
- منبع ردیف‌ها: `session.getViewState()` (slice صفحه‌ای) به‌جای کل snapshot.
- کنترل‌ها: قبلی / بعدی / تغییر `pageSize` (5/10/20/50).
- **توسعه بعدی:** UI antd میزبان (`ERPTablePagination`) جدا از این chrome دموست.

### 6. جستجو

- انتخاب ستون + query + Find / Prev / Next.
- Match یابی محلی روی snapshot؛ state از طریق `SET_GRID_SEARCH`.
- در حالت paged، صفحهٔ حاوی match فعلی تغییر می‌کند.
- ردیف match فعلی هایلایت زرد دارد.
- **توسعه بعدی:** استفاده از helpers میزبان (`ui/gridSearch`) در صورت publish شدن، یا virtual `CHANGE_VIEWPORT` برای اسکرول به match.

### 7. ستون‌های پویا (کار قبلی همین شاخه)

- `DemoComponent` از `DEMO_COLUMNS` رندر می‌کند (دیگر hard-code Item/Qty/Amount نیست).
- `fixtures.ts`: ستون‌های `price` / `totalPrice` (computed صحیح) / `date`.
- گزارش این مورد برای ادامهٔ توسعه در همین سند ثبت شد.

---

## فایل‌های لمس‌شده

| فایل | نقش |
|------|-----|
| `demo/src/DemoComponent.tsx` | toolbar، search، pager، grid |
| `demo/src/DemoDateCell.tsx` | DatePicker + mask |
| `demo/src/demoHelpers.ts` | flatten cells، match، template |
| `demo/src/fixtures.ts` | schema/rows دمو |
| `demo/src/site.module.css` | sticky/overlap، DnD، actions، search، pager |
| `package.json` | `react-persian-range-picker` |
| `WORKLOG.md` | ثبت کار اجرایی |
| `docs/demo-playground-report.md` | این گزارش |

---

## نحوهٔ تست دستی

1. `npm run dev` → http://localhost:5175/
2. Toggle **روی‌هم‌افتادگی سلول** → اسکرول افقی جدول.
3. ستون Date → تایپ ماسک `YYYY/MM/DD` یا انتخاب از تقویم.
4. Drag دستهٔ ⋮⋮ → جابه‌جایی ردیف؛ History/`ROW_REORDERED` در log.
5. دکمه‌های کپی/حذف/+ روی سطر.
6. **Pagination** → تغییر صفحه و page size.
7. نوار جستجو روی Item (مثلاً `SKU-0005`) → Find / Next.

---

## Backlog پیشنهادی (توسعه بعدی)

1. API رسمی cell overlap / sticky columns در کتابخانه (نه فقط CSS دمو).
2. Peer optional برای Persian DatePicker در CellRenderer.
3. Column DnD UI.
4. Reveal match در VirtualList با `CHANGE_VIEWPORT`.
5. هم‌ترازی کامل chrome دمو با `ERPTable` میزبان بدون duplicate logic.
