import {
  getLocalePack,
  type ERPTableLocale,
  type ERPTableMessages,
} from '../locales';

export type { ERPTableLocale, ERPTableMessages } from '../locales';
export {
  arMessages,
  enMessages,
  faMessages,
  formatLocaleDate,
  formatLocaleNumber,
  getLocalePack,
  LOCALE_META,
  LOCALE_PACKS,
  resolveDirection,
  resolveLocaleMeta,
} from '../locales';
export type { LocaleMeta, NumberingSystem } from '../locales';

/** @deprecated Prefer `faMessages` from `persian-data-grid/locales/fa`. */
export const FA_MESSAGES: ERPTableMessages = getLocalePack('fa');
/** @deprecated Prefer `enMessages` from `persian-data-grid/locales/en`. */
export const EN_MESSAGES: ERPTableMessages = getLocalePack('en');
/** Arabic pack alias (PR-127). */
export const AR_MESSAGES: ERPTableMessages = getLocalePack('ar');

export function translate(
  key: string,
  locale: ERPTableLocale,
  overrides?: Partial<ERPTableMessages>,
): string {
  const pack = getLocalePack(locale);
  return overrides?.[key] ?? pack[key] ?? key;
}

/** Replace `{name}` tokens in a message template (PR-125). */
export function formatMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars[name];
    return value == null ? `{${name}}` : String(value);
  });
}
