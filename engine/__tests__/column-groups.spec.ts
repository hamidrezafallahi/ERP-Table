import { describe, expect, it } from 'vitest';

import { resolveColumnReorder } from '../columnReorder';
import {
  applyColumnGroupCollapse,
  buildColumnGroupHeaderModel,
  maxColumnGroupDepth,
  resolveGroupBlockReorder,
} from '../dataOps/columnGroups';
import { flattenColDefOrGroup } from '../../infrastructure/columns/flattenColumnDefs';
import { mapColDefOrGroups } from '../../infrastructure/columns/mapColumnDef';

const col = (
  fieldName: string,
  path: { groupId: string; headerName: string }[] = [],
) => ({
  fieldName,
  fieldCaption: fieldName,
  fieldType: 'text' as const,
  visibility: { kind: 'always' as const },
  columnGroup:
    path.length > 0
      ? {
          groupId: path[path.length - 1]!.groupId,
          path,
        }
      : undefined,
});

describe('columnGroups (PR-113)', () => {
  it('flattenColDefOrGroup stamps two-level group paths', () => {
    const flat = flattenColDefOrGroup([
      {
        headerName: 'Sales',
        children: [
          {
            headerName: 'Q1',
            children: [
              { field: 'a', headerName: 'A' },
              { field: 'b', headerName: 'B' },
            ],
          },
        ],
      },
    ]);
    expect(flat).toHaveLength(2);
    expect(flat[0]?.columnGroup?.path).toHaveLength(2);
    expect(flat[0]?.columnGroup?.path[0]?.headerName).toBe('Sales');
    expect(flat[0]?.columnGroup?.path[1]?.headerName).toBe('Q1');
  });

  it('buildColumnGroupHeaderModel produces two group rows for nested groups', () => {
    const columns = [
      col('a', [
        { groupId: 'sales', headerName: 'Sales' },
        { groupId: 'q1', headerName: 'Q1' },
      ]),
      col('b', [
        { groupId: 'sales', headerName: 'Sales' },
        { groupId: 'q1', headerName: 'Q1' },
      ]),
      col('c', [{ groupId: 'costs', headerName: 'Costs' }]),
    ];
    expect(maxColumnGroupDepth(columns)).toBe(2);
    const model = buildColumnGroupHeaderModel(columns, {});
    expect(model.rows).toHaveLength(2);
    expect(model.rows[0]?.[0]?.colspan).toBe(2);
    expect(model.rows[0]?.[0]?.headerName).toBe('Sales');
    expect(model.rows[1]?.[0]?.headerName).toBe('Q1');
    expect(model.rows[0]?.[1]?.headerName).toBe('Costs');
  });

  it('collapsed group hides descendant columns in view', () => {
    const columns = [
      col('a', [{ groupId: 'sales', headerName: 'Sales' }]),
      col('b', [{ groupId: 'sales', headerName: 'Sales' }]),
      col('c'),
    ];
    const out = applyColumnGroupCollapse(columns, { sales: true });
    expect(out[0]?.hidden).toBe(true);
    expect(out[1]?.hidden).toBe(true);
    expect(out[2]?.hidden).toBeFalsy();
  });

  it('resolveColumnReorder works within the same parent group', () => {
    const columns = [
      col('index'),
      col('a', [{ groupId: 'g', headerName: 'G' }]),
      col('b', [{ groupId: 'g', headerName: 'G' }]),
    ];
    const move = resolveColumnReorder(columns, 'a', 'b');
    expect(move).toEqual({ sourceIndex: 1, destIndex: 2 });
  });

  it('resolveGroupBlockReorder moves a contiguous group block', () => {
    const columns = [
      col('index'),
      col('a', [{ groupId: 'sales', headerName: 'Sales' }]),
      col('b', [{ groupId: 'sales', headerName: 'Sales' }]),
      col('c'),
    ];
    const move = resolveGroupBlockReorder(columns, 'sales', 'c');
    expect(move).toEqual({ sourceIndex: 1, destIndex: 3 });
  });

  it('mapColDefOrGroups round-trips group metadata on schema', () => {
    const schemas = mapColDefOrGroups([
      {
        headerName: 'Region',
        children: [{ field: 'city', headerName: 'City' }],
      },
    ]);
    expect(schemas[0]?.columnGroup?.path[0]?.headerName).toBe('Region');
  });
});
