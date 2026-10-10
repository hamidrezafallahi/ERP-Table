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
}): boolean {
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
