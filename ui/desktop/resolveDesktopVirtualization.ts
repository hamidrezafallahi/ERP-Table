import type { GridSession } from '../../application/session/GridSession';

/**
 * Desktop virtualization is on by default when a GridSession exists.
 * Pass `virtualization={false}` to keep classic pagination.
 */
export function resolveDesktopVirtualization(
  virtualization: boolean | undefined,
  session: GridSession | null | undefined,
): boolean {
  const enabled = virtualization !== false;
  return enabled && !!session;
}
