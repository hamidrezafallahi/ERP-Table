import type { FieldType } from '../../domain/types/ColumnSchema';
import { normalizeDigits } from './sortModel';

/** Strip grouping separators and normalize Persian decimal (٫) to `.`. */
export function normalizePersianNumberText(text: string): string {
  let s = normalizeDigits(text.trim());
  s = s.replace(/[,٬\s]/g, '');
  s = s.replace(/\u066B/g, '.');
  return s;
}

export function parseClipboardNumber(text: string): number | null {
  const normalized = normalizePersianNumberText(text);
  if (normalized === '') return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function parseClipboardDate(text: string): string {
  return normalizeDigits(text.trim());
}

export type CoercePastedCellResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: string };

export function coercePastedCellValue(
  fieldType: FieldType | undefined,
  rawText: string,
): CoercePastedCellResult {
  const trimmed = rawText.trim();
  if (trimmed === '') {
    return { ok: true, value: '' };
  }

  switch (fieldType) {
    case 'number':
    case 'price':
    case 'select':
    case 'selectOption': {
      const n = parseClipboardNumber(trimmed);
      if (n == null) {
        return { ok: false, reason: 'Expected number' };
      }
      return { ok: true, value: n };
    }
    case 'date':
      return { ok: true, value: parseClipboardDate(trimmed) };
    case 'checkbox': {
      const lower = normalizeDigits(trimmed).toLowerCase();
      if (['true', '1', 'yes', '✔'].includes(lower)) {
        return { ok: true, value: true };
      }
      if (['false', '0', 'no', '✘'].includes(lower)) {
        return { ok: true, value: false };
      }
      return { ok: false, reason: 'Expected boolean' };
    }
    default:
      return { ok: true, value: rawText };
  }
}
