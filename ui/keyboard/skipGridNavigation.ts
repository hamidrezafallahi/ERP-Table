const SELECT_NAV_SKIP = new Set([
  'ArrowUp',
  'ArrowDown',
  'Enter',
  'NumpadEnter',
]);

const TEXTAREA_NAV_SKIP = new Set([
  'Enter',
  'NumpadEnter',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

type ClosestHost = {
  closest: (selector: string) => unknown;
  getAttribute?: (name: string) => string | null;
};

function asClosestHost(target: EventTarget | null): ClosestHost | null {
  if (!target || typeof (target as unknown as ClosestHost).closest !== 'function') {
    return null;
  }
  return target as unknown as ClosestHost;
}

/** Select widget, its portal dropdown / virtual list, or an option/combobox node. */
function isInsideSelect(el: ClosestHost): boolean {
  return Boolean(
    el.closest('.ant-select') ||
      el.closest('.ant-select-dropdown') ||
      el.closest('.rc-virtual-list') ||
      el.closest('.erp-table-select') ||
      el.getAttribute?.('role') === 'option' ||
      el.getAttribute?.('role') === 'combobox',
  );
}

/**
 * Table shortcuts that must win over a focused Select: every Alt shortcut and
 * the Ctrl+Space / Ctrl+Arrow / Ctrl+End row shortcuts. The caller must
 * `preventDefault()` + `stopPropagation()` synchronously — an async dispatch
 * is too late to stop the Select's own handling.
 */
export function isGridShortcutKey(e: {
  altKey: boolean;
  ctrlKey: boolean;
  code: string;
  getModifierState?: (key: string) => boolean;
}): boolean {
  // AltGr (reported as Ctrl+Alt on Windows) types a character, it is no chord.
  if (typeof e.getModifierState === 'function' && e.getModifierState('AltGraph')) {
    return false;
  }
  if (e.altKey) return true;
  return (
    e.ctrlKey &&
    (e.code === 'Space' ||
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown' ||
      e.code === 'End')
  );
}

/**
 * Window-capture KEY_DOWN must not steal Enter/arrows from native controls.
 * Select: keep existing skip. Textarea: Enter inserts a newline (PR-56).
 */
export function shouldSkipGridNavigation(
  target: EventTarget | null,
  code: string,
): boolean {
  const el = asClosestHost(target);
  if (!el) return false;
  if (isInsideSelect(el)) {
    return SELECT_NAV_SKIP.has(code);
  }
  if (el.closest('[data-erp-cell-textarea]')) {
    return TEXTAREA_NAV_SKIP.has(code);
  }
  return false;
}

/**
 * Where a window-level keydown came from, relative to ONE grid root.
 * - `cell`: a body cell or the grid's own table (APG focus) → grid keyboard.
 * - `page`: nothing focused (body / document) → grid keyboard (arrows keep
 *   working after a click on a non-focusable area, as in the legacy table).
 * - `outside`: any other control — page forms, the grid toolbar, header
 *   filters, popovers, dialogs → only the legacy global chords
 *   (`isGridShortcutKey`); typing, copy/paste, Enter, Tab, arrows stay native.
 * - `other-grid`: inside another grid → ignored.
 */
export type GridKeyScope = 'cell' | 'page' | 'outside' | 'other-grid';

export function resolveGridKeyScope(
  target: EventTarget | null,
  root: Element | null,
): GridKeyScope {
  if (!root) return 'cell';
  if (typeof Element === 'undefined' || !(target instanceof Element)) return 'page';
  if (
    typeof document !== 'undefined' &&
    (target === document.body || target === document.documentElement)
  ) {
    return 'page';
  }
  const owner = target.closest('[data-pdg-grid]');
  if (owner && owner !== root) return 'other-grid';
  if (!root.contains(target)) return 'outside';
  if (target.closest('[role="menu"], [role="dialog"], .erp-table-modal')) return 'outside';
  if (target.closest('[role="gridcell"], [data-erp-cell-textarea]')) return 'cell';
  if (target.closest('[role="grid"], [role="treegrid"]') === target) return 'cell';
  return 'outside';
}
