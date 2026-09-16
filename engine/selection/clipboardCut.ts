/**
 * Pure cut helpers (PR-109): clear targets for selected ranges.
 */

import type { CellRange } from './cellRange';

export type CutColumnMeta = {
  id: string;
  editable?: boolean;
  fieldType?: string;
  hidden?: boolean;
};

export type CutClearTarget = {
  rowIndex: number;
  colId: string;
  rawText: '';
};

export function buildCutClearTargets(
  ranges: readonly CellRange[],
  columns: readonly CutColumnMeta[],
): CutClearTarget[] {
  const editableIds = new Set(
    columns
      .filter(
        (col) =>
          !col.hidden &&
          col.editable !== false &&
          col.fieldType !== 'index' &&
          col.fieldType !== 'static',
      )
      .map((col) => col.id),
  );

  const seen = new Set<string>();
  const targets: CutClearTarget[] = [];

  for (const range of ranges) {
    for (let rowIndex = range.startRow; rowIndex <= range.endRow; rowIndex += 1) {
      for (const colId of range.colIds) {
        if (!editableIds.has(colId)) continue;
        const key = `${rowIndex}:${colId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        targets.push({ rowIndex, colId, rawText: '' });
      }
    }
  }

  return targets;
}
