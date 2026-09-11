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

type ClosestHost = { closest: (selector: string) => unknown };

function asClosestHost(target: EventTarget | null): ClosestHost | null {
  if (!target || typeof (target as unknown as ClosestHost).closest !== 'function') {
    return null;
  }
  return target as unknown as ClosestHost;
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
  if (el.closest('.ant-select') || el.closest('.erp-table-select')) {
    return SELECT_NAV_SKIP.has(code);
  }
  if (el.closest('[data-erp-cell-textarea]')) {
    return TEXTAREA_NAV_SKIP.has(code);
  }
  return false;
}
