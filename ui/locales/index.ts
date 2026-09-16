import { arMessages } from './ar';
import { enMessages } from './en';
import { faMessages } from './fa';
import {
  LOCALE_META,
  resolveDirection,
  resolveLocaleMeta,
  type ERPTableLocale,
  type ERPTableMessages,
  type LocaleMeta,
  type NumberingSystem,
} from './types';

export type {
  ERPTableLocale,
  ERPTableMessages,
  LocaleMeta,
  NumberingSystem,
} from './types';
export {
  LOCALE_META,
  resolveDirection,
  resolveLocaleMeta,
} from './types';
export { faMessages } from './fa';
export { enMessages } from './en';
export { arMessages } from './ar';

export const LOCALE_PACKS: Record<ERPTableLocale, ERPTableMessages> = {
  fa: faMessages,
  en: enMessages,
  ar: arMessages,
};

export function getLocalePack(locale: ERPTableLocale): ERPTableMessages {
  return LOCALE_PACKS[locale] ?? faMessages;
}

export type FormatOptions = {
  locale?: ERPTableLocale;
  numberingSystem?: NumberingSystem;
};

function metaFor(options?: FormatOptions): LocaleMeta {
  const locale = options?.locale ?? 'fa';
  return resolveLocaleMeta(locale, {
    numberingSystem: options?.numberingSystem,
  });
}

/** Intl number formatting with configurable numberingSystem (PR-127). */
export function formatLocaleNumber(
  value: unknown,
  options?: FormatOptions & Intl.NumberFormatOptions,
): string {
  if (value == null || value === '') return '';
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  const meta = metaFor(options);
  const {
    locale: _l,
    numberingSystem: ns,
    ...intlOpts
  } = options ?? {};
  return new Intl.NumberFormat(meta.intlLocale, {
    numberingSystem: ns ?? meta.numberingSystem,
    ...intlOpts,
  }).format(n);
}

/** Intl date formatting; calendar follows locale meta until DateAdapter (PR-128). */
export function formatLocaleDate(
  value: unknown,
  options?: FormatOptions & Intl.DateTimeFormatOptions,
): string | null {
  if (value == null || value === '') return null;
  const date =
    typeof value === 'number' ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  const meta = metaFor(options);
  const {
    locale: _l,
    numberingSystem: ns,
    ...intlOpts
  } = options ?? {};
  const calendar =
    meta.calendar === 'persian'
      ? 'persian'
      : meta.calendar === 'islamic'
        ? 'islamic'
        : 'gregory';
  return new Intl.DateTimeFormat(meta.intlLocale, {
    calendar,
    numberingSystem: ns ?? meta.numberingSystem,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...intlOpts,
  }).format(date);
}
