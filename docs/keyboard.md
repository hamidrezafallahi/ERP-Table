# Keyboard shortcuts

Standard shortcuts for `DataGrid` when focus is inside the grid (session keyboard handler).  
RTL note: **ArrowLeft** moves to the **next** column in document order; **ArrowRight** moves to the **previous** column.

## Which keys the grid takes

`DataGrid` listens on `window` (so Select popups and the legacy chords work), but it only acts on keys typed **inside its own body cells or its table element**, or when nothing is focused (`document.body`). Keys typed in page forms, the grid toolbar, header filters, popovers, dialogs or another grid stay native — typing, copy/paste, `Enter`, `Tab`, arrows are never taken from them. The only exception are the legacy **global chords** (every `Alt+…` shortcut, `Ctrl+Space`, `Ctrl+ArrowUp/Down`, `Ctrl+End`), which work from anywhere on the page as in the 0.5 line. `AltGr` (`Ctrl+Alt` on Windows) is typing, never a chord. Hosts with their own wiring can reuse `resolveGridKeyScope(target, gridRoot)`.

## Cell navigation

The grid is a **single tab-stop** (APG `aria-activedescendant`, PR-124): `Tab` moves focus into the grid once and arrow keys move the active cell; `Tab` from the grid container leaves the grid. From **inside a cell** — a text editor, a Select, the date-picker button, a checkbox or a read-only cell — `Tab` confirms the edit and advances to the next editable cell (PR-126).

| Shortcut | Action |
|----------|--------|
| `ArrowUp` / `ArrowDown` | Move active cell vertically |
| `ArrowLeft` / `ArrowRight` | Move active cell horizontally (RTL-aware) |
| `Tab` (grid container focused) | Leave the grid (browser focus next control) |
| `Tab` (inside a cell) | Confirm edit + next editable cell |
| `Shift+Tab` (inside a cell) | Confirm edit + previous editable cell |
| `Enter` (`enterNavigation: 'nextCell'`, default) | Confirm edit + next editable cell of the row, then the first cell of the next row; past the last cell of the last row **a new row is added** |
| `Shift+Enter` (`'nextCell'`) | Confirm edit + previous editable cell |
| `Enter` / `Shift+Enter` (`enterNavigation: 'down'`) | Confirm edit + move down / up (spreadsheet style) |
| `Enter` (not editing, `singleClickEdit: false`) | Start editing |
| `F2` | Start editing |
| `Home` / `End` (not in a text editor) | First / last editable column in the current row |
| `Ctrl+Home` | First editable cell in the grid |
| `Ctrl+End` | Last editable cell in the grid |
| `PageUp` / `PageDown` | Previous / next page |
| `Escape` | End the edit — `cellEditCommit: 'deferred'` discards the draft, `'immediate'` keeps the (already written) value; then editor → focus grid; grid focused → blur grid |

### Inside a text editor

While a cell's text input / textarea is focused, the editing keys belong to it: `Ctrl+A` (select text), `Ctrl+C` / `Ctrl+X` / `Ctrl+V` (text clipboard), `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` (text undo) and plain `Home` / `End` (caret). The clipboard keys act on the grid only when **more than one cell** is selected (`Shift+Arrow` / drag). Grid undo stays available through `api.undo()` / `api.redo()` and `Ctrl+Z` when focus is not in a text editor.

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
