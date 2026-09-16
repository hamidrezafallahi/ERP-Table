/**
 * Column aggregation model (PR-118 / RFC-002). Pure — no React/DOM.
 * Built-in aggs are incremental; money uses integer minor units (no float sum).
 */

import type { AggFunc, AggFuncName } from '../../domain/types/ColumnDef';

export type { AggFunc, AggFuncName };

export function isAggFuncName(value: unknown): value is AggFuncName {
  return (
    value === 'sum' ||
    value === 'avg' ||
    value === 'min' ||
    value === 'max' ||
    value === 'count' ||
    value === 'first' ||
    value === 'last'
  );
}

export function isCustomAggFunc(
  agg: AggFunc | undefined,
): agg is (values: readonly unknown[]) => unknown {
  return typeof agg === 'function';
}

/**
 * Coerce a cell value to integer minor units (rials).
 * Rejects non-finite numbers; truncates toward zero (no float accumulation).
 */
export function toMinorUnits(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'bigint') {
    const n = Number(value);
    return Number.isSafeInteger(n) ? n : null;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return Math.trunc(value);
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const normalized = value
      .trim()
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/,/g, '');
    if (normalized === '') return null;
    const n = Number(normalized);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
  }
  return null;
}

export type AggAccumulator =
  | { kind: 'sum'; sum: number; count: number }
  | { kind: 'avg'; sum: number; count: number }
  | { kind: 'min'; min: number | null; count: number }
  | { kind: 'max'; max: number | null; count: number }
  | { kind: 'count'; count: number }
  | { kind: 'first'; value: unknown; set: boolean }
  | { kind: 'last'; value: unknown; set: boolean };

export function createAccumulator(kind: AggFuncName): AggAccumulator {
  switch (kind) {
    case 'sum':
      return { kind: 'sum', sum: 0, count: 0 };
    case 'avg':
      return { kind: 'avg', sum: 0, count: 0 };
    case 'min':
      return { kind: 'min', min: null, count: 0 };
    case 'max':
      return { kind: 'max', max: null, count: 0 };
    case 'count':
      return { kind: 'count', count: 0 };
    case 'first':
      return { kind: 'first', value: undefined, set: false };
    case 'last':
      return { kind: 'last', value: undefined, set: false };
  }
}

function contributeNumeric(
  acc: Extract<AggAccumulator, { kind: 'sum' | 'avg' | 'min' | 'max' }>,
  value: unknown,
  sign: 1 | -1,
): 'ok' | 'rebuild' {
  const n = toMinorUnits(value);
  if (n == null) return 'ok';
  if (acc.kind === 'sum' || acc.kind === 'avg') {
    acc.sum += sign * n;
    acc.count += sign;
    return 'ok';
  }
  if (acc.kind === 'min') {
    if (sign === 1) {
      acc.min = acc.min == null ? n : Math.min(acc.min, n);
      acc.count += 1;
      return 'ok';
    }
    acc.count -= 1;
    if (acc.count <= 0) {
      acc.min = null;
      acc.count = 0;
      return 'ok';
    }
    if (acc.min === n) return 'rebuild';
    return 'ok';
  }
  // max
  if (sign === 1) {
    acc.max = acc.max == null ? n : Math.max(acc.max, n);
    acc.count += 1;
    return 'ok';
  }
  acc.count -= 1;
  if (acc.count <= 0) {
    acc.max = null;
    acc.count = 0;
    return 'ok';
  }
  if (acc.max === n) return 'rebuild';
  return 'ok';
}

/** Add one value into an accumulator. Returns 'rebuild' when min/max need a full pass. */
export function accumulateAdd(
  acc: AggAccumulator,
  value: unknown,
): 'ok' | 'rebuild' {
  switch (acc.kind) {
    case 'sum':
    case 'avg':
    case 'min':
    case 'max':
      return contributeNumeric(acc, value, 1);
    case 'count':
      if (value != null && value !== '') acc.count += 1;
      return 'ok';
    case 'first':
      if (!acc.set && value != null && value !== '') {
        acc.value = value;
        acc.set = true;
      }
      return 'ok';
    case 'last':
      if (value != null && value !== '') {
        acc.value = value;
        acc.set = true;
      }
      return 'ok';
  }
}

/** Remove one value from an accumulator (cell edit old value). */
export function accumulateRemove(
  acc: AggAccumulator,
  value: unknown,
): 'ok' | 'rebuild' {
  switch (acc.kind) {
    case 'sum':
    case 'avg':
    case 'min':
    case 'max':
      return contributeNumeric(acc, value, -1);
    case 'count':
      if (value != null && value !== '') acc.count = Math.max(0, acc.count - 1);
      return 'ok';
    case 'first':
      if (acc.set && Object.is(acc.value, value)) return 'rebuild';
      return 'ok';
    case 'last':
      if (acc.set && Object.is(acc.value, value)) return 'rebuild';
      return 'ok';
  }
}

