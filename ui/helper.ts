import type { ReactNode } from 'react';

import type { DateAdapter } from '../application/ports/DateAdapter';
import { FieldType } from '../bootstrap/type';
import {
  formatLocaleNumber,
  translate,
  type ERPTableLocale,
  type NumberingSystem,
} from './host/messages';

export type FormatLocaleOptions = {
  locale?: ERPTableLocale;
  numberingSystem?: NumberingSystem;
  dateAdapter?: DateAdapter;
};

/** @deprecated Digits come from Intl numberingSystem (PR-127). Kept for search highlight. */
export function toFaDigits(value: string): string {
  const FA_DIGITS =
    '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9';
  return value.replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

export function formatGroupedNumber(
  val: unknown,
  locale: ERPTableLocale = 'fa',
  numberingSystem?: NumberingSystem,
): string {
  if (val == null || val === '') return '';
  const n = Number(val);
  if (!Number.isFinite(n)) return String(val);
  return formatLocaleNumber(n, {
    locale,
    numberingSystem,
    useGrouping: true,
  });
}

export function formatDisplayNumber(
  val: unknown,
  locale: ERPTableLocale = 'fa',
  numberingSystem?: NumberingSystem,
): string {
  if (val == null || val === '') return '';
  const n = Number(val);
  if (Number.isFinite(n) && String(val).trim() !== '' && !Number.isNaN(n)) {
    if (/^-?\d+(\.\d+)?$/.test(String(val).trim())) {
      return formatLocaleNumber(n, {
        locale,
        numberingSystem,
        useGrouping: false,
      });
    }
  }
  return String(val);
}

export function formatJalaliDate(
  val: unknown,
  options?: FormatLocaleOptions,
): string | null {
  if (val == null || val === '') return null;
  if (options?.dateAdapter) {
    const date = options.dateAdapter.parse(val);
    return date ? options.dateAdapter.format(date) : null;
  }
  const date =
    typeof val === 'number' ? new Date(val) : new Date(String(val));
  if (Number.isNaN(date.getTime())) return null;
  const locale = options?.locale ?? 'fa';
  const ns = options?.numberingSystem;
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    calendar: locale === 'fa' ? 'persian' : 'gregory',
    numberingSystem: ns,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export const valueParser = (
  val: unknown,
  type: FieldType,
  locale: ERPTableLocale = 'fa',
  numberingSystem?: NumberingSystem,
  dateAdapter?: DateAdapter,
): ReactNode => {
  if (val == null) {
    return type === 'selectOption'
      ? translate('general.selectPlaceholder', locale)
      : '';
  }

  switch (type) {
    case 'text':
    case 'textArea':
    case 'description':
    case 'number':
    case 'select':
    case 'selectOption':
    case 'static':
      return formatDisplayNumber(val, locale, numberingSystem);

    case 'checkbox':
      return val ? '✔' : '✘';

    case 'price':
      return formatGroupedNumber(val, locale, numberingSystem);

    case 'date':
      return formatJalaliDate(val, { locale, numberingSystem, dateAdapter });

    default:
      return '—';
  }
};
