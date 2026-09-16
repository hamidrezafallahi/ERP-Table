import { isBlankSortValue, normalizeDigits } from './sortModel';

/**
 * Column filter model (PR-92). Wired to the row index in PR-94.
 * Keys are `colId` / field names. Empty model ⇒ all rows pass.
 */
export type FilterModel = Readonly<Record<string, ColumnFilter>>;

export type FilterJoin = 'AND' | 'OR';

export type TextFilterOp =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'blank'
  | 'notBlank';

/** Number ops: = ≠ < ≤ > ≥ inRange blank */
export type NumberFilterOp =
  | 'equals'
  | 'notEqual'
  | '='
  | '≠'
  | '!='
  | 'lessThan'
  | '<'
  | 'lessThanOrEqual'
  | '≤'
  | '<='
  | 'greaterThan'
  | '>'
  | 'greaterThanOrEqual'
  | '≥'
  | '>='
  | 'inRange'
  | 'blank';

export type DateFilterOp =
  | 'equals'
  | 'before'
  | 'after'
  | 'inRange'
  | 'blank';

export type SetFilterOp = 'in' | 'notIn';

export type BooleanFilterOp = 'true' | 'false' | 'any';

export type TextColumnFilter = {
  filterType: 'text';
  type: TextFilterOp;
  filter?: string | number | null;
};

export type NumberColumnFilter = {
  filterType: 'number';
  type: NumberFilterOp;
  filter?: number | string | null;
  filterTo?: number | string | null;
};

export type DateColumnFilter = {
  filterType: 'date';
  type: DateFilterOp;
  /** Inclusive lower / equals bound (Date, epoch ms, or date string). */
  dateFrom?: unknown;
  dateTo?: unknown;
  filter?: unknown;
  filterTo?: unknown;
};

export type SetColumnFilter = {
  filterType: 'set';
  type?: SetFilterOp;
  values: readonly unknown[];
};

export type BooleanColumnFilter = {
  filterType: 'boolean';
  type: BooleanFilterOp;
};

/**
 * Host / ColumnDef custom predicate. `rowId` is the engine row id;
 * hosts that need the row object look it up themselves.
 */
export type CustomFilterFn = (value: unknown, rowId: number) => boolean;

export type CustomColumnFilter = {
  filterType: 'custom';
  /** Registry key when applied from a FilterComponent (PR-95). */
  type?: string;
  params?: Record<string, unknown>;
  customFilter: CustomFilterFn;
};

export type SimpleColumnFilter =
  | TextColumnFilter
  | NumberColumnFilter
  | DateColumnFilter
  | SetColumnFilter
  | BooleanColumnFilter
  | CustomColumnFilter;

/** AND / OR of simple conditions on one column (PR-92). */
export type CombinedColumnFilter = {
  operator: FilterJoin;
  conditions: readonly SimpleColumnFilter[];
};

export type ColumnFilter = SimpleColumnFilter | CombinedColumnFilter;

export type FilterAccessor = {
  getValue: (rowId: number, colId: string) => unknown;
  /**
   * Optional per-column custom filter when the model uses
   * `{ filterType: 'custom' }` without an inline `customFilter`.
   */
  getCustomFilter?: (colId: string) => CustomFilterFn | undefined;
};

const ARABIC_YEH = /\u064A/g; // ي
const ARABIC_KAF = /\u0643/g; // ك
const PERSIAN_YEH = '\u06CC'; // ی
const PERSIAN_KAF = '\u06A9'; // ک

/** Digits + Arabic ي/ك → Latin digits + Persian ی/ک for text compare. */
export function normalizeFilterText(value: string): string {
  return normalizeDigits(value)
    .replace(ARABIC_YEH, PERSIAN_YEH)
    .replace(ARABIC_KAF, PERSIAN_KAF);
}

function isCombined(filter: ColumnFilter): filter is CombinedColumnFilter {
  return (
    typeof filter === 'object' &&
    filter !== null &&
    'operator' in filter &&
    'conditions' in filter &&
    !('filterType' in filter)
  );
}

