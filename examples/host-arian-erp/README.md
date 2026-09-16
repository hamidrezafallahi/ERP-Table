# arianERP host glue (examples)

Reference copies of ERP page glue that used to live under `ui/` but are **not** part of the published `persian-data-grid` package.

| File | Role |
|------|------|
| `useERPGrid.ts` | Next.js / Redux page hook that wires voucher header + detail grid |
| `useVoucherDescription.tsx` | Redux/RTK hook for voucher description cells |

These files keep `@ts-nocheck` and depend on host modules (`next-intl`, `react-redux`, `@slice/*`, …). Copy them into the host app and adapt imports; do not import them from `persian-data-grid`.

Adapter contract for `FetchRemoteApi` / cookies: [`host-arian-erp.md`](./host-arian-erp.md).
