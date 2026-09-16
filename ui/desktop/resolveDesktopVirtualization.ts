import type { GridSession } from '../../application/session/GridSession';

/**
 * Desktop row virtualization (PR-97 / D17).
 * Default **on** when a `GridSession` is present.
 * Pass `virtualization={false}` for classic pagination chrome.
 * Without a session, virtualization stays off (no viewport).
 */
export function resolveDesktopVirtualization(
  virtualization: boolean | undefined,
  session: GridSession | null | undefined,
): boolean {
  if (!session) return false;
  if (virtualization === false) return false;
  return true;
}
