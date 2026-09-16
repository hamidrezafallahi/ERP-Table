# Performance (PR-100 / PR-101)

Measured by `infrastructure/perf/gridHarness.ts` and
`infrastructure/perf/memoryHarness.ts`. CI tests hydrate **100 000 domain rows**
in-memory — not a browser paint profile.

## Throughput (8 columns) — PR-100

Recorded 16 Sep 2026 (Windows, Node 22, Vitest):

| Operation | Measured | CI budget (max) |
|-----------|----------|-----------------|
| Hydrate 100k rows (`createGrid` → `ready`) | **1675 ms** | 15 000 ms |
| First visible window (`CHANGE_VIEWPORT` + project) | **1 ms** | 50 ms |
| Scroll 1000 viewport steps | **156 ms** | 1 000 ms |
| 100 cell edits (`CHANGE_CELL_VALUE`) | **674 ms** | 5 000 ms |
| Sort by `amount` desc (index rebuild) | **2014 ms** | 8 000 ms |
| Text filter `name contains "r1"` | **403 ms** | 4 000 ms |
| Rows in first window | **12** | ≤ 20 |

Budgets: `infrastructure/perf/grid-performance-budgets.json`.

## Memory (20 columns) — PR-101

| Metric | Measured | CI budget (max) |
|--------|----------|-----------------|
| Heap delta after hydrate 100k × 20 | **215 MB** | 300 MB |
| Avg materialized cells / row | **1** (index only; other fields stay on host `data`) | ≤ 1.05 |

Lazy host cells (PR-101): `rowData` rows keep values on the host object until
`getCell` / edit. `Cell` stores primitives (no per-field `CellValue` wrappers).
`ColumnId.for` interns field names.

## How to re-run

```bash
yarn vitest run infrastructure/__tests__/grid-performance-budget.spec.ts
yarn vitest run infrastructure/__tests__/grid-memory-budget.spec.ts
```