export function readAccumulator(acc: AggAccumulator): unknown {
  switch (acc.kind) {
    case 'sum':
      return acc.count === 0 ? null : acc.sum;
    case 'avg':
      return acc.count === 0 ? null : acc.sum / acc.count;
    case 'min':
      return acc.min;
    case 'max':
      return acc.max;
    case 'count':
      return acc.count;
    case 'first':
    case 'last':
      return acc.set ? acc.value : null;
  }
}

/** Full (non-incremental) aggregate over a value list. */
export function applyAgg(
  agg: AggFunc | undefined,
  values: readonly unknown[],
): unknown {
  if (agg == null) return null;
  if (typeof agg === 'function') return agg(values);
  const acc = createAccumulator(agg);
  for (const v of values) accumulateAdd(acc, v);
  return readAccumulator(acc);
}

export type ColumnAggSpec = {
  colId: string;
  aggFunc: AggFunc;
};

/**
 * Resolve which columns participate in footer aggregates (PR-119).
 * - If any column declares `columnDef.aggFunc`, only those columns aggregate
 *   (columns without aggFunc stay empty — verify).
 * - Else legacy: `price` / `number` columns default to `sum` (0.5.x hosts).
 */
export function resolveColumnAggSpecs(
  columns: readonly {
    fieldName: string;
    fieldType?: string;
    columnDef?: { aggFunc?: AggFunc } | undefined;
  }[],
): ColumnAggSpec[] {
  const explicit: ColumnAggSpec[] = [];
  for (const col of columns) {
    const agg = col.columnDef?.aggFunc;
    if (agg != null) explicit.push({ colId: col.fieldName, aggFunc: agg });
  }
  if (explicit.length > 0) return explicit;
  return columns
    .filter((c) => c.fieldType === 'price' || c.fieldType === 'number')
    .map((c) => ({ colId: c.fieldName, aggFunc: 'sum' as const }));
}

/**
 * Incremental per-column aggregates (PR-118).
 * Custom functions always rebuild; built-ins patch in O(1) when possible.
 */
export class ColumnAggIndex {
  private readonly states = new Map<
    string,
    {
      agg: AggFunc;
      acc: AggAccumulator | null;
      customResult: unknown;
      dirty: boolean;
    }
  >();
  private dirty = true;

  invalidate(): void {
    this.dirty = true;
    for (const state of this.states.values()) state.dirty = true;
  }

  get isDirty(): boolean {
    return this.dirty;
  }

  clear(): void {
    this.states.clear();
    this.dirty = true;
  }

  /**
   * Rebuild all tracked columns. `valuesFor` supplies current values per colId.
   */
  rebuild(
    specs: readonly ColumnAggSpec[],
    valuesFor: (colId: string) => readonly unknown[],
  ): void {
    this.states.clear();
    for (const spec of specs) {
      if (isCustomAggFunc(spec.aggFunc)) {
        this.states.set(spec.colId, {
          agg: spec.aggFunc,
          acc: null,
          customResult: spec.aggFunc(valuesFor(spec.colId)),
          dirty: false,
        });
        continue;
      }
      const acc = createAccumulator(spec.aggFunc);
      for (const v of valuesFor(spec.colId)) accumulateAdd(acc, v);
      this.states.set(spec.colId, {
        agg: spec.aggFunc,
        acc,
        customResult: undefined,
        dirty: false,
      });
    }
    this.dirty = false;
  }

  /**
   * O(1) patch for a cell change. Returns false if a rebuild is required.
   */
  patch(
    colId: string,
    oldValue: unknown,
    newValue: unknown,
  ): boolean {
    const state = this.states.get(colId);
    if (!state || state.dirty || this.dirty) return false;
    if (isCustomAggFunc(state.agg) || !state.acc) return false;
    if (state.acc.kind === 'first' || state.acc.kind === 'last') {
      state.dirty = true;
      this.dirty = true;
      return false;
    }
    const rem = accumulateRemove(state.acc, oldValue);
    if (rem === 'rebuild') {
      state.dirty = true;
      this.dirty = true;
      return false;
    }
    const add = accumulateAdd(state.acc, newValue);
    if (add === 'rebuild') {
      state.dirty = true;
      this.dirty = true;
      return false;
    }
    return true;
  }

  get(colId: string): unknown {
    const state = this.states.get(colId);
    if (!state) return null;
    if (isCustomAggFunc(state.agg)) return state.customResult ?? null;
    if (!state.acc) return null;
    return readAccumulator(state.acc);
  }

  toRecord(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const colId of this.states.keys()) {
      out[colId] = this.get(colId);
    }
    return out;
  }

  /** Numeric-only view for legacy footer (`Record<string, number>`). */
  toNumberRecord(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const colId of this.states.keys()) {
      const v = this.get(colId);
      if (typeof v === 'number' && Number.isFinite(v)) out[colId] = v;
    }
    return out;
  }
}
