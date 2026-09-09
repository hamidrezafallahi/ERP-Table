import type { GridSession } from '../../application/session/GridSession';

/**
 * Desktop virtualization is off by default to match the ERP host
 * (classic pagination chrome). Pass `virtualization={true}` to enable.
 */
export function resolveDesktopVirtualization(
  virtualization: boolean | undefined,
  session: GridSession | null | undefined,
): boolean {
  return virtualization === true && !!session;
}
