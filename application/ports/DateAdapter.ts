/**
 * Pluggable calendar port (PR-128 / D21).
 * Domain values stay as JS `Date` (or null); adapters own parse/format.
 */

export type DateAdapter = {
  /** Parse host/cell input into a Date, or null if empty/invalid. */
  parse(input: unknown): Date | null;
  /** Format a Date for display / edit. */
  format(date: Date): string;
  addDays(date: Date, days: number): Date;
  startOfMonth(date: Date): Date;
  /** Negative if a < b, 0 if equal (by UTC day), positive if a > b. */
  compare(a: Date, b: Date): number;
  /** Calendar id for docs / Intl hints. */
  readonly id: 'jalali' | 'gregory';
};
