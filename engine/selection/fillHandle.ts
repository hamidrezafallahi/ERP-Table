/**
 * Pure fill-handle series + target builder (PR-108).
 */

import { normalizeDigits } from '../dataOps/sortModel';
import { parseClipboardNumber } from '../dataOps/cellValueCoercion';
import type { CellRange } from './cellRange';
import { colIndex } from './cellRange';

export type FillSeriesKind = 'number' | 'jalali' | 'copy';

export type FillTarget = {
  rowIndex: number;
  colId: string;
  rawText: string;
};

export type FillCorner = {
  rowIndex: number;
  colId: string;
  colIndex: number;
};

const JALALI_DATE_RE = /^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$/;

function parseJalaliParts(text: string): { y: number; m: number; d: number } | null {
  const normalized = normalizeDigits(text.trim());
  const match = JALALI_DATE_RE.exec(normalized);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

function formatJalali(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}/${mm}/${dd}`;
}

/** Jalali month lengths (non-leap Esfand = 29). */
function jalaliMonthLength(year: number, month: number): number {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

function isJalaliLeapYear(year: number): boolean {
  // 33-year cycle approximation (good enough for fill series).
  const mod = ((year + 2346) % 128) % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(mod);
}

export function addJalaliMonths(
  parts: { y: number; m: number; d: number },
  months: number,
): { y: number; m: number; d: number } {
  let y = parts.y;
  let m = parts.m + months;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  const maxDay = jalaliMonthLength(y, m);
  const d = Math.min(parts.d, maxDay);
  return { y, m, d };
}

export function detectFillSeries(
  values: readonly string[],
): { kind: FillSeriesKind; numberStep?: number } {
  if (values.length === 0) return { kind: 'copy' };

  const jalali = values.map(parseJalaliParts);
  if (jalali.every((p) => p != null) && jalali.length >= 1) {
    if (jalali.length === 1) {
      return { kind: 'jalali' };
    }
    for (let i = 1; i < jalali.length; i += 1) {
      const prev = jalali[i - 1]!;
      const cur = jalali[i]!;
      const expected = addJalaliMonths(prev, 1);
      if (
        expected.y !== cur.y ||
        expected.m !== cur.m ||
        expected.d !== cur.d
      ) {
        return { kind: 'copy' };
      }
    }
    return { kind: 'jalali' };
  }

  const nums = values.map((v) => parseClipboardNumber(v));
  if (nums.every((n) => n != null)) {
    if (nums.length === 1) {
      return { kind: 'number', numberStep: 1 };
    }
    const step = nums[1]! - nums[0]!;
    for (let i = 2; i < nums.length; i += 1) {
      if (nums[i]! - nums[i - 1]! !== step) {
        return { kind: 'copy' };
      }
    }
    return { kind: 'number', numberStep: step };
  }

  return { kind: 'copy' };
}

export function extendSeriesValue(
  kind: FillSeriesKind,
  sourceValues: readonly string[],
  offset: number,
  numberStep = 1,
): string {
  if (offset <= 0) {
    return sourceValues[sourceValues.length - 1] ?? '';
  }

  if (kind === 'copy') {
    const idx = offset % sourceValues.length;
    return sourceValues[idx] ?? '';
  }

  if (kind === 'number') {
    const nums = sourceValues.map((v) => parseClipboardNumber(v) ?? 0);
    const base = nums[nums.length - 1] ?? 0;
    const step =
      nums.length >= 2
        ? (nums[nums.length - 1] ?? 0) - (nums[nums.length - 2] ?? 0)
        : numberStep;
    return String(base + step * offset);
  }

  const last = parseJalaliParts(sourceValues[sourceValues.length - 1] ?? '');
  if (!last) return sourceValues[sourceValues.length - 1] ?? '';
  const next = addJalaliMonths(last, offset);
  return formatJalali(next.y, next.m, next.d);
}

export function resolveFillCorner(
  ranges: readonly CellRange[],
  columnOrder: readonly string[],
): FillCorner | null {
  if (ranges.length === 0 || columnOrder.length === 0) return null;
  const range = ranges[0]!;
  const endRow = Math.max(range.startRow, range.endRow);
  const lastCol = range.colIds[range.colIds.length - 1];
  if (!lastCol) return null;
  const colIdx = colIndex(lastCol, columnOrder);
  if (colIdx < 0) return null;
  return { rowIndex: endRow, colId: lastCol, colIndex: colIdx };
}

export function buildFillUpdates(input: {
  sourceRange: CellRange;
  extendToRowIndex: number;
  extendToColIndex: number;
  columnOrder: readonly string[];
  getSourceText: (rowIndex: number, colId: string) => string;
  copyOnly: boolean;
}): FillTarget[] {
  const {
    sourceRange,
    extendToRowIndex,
    extendToColIndex,
    columnOrder,
    getSourceText,
    copyOnly,
  } = input;

  const startRow = Math.min(sourceRange.startRow, sourceRange.endRow);
  const endRow = Math.max(sourceRange.startRow, sourceRange.endRow);
  const colIds = sourceRange.colIds;
  if (colIds.length === 0) return [];

  const colStart = colIndex(colIds[0]!, columnOrder);
  const colEnd = colIndex(colIds[colIds.length - 1]!, columnOrder);
  if (colStart < 0 || colEnd < 0) return [];

  const rowDelta = extendToRowIndex - endRow;
  const colDelta = extendToColIndex - colEnd;
  if (rowDelta <= 0 && colDelta <= 0) return [];

  const destEndRow = Math.max(endRow, extendToRowIndex);
  const destEndCol = Math.max(colEnd, extendToColIndex);
  const targets: FillTarget[] = [];

  for (let r = startRow; r <= destEndRow; r += 1) {
    for (let c = colStart; c <= destEndCol; c += 1) {
      if (r >= startRow && r <= endRow && c >= colStart && c <= colEnd) {
        continue;
      }
      const colId = columnOrder[c];
      if (!colId) continue;

      const colValues: string[] = [];
      for (let sr = startRow; sr <= endRow; sr += 1) {
        colValues.push(getSourceText(sr, colId));
      }

      const rowValues: string[] = [];
      for (let sc = colStart; sc <= colEnd; sc += 1) {
        const cid = columnOrder[sc];
        if (cid) rowValues.push(getSourceText(r, cid));
      }

      let rawText: string;
      if (copyOnly) {
        const srcRow = startRow + ((r - startRow) % (endRow - startRow + 1));
        const srcCol =
          colStart + ((c - colStart) % (colEnd - colStart + 1));
        const srcColId = columnOrder[srcCol] ?? colId;
        rawText = getSourceText(srcRow, srcColId);
      } else if (r > endRow && c <= colEnd) {
        const series = detectFillSeries(colValues);
        rawText = extendSeriesValue(
          series.kind,
          colValues,
          r - endRow,
          series.numberStep,
        );
      } else if (c > colEnd && r <= endRow) {
        const series = detectFillSeries(rowValues);
        rawText = extendSeriesValue(
          series.kind,
          rowValues,
          c - colEnd,
          series.numberStep,
        );
      } else {
        const series = detectFillSeries(colValues);
        rawText = extendSeriesValue(
          series.kind,
          colValues,
          r - endRow,
          series.numberStep,
        );
      }

      targets.push({ rowIndex: r, colId, rawText });
    }
  }

  return targets;
}
