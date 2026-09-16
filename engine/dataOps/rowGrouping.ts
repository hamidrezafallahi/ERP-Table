/**
 * Single-level row grouping (PR-120 / RFC-002). Pure — no React/DOM.
 * Produces a flat presentation list: group nodes + leaf row ids.
 */

import type { AggFunc } from '../../domain/types/ColumnDef';
import { applyAgg } from './aggregation';

export type FlatGroupNode = {
  kind: 'group';
  /** Negative sentinel id (not a domain RowId). */
  id: number;
  field: string;
  key: string;
  childRowIds: readonly number[];
  aggregates: Record<string, unknown>;
};

export type FlatLeafNode = {
  kind: 'leaf';
  id: number;
};

export type FlatUiNode = FlatGroupNode | FlatLeafNode;

export type RowGroupingAggColumn = {
  colId: string;
  aggFunc: AggFunc;
};

export type BuildGroupedFlatIndexInput = {
  /** Leaf row ids already sorted/filtered. */
  orderedLeafIds: readonly number[];
  groupField: string;
  getGroupValue: (rowId: number) => unknown;
  /** When true (default), groups start expanded. */
  defaultExpanded?: boolean;
  /** Per-group override: true = expanded, false = collapsed. */
  expandedByKey?: Readonly<Record<string, boolean>>;
  aggregateColumns?: readonly RowGroupingAggColumn[];
  getCellValue?: (rowId: number, colId: string) => unknown;
};

/** Stable negative id for a group key (PR-120). */
export function groupRowId(groupField: string, groupKey: string): number {
  let h = 2166136261;
  const s = `${groupField}\0${groupKey}`;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const id = h | 0;
  if (id === 0) return -1;
  return id > 0 ? -id : id;
}

export function normalizeGroupKey(value: unknown): string {
  if (value == null || value === '') return '(blank)';
  return String(value);
}

export function isGroupRowId(id: number): boolean {
  return id < 0;
}

export function isGroupExpanded(
  groupKey: string,
  defaultExpanded: boolean,
  expandedByKey: Readonly<Record<string, boolean>> | undefined,
): boolean {
  if (expandedByKey && Object.prototype.hasOwnProperty.call(expandedByKey, groupKey)) {
    return Boolean(expandedByKey[groupKey]);
  }
  return defaultExpanded;
}

/**
 * Active group field: API accepts `string | string[]` but only the first
 * entry is used in 0.12.0 (RFC-002).
 */
export function resolveActiveGroupField(
  groupBy: string | readonly string[] | null | undefined,
): string | null {
  if (groupBy == null) return null;
  if (typeof groupBy === 'string') {
    const t = groupBy.trim();
    return t === '' ? null : t;
  }
  const first = groupBy.find((c) => typeof c === 'string' && c.trim() !== '');
  return first?.trim() ?? null;
}

export function buildGroupedFlatIndex(
  input: BuildGroupedFlatIndexInput,
): { nodes: FlatUiNode[]; orderedIds: number[] } {
  const {
    orderedLeafIds,
    groupField,
    getGroupValue,
    defaultExpanded = true,
    expandedByKey,
    aggregateColumns = [],
    getCellValue,
  } = input;

  const buckets = new Map<string, number[]>();
  const order: string[] = [];
  for (const rowId of orderedLeafIds) {
    const key = normalizeGroupKey(getGroupValue(rowId));
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
      order.push(key);
    }
    bucket.push(rowId);
  }

  const nodes: FlatUiNode[] = [];
  const orderedIds: number[] = [];

  for (const key of order) {
    const childRowIds = buckets.get(key) ?? [];
    const aggregates: Record<string, unknown> = {};
    if (getCellValue && aggregateColumns.length > 0) {
      for (const col of aggregateColumns) {
        const values = childRowIds.map((id) => getCellValue(id, col.colId));
        aggregates[col.colId] = applyAgg(col.aggFunc, values);
      }
    }
    const id = groupRowId(groupField, key);
    const groupNode: FlatGroupNode = {
      kind: 'group',
      id,
      field: groupField,
      key,
      childRowIds,
      aggregates,
    };
    nodes.push(groupNode);
    orderedIds.push(id);

    if (isGroupExpanded(key, defaultExpanded, expandedByKey)) {
      for (const childId of childRowIds) {
        nodes.push({ kind: 'leaf', id: childId });
        orderedIds.push(childId);
      }
    }
  }

  return { nodes, orderedIds };
}
