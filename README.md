# Persian Data Grid

[![npm version](https://img.shields.io/npm/v/persian-data-grid.svg)](https://www.npmjs.com/package/persian-data-grid)
[![npm downloads](https://img.shields.io/npm/dm/persian-data-grid.svg)](https://www.npmjs.com/package/persian-data-grid)
[![license](https://img.shields.io/npm/l/persian-data-grid.svg)](https://github.com/hamidrezafallahi/ERP-Table/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-17%20%7C%2018%20%7C%2019-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)](https://www.typescriptlang.org/)

**Persian / Jalali data grid for React** — event-sourced, IndexedDB storage, Excel/IDE keyboard navigation, RTL, and reactive cells that call a **host-injected** API.

A real **Data Grid** for enterprise forms: voucher lines, money columns, Jalali date cells, row actions, virtual scroll, and Excel/PDF plugins.

> npm package: [`persian-data-grid`](https://www.npmjs.com/package/persian-data-grid) · Author: [Hamidreza Fallahi](https://github.com/hamidrezafallahi) · Demo: [hamidrezafallahi.github.io/ERP-Table](https://hamidrezafallahi.github.io/ERP-Table/)

---

## Table of contents

- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [API overview](#api-overview)
- [Demo](#demo)
- [فارسی](#فارسی)
- [License](#license)

---

## Features

- **Grid** — published React chrome (pagination, row index/actions, Jalali date cells)
- **RTL-native** layout and Shamsi / Jalali date cells (`react-persian-range-picker`)
- **Excel-like keyboard** — arrows, Tab, Enter between cells
- **VirtualList** — render only visible rows for tens of thousands of lines
- **Event-sourced session** with IndexedDB and cell undo
- **Excel / PDF plugins** on the view stream (domain aggregates stay untouched)
- **TypeScript**, React **17 / 18 / 19**

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

Install does **not** connect to arianERP. Default `remoteApi` is `NoopRemoteApi`. ERP hosts must inject `FetchRemoteApi` — see [docs/host-arian-erp.md](./docs/host-arian-erp.md) (`_auth`, `persist:arianERP`, `Defaults`).

```tsx
import { ERPTable } from 'persian-data-grid';

<ERPTable
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columnConfig}
  rows={rows}
  tableHeight={tableHeight}
  onReady={setController}
/>
```

---

## Quick start

```tsx
import { useState } from 'react';
import { ERPTable, type UITableController } from 'persian-data-grid';

export function VoucherLines() {
  const [controller, setController] = useState<UITableController | null>(null);

  return (
    <ERPTable
      store="erp"
      tableKey="voucher-1"
      actor={{ userId: 'u1', roles: ['admin'] }}
      columns={columns}
      rows={rows}
      tableHeight={420}
      recordPerPage={10}
      tableTitle="اقلام سند"
      locale="fa"
      onReady={setController}
    />
  );
}
```

Headless composition (own UI + `VirtualList`):

```ts
import { createERPTable, VirtualList } from 'persian-data-grid';

const grid = await createERPTable({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columns,
  rows,
});
```

---

## API overview

| Export | Purpose |
|--------|---------|
| Grid | Drop-in React **grid** |
| Composition root | session, engine, plugins |
| `VirtualList` | Virtualized row window |
| `ExcelExportPlugin` / `ExcelImportPlugin` | xlsx |
| `PdfExportPlugin` | pdf |
| `UITableController` / `GridSession` | Imperative control |

See [docs/public-api.md](./docs/public-api.md), [docs/getting-started.md](./docs/getting-started.md), [docs/cell-components.md](./docs/cell-components.md), [docs/components.md](./docs/components.md), [docs/host-arian-erp.md](./docs/host-arian-erp.md).

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

`persian-data-grid` یک **Data Grid** برای فرم‌های سازمانی فارسی است: گرید با RTL، سلول تاریخ شمسی، ناوبری کیبورد شبیه Excel، اسکرول مجازی و خروجی Excel/PDF.

### نصب

```bash
npm i persian-data-grid
```

وابستگی‌های peer: `react` و `react-dom` (نسخه ۱۷، ۱۸ یا ۱۹).

نصب به‌تنهایی به ERP وصل نمی‌شود. پیش‌فرض `NoopRemoteApi` است. میزبان arianERP باید `FetchRemoteApi` تزریق کند: [docs/host-arian-erp.md](./docs/host-arian-erp.md).

### شروع سریع

```tsx
import { ERPTable } from 'persian-data-grid';

<ERPTable
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columns}
  rows={rows}
  tableHeight={420}
  onReady={setController}
/>
```

### دمو زنده

[https://hamidrezafallahi.github.io/ERP-Table/](https://hamidrezafallahi.github.io/ERP-Table/)

---

## License

MIT © [Hamidreza Fallahi](https://github.com/hamidrezafallahi)

Repository: [github.com/hamidrezafallahi/ERP-Table](https://github.com/hamidrezafallahi/ERP-Table)  
Issues: [GitHub Issues](https://github.com/hamidrezafallahi/ERP-Table/issues)  
npm: [persian-data-grid](https://www.npmjs.com/package/persian-data-grid)
