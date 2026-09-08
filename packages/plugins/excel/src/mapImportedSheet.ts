import type { ExportColumnDef } from '../../../../application/plugins/GridPlugin';
import type { ParsedXlsxSheet } from './parseXlsxBlob';

export type ImportCellKv = {
  key: string;
  value: unknown;
  display: unknown;
};

export type MappedImportRows = {
  columns: Array<{ fieldName: string; fieldType?: string }>;
  /** One KeyValue[] per data row (no index column). */
  rows: ImportCellKv[][];
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

function coerceValue(raw: string, fieldType?: string): unknown {
  const text = raw.trim();
  if (text === '') return '';

  switch (fieldType) {
    case 'number':
    case 'price': {
      const n = Number(text.replace(/,/g, ''));
      return Number.isFinite(n) ? n : text;
    }
    case 'checkbox': {
      const lower = text.toLowerCase();
      if (['1', 'true', 'yes', '✔', 'y'].includes(lower)) return true;
      if (['0', 'false', 'no', '✘', 'n'].includes(lower)) return false;
      return text;
    }
    default:
      return text;
  }
}

/**
 * Maps sheet headers to export/query columns by caption or fieldName.
 * Skips index/static columns.
 */
export function mapImportedSheet(
  sheet: ParsedXlsxSheet,
  columns: readonly ExportColumnDef[],
): MappedImportRows {
  const importable = columns.filter(
    (c) =>
      c.fieldName !== 'index' &&
      c.fieldType !== 'index' &&
      c.fieldType !== 'static',
  );

  const byCaption = new Map<string, ExportColumnDef>();
  const byField = new Map<string, ExportColumnDef>();
  for (const col of importable) {
    byField.set(normalizeHeader(col.fieldName), col);
    if (col.fieldCaption) {
      byCaption.set(normalizeHeader(col.fieldCaption), col);
    }
  }

  const mappedCols: Array<{ fieldName: string; fieldType?: string; colIndex: number }> =
    [];

  sheet.headers.forEach((header, colIndex) => {
    const key = normalizeHeader(header);
    if (!key) return;
    const col = byCaption.get(key) ?? byField.get(key);
    if (!col) return;
    if (mappedCols.some((m) => m.fieldName === col.fieldName)) return;
    mappedCols.push({
      fieldName: col.fieldName,
      fieldType: col.fieldType,
      colIndex,
    });
  });

  // If headers did not match, fall back to positional mapping of importable columns.
  if (mappedCols.length === 0 && sheet.headers.length > 0) {
    importable.forEach((col, i) => {
      if (i < sheet.headers.length) {
        mappedCols.push({
          fieldName: col.fieldName,
          fieldType: col.fieldType,
          colIndex: i,
        });
      }
    });
  }

  const rows: ImportCellKv[][] = sheet.rows.map((line) =>
    mappedCols.map((m) => {
      const raw = line[m.colIndex] ?? '';
      const value = coerceValue(raw, m.fieldType);
      return { key: m.fieldName, value, display: value };
    }),
  );

  return {
    columns: mappedCols.map(({ fieldName, fieldType }) => ({
      fieldName,
      fieldType,
    })),
    rows,
  };
}
