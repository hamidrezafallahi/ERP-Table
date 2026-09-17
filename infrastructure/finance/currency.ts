/**
 * Iranian money units (PR-140).
 * Canonical storage is integer **rials** (same convention as `toMinorUnits`).
 * 1 toman = 10 rials.
 */

export type CurrencyUnit = 'rial' | 'toman';

export const RIALS_PER_TOMAN = 10;

export function rialToToman(rial: number): number {
  if (!Number.isFinite(rial)) return NaN;
  return Math.trunc(rial) / RIALS_PER_TOMAN;
}

export function tomanToRial(toman: number): number {
  if (!Number.isFinite(toman)) return NaN;
  return Math.trunc(toman) * RIALS_PER_TOMAN;
}

export function convertCurrency(
  amount: number,
  from: CurrencyUnit,
  to: CurrencyUnit,
): number {
  if (!Number.isFinite(amount)) return NaN;
  if (from === to) return Math.trunc(amount);
  if (from === 'rial' && to === 'toman') return rialToToman(amount);
  return tomanToRial(amount);
}

export type FormatPriceOptions = {
  /** Unit of the numeric `amount` argument. Default `rial`. */
  unit?: CurrencyUnit;
  /** Unit shown in the label suffix. Defaults to `unit`. */
  displayUnit?: CurrencyUnit;
  /** Append unit label (`ریال` / `تومان`). Default true. */
  withLabel?: boolean;
  /** Use Persian digits via Intl. Default true. */
  persianDigits?: boolean;
  locale?: string;
};

/**
 * Format a money amount. Converts when `unit` ≠ `displayUnit`.
 * Values are truncated to integers before conversion.
 */
export function formatPrice(
  amount: number,
  options: FormatPriceOptions = {},
): string {
  if (!Number.isFinite(amount)) return '';
  const unit = options.unit ?? 'rial';
  const displayUnit = options.displayUnit ?? unit;
  const converted = convertCurrency(amount, unit, displayUnit);
  if (!Number.isFinite(converted)) return '';

  const locale = options.locale ?? (options.persianDigits === false ? 'en-US' : 'fa-IR');
  const formatted = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: displayUnit === 'toman' ? 1 : 0,
  }).format(converted);

  if (options.withLabel === false) return formatted;
  const label = displayUnit === 'toman' ? 'تومان' : 'ریال';
  return `${formatted} ${label}`;
}
