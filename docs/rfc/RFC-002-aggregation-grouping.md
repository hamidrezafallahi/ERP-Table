# RFC-002 — Aggregation and single-level row grouping

## Status

**Accepted** (PR-117) — recorded in `WORKLOG.md` (user continue = Accept, ۱۴۰۵/۰۶/۲۵).

PR-118 … PR-122 may proceed.

## Summary

Today the footer hard-codes `sum` via `ColumnTotalsIndex` (PR-99). This RFC opens **general `aggFunc`** and **single-level row grouping** (D20), while keeping **pivot**, **integrated charts**, and **multi-level tree data** out of scope.

Aggregation and grouping are **view / presentation concerns** derived from the document. They must not rewrite cell history, must remain undo-safe, must participate correctly in the virtual row window, and must be visible in Excel / PDF / CSV exports (PR-122).

## Goals (Phase 22)

| PR | Deliverable |
|----|-------------|
| PR-118 | Pure `engine/dataOps/aggregation.ts` — incremental aggs |
| PR-119 | Footer reads `ColumnDef.aggFunc` + optional `footerRows` |
| PR-120 | Single-level `groupBy` engine + flat index with group rows |
| PR-121 | Group row UI (chevron, `aria-expanded` / `aria-level`) |
| PR-122 | Excel / PDF / CSV carry groups + aggregates |

## Non-goals (explicit)

- Pivot mode / cross-tab
- Integrated charts
- Multi-level tree data / nested `groupBy` activation (API may accept `colId[]` but only **one** level is active in 0.12.0)
- Persisting expanded/collapsed group UI as domain events (see EventStore)
- Making group rows editable domain `Row`s

---

## 1. Data model

### 1.1 Column aggregation

Extend `ColumnDef` / `ColumnDefBridge`:

```ts
type AggFuncName =
  | 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last';

type AggFunc<TValue = unknown> =
  | AggFuncName
  | ((values: readonly TValue[]) => unknown);

// on ColumnDef:
aggFunc?: AggFunc;
```

- Built-ins live in `engine/dataOps/aggregation.ts` (pure, no React/DOM).
- Custom functions receive the **current visible** (post sort/filter) value list for that column, or an incremental accumulator API for built-ins (preferred for hot path).
- Columns without `aggFunc` show empty footer cells (PR-119).

**Money / float:** `sum` / `avg` for `price` / `number` must use **integer rials** (or a fixed-scale decimal integer), never IEEE float accumulation. Document the unit in `ColumnDef` comments: amounts are integer minor units unless `valueParser` already normalizes.

### 1.2 Footer rows

```ts
// DataGrid / CreateGridConfig (PR-119)
footerRows?: ReadonlyArray<{
  id: string;           // e.g. 'sum' | 'avg'
  label?: string;       // i18n key or literal
  /** Override which agg to show; default = column's aggFunc */
  aggFunc?: AggFuncName;
}>;
```

- Default when `footer={true}` and no `footerRows`: one row using each column’s `aggFunc` (or legacy sum for `price`/`number` during one-version compat).
- Multiple footer rows are **not** pinned bottom host rows (`pinnedBottomRowData`, PR-116); they remain `tfoot` aggregation chrome.

### 1.3 Grouping

```ts
// session / view intent (not domain Table mutation)
groupBy?: string | string[];  // colId; only first entry active in 0.12.0
groupDefaultExpanded?: boolean | number; // true | false | level count
```

**Flat presentation index** (PR-120):

```
[ GroupRow(key=A, agg…), Leaf, Leaf, GroupRow(key=B, agg…), Leaf, … ]
```

- `GroupRow` is a **synthetic view node**, not a domain `Row`.
- Identity: negative or reserved id space, e.g. `group:${colId}:${key}` mapped to a stable numeric sentinel for `SparseRowIndex`, **or** a parallel `UiNode` index (`{ kind: 'group' | 'leaf', … }`). Prefer an explicit `UiNode` list so we do not collide with real `RowId`s.
- Collapsed group: children omitted from the flat index; group row remains.
- Expanded: children follow immediately after the group row.

### 1.4 Relationship to existing totals

| Today | After |
|-------|--------|
| `ColumnTotalsIndex` sum-only | Generalize to `ColumnAggIndex` (or extend totals) with per-column `aggFunc` state |
| Footer hard-coded price/number | Footer driven by `aggFunc` |
| No group rows | Flat index includes group nodes |

`ColumnTotalsIndex` may remain as the `sum` implementation behind the new API for one version, then fold in.

---

## 2. EventStore impact

### Decision: **no group / agg document events**

| Concern | Stream | Event? |
|---------|--------|--------|
| Cell edit | document `table:{id}` | existing `CELL_CHANGED` (unchanged) |
| Column reorder / layout | document / view as today | unchanged |
| `groupBy` / expand-collapse | **session only** | **no** EventStore append |
| Aggregate values | derived | **no** EventStore append |

**Rationale**

- Aggregates are pure functions of cell values + filter/sort/group view intent.
- Expanding a group is UI chrome (like scroll viewport), not an audit fact.
- Persisting `groupBy` across reload belongs with **view state** (`stateKey` / future `columnState`-style view persist), not the cell event log.

Optional later (out of 0.12.0): `VIEW_GROUP_BY_CHANGED` on the **view** stream for host analytics — same pattern as `EXPORT_REQUESTED` (RFC-001). Not required to ship PR-118…121.

### Replay / catch-up

- Snapshot + event catch-up rebuilds domain rows only.
- After load, `ViewStateBuilder` recomputes aggs and (if `groupBy` set) the flat group index from current rows + session intent.
- No migration of historical events.

---

