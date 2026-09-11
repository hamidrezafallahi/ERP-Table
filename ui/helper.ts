import type { ReactNode } from 'react';

import { FieldType } from '../bootstrap/type';
import type { ERPTableLocale } from './host/messages';

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toFaDigits(value: string): string {
  return value.replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

export function formatGroupedNumber(
  val: unknown,
  locale: ERPTableLocale = 'fa',
): string {
  if (val == null || val === '') return '';
  const n = Number(val);
  if (!Number.isFinite(n)) return String(val);
  const grouped = `${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return locale === 'fa' ? toFaDigits(grouped) : grouped;
}

export function formatDisplayNumber(
  val: unknown,
  locale: ERPTableLocale = 'fa',
): string {
  if (val == null || val === '') return '';
  const text = String(val);
  return locale === 'fa' ? toFaDigits(text) : text;
}

export function formatJalaliDate(val: unknown): string | null {
  if (val == null || val === '') return null;
  const date =
    typeof val === 'number'
      ? new Date(val)
      : new Date(String(val));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export const valueParser = (
  val: unknown,
  type: FieldType,
  locale: ERPTableLocale = 'fa',
): ReactNode => {
  if (val == null) {
    return type === 'selectOption' ? 'انتخاب کنید' : '';
  }

  switch (type) {
    case 'text':
    case 'textArea':
    case 'description':
    case 'number':
    case 'select':
    case 'selectOption':
    case 'static':
      return formatDisplayNumber(val, locale);

    case 'checkbox':
      return val ? '✔' : '✘';

    case 'price':
      return formatGroupedNumber(val, locale);

    case 'date':
      return formatJalaliDate(val);

    default:
      return '—';
  }
};