function isBlank(value: unknown): boolean {
  return isBlankSortValue(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const trimmed = normalizeDigits(value).replace(/,/g, '').trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
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
  if (value === 1 || value === '1' || value === 'true' || value === 'TRUE') {
    return true;
  }
  if (value === 0 || value === '0' || value === 'false' || value === 'FALSE') {
    return false;
  }
  return null;
}

function textNeedle(filter: TextColumnFilter): string {
  if (filter.filter == null) return '';
  return normalizeFilterText(String(filter.filter)).toLocaleLowerCase('fa');
}

function textHaystack(value: unknown): string {
  if (isBlank(value)) return '';
  return normalizeFilterText(String(value)).toLocaleLowerCase('fa');
}

function matchText(value: unknown, filter: TextColumnFilter): boolean {
  const op = filter.type;
  if (op === 'blank') return isBlank(value);
  if (op === 'notBlank') return !isBlank(value);

  const hay = textHaystack(value);
  const needle = textNeedle(filter);

  switch (op) {
    case 'contains':
      return needle.length === 0 ? true : hay.includes(needle);
    case 'notContains':
      return needle.length === 0 ? true : !hay.includes(needle);
    case 'equals':
      return hay === needle;
    case 'startsWith':
      return needle.length === 0 ? true : hay.startsWith(needle);
    case 'endsWith':
      return needle.length === 0 ? true : hay.endsWith(needle);
    default:
      return true;
  }
}

function normalizeNumberOp(op: NumberFilterOp): NumberFilterOp {
  switch (op) {
    case '=':
      return 'equals';
    case '≠':
    case '!=':
      return 'notEqual';
    case '<':
      return 'lessThan';
    case '≤':
    case '<=':
      return 'lessThanOrEqual';
    case '>':
      return 'greaterThan';
    case '≥':
    case '>=':
      return 'greaterThanOrEqual';
    default:
      return op;
  }
}

function matchNumber(value: unknown, filter: NumberColumnFilter): boolean {
  const op = normalizeNumberOp(filter.type);
  if (op === 'blank') return isBlank(value);

  const n = toNumber(value);
  const bound = toNumber(filter.filter);
  const boundTo = toNumber(filter.filterTo);

  if (n == null) return false;

  switch (op) {
    case 'equals':
      return bound != null && n === bound;
    case 'notEqual':
      return bound == null ? true : n !== bound;
    case 'lessThan':
      return bound != null && n < bound;
    case 'lessThanOrEqual':
      return bound != null && n <= bound;
    case 'greaterThan':
      return bound != null && n > bound;
    case 'greaterThanOrEqual':
      return bound != null && n >= bound;
    case 'inRange':
      if (bound == null || boundTo == null) return false;
      return n >= Math.min(bound, boundTo) && n <= Math.max(bound, boundTo);
    default:
      return true;
  }
}

function dateBound(filter: DateColumnFilter, which: 'from' | 'to'): number | null {
  if (which === 'from') {
    return toDateKey(filter.dateFrom ?? filter.filter);
  }
  return toDateKey(filter.dateTo ?? filter.filterTo);
}

function matchDate(value: unknown, filter: DateColumnFilter): boolean {
  const op = filter.type;
  if (op === 'blank') return isBlank(value);

  const key = toDateKey(value);
  if (key == null) return false;

  const from = dateBound(filter, 'from');
  const to = dateBound(filter, 'to');

  switch (op) {
    case 'equals':
      return from != null && key === from;
    case 'before':
      return from != null && key < from;
    case 'after':
      return from != null && key > from;
    case 'inRange':
      if (from == null || to == null) return false;
      return key >= Math.min(from, to) && key <= Math.max(from, to);
    default:
      return true;
  }
}

function setKey(value: unknown): string {
  if (isBlank(value)) return '';
  if (typeof value === 'string') return normalizeFilterText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return normalizeFilterText(String(value));
}

function matchSet(value: unknown, filter: SetColumnFilter): boolean {
  const op: SetFilterOp = filter.type === 'notIn' ? 'notIn' : 'in';
  const allowed = new Set(filter.values.map(setKey));
  const key = setKey(value);
  const hit = allowed.has(key);
  return op === 'in' ? hit : !hit;
}

function matchBoolean(value: unknown, filter: BooleanColumnFilter): boolean {
  if (filter.type === 'any') return true;
  const b = toBoolean(value);
  if (b == null) return false;
  return filter.type === 'true' ? b === true : b === false;
}

function matchCustom(
  value: unknown,
  rowId: number,
  colId: string,
  filter: CustomColumnFilter,
  accessor: FilterAccessor,
): boolean {
  const fn = filter.customFilter ?? accessor.getCustomFilter?.(colId);
  if (!fn) return true;
  return Boolean(fn(value, rowId));
}

function matchSimple(
  value: unknown,
  rowId: number,
  colId: string,
  filter: SimpleColumnFilter,
  accessor: FilterAccessor,
): boolean {
  switch (filter.filterType) {
    case 'text':
      return matchText(value, filter);
    case 'number':
      return matchNumber(value, filter);
    case 'date':
      return matchDate(value, filter);
    case 'set':
      return matchSet(value, filter);
    case 'boolean':
      return matchBoolean(value, filter);
    case 'custom':
      return matchCustom(value, rowId, colId, filter, accessor);
    default:
      return true;
  }
}

function matchColumn(
  value: unknown,
  rowId: number,
  colId: string,
  filter: ColumnFilter,
  accessor: FilterAccessor,
): boolean {
  if (isCombined(filter)) {
    const { operator, conditions } = filter;
    if (!conditions || conditions.length === 0) return true;
    if (operator === 'OR') {
      return conditions.some((c) =>
        matchSimple(value, rowId, colId, c, accessor),
      );
    }
    return conditions.every((c) =>
      matchSimple(value, rowId, colId, c, accessor),
    );
  }
  return matchSimple(value, rowId, colId, filter, accessor);
}

/**
 * Unique display values for a set-filter menu (PR-92 helper; UI in PR-94).
 * Order is first-seen in `rowIds`.
 */
export function collectUniqueFilterValues(
  rowIds: readonly number[],
  colId: string,
  accessor: FilterAccessor,
): unknown[] {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const rowId of rowIds) {
    const value = accessor.getValue(rowId, colId);
    const key = setKey(value);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(isBlank(value) ? null : value);
  }
  return out;
}

