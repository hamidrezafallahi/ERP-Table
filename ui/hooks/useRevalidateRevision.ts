import { useEffect, useState } from 'react';

/**
 * Window events that ask every mounted grid header to re-run validation.
 * Hosts dispatch one after changing something the grid cannot observe
 * (e.g. a header form field that feeds a column `requiredIf` rule).
 * `erp-table:revalidate` is the legacy arianERP name and stays supported.
 */
export const GRID_REVALIDATE_EVENT = 'pdg-grid:revalidate';
export const LEGACY_GRID_REVALIDATE_EVENT = 'erp-table:revalidate';

/** Increments whenever a host fires a revalidate event. SSR-safe. */
export function useRevalidateRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const bump = () => setRevision((v) => v + 1);
    const names = [GRID_REVALIDATE_EVENT, LEGACY_GRID_REVALIDATE_EVENT];
    names.forEach((n) => window.addEventListener(n, bump));
    return () => names.forEach((n) => window.removeEventListener(n, bump));
  }, []);
  return revision;
}
