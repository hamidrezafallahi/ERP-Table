import { assignThemeVars } from '../theme';
import { useERPTableHost } from './ERPTableHost';

export function showSuccessToast(message?: unknown, _detail?: unknown): void {
  const text = String(message ?? '');
  emitToast('success', text);
}

export function showErrorToast(message?: unknown, _detail?: unknown): void {
  const text = String(message ?? '');
  emitToast('error', text);
}

function emitToast(kind: 'success' | 'error', message: string): void {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector('.erp-table-toast');
  existing?.remove();
  const el = document.createElement('div');
  el.className = `erp-table-toast is-${kind}`;
  el.textContent = message;
  assignThemeVars(el);
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 2800);
}

/** Host can wrap this if it wants toasts routed through its own UI. */
export function useHostToast() {
  const host = useERPTableHost();
  return {
    success: (message: string, detail?: unknown) => {
      if (host.onToast) host.onToast('success', message, detail);
      else showSuccessToast(message, detail);
    },
    error: (message: string, detail?: unknown) => {
      if (host.onToast) host.onToast('error', message, detail);
      else showErrorToast(message, detail);
    },
  };
}