/**
 * Pure multi-column filter (PR-92). Does not mutate `rowIds`.
 * Columns in the model are combined with AND. Per-column conditions
 * may use AND / OR. Empty / invalid model returns a shallow copy.
 */
export function applyFilter(
  rowIds: readonly number[],
  filterModel: FilterModel | null | undefined,
  accessor: FilterAccessor,
): number[] {
  if (!filterModel) return rowIds.slice();
  const entries = Object.entries(filterModel).filter(
    ([colId, filter]) =>
      typeof colId === 'string' &&
      colId.length > 0 &&
      filter != null &&
      typeof filter === 'object',
  );
  if (entries.length === 0) return rowIds.slice();

  return rowIds.filter((rowId) =>
    entries.every(([colId, filter]) =>
      matchColumn(
        accessor.getValue(rowId, colId),
        rowId,
        colId,
        filter,
        accessor,
      ),
    ),
  );
}

/** True when the column has a non-empty filter entry (PR-94 active indicator). */
export function isColumnFilterActive(
  filterModel: FilterModel | null | undefined,
  colId: string,
): boolean {
  if (!filterModel) return false;
  const entry = filterModel[colId];
  return entry != null && typeof entry === 'object';
}

export type BuiltinFilterKind = 'text' | 'number' | 'date' | 'set' | 'boolean';

const BUILTIN_FILTER_NAMES = new Set<string>([
  'text',
  'number',
  'date',
  'set',
  'boolean',
]);

export type FilterUiResolution =
  | { mode: 'builtin'; kind: BuiltinFilterKind }
  | { mode: 'custom'; name: string; params?: Record<string, unknown> };

/**
 * Resolve filter UI for a column (PR-94/95).
 * `filter: false` ⇒ not filterable. Custom string / `{ type }` ⇒ registry key.
 */
export function resolveFilterUi(col: {
  fieldName: string;
  fieldType?: string;
  columnDef?: { filter?: unknown } | null;
}): FilterUiResolution | null {
  if (col.fieldName === 'index' || col.fieldType === 'index') return null;
  const def = col.columnDef?.filter;
  if (def === false) return null;

  if (typeof def === 'string') {
    if (BUILTIN_FILTER_NAMES.has(def)) {
      return { mode: 'builtin', kind: def as BuiltinFilterKind };
    }
    return { mode: 'custom', name: def };
  }

  if (def && typeof def === 'object' && def !== null && 'type' in def) {
    const t = String((def as { type: string }).type ?? '');
    const params = (def as { params?: Record<string, unknown> }).params;
    if (!t) return null;
    if (BUILTIN_FILTER_NAMES.has(t)) {
      return { mode: 'builtin', kind: t as BuiltinFilterKind };
    }
    return { mode: 'custom', name: t, params };
  }

  switch (col.fieldType) {
    case 'number':
    case 'price':
      return { mode: 'builtin', kind: 'number' };
    case 'date':
      return { mode: 'builtin', kind: 'date' };
    case 'checkbox':
      return { mode: 'builtin', kind: 'boolean' };
    case 'text':
    case 'textArea':
    case 'description':
    case 'select':
    case 'selectOption':
    case 'static':
    default:
      return { mode: 'builtin', kind: 'text' };
  }
}

/**
 * Resolve which built-in filter UI to show for a column (PR-94).
 * Custom registry filters return `null` — use {@link resolveFilterUi}.
 */
export function resolveBuiltinFilterKind(col: {
  fieldName: string;
  fieldType?: string;
  columnDef?: { filter?: unknown } | null;
}): BuiltinFilterKind | null {
  const ui = resolveFilterUi(col);
  return ui?.mode === 'builtin' ? ui.kind : null;
}
