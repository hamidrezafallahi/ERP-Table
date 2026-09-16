import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  enMessages,
  faMessages,
  formatLocaleNumber,
  resolveDirection,
  translate,
} from '../../host/messages';
import { arMessages } from '../ar';

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

const PERSIAN = /[\u0600-\u06FF]/;

/** Allowed to keep Arabic/Persian script (locale packs + fixtures). */
function isExempt(rel: string): boolean {
  if (rel.startsWith('locales' + '/') || rel.startsWith('locales\\')) return true;
  if (rel.includes('.typecheck.')) return true;
  if (rel.includes('__tests__')) return true;
  if (rel.replace(/\\/g, '/').endsWith('styles/injectStyles.ts')) return true;
  return false;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe('PR-127 locale packs', () => {
  it('fa / en / ar packs share the same keys', () => {
    const faKeys = Object.keys(faMessages).sort();
    expect(Object.keys(enMessages).sort()).toEqual(faKeys);
    expect(Object.keys(arMessages).sort()).toEqual(faKeys);
  });

  it('locale="en" translates to English and dir is ltr', () => {
    expect(translate('general.addNewRow', 'en')).toBe('Add row');
    expect(translate('general.noData', 'en')).toBe('No data');
    expect(resolveDirection('en')).toBe('ltr');
    expect(resolveDirection('fa')).toBe('rtl');
    expect(resolveDirection('ar')).toBe('rtl');
    expect(resolveDirection('en', 'rtl')).toBe('rtl');
  });

  it('locale="ar" returns Arabic copy', () => {
    expect(translate('general.addNewRow', 'ar')).toBe('إضافة صف');
    expect(enMessages['general.search']).toBe('Search');
  });

  it('formatLocaleNumber respects numberingSystem', () => {
    const latn = formatLocaleNumber(1234, {
      locale: 'fa',
      numberingSystem: 'latn',
      useGrouping: false,
    });
    expect(latn).toMatch(/1234/);
    const arabext = formatLocaleNumber(5, {
      locale: 'fa',
      numberingSystem: 'arabext',
      useGrouping: false,
    });
    expect(arabext).toMatch(/[۰-۹]/);
  });

  it('ui/ has no hardcoded Persian/Arabic UI strings outside locales', () => {
    const offenders: string[] = [];
    for (const file of walk(uiRoot)) {
      const rel = relative(uiRoot, file);
      if (isExempt(rel)) continue;
      const text = readFileSync(file, 'utf8');
      if (PERSIAN.test(text)) {
        offenders.push(rel.replace(/\\/g, '/'));
      }
    }
    expect(offenders).toEqual([]);
  });
});
