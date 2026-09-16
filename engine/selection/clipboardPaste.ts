/**
 * Pure clipboard paste parse + target tiling (PR-107).
 * No DOM / React.
 */

import type { CellRange } from './cellRange';
import { resolveCopyRanges } from './clipboardCopy';

export type PasteTarget = {
  rowIndex: number;
  colId: string;
  rawText: string;
};

export type SkippedPasteTarget = PasteTarget & {
  reason: string;
};

export type PasteColumnMeta = {
  id: string;
  editable?: boolean;
  /** Skip paste into index chrome columns by default. */
  fieldType?: string;
};

export type BuildPastePlanInput = {
  text: string;
  ranges: readonly CellRange[];
  activeCell?: { rowIndex: number; colId: string } | null;
  columnOrder: readonly string[];
  columns: readonly PasteColumnMeta[];
  pasteAddsRows?: boolean;
  rowCount: number;
};

export type PastePlan = {
  matrix: readonly (readonly string[])[];
  targets: readonly PasteTarget[];
  skipped: readonly SkippedPasteTarget[];
  rowsToAdd: number;
};

function detectDelimiter(text: string): string {
  if (text.includes('\t')) return '\t';
  if (text.includes(',')) return ',';
  return '\t';
}

/**
 * Parse TSV/CSV including quoted fields and embedded newlines.
 */
export function parseDelimitedClipboardText(
  text: string,
  delimiter = detectDelimiter(text),
): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\r') {
      // skip
    } else if (ch === '\n') {
      row.push(field);
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.length > 1 || row[0] !== '') {
    rows.push(row);
  }

  return rows;
}

function resolvePasteOrigin(
  ranges: readonly CellRange[],
  activeCell: { rowIndex: number; colId: string } | null | undefined,
  columnOrder: readonly string[],
): { rowIndex: number; colIndex: number } | null {
  const resolved = resolveCopyRanges(ranges, activeCell);
  if (resolved.length === 0) return null;

  const range = resolved[0]!;
  const rowIndex = Math.min(range.startRow, range.endRow);
  const firstCol = range.colIds[0];
  if (!firstCol) return null;
  const colIndex = columnOrder.indexOf(firstCol);
  if (colIndex < 0) return null;
  return { rowIndex, colIndex };
}

function isPasteableColumn(col: PasteColumnMeta | undefined): boolean {
  if (!col) return false;
  if (col.editable === false) return false;
  if (col.fieldType === 'index') return false;
  return true;
}

export function buildPastePlan(input: BuildPastePlanInput): PastePlan | null {
  const trimmed = input.text.replace(/^\uFEFF/, '').trimEnd();
  if (!trimmed) return null;

  const matrix = parseDelimitedClipboardText(trimmed);
  if (matrix.length === 0) return null;

  const origin = resolvePasteOrigin(
    input.ranges,
    input.activeCell,
    input.columnOrder,
  );
  if (!origin) return null;

  const columnById = new Map(input.columns.map((c) => [c.id, c]));
  const targets: PasteTarget[] = [];
  const skipped: SkippedPasteTarget[] = [];

  let maxRowIndex = origin.rowIndex;

  for (let r = 0; r < matrix.length; r += 1) {
    const line = matrix[r] ?? [];
    for (let c = 0; c < line.length; c += 1) {
      const colIndex = origin.colIndex + c;
      if (colIndex >= input.columnOrder.length) continue;
      const colId = input.columnOrder[colIndex]!;
      const rowIndex = origin.rowIndex + r;
      maxRowIndex = Math.max(maxRowIndex, rowIndex);
      const rawText = line[c] ?? '';
      const meta = columnById.get(colId);
      const target: PasteTarget = { rowIndex, colId, rawText };
      if (!isPasteableColumn(meta)) {
        skipped.push({ ...target, reason: 'not_editable' });
        continue;
      }
      targets.push(target);
    }
  }

  const pasteAddsRows = input.pasteAddsRows !== false;
  const rowsToAdd =
    pasteAddsRows && maxRowIndex >= input.rowCount
      ? maxRowIndex - input.rowCount + 1
      : 0;

  return { matrix, targets, skipped, rowsToAdd };
}
