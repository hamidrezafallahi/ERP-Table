/**
 * Which full-body overlay to show (PR-103). Pure — no React.
 * `loading` wins over no-rows.
 */
export type GridOverlayKind = 'loading' | 'noRows' | null;

export function resolveGridOverlay(
  loading: boolean | undefined,
  rowCount: number,
): GridOverlayKind {
  if (loading) return 'loading';
  if (rowCount <= 0) return 'noRows';
  return null;
}
