# Example gallery (PR-130)

Seventeen copy-pasteable demos for `persian-data-grid`. English source (D23).

## Run locally

From the repo root (after `yarn install`):

```bash
yarn examples:typecheck
cd examples/gallery && yarn install && yarn dev
```

## StackBlitz

Open the gallery (GitHub import). Append `?example=<id>` to jump to one demo:

| # | Example | StackBlitz |
|---|---------|------------|
| 01 | Basic | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2Fbasic.tsx) |
| 02 | Sort / filter | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FsortFilter.tsx) |
| 03 | Editing + validation | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FeditingValidation.tsx) |
| 04 | Selection + clipboard | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FselectionClipboard.tsx) |
| 05 | Virtual 100k | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2Fvirtual100k.tsx) |
| 06 | Infinite / server | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FinfiniteServer.tsx) |
| 07 | Grouping + agg | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FgroupingAgg.tsx) |
| 08 | Theme dark | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FthemeDark.tsx) |
| 09 | Custom cell | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FcustomCell.tsx) |
| 10 | Export Excel/CSV | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FexportPlugins.tsx) |
| 11 | Jalali dates | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FjalaliDates.tsx) |
| 12 | History / audit | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FhistoryAudit.tsx) |
| 13 | Offline status | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FofflineStatus.tsx) |
| 14 | Sync conflicts | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FsyncConflicts.tsx) |
| 15 | Presence peers | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FpresencePeers.tsx) |
| 16 | Document / finance | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FdocumentFinance.tsx) |
| 17 | Document PDF | [Open](https://stackblitz.com/github/hamidrezafallahi/ERP-Table/tree/master/examples/gallery?file=src%2Fexamples%2FdocumentPdf.tsx) |

CodeSandbox: use **Import from GitHub** → `hamidrezafallahi/ERP-Table` → folder `examples/gallery`.

## CI

`yarn examples:typecheck` runs `tsc -p examples/gallery/tsconfig.json --noEmit` (also in GitHub Actions).
