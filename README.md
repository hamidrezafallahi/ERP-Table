# Persian Data Grid

[![CI](https://github.com/hamidrezafallahi/ERP-Table/actions/workflows/ci.yml/badge.svg)](https://github.com/hamidrezafallahi/ERP-Table/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/persian-data-grid.svg)](https://www.npmjs.com/package/persian-data-grid)
[![npm downloads](https://img.shields.io/npm/dm/persian-data-grid.svg)](https://www.npmjs.com/package/persian-data-grid)
[![license](https://img.shields.io/npm/l/persian-data-grid.svg)](https://github.com/hamidrezafallahi/ERP-Table/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-17%20%7C%2018%20%7C%2019-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)](https://www.typescriptlang.org/)

**Persian / Jalali data grid for React** — event-sourced, IndexedDB storage, cell keyboard navigation, RTL, and reactive cells that call a **host-injected** API.

A **Data Grid** for enterprise forms: voucher lines, money columns, Jalali date cells, row actions, optional virtual scroll, and Excel/PDF plugins.

> npm package: [`persian-data-grid`](https://www.npmjs.com/package/persian-data-grid) · Author: [Hamidreza Fallahi](https://github.com/hamidrezafallahi) · Demo: [hamidrezafallahi.github.io/ERP-Table](https://hamidrezafallahi.github.io/ERP-Table/)

---

## Table of contents

- [Features](#features)
- [Performance](#performance)
- [Install](#install)
- [Quick start](#quick-start)
- [API overview](#api-overview)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Demo](#demo)
- [فارسی](#فارسی)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Grid** — published React chrome (pagination, row index/actions, Jalali date cells)
- **RTL-native** layout and Shamsi / Jalali date cells (internal calendar; optional enhanced UI via `persian-data-grid/date-picker-jalali`)
- **Cell keyboard navigation** — arrows, Tab, Enter, Home/End; **Ctrl+C/X/V** Excel clipboard round-trip; fill handle on range corner (numeric + Jalali series, one undo). See [`docs/keyboard.md`](docs/keyboard.md).
- **VirtualList** — row window on by default (`session` present); pass `virtualization={false}` for pagination
- **Event-sourced session** with IndexedDB and cell undo
- **Excel / PDF plugins** on the view stream (domain aggregates stay untouched)
- **TypeScript**, React **17 / 18 / 19**

## Performance

CI harness — see [docs/performance.md](./docs/performance.md):

| Metric | Measured |
|--------|----------|
| Hydrate 100k rows (8 cols) | 1675 ms |
| Scroll 1000 viewport steps | 156 ms |
| 100 cell edits | 674 ms |
| Sort (rebuild index) | 2014 ms |
| Text filter | 403 ms |
| Heap delta 100k × 20 cols | 215 MB |

---

## Install

```bash
npm i persian-data-grid
# or
yarn add persian-data-grid
# or
pnpm add persian-data-grid
```

**Peer dependencies:** `react` and `react-dom` (`^17` / `^18` / `^19`).

Install does **not** connect to arianERP. Default `remoteApi` is `NoopRemoteApi`. ERP hosts must inject `FetchRemoteApi` from `persian-data-grid/adapters/arian-erp` — see [examples/host-arian-erp/host-arian-erp.md](./examples/host-arian-erp/host-arian-erp.md) (`_auth`, `persist:arianERP`, `Defaults`).

Styles are **not** auto-injected. Import the CSS (recommended) or call `injectGridStyles()` once if the host has no CSS bundler:

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
  onCellValueChanged={(e) => save(e.data)}
/>
```

---

## Quick start

```tsx
import { DataGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

type Invoice = { id: string; title: string; amount: number; date: string };

export function InvoiceLines({ invoices }: { invoices: Invoice[] }) {
  return (
    <DataGrid<Invoice>
      rowData={invoices}
      columnDefs={[
        { field: 'title', headerName: 'شرح' },
        { field: 'amount', type: 'price' },
        { field: 'date', type: 'date' },
      ]}
      onCellValueChanged={(e) => save(e.data)}
    />
  );
}
```

Headless composition (own UI + `VirtualList`):

```ts
import { createGrid, VirtualList } from 'persian-data-grid';

const grid = createGrid({
  columnDefs: [{ field: 'title', headerName: 'شرح' }],
  rowData: invoices,
});
await grid.ready;
```

---

## API overview

| Export | Purpose |
|--------|---------|
| Grid | Drop-in React **grid** |
| `injectGridStyles` | Explicit CSS inject when the host cannot `import` CSS |
| Composition root | session, engine, plugins |
| `VirtualList` | Virtualized row window |
| `ExcelExportPlugin` / `ExcelImportPlugin` | xlsx |
| `PdfExportPlugin` | pdf |
| `GridApi` / `apiRef` | Imperative control (PR-86). `UITableController` class is on `/headless`. |

See [docs/public-api.md](./docs/public-api.md), [docs/getting-started.md](./docs/getting-started.md), [docs/cell-components.md](./docs/cell-components.md), [docs/components.md](./docs/components.md), [examples/host-arian-erp/host-arian-erp.md](./examples/host-arian-erp/host-arian-erp.md).

Product docs site (English source + فارسی, live demos, TypeDoc API): `yarn docs:dev` — build with `yarn docs:build` (also in CI).
---

## Keyboard shortcuts

Active while focus is inside the grid (`UITableKeyboardHandler`). Full reference, including clipboard, range selection and undo: [`docs/keyboard.md`](https://github.com/hamidrezafallahi/ERP-Table/blob/master/docs/keyboard.md). Persian list: [فارسی](#فارسی).

### Cell navigation and editing

| Shortcut | Action |
|---|---|
| `Enter` / `Numpad Enter` | No active cell → activate the first cell of the active row; otherwise → next cell |
| `Shift + Enter` | Previous cell |
| `Tab` | Next cell (needs an active row and cell) |
| `Shift + Tab` | Previous cell (needs an active row and cell) |
| `Arrow Left` | Next cell (RTL: document order) |
| `Arrow Right` | Previous cell (RTL: document order) |
| `Arrow Up` | Move the active cell up in the same column |
| `Arrow Down` | Move the active cell down in the same column |

### Row selection and reordering

| Shortcut | Action |
|---|---|
| `Ctrl + Space` | Toggle selection of the active row |
| `Shift + End` | Toggle selection of the active row |
| `Ctrl + Shift + End` | Select from the active row to the last row |
| `Ctrl + Arrow Up` / `Ctrl + Arrow Down` | Move the active row up / down |
| `Alt + Arrow Up` / `Alt + Arrow Down` | Move the selected rows up / down (needs a selection) |

### Row and table operations

| Shortcut | Action |
|---|---|
| `Alt + N` | Add an empty row and activate it |
| `Alt + D` | Duplicate the active row |
| `Alt + Delete` | Delete the active row |
| `Alt + Arrow Left` | Collapse all expanded rows |
| `Alt + C` / `Alt + X` / `Alt + V` | Table copy / cut / paste mode |
| `Alt + B` | Paste-as-insert mode |
| `Escape` | Clear the current table action |

### Pagination

| Shortcut | Action |
|---|---|
| `Page Up` | Previous page (no-op on the first page) |
| `Page Down` | Next page (no-op on the last page) |

`Ctrl` and `Alt` are the browser modifier keys; `Meta` (⌘) is not treated as `Ctrl`.

---

## Demo

| Page | URL |
|------|-----|
| Live grid | https://hamidrezafallahi.github.io/ERP-Table/ |
| Guide | https://hamidrezafallahi.github.io/ERP-Table/guide/ |

```bash
yarn install
yarn dev:docs        # landing / live grid docs
yarn dev             # live grid + VirtualList playground
yarn build:demo      # static site → demo/dist
yarn deploy:demo     # GitHub Pages
```

---

## فارسی

### معرفی

`persian-data-grid` یک **Data Grid** برای فرم‌های سازمانی فارسی است: گرید با RTL، سلول تاریخ شمسی، ناوبری کیبورد بین سلول‌ها، صفحه‌بندی پیش‌فرض (مجازی‌سازی اختیاری)، و خروجی Excel/PDF.

### نصب

```bash
npm i persian-data-grid
```

وابستگی‌های peer: `react` و `react-dom` (نسخه ۱۷، ۱۸ یا ۱۹).

نصب به‌تنهایی به ERP وصل نمی‌شود. پیش‌فرض `NoopRemoteApi` است. میزبان arianERP باید `FetchRemoteApi` را از `persian-data-grid/adapters/arian-erp` تزریق کند: [examples/host-arian-erp/host-arian-erp.md](./examples/host-arian-erp/host-arian-erp.md).

استایل خودکار تزریق نمی‌شود. `import 'persian-data-grid/styles.css'` را اضافه کنید (یا برای هاست بدون bundler، `injectGridStyles()`).

### شروع سریع

```tsx
import { DataGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';

<DataGrid
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columns}
  rows={rows}
  tableHeight={420}
  onReady={setController}
/>
```

### میانبرهای صفحه‌کلید

وقتی focus داخل گرید است این میانبرها فعال‌اند (پیاده‌سازی در `UITableKeyboardHandler`).

#### جابه‌جایی و ویرایش سلول

| میانبر | عملکرد |
|---|---|
| `Enter` یا `Numpad Enter` | اگر سلول فعالی وجود نداشته باشد، نخستین سلول سطر فعال را فعال می‌کند؛ در غیر این صورت به سلول بعدی می‌رود. |
| `Shift + Enter` | به سلول قبلی می‌رود. |
| `Tab` | با وجود سطر و سلول فعال، به سلول بعدی می‌رود. |
| `Shift + Tab` | با وجود سطر و سلول فعال، به سلول قبلی می‌رود. |
| `Arrow Left` | با وجود سطر و سلول فعال، به سلول بعدی می‌رود. |
| `Arrow Right` | با وجود سطر و سلول فعال، به سلول قبلی می‌رود. |
| `Arrow Up` | با وجود سطر و سلول فعال، سلول فعال را در همان ستون به بالا می‌برد. |
| `Arrow Down` | با وجود سطر و سلول فعال، سلول فعال را در همان ستون به پایین می‌برد. |

> جهت حرکت بین سلول‌ها همان `next` و `prev` موتور جدول است؛ در نتیجه الزاماً با جهت بصری فلش چپ و راست یکی نیست.

#### انتخاب و جابه‌جایی سطر

| میانبر | عملکرد |
|---|---|
| `Ctrl + Space` | انتخاب سطر فعال را تغییر می‌دهد (انتخاب یا لغو انتخاب). |
| `Shift + End` | انتخاب سطر فعال را تغییر می‌دهد (انتخاب یا لغو انتخاب). |
| `Ctrl + Shift + End` | از سطر فعال تا آخر، سطرها را انتخاب می‌کند. |
| `Ctrl + Arrow Up` | سطر فعال را به بالا جابه‌جا می‌کند. |
| `Ctrl + Arrow Down` | سطر فعال را به پایین جابه‌جا می‌کند. |
| `Alt + Arrow Up` | سطرهای انتخاب‌شده را به بالا جابه‌جا می‌کند؛ باید سطری انتخاب شده باشد. |
| `Alt + Arrow Down` | سطرهای انتخاب‌شده را به پایین جابه‌جا می‌کند؛ باید سطری انتخاب شده باشد. |

#### عملیات سطر و جدول

| میانبر | عملکرد |
|---|---|
| `Alt + N` | یک سطر خالی اضافه و آن را فعال می‌کند. |
| `Alt + D` | سطر فعال را کپی می‌کند؛ وجود سطر فعال لازم است. |
| `Alt + Delete` | سطر فعال را حذف می‌کند؛ وجود سطر فعال لازم است. |
| `Alt + Arrow Left` | همهٔ سطرهای بازشده را می‌بندد. |
| `Alt + C` | حالت کپی جدول را فعال می‌کند. |
| `Alt + X` | حالت برش جدول را فعال می‌کند. |
| `Alt + V` | حالت چسباندن جدول را فعال می‌کند. |
| `Alt + B` | حالت چسباندن به‌صورت درج را فعال می‌کند. |
| `Escape` | کنش جاری جدول را پاک می‌کند. |

#### صفحه‌بندی

| میانبر | عملکرد |
|---|---|
| `Page Up` | به صفحهٔ قبلی می‌رود؛ اگر صفحهٔ قبلی وجود نداشته باشد کاری نمی‌کند. |
| `Page Down` | به صفحهٔ بعدی می‌رود؛ اگر صفحهٔ بعدی وجود نداشته باشد کاری نمی‌کند. |

#### نکته‌ها

- `Ctrl` و `Alt` بر اساس کلیدهای اصلاح‌کنندهٔ مرورگر تعریف شده‌اند؛ `Meta` جایگزین `Ctrl` نیست.
- میانبرهای وابسته به سطر فقط وقتی اجرا می‌شوند که سطر فعال پیدا شود. اگر focus داخل کنترل انتخاب باشد، هندلر برای یافتن سطر فعال از وضعیت موتور و سپس سطر انتخاب‌شده کمک می‌گیرد.
- میانبرهای `Tab` و فلش‌ها فقط وقتی به حرکت سلول منجر می‌شوند که سطر و ستون فعال موجود باشند.

### دمو زنده

[https://hamidrezafallahi.github.io/ERP-Table/](https://hamidrezafallahi.github.io/ERP-Table/)

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) (Keep a Changelog). The next npm line is **0.7.0**.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Security reports: [SECURITY.md](./SECURITY.md).

## License

MIT © [Hamidreza Fallahi](https://github.com/hamidrezafallahi) (`LICENSE` in the npm tarball).

The optional Vazirmatn PDF font is SIL Open Font License 1.1 (`OFL.txt` in the tarball; banner on `persian-data-grid/plugins/pdf`).

Repository: [github.com/hamidrezafallahi/ERP-Table](https://github.com/hamidrezafallahi/ERP-Table)  
Issues: [GitHub Issues](https://github.com/hamidrezafallahi/ERP-Table/issues)  
npm: [persian-data-grid](https://www.npmjs.com/package/persian-data-grid)
