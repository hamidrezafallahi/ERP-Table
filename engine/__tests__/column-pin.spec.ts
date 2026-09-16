import { describe, expect, it } from 'vitest';

import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import {
  computeEndPinOffsets,
  computePinOffsets,
  partitionColumnsByPin,
  resolveColumnPinned,
} from '../dataOps/columnPin';
import { buildColumnWindowModel } from '../../ui/virtual/columnWindow';

function col(
  fieldName: string,
  pinned?: 'start' | 'end' | null,
): ColumnSchema {
  return {
    fieldName,
    fieldCaption: fieldName,
    fieldType: fieldName === 'index' ? 'index' : 'text',
    visibility: { kind: 'always' },
    minWidth: 100,
    columnDef: pinned != null ? { pinned } : undefined,
  };
}

describe('PR-110 column pin (pure)', () => {
  it('index is always pinned start', () => {
    expect(resolveColumnPinned(col('index'))).toBe('start');
  });

  it('partitions start, scrollable, and end columns', () => {
    const columns = [
      col('index'),
      col('name', 'start'),
      col('qty'),
      col('total', 'end'),
    ];
    const parts = partitionColumnsByPin(columns);
    expect(parts.pinnedStart.map((c) => c.fieldName)).toEqual(['index', 'name']);
    expect(parts.scrollable.map((c) => c.fieldName)).toEqual(['qty']);
    expect(parts.pinnedEnd.map((c) => c.fieldName)).toEqual(['total']);
  });

  it('computes cumulative sticky offsets', () => {
    const start = [col('index'), col('name', 'start')];
    const width = () => 80;
    expect(computePinOffsets(start, width)).toEqual({ index: 0, name: 80 });
    const end = [col('notes', 'end'), col('total', 'end')];
    expect(computeEndPinOffsets(end, width)).toEqual({ total: 0, notes: 80 });
  });

  it('window model keeps end pins mounted while virtualizing middle', () => {
    const columns: ColumnSchema[] = [col('index')];
    for (let i = 0; i < 30; i += 1) {
      columns.push(col(`c${i}`));
    }
    columns.push(col('total', 'end'));

    const model = buildColumnWindowModel(columns, undefined, 500, 600, 1);
    expect(model.pinnedStart).toHaveLength(1);
    expect(model.pinnedEnd).toHaveLength(1);
    expect(model.pinnedEnd[0]?.fieldName).toBe('total');
    expect(model.scrollable.length).toBeLessThan(20);
    expect(model.pinnedEndWidth).toBeGreaterThan(0);
  });
});
