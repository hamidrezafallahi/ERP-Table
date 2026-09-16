/**
 * Focus helpers for APG grid / modal / menu (PR-124).
 * DOM-only; used by keyboard handler and UI overlays.
 */

const EDITOR_SELECTOR =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"]';

export function isCellEditorTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  if (target.closest('[role="menu"], [role="dialog"], .erp-table-modal')) {
    return false;
  }
  const editor = target.closest(EDITOR_SELECTOR);
  if (!editor) return false;
  return Boolean(editor.closest('[role="gridcell"], [data-erp-cell-textarea]'));
}

export function closestGridRoot(target: EventTarget | null): HTMLElement | null {
  if (!target || !(target instanceof Element)) return null;
  return target.closest('[role="grid"], [role="treegrid"]') as HTMLElement | null;
}

/** Focusable controls inside a container (for focus traps). */
export function listFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(nodes).filter((el) => {
    if (el.hasAttribute('disabled')) return false;
    const style = typeof window !== 'undefined' ? window.getComputedStyle(el) : null;
    if (style && (style.visibility === 'hidden' || style.display === 'none')) {
      return false;
    }
    return true;
  });
}

/**
 * Trap Tab inside `container`. Returns true when the event was handled.
 */
export function trapTabKey(
  container: HTMLElement,
  e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'preventDefault'>,
): boolean {
  if (e.key !== 'Tab') return false;
  const focusables = listFocusable(container);
  if (focusables.length === 0) return false;
  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;
  const active = document.activeElement as HTMLElement | null;
  if (e.shiftKey) {
    if (!active || active === first || !container.contains(active)) {
      e.preventDefault();
      last.focus();
      return true;
    }
  } else if (!active || active === last || !container.contains(active)) {
    e.preventDefault();
    first.focus();
    return true;
  }
  return false;
}
