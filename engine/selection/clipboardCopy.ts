/**
 * Pure clipboard payload builder (PR-106).
 * No DOM — keyboard/UI wiring writes via infrastructure.
 */

import { normalizeDigits } from '../dataOps/sortModel';
import type { CellRange } from './cellRange';

export type ClipboardCellSnapshot = {
  value: unknown;
  display: string;
};

export type ClipboardRowSnapshot = {
  id: number;
  cells: Record<string, ClipboardCellSnapshot | undefined>;
  /** Infinite/server placeholder row — skipped in clipboard output. */
  loading?: boolean;
};

export type ClipboardColumnMeta = {
  id: string;
  header: string;
};

export type ProcessCellForClipboardParams = {
  value: unknown;
  display: string;
  colId: string;
  rowIndex: number;
  rowId: number;
};

export type ClipboardCopyBuildOptions = {
  /** When true, use formatted display strings (valueFormatter output). Default false. */
  copyFormattedValue?: boolean;
  /** Prepend a header row with column captions. Default false. */
  copyHeadersToClipboard?: boolean;
  /** Eastern digits → ASCII for Excel. Default true. */
  copyDigitsAsLatin?: boolean;
  processCellForClipboard?: (params: ProcessCellForClipboardParams) => string;
};

export type ClipboardPayload = {
  plainText: string;
  html: string;
  ranges: readonly CellRange[];
};

function stringifyRawValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function maybeLatinDigits(text: string, copyDigitsAsLatin: boolean): string {
  return copyDigitsAsLatin ? normalizeDigits(text) : text;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeTsvCell(text: string): string {
  if (/[\t\n\r"]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function normalizeRowSpan(range: CellRange): {
  from: number;
  to: number;
  colIds: readonly string[];
} {
  const from = Math.min(range.startRow, range.endRow);
  const to = Math.max(range.startRow, range.endRow);
  return { from, to, colIds: range.colIds };
}

export function resolveCopyRanges(
  ranges: readonly CellRange[],
  activeCell: { rowIndex: number; colId: string } | null | undefined,
): CellRange[] {
  if (ranges.length > 0) return [...ranges];
  if (activeCell?.colId) {
    return [
      {
        startRow: activeCell.rowIndex,
        endRow: activeCell.rowIndex,
        colIds: [activeCell.colId],
      },
    ];
  }
  return [];
}

function resolveCellText(
  row: ClipboardRowSnapshot,
  colId: string,
  rowIndex: number,
  options: ClipboardCopyBuildOptions & {
    copyFormattedValue: boolean;
    copyDigitsAsLatin: boolean;
  },
): string {
  if (row.loading) return '';
  const cell = row.cells[colId];
  const raw = cell?.value;
  const display = cell?.display ?? stringifyRawValue(raw);
  let text = options.copyFormattedValue
    ? display
    : stringifyRawValue(raw);
  if (options.processCellForClipboard) {
    text = options.processCellForClipboard({
      value: raw,
      display,
      colId,
      rowIndex,
      rowId: row.id,
    });
  }
  return maybeLatinDigits(text, options.copyDigitsAsLatin);
}

export function buildClipboardPayload(input: {
  ranges: readonly CellRange[];
  rows: readonly ClipboardRowSnapshot[];
  columns: readonly ClipboardColumnMeta[];
  activeCell?: { rowIndex: number; colId: string } | null;
  options?: ClipboardCopyBuildOptions;
}): ClipboardPayload | null {
  const opts = input.options ?? {};
  const copyFormattedValue = opts.copyFormattedValue ?? false;
  const copyHeadersToClipboard = opts.copyHeadersToClipboard ?? false;
  const copyDigitsAsLatin = opts.copyDigitsAsLatin !== false;

  const resolvedRanges = resolveCopyRanges(input.ranges, input.activeCell);
  if (resolvedRanges.length === 0 || input.rows.length === 0) return null;

  const headerByCol = new Map(input.columns.map((c) => [c.id, c.header]));
  const cellOpts = { ...opts, copyFormattedValue, copyDigitsAsLatin };

  const plainBlocks: string[] = [];
  const htmlTables: string[] = [];

  for (const range of resolvedRanges) {
    const { from, to, colIds } = normalizeRowSpan(range);
    if (colIds.length === 0) continue;

    const plainRows: string[] = [];
    const htmlRows: string[] = [];

    if (copyHeadersToClipboard) {
      plainRows.push(
        colIds
          .map((colId) => {
            const header = headerByCol.get(colId) ?? colId;
            return escapeTsvCell(maybeLatinDigits(header, copyDigitsAsLatin));
          })
          .join('\t'),
      );
      htmlRows.push(
        `<tr>${colIds
          .map((colId) => {
            const header = headerByCol.get(colId) ?? colId;
            return `<th>${escapeHtml(maybeLatinDigits(header, copyDigitsAsLatin))}</th>`;
          })
          .join('')}</tr>`,
      );
    }

    for (let rowIndex = from; rowIndex <= to; rowIndex += 1) {
      const row = input.rows[rowIndex];
      if (!row || row.loading) continue;
      plainRows.push(
        colIds
          .map((colId) =>
            escapeTsvCell(resolveCellText(row, colId, rowIndex, cellOpts)),
          )
          .join('\t'),
      );
      htmlRows.push(
        `<tr>${colIds
          .map((colId) => {
            const text = resolveCellText(row, colId, rowIndex, cellOpts);
            return `<td>${escapeHtml(text)}</td>`;
          })
          .join('')}</tr>`,
      );
    }

    if (plainRows.length === 0) continue;
    plainBlocks.push(plainRows.join('\n'));
    htmlTables.push(`<table><tbody>${htmlRows.join('')}</tbody></table>`);
  }

  if (plainBlocks.length === 0) return null;

  const tablesHtml = htmlTables.join('');
  return {
    plainText: plainBlocks.join('\n\n'),
    html: `<html><body><!--StartFragment-->${tablesHtml}<!--EndFragment--></body></html>`,
    ranges: resolvedRanges,
  };
}
