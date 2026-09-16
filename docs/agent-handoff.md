# Agent handoff — persian-data-grid

اگر از تو خواسته شد «ادامه بده / فاز بعدی / توسعهٔ جدول»: این صفحه را اول بخوان، بعد **اولین PR تیک‌نخورده** در `EXECUTION_PLAN.md` را پیاده کن، Verify را اجرا کن، چک‌باکس و `WORKLOG.md` را به‌روز کن.

بازچینی‌شده ۱۴۰۵/۰۶/۲۰ (۱۱ سپتامبر ۲۰۲۶) هم‌زمان با طرح اجرایی v2.

## این کتابخانه چیست

React Data Grid با هستهٔ event-sourced، ذخیره‌سازی IndexedDB، undo دامنه‌ای، RTL و تقویم جلالی.

خاستگاهش ویرایشگر اقلام سند ERP بود و کد هنوز نشانهٔ آن را دارد (`ERPTable`، `--erp-*`). **جهت‌گیری جدید:** یک Data Grid عمومی که در نیچ «سند مالی فارسی با audit و offline» از همه بهتر است.

این یعنی محدودیت قدیمی «Data Grid عمومی نیست، grouping ممنوع» **دیگر معتبر نیست**. محدودهٔ جدید در `EXECUTION_PLAN.md` → Open Decisions و «خارج از محدوده» تعریف شده است.

## چهار فایل اجباری

| فایل | نقش |
|------|------|
| `WORKLOG.md` | الان کجاییم؛ سرمایه؛ بدهی؛ verify |
| `EXECUTION_PLAN.md` | فازها و چک‌باکس از `PR-72` به بعد |
| `docs/ag-grid-gap-analysis.md` | چرا این فازها به این ترتیب‌اند؛ کارت امتیاز |
| این فایل | پروتکل |

`PR-1 … PR-71` **تمام شده و آرشیو شده** (`docs/worklog-archive-v0.5.md`، `docs/execution-plan-archive-v0.5.md`). بازنویسی نکن؛ فقط bugfix.

## الان چه کار کنی

1. `WORKLOG.md` → **Current Snapshot**. اگر PR جاری نیمه‌کاره است، همان را تمام کن.
2. `EXECUTION_PLAN.md` → **Status Summary** و اولین `- [ ] PR-N`.
3. **Open Decisions همان فایل:** `D13 … D21` و `D23 … D25` در ۱۴۰۵/۰۶/۲۰ **قفل** شدند — اجرا کن، نپرس. تنها تصمیم باز **`D22` (monorepo)** است؛ قبل از `PR-132` بپرس و بایست.
4. Phase 16 تا 23 هیچ بلوکری ندارد. مسیر از `PR-72` مستقیم باز است.
5. یک PR طرح = یک برش. از فاز نپر مگر PR صریحاً blocked باشد (دلیل را در WORKLOG بنویس).
6. `PR-117` (RFC-002 برای grouping/aggregation) خودش یک گِیت است: تا RFC تأیید نشود، `PR-118` به بعد شروع نشود.

## قواعد سخت

- `domain/` و `application/` هرگز React یا DOM import نمی‌کنند. این تنها مزیت معماری ماست.
- **هیچ ادعای README/docs بدون تست در CI.** اگر فیچری تست ندارد، از مستندات حذف می‌شود، نه اینکه تست جعلی بگیرد.
- الگوریتم مسیر گرم (کلید، اسکرول، ویرایش) باید `O(window)` یا `O(log n)` باشد. O(n) فقط با memoize و invalidate صریح.
- هر PR فیچرمحور باید هزینهٔ bundle خودش را در `size-limit` اعلام کند.
- منطق داده (sort، filter، aggregation، بازهٔ سلولی) در `engine/` **خالص و بدون DOM** نوشته می‌شود تا headless و server-side هم از آن استفاده کنند. در کامپوننت React ننویس.

## بعد از اتمام یک PR

1. در `EXECUTION_PLAN.md` همان خط را `[x]` کن.
2. در `WORKLOG.md` بخش جدید با قالب انتهای آن فایل (فایل‌ها، هدف، انجام شد، **محدودیت آگاهانه**، اثر روی کارت امتیاز، Verify، بعدی).
3. Current Snapshot را به PR بعدی عوض کن.
4. Verify همان PR را اجرا کن و خروجی عددی را بنویس. قرمز = PR تمام نشده.
5. یک خط در `CHANGELOG.md`.

## زمینهٔ فنی که باید بدانی

### تناقض‌های شناخته‌شده (اشتباه نگیر)

- **مجازی‌سازی پیش‌فرض روشن است** (PR-97 / D17) — `resolveDesktopVirtualization` وقتی session هست `true` می‌دهد مگر `virtualization={false}`.
- **`persian-data-grid/styles.css` وجود دارد** (PR-76/77). تزریق خودکار حذف شده — مصرف‌کننده باید CSS را import کند یا `injectGridStyles()` را صدا بزند.
- **`FetchRemoteApi` روی `.` نیست** — فقط `persian-data-grid/adapters/arian-erp`. IndexedDB پیش‌فرض `persian-data-grid-events:{store}` است؛ هاست 0.5.x باید `eventStoreName: 'erp-table-events'` بدهد.
- **`GridSearchPanel` فیلتر نیست** — find & navigate است و ردیف را حذف نمی‌کند. quick filter واقعی (`quickFilterText`) در `PR-93` زنده است. اسکن O(n) جستجو در PR-99 با ایندکس حذف شد.

### تم

توکن‌های نقش (`--pdg-bg`, `--pdg-accent`, …) روی `.pdg-grid` با alias `.erp-table` و `--erp-*`. منبع حقیقت **`ui/styles/erp-table.css`** است؛ `injectStyles.ts` با `yarn generate:inject-styles` از آن ساخته می‌شود. کپی دستی نکن.

`GridTheme.withParams` + CSS variables؛ کپی `withPart` از AG Grid نساز. تم سفارشی دکمهٔ toggle را قفل می‌کند. `rowHeight` پیش‌فرض ۴۰ (D12).

### دستورات verify

```bash
yarn test                 # ۱۱۸ فایل / ۶۳۷ تست (پس از PR-124)
yarn typecheck:publish    # graph انتشار، strict
yarn typecheck:host-ui     # کل ui/ با shims
yarn lint:publish         # صفر `any` در publish graph
yarn build                # tsup ESM+CJS+DTS
yarn verify:dist
yarn dev                  # دمو روی پورت 5175
```

از `PR-72` به بعد همین‌ها در CI هم اجرا می‌شوند؛ لوکال سبز کافی نیست.

**الان:** Phase 25 🔄 — `PR-136`…`PR-139` ✅. بعدی `PR-140` (Persian date/finance). `PR-132` فقط بعد از تصمیم **D22**. `release-gate` هنوز قرمز (diff ۸۶<۹۰، bundle>۶۰KB، نبود `packages/core`).