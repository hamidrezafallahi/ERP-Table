import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

type ShortcutRow = {
  shortcut: string;
  /** Substrings that must appear in UITableKeyboardHandler.ts for this shortcut. */
  handlerMarkers: string[];
};

/**
 * Every documented shortcut row (except section headers) must map to handler wiring.
 * Source of truth: docs/keyboard.md tables.
 */
const DOCUMENTED_SHORTCUTS: ShortcutRow[] = [
  { shortcut: 'ArrowUp', handlerMarkers: ["case 'ArrowUp'", 'MOVE_ACTIVE_CELL_VERTICAL'] },
  { shortcut: 'ArrowDown', handlerMarkers: ["case 'ArrowDown'", 'MOVE_ACTIVE_CELL_VERTICAL'] },
  { shortcut: 'ArrowLeft', handlerMarkers: ["case 'ArrowLeft'", 'MOVE_ACTIVE_CELL'] },
  { shortcut: 'ArrowRight', handlerMarkers: ["case 'ArrowRight'", 'MOVE_ACTIVE_CELL'] },
  { shortcut: 'Tab', handlerMarkers: ["case 'Tab'", 'isCellEditorTarget', 'MOVE_ACTIVE_CELL'] },
  { shortcut: 'Enter', handlerMarkers: ["case 'Enter'", 'MOVE_ACTIVE_CELL_VERTICAL', 'commit'] },
  { shortcut: 'Home', handlerMarkers: ["case 'Home'", 'JUMP_ACTIVE_CELL_ROW_EDGE', 'JUMP_ACTIVE_CELL_GRID'] },
  { shortcut: 'End', handlerMarkers: ["case 'End'", 'JUMP_ACTIVE_CELL_ROW_EDGE', 'SELECT_FROM_ACTIVE_TO_LAST'] },
  { shortcut: 'Ctrl+Home', handlerMarkers: ['JUMP_ACTIVE_CELL_GRID', "corner: 'first'"] },
  { shortcut: 'Ctrl+End', handlerMarkers: ['JUMP_ACTIVE_CELL_GRID', "corner: 'last'"] },
  { shortcut: 'PageUp', handlerMarkers: ["case 'PageUp'", 'CHANGE_PAGE'] },
  { shortcut: 'PageDown', handlerMarkers: ["case 'PageDown'", 'CHANGE_PAGE'] },
  { shortcut: 'Shift+Arrow', handlerMarkers: ['EXTEND_CELL_RANGE'] },
  { shortcut: 'Ctrl+Shift+Arrow', handlerMarkers: ['EXTEND_CELL_RANGE_TO_EDGE'] },
  { shortcut: 'Ctrl+A', handlerMarkers: ["case 'KeyA'", 'SELECT_ALL_CELLS'] },
  { shortcut: 'Ctrl+C', handlerMarkers: ["case 'KeyC'", 'this.copyCells'] },
  { shortcut: 'Ctrl+X', handlerMarkers: ["case 'KeyX'", 'this.cutCells'] },
  { shortcut: 'Ctrl+V', handlerMarkers: ["case 'KeyV'", 'this.pasteCells'] },
  { shortcut: 'Alt+C (deprecated)', handlerMarkers: ['SET_TABLE_ACTION', "action: 'copy'", '@deprecated D18'] },
  { shortcut: 'Alt+X (deprecated)', handlerMarkers: ['SET_TABLE_ACTION', "action: 'cut'", '@deprecated D18'] },
  { shortcut: 'Alt+V (deprecated)', handlerMarkers: ['SET_TABLE_ACTION', "action: 'paste'", '@deprecated D18'] },
  { shortcut: 'Alt+N', handlerMarkers: ["case 'KeyN'", 'ADD_EMPTY_ROW'] },
  { shortcut: 'Alt+D', handlerMarkers: ["case 'KeyD'", 'DUPLICATE_ROW'] },
  { shortcut: 'Alt+Delete', handlerMarkers: ["case 'Delete'", 'DELETE_ROW'] },
  { shortcut: 'Ctrl+Space', handlerMarkers: ["case 'Space'", 'TOGGLE_ROW_SELECTION'] },
  { shortcut: 'Ctrl+Shift+End', handlerMarkers: ['SELECT_FROM_ACTIVE_TO_LAST'] },
  { shortcut: 'Ctrl+Arrow vertical', handlerMarkers: ['MOVE_VERTICAL_ACTIVE_ROW'] },
  { shortcut: 'Alt+Arrow vertical', handlerMarkers: ['MOVE_VERTICAL_SELECTED_ROWS'] },
  { shortcut: 'Alt+Left', handlerMarkers: ['COLLAPSE_ALL_ROWS'] },
  { shortcut: 'Ctrl+Z', handlerMarkers: ["case 'KeyZ'", 'UNDO'] },
  { shortcut: 'Ctrl+Shift+Z / Ctrl+Y', handlerMarkers: ['REDO'] },
  { shortcut: 'Alt+B', handlerMarkers: ["case 'KeyB'", 'pasteInsert'] },
  { shortcut: 'Escape', handlerMarkers: ["case 'Escape'", 'SET_TABLE_ACTION', 'cancelCellEdit', 'closestGridRoot'] },
];

describe('PR-109 docs/keyboard.md', () => {
  const handler = load('infrastructure/ui/UITableKeyboardHandler.ts');
  const doc = load('docs/keyboard.md');

  it('keyboard.md lists standard sections', () => {
    expect(doc).toContain('## Cell navigation');
    expect(doc).toContain('single tab-stop');
    expect(doc).toContain('## Clipboard (system)');
    expect(doc).toContain('Deprecated row-clone aliases');
  });

  it.each(DOCUMENTED_SHORTCUTS)(
    'handler wires $shortcut',
    ({ handlerMarkers }) => {
      for (const marker of handlerMarkers) {
        expect(handler).toContain(marker);
      }
    },
  );

  it('bootstrap wires cut handler', () => {
    expect(load('bootstrap/index.ts')).toContain('attachCutCells');
    expect(load('bootstrap/index.ts')).toContain('cutGridSelectionToClipboard');
  });

  it('MIGRATION.md documents Alt→Ctrl clipboard aliases', () => {
    expect(load('MIGRATION.md')).toContain('Alt+C');
    expect(load('MIGRATION.md')).toContain('Ctrl+C');
  });

  it('codemod notes D18 clipboard migration', () => {
    expect(load('scripts/codemod-v0.7.mjs')).toContain('Alt+C');
  });
});
