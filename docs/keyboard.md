# Keyboard shortcuts

Standard shortcuts for `DataGrid` when focus is inside the grid (session keyboard handler).  
RTL note: **ArrowLeft** moves to the **next** column in document order; **ArrowRight** moves to the **previous** column.

## Cell navigation

The grid is a **single tab-stop** (APG `aria-activedescendant`, PR-124): `Tab` moves focus into the grid once, arrow keys move the active cell, and `Tab` again leaves the grid. While a cell **editor** is focused, `Tab` confirms the draft and advances to the next editable cell (PR-126). `Esc` cancels the draft without writing EventStore.

| Shortcut | Action |
|----------|--------|
| `ArrowUp` / `ArrowDown` | Move active cell vertically |
| `ArrowLeft` / `ArrowRight` | Move active cell horizontally (RTL-aware) |
| `Tab` (navigation) | Leave the grid (browser focus next control) |
| `Tab` (while editing) | Confirm edit + next editable cell |
| `Shift+Tab` (while editing) | Confirm edit + previous editable cell |
| `Enter` (while editing) | Confirm edit + move down |
| `Shift+Enter` (while editing) | Confirm edit + move up |
| `Enter` (not editing, `singleClickEdit: false`) | Start editing |
| `F2` | Start editing |
| `Home` | First editable column in the current row |
| `End` | Last editable column in the current row |
| `Ctrl+Home` | First editable cell in the grid |
| `Ctrl+End` | Last editable cell in the grid |
| `PageUp` / `PageDown` | Previous / next page |
| `Escape` | Cancel edit draft (no EventStore write); then editor → focus grid; grid focused → blur grid |

## Cell range selection

| Shortcut | Action |
|----------|--------|
| `Shift+Arrow` | Extend cell range |
| `Ctrl+Shift+Arrow` | Extend cell range to grid edge |
| `Ctrl+A` | Select all cells |

## Clipboard (system)

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Copy selection to system clipboard (TSV + HTML) |
| `Ctrl+X` | Cut selection (copy then clear cells; one undo) |
| `Ctrl+V` | Paste from system clipboard |

### Deprecated row-clone aliases (until 1.0.0)

These keep the legacy **in-memory row clone** mode (`SET_TABLE_ACTION`), not the system clipboard:

| Deprecated | Replacement |
|------------|-------------|
| `Alt+C` | `Ctrl+C` |
| `Alt+X` | `Ctrl+X` |
| `Alt+V` | `Ctrl+V` |

## Row operations

| Shortcut | Action |
|----------|--------|
| `Alt+N` | Add empty row |
| `Alt+D` | Duplicate active row |
| `Alt+Delete` | Delete active row |
| `Ctrl+Space` | Toggle row selection |
| `Shift+End` | Toggle row selection (legacy) |
| `Ctrl+Shift+End` | Select from active row to last row |
| `Ctrl+ArrowUp` / `Ctrl+ArrowDown` | Move active row |
| `Alt+ArrowUp` / `Alt+ArrowDown` | Move selected rows |
| `Alt+Left` | Collapse all expanded rows |

## Undo

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |

## Other

| Shortcut | Action |
|----------|--------|
| `Alt+B` | Paste insert (row-clone mode) |
| `Escape` | Cancel row-clone mode |
