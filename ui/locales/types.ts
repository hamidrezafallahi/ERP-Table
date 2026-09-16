/** Locale pack types (PR-127). */

export type ERPTableLocale = 'fa' | 'en' | 'ar';

export type ERPTableMessages = Record<string, string>;

/** Unicode numbering systems for Intl (PR-127). */
export type NumberingSystem = 'latn' | 'arab' | 'arabext';

export type LocaleMeta = {
  locale: ERPTableLocale;
  /** Default writing direction; host may override. */
  dir: 'rtl' | 'ltr';
  /** BCP 47 tag for Intl. */
  intlLocale: string;
  /** Default digit system. */
  numberingSystem: NumberingSystem;
  /** Default calendar for date display (PR-128 may replace with DateAdapter). */
  calendar: 'persian' | 'gregory' | 'islamic';
};

export const LOCALE_META: Record<ERPTableLocale, LocaleMeta> = {
  fa: {
    locale: 'fa',
    dir: 'rtl',
    intlLocale: 'fa-IR',
    numberingSystem: 'arabext',
    calendar: 'persian',
  },
  en: {
    locale: 'en',
    dir: 'ltr',
    intlLocale: 'en-US',
    numberingSystem: 'latn',
    calendar: 'gregory',
  },
  ar: {
    locale: 'ar',
    dir: 'rtl',
    intlLocale: 'ar-SA',
    numberingSystem: 'arab',
    calendar: 'gregory',
  },
};

export function resolveLocaleMeta(
  locale: ERPTableLocale,
  overrides?: {
    numberingSystem?: NumberingSystem;
  },
): LocaleMeta {
  const base = LOCALE_META[locale] ?? LOCALE_META.fa;
  if (!overrides?.numberingSystem) return base;
  return { ...base, numberingSystem: overrides.numberingSystem };
}

export function resolveDirection(
  locale: ERPTableLocale,
  override?: 'rtl' | 'ltr',
): 'rtl' | 'ltr' {
  if (override === 'rtl' || override === 'ltr') return override;
  return (LOCALE_META[locale] ?? LOCALE_META.fa).dir;
}
