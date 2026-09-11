# Custom cell components

How a host registers or replaces a cell editor **without** opening `ui/cellRenderer/index.tsx`.

This package is a voucher-line editor (RTL, Jalali, RowState). It is not AG Grid. grouping / pivot / tree / charts stay out of scope.

Related: [`public-api.md`](./public-api.md) (exports), [`public-api-honesty.md`](./public-api-honesty.md) (what is actually live).

## Which hook to use

| Need | API |
|------|-----|
| One column looks custom | `columns[].render` |
| Every `checkbox` (or another FieldType) looks custom | `ERPTable components={{ checkbox: … }}` |
| New editor type for many columns | `components` key + `fieldType` on those columns |
| Display string for engine / search / export | `returnDisplayValue` — **not** a React renderer |

Lookup order, desktop and mobile:

1. `columns[].render` (that column only)
2. `components[fieldType]` (host map, merged over `DEFAULT_CELL_COMPONENTS`)
3. Built-in FieldType switch (`text`, `price`, `date`, …)

Omit a hook to keep the built-in editor.

## `CellRenderContext`

Every `render` function and every registry component receives the same argument:

| Field | Use |
|-------|-----|
| `value` / `display` | Current cell |
| `row` / `columnId` / `meta` | Schema + row view |
| `controller` | `dispatch`, `getCell`, … |
| `isActive` / `isDeleted` / `isEditable` / `mode` | `view` \| `cell` \| `form` |
| `validation` | Current `isValidCell` result |
| `dispatchChangeValue(next)` | Write the cell (and optional select option) |
| `dispatchChangeDisplay(label)` | Write the display string |
| `activeCell()` | Focus this cell |
| `searchQuery` / `isCurrentSearchMatch` | Current grid-search hit (PR-71). Use `highlightIfCurrentSearch` so `mark.erp-search-hit` appears even while the cell is active. |

```ts
import type { CellComponent, CellRenderContext } from 'persian-data-grid';
import { highlightIfCurrentSearch } from 'persian-data-grid';
```

## Replace a built-in type

```tsx
import { ERPTable, type CellComponent } from 'persian-data-grid';

const HostCheckbox: CellComponent = (ctx: CellRenderContext) => (
  <input
    type="checkbox"
    checked={ctx.value === true}
    disabled={ctx.isDeleted || !ctx.isEditable}
    onChange={(e) => ctx.dispatchChangeValue(e.target.checked)}
  />
);

<ERPTable
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columns}
  rows={rows}
  components={{ checkbox: HostCheckbox }}
/>
```

Only `checkbox` changes. `text` / `price` / `date` stay on the built-in switch.

## One-off column `render`

```tsx
{
  fieldName: 'side',
  fieldCaption: 'طرف',
  fieldType: 'static',
  visibility: { kind: 'always' },
  render: (ctx: CellRenderContext) => (
    <span data-erp-custom-cell="side">{String(ctx.display ?? ctx.value ?? '')}</span>
  ),
}
```

Column `render` wins over `components[fieldType]` for that column.

## New type (file, not a switch case)

`textArea` is the in-package proof: `TextAreaCell` is registered on `DEFAULT_CELL_COMPONENTS`. There is **no** `case "textArea"` in `CellRenderer`.

Host-only type — register a key, point columns at it. `FieldType` is a closed union today, so cast until you add the member in a package PR:

```tsx
import type { CellComponent, CellRenderContext, FieldType } from 'persian-data-grid';

const RatingCell: CellComponent = (ctx: CellRenderContext) => (
  <input
    type="range"
    min={0}
    max={5}
    value={Number(ctx.value ?? 0)}
    disabled={ctx.isDeleted || !ctx.isEditable}
    onChange={(e) => ctx.dispatchChangeValue(Number(e.target.value))}
  />
);

<ERPTable
  components={{ rating: RatingCell }}
  columns={[
    {
      fieldName: 'score',
      fieldCaption: 'امتیاز',
      fieldType: 'rating' as FieldType,
      visibility: { kind: 'always' },
    },
  ]}
/>
```

To ship a type inside this package (like `textArea`):

1. Add the union member on `FieldType`.
2. Put the editor in a **new file**.
3. Register it on `DEFAULT_CELL_COMPONENTS`.
4. If values are strings, add `case 'yourType'` next to `text` in the cell command validator — not in the UI switch.

## Keyboard

Grid capture listens on `window` and treats Enter as “next cell”. Native multiline controls must opt out:

- Built-in `textArea` sets `data-erp-cell-textarea`. Enter / arrows stay in the control; **Tab** still moves cell.
- Host editors that need the same: put `data-erp-cell-textarea` on the focused node, or call `shouldSkipGridNavigation(event.target, event.code)` in a capture listener you own.

Select dropdowns already skip Enter / ArrowUp / ArrowDown via `.erp-table-select`.

## Do not

- Fork `CellRenderer` or add a `case` for a host widget.
- Treat `returnDisplayValue` as JSX. It feeds engine display / search / export.
- Expect `components` on `createERPTable`. It is an `ERPTable` (React host) prop.

Host `render` / `components` widgets that show text should call `highlightIfCurrentSearch(ctx.value, ctx.searchQuery, ctx.isCurrentSearchMatch)` in the read-only path. Built-in `textArea` and `description` already do. Checkbox / date widgets can ignore the fields.

## Related

- [`public-api.md`](./public-api.md) — short examples
- [`getting-started.md`](./getting-started.md) — install
- [`components.md`](./components.md) — `ERPTable` surface
