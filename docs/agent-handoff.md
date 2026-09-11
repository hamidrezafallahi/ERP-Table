# Agent handoff — persian-data-grid

اگر از تو خواسته شد «ادامه بده / فاز بعدی / توسعه جدول»: این صفحه را اول بخوان، بعد کد بزن.

## این کتابخانه چیست

ویرایشگر اقلام سند ERP (RTL، جلالی، RowState، undo، IndexedDB). **Data Grid عمومی نیست.** grouping / pivot / tree / chart / SSRM بدون RFC جدید ممنوع است.

## سه فایل اجباری

| فایل | نقش |
|------|------|
| `WORKLOG.md` | الان کجاییم؛ آخرین PR؛ verify |
| `EXECUTION_PLAN.md` | فازها و چک‌باکس PR-39 به بعد |
| این فایل | پروتکل |

فاز ۱–۵ (PR-1 … PR-38) **تمام شده**. بازنویسی نکن.

## الان چه کار کنی

1. `WORKLOG.md` → **Current Snapshot**.
2. `EXECUTION_PLAN.md` → **Active Track** و اولین `- [ ] PR-N`.
3. بخش **Open Decisions** همان فایل: اگر تصمیم **باز** است و به این PR مربوط است، بپرس و بایست.
4. شکستن API/پیش‌فرض غیر از D1 (Noop RemoteApi) و D11 (`multiSelectConfig` اختیاری): قبل از کد تأیید بگیر.
5. یک PR طرح = یک برش. از روی Phase نپر مگر PR صریحاً blocked باشد.

## بعد از اتمام یک PR

1. در `EXECUTION_PLAN.md` همان خط را `[x]` کن.
2. در `WORKLOG.md` یک بخش با تاریخ، فایل‌ها، هدف، نتیجه، محدودیت.
3. Current Snapshot را به PR بعدی عوض کن.
4. دستورات Verify همان PR را اجرا کن و خروجی را در WORKLOG بنویس.

## بعدیِ زنده

اگر Snapshot کهنه بود، به EXECUTION_PLAN اعتماد کن. در زمان نوشتن این صفحه: **PR-63**.

## زمینهٔ تم (Phase 6–7، بسته)

توکن‌های نقش (`--erp-bg`, `--erp-accent`, …) روی `.erp-table` هستند. CSS در **دو جا** تکرار شده: `ui/styles/injectStyles.ts` و `ui/styles/erp-table.css`. هر دو را با هم عوض کن. Theming API یعنی `GridTheme.withParams` + CSS variables؛ کپی `withPart` از AG Grid نساز.

`ERPTable theme={themeErp.withParams({ accentColor: '#1d4ed8' })}` vars را inline می‌گذارد. Portalها `toCssVars()` را روی overlay کپی می‌کنند. تم تیره: `themeErpDark` + دکمه در `GroupActionButtons` / `MobileActionButtons` (تم سفارشی toggle را قفل می‌کند). `rowHeight` پیش‌فرض ۴۰ (D12).