## 3. Undo impact

| Action | Undo? |
|--------|-------|
| Cell edit that changes an aggregate | Yes — existing cell undo; agg index **patches** on undo/redo of `CELL_CHANGED` |
| Change `groupBy` | No stack entry (session) |
| Expand / collapse group | No stack entry |
| Edit “inside” a group row | N/A — group rows are not editable |

**Invariant:** Undo never needs to store aggregate snapshots if the agg index is incremental and patched from `previousValue` / `newValue` on the same path as `ColumnTotalsIndex.patch` today.

Custom `aggFunc` functions that are not incremental: mark the index dirty and rebuild O(n) for that column only on cell change (document the cost).

---

## 4. Virtualization impact

### Problem

`SparseRowIndex` / `getUiRowCount()` today count **leaf** rows. Group rows must occupy slots in the window or scroll math breaks.

### Decision

1. Build a **flat `UiNode[]` (or ordered id list including group sentinels)** after sort + filter + group.
2. `ViewportCalculator.calculate` / `useVirtualWindow` operate on **that** flat length.
3. Mounted window maps each slot:
   - `leaf` → existing `ERPTableRow` via `getRowView(rowId)`
   - `group` → `ERPTableGroupRow` (PR-121)
4. Keyboard `neighbor` walks the flat index (skip hidden collapsed children by not including them).
5. `aria-rowcount` / `aria-rowindex` / `aria-level` / `aria-expanded` follow the flat index (group level = 1; leaves under group = level 2).

### Performance budgets

- Regroup on `groupBy` / filter / sort change: O(n) acceptable with same class of budgets as sort/filter (PR-100 harness).
- Expand/collapse: O(group size) splice into flat index, not full O(n) rebuild when possible.
- 100k rows + grouping must stay under documented memory/time ceilings (extend harness in PR-120 verify).

### Pinned rows (PR-116)

- `pinnedTopRowData` / `pinnedBottomRowData` stay **outside** the flat group index (unchanged).
- Footer agg rows stay in `tfoot` (not group nodes).

---

## 5. Excel / PDF / CSV export impact

### Source of truth for export

`GridQueryPort.getExportSource` today walks **domain rows** (no group headers). PR-122 must expose an export projection that includes:

| Row kind | Excel | PDF | CSV |
|----------|-------|-----|-----|
| Group header | Outline level / bold label + agg cells | Bold section row | Prefix column or repeated group key |
| Leaf | As today | As today | As today |
| Footer / grand total | Optional trailing rows from `footerRows` | Same | Same |

### Plugin boundary

- Prefer extending `ExportSource` with `rows: Array<{ kind: 'group' | 'leaf' | 'total'; … }>` rather than plugins re-implementing grouping.
- Excel: use SheetJS (or current stack) **outline levels** when feasible; otherwise emulate with indentation in the first column.
- PDF: reuse table layout; group rows as full-width or labeled first cell (Vazirmatn RTL preserved).
- CSV: new `./plugins/csv` (PR-122) — flat file; group key column or blank separator rows; document the chosen convention in public-api.

### EventStore

Export remains view-stream side effects (`EXPORT_REQUESTED` / `*_COMPLETED`) per RFC-001 — **no** change to that model when groups are included in the blob.

---

## 6. API sketch (host-facing)

```tsx
<DataGrid
  rowData={rows}
  columnDefs={[
    { field: 'category', headerName: 'نوع' },
    { field: 'amount', headerName: 'مبلغ', type: 'number', aggFunc: 'sum' },
  ]}
  groupBy="category"
  groupDefaultExpanded
  footer
  footerRows={[{ id: 'sum', label: 'جمع' }]}
/>
```

Imperative (optional in PR-120/121):

```ts
api.setRowGroupColumns(['category']);
api.getRowGroupColumns();
// expand/collapse via existing session dispatch or small API surface
```

---

## 7. Layering rules

| Layer | May contain |
|-------|-------------|
| `engine/dataOps/aggregation.ts` | Pure agg + incremental index |
| `engine/dataOps/rowGrouping.ts` (name TBD) | Pure flatten group/leaf nodes |
| `engine/ViewStateBuilder` | Wires sort → filter → group → ui index |
| `application/` | No React; optional view-intent commands only if needed |
| `domain/` | **No** group entities; cells remain source of truth |
| `ui/desktop` | Group row chrome, footer from agg model |
| `packages/plugins/*` | Consume enriched `ExportSource` |

---

## 8. Acceptance checklist (for Approver)

- [x] Agree: no EventStore events for `groupBy` / expand-collapse
- [x] Agree: group rows are synthetic view nodes, not domain `Row`s
- [x] Agree: money aggs use integer minor units (no float sum)
- [x] Agree: only one active group level in 0.12.0
- [x] Agree: export goes through enriched `ExportSource` (PR-122)
- [x] Agree: pivot / charts / multi-level tree remain out of scope

## 9. Proposed follow-up after Accept

1. Record in `WORKLOG.md`: `RFC-002 Accepted (date)` + checklist copy.
2. Set this file Status → `Accepted (PR-117)`.
3. Check `PR-117` in `EXECUTION_PLAN.md`.
4. Start **PR-118** (aggregation engine only).

---

## References

- D20 (locked): `aggFunc` + single-level grouping open behind this RFC; pivot/chart/tree multi-level closed
- `engine/ColumnTotalsIndex.ts` — incremental sum baseline (PR-99)
- `engine/SparseRowIndex.ts` — virtualization index (PR-99)
- RFC-001 — view-stream export events (pattern for optional future view analytics)
- `EXECUTION_PLAN.md` Phase 22 (PR-118 … PR-122)
