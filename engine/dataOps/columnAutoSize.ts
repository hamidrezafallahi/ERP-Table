import {
  clampColumnWidth,
  type ColumnWidthHint,
} from '../columnWidth';

export type TextMeasurer = (text: string) => number;

/** Horizontal padding added around measured text (cell chrome). */
export const AUTO_SIZE_PADDING = 16;

export function measureTextsWidth(
  texts: readonly string[],
  measureText: TextMeasurer,
): number {
  let max = 0;
  for (const text of texts) {
    if (!text) continue;
    max = Math.max(max, measureText(text));
  }
  return max;
}

export function autoSizeColumnWidth(
  column: ColumnWidthHint,
  texts: readonly string[],
  measureText: TextMeasurer,
  padding = AUTO_SIZE_PADDING,
): number {
  const content = measureTextsWidth(texts, measureText);
  return clampColumnWidth(content + padding, column);
}

export type AutoSizeCell = {
  display?: unknown;
  value?: unknown;
};

export type AutoSizeRow = {
  cells: Record<string, AutoSizeCell>;
};

/** Header caption + visible cell strings for auto-size (O(window) capped). */
export function collectAutoSizeTexts(
  column: { fieldName: string; fieldCaption?: string },
  rows: readonly AutoSizeRow[],
  maxRows = 500,
): string[] {
  const texts: string[] = [column.fieldCaption ?? column.fieldName];
  const limit = Math.min(rows.length, maxRows);
  for (let i = 0; i < limit; i += 1) {
    const cell = rows[i]?.cells[column.fieldName];
    if (!cell) continue;
    const raw = cell.display ?? cell.value;
    if (raw != null && raw !== '') texts.push(String(raw));
  }
  return texts;
}

export function autoSizeColumnWidths(
  columns: readonly { fieldName: string; fieldCaption?: string }[],
  rows: readonly AutoSizeRow[],
  measureText: TextMeasurer,
  colIds?: readonly string[],
): Record<string, number> {
  const targets = colIds?.length
    ? columns.filter((c) => colIds.includes(c.fieldName))
    : columns;

  const out: Record<string, number> = {};
  for (const col of targets) {
    const texts = collectAutoSizeTexts(col, rows);
    out[col.fieldName] = autoSizeColumnWidth(col, texts, measureText);
  }
  return out;
}
