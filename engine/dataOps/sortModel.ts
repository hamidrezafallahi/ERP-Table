import type { FieldType } from '../../domain/types/ColumnSchema';

/** Document-order column used as the final tie-breaker (PR-89). */
export const INDEX_COL_ID = 'index';

export type SortDirection = 'asc' | 'desc';

export type SortModelItem = {
  colId: string;
  sort: SortDirection;
};

export type SortModel = readonly SortModelItem[];

export type SortValueComparator = (a: unknown, b: unknown) => number;

export type SortAccessor = {
  getValue: (rowId: number, colId: string) => unknown;
  getFieldType?: (colId: string) => FieldType | undefined;
  getComparator?: (colId: string) => SortValueComparator | undefined;
};

const FA_COLLATOR = new Intl.Collator('fa', {
  numeric: true,
  sensitivity: 'base',
});

const EASTERN_DIGITS = /[۰-۹٠-٩]/g;
const EASTERN_DIGIT_MAP: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

export function normalizeDigits(value: string): string {
  return value.replace(EASTERN_DIGITS, (ch) => EASTERN_DIGIT_MAP[ch] ?? ch);
}

export function isBlankSortValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'number' && Number.isNaN(value)) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const n = Number(normalizeDigits(value).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toDateKey(value: unknown): number | null {
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const text = normalizeDigits(value).trim();
    if (!text) return null;
    const parsed = Date.parse(text);
    if (!Number.isNaN(parsed)) return parsed;
    const digits = text.replace(/\D/g, '');
    if (digits.length >= 8) return Number(digits.slice(0, 8));
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return null;
}

function compareText(a: unknown, b: unknown): number {
  return FA_COLLATOR.compare(String(a), String(b));
}

function compareFinite(a: number, b: number): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Ascending compare for a FieldType. Blank handling is done by `compareSortValues`.
 */
export function compareTypedValues(
  a: unknown,
  b: unknown,
  fieldType: FieldType | undefined,
): number {
  switch (fieldType) {
    case 'number':
    case 'price':
    case 'index': {
      const na = toNumber(a);
      const nb = toNumber(b);
      if (na == null && nb == null) return compareText(a, b);
      if (na == null) return 1;
      if (nb == null) return -1;
      return compareFinite(na, nb);
    }
    case 'date': {
      const da = toDateKey(a);
      const db = toDateKey(b);
      if (da == null && db == null) return compareText(a, b);
      if (da == null) return 1;
      if (db == null) return -1;
      return compareFinite(da, db);
    }
    case 'checkbox': {
      const ba = toBoolean(a);
      const bb = toBoolean(b);
      if (ba == null && bb == null) return compareText(a, b);
      if (ba == null) return 1;
      if (bb == null) return -1;
      return Number(ba) - Number(bb);
    }
    default:
      return compareText(a, b);
  }
}

export function compareSortValues(
  a: unknown,
  b: unknown,
  fieldType: FieldType | undefined,
  comparator: SortValueComparator | undefined,
): number {
  if (comparator) return comparator(a, b);
  return compareTypedValues(a, b, fieldType);
}

function isSortDirection(value: string): value is SortDirection {
  return value === 'asc' || value === 'desc';
}

function resolveKeys(sortModel: SortModel): SortModelItem[] {
  const keys: SortModelItem[] = [];
  const seen = new Set<string>();
  for (const item of sortModel) {
    if (!item || typeof item.colId !== 'string' || item.colId.length === 0) {
      continue;
    }
    if (!isSortDirection(item.sort) || seen.has(item.colId)) continue;
    seen.add(item.colId);
    keys.push({ colId: item.colId, sort: item.sort });
  }
  if (!seen.has(INDEX_COL_ID)) {
    keys.push({ colId: INDEX_COL_ID, sort: 'asc' });
  }
  return keys;
}

/**
 * Pure multi-sort (PR-89). Does not mutate `rowIds`.
 * Null/blank values sort last in both directions. `index` is the last
 * tie-breaker so document order is preserved when sort keys match.
 */
export function applySort(
  rowIds: readonly number[],
  sortModel: SortModel,
  accessor: SortAccessor,
): number[] {
  const keys = resolveKeys(sortModel);
  const decorated = rowIds.map((rowId, originalIndex) => ({
    rowId,
    originalIndex,
  }));

  decorated.sort((left, right) => {
    for (const key of keys) {
      const a = accessor.getValue(left.rowId, key.colId);
      const b = accessor.getValue(right.rowId, key.colId);
      const aBlank = isBlankSortValue(a);
      const bBlank = isBlankSortValue(b);
      if (aBlank || bBlank) {
        if (aBlank && bBlank) continue;
        return aBlank ? 1 : -1;
      }
      const fieldType =
        accessor.getFieldType?.(key.colId) ??
        (key.colId === INDEX_COL_ID ? 'index' : undefined);
      const cmp = compareSortValues(
        a,
        b,
        fieldType,
        accessor.getComparator?.(key.colId),
      );
      if (cmp !== 0) return key.sort === 'desc' ? -cmp : cmp;
    }
    return left.originalIndex - right.originalIndex;
  });

  return decorated.map((row) => row.rowId);
}

/**
 * Compare two row ids under the same rules as {@link applySort}
 * (without original-index stability — uses id as final tie-break).
 * Used for O(log n) binary insert into an already-sorted UI index (PR-99).
 */
export function compareRowIdsForSort(
  leftId: number,
  rightId: number,
  sortModel: SortModel,
  accessor: SortAccessor,
): number {
  const keys = resolveKeys(sortModel);
  for (const key of keys) {
    const a = accessor.getValue(leftId, key.colId);
    const b = accessor.getValue(rightId, key.colId);
    const aBlank = isBlankSortValue(a);
    const bBlank = isBlankSortValue(b);
    if (aBlank || bBlank) {
      if (aBlank && bBlank) continue;
      return aBlank ? 1 : -1;
    }
    const fieldType =
      accessor.getFieldType?.(key.colId) ??
      (key.colId === INDEX_COL_ID ? 'index' : undefined);
    const cmp = compareSortValues(
      a,
      b,
      fieldType,
      accessor.getComparator?.(key.colId),
    );
    if (cmp !== 0) return key.sort === 'desc' ? -cmp : cmp;
  }
  return leftId - rightId;
}

/** Binary-search insert position for `rowId` into an already-sorted id list. */
export function findSortedInsertIndex(
  orderedIds: readonly number[],
  rowId: number,
  sortModel: SortModel,
  accessor: SortAccessor,
): number {
  let lo = 0;
  let hi = orderedIds.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const midId = orderedIds[mid]!;
    if (compareRowIdsForSort(midId, rowId, sortModel, accessor) <= 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/** Max pointer movement (px) that still counts as a header sort click (PR-91). */
export const HEADER_SORT_CLICK_MAX_MOVE_PX = 5;

/**
 * True when pointer travel is below the drag threshold so a header click
 * should change sort (not a column reorder gesture).
 */
export function shouldCommitHeaderSortClick(movedPx: number): boolean {
  return Number.isFinite(movedPx) && movedPx < HEADER_SORT_CLICK_MAX_MOVE_PX;
}

export type CycleSortModelOptions = {
  /** Shift+Click: keep other columns; otherwise replace with this column. */
  multi?: boolean;
};

/**
 * Header click cycle (PR-91): none → asc → desc → none.
 * Without `multi`, the model becomes a single column (or empty).
 * With `multi`, the column is appended / toggled / removed in place.
 */
export function cycleSortModel(
  current: SortModel,
  colId: string,
  options: CycleSortModelOptions = {},
): SortModel {
  if (typeof colId !== 'string' || colId.length === 0) {
    return current.slice();
  }
  if (colId === INDEX_COL_ID) return current.slice();

  const multi = Boolean(options.multi);
  const existing = current.findIndex((item) => item.colId === colId);

  if (!multi) {
    const only =
      current.length === 1 && current[0]?.colId === colId ? current[0] : null;
    if (!only) return [{ colId, sort: 'asc' }];
    if (only.sort === 'asc') return [{ colId, sort: 'desc' }];
    return [];
  }

  if (existing === -1) {
    return [...current, { colId, sort: 'asc' }];
  }
  const item = current[existing];
  if (item?.sort === 'asc') {
    return current.map((entry, index) =>
      index === existing ? { colId, sort: 'desc' } : entry,
    );
  }
  return current.filter((_, index) => index !== existing);
}

export type AriaSortValue = 'ascending' | 'descending' | 'none';

export function ariaSortForColumn(
  sortModel: SortModel,
  colId: string,
): AriaSortValue {
  const item = sortModel.find((entry) => entry.colId === colId);
  if (!item) return 'none';
  return item.sort === 'asc' ? 'ascending' : 'descending';
}

/** 1-based priority for multi-sort badge; undefined when column is unsorted. */
export function sortPriorityForColumn(
  sortModel: SortModel,
  colId: string,
): number | undefined {
  const index = sortModel.findIndex((entry) => entry.colId === colId);
  return index >= 0 ? index + 1 : undefined;
}

/** Index column and `sortable: false` are never header-sortable. */
export function isHeaderColumnSortable(col: {
  fieldName: string;
  fieldType?: string;
  columnDef?: { sortable?: boolean } | null;
}): boolean {
  if (col.fieldName === INDEX_COL_ID || col.fieldType === 'index') return false;
  if (col.columnDef?.sortable === false) return false;
  return true;
}
