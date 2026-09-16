import { describe, expect, it } from 'vitest';

import { buildCutClearTargets } from '../selection/clipboardCut';

describe('PR-109 clipboard cut (pure)', () => {
  it('builds empty-text targets for editable cells in ranges', () => {
    const targets = buildCutClearTargets(
      [{ startRow: 0, endRow: 1, colIds: ['name', 'amount', 'index'] }],
      [
        { id: 'index', fieldType: 'index', editable: false },
        { id: 'name', fieldType: 'text', editable: true },
        { id: 'amount', fieldType: 'number', editable: true },
      ],
    );
    expect(targets).toEqual([
      { rowIndex: 0, colId: 'name', rawText: '' },
      { rowIndex: 0, colId: 'amount', rawText: '' },
      { rowIndex: 1, colId: 'name', rawText: '' },
      { rowIndex: 1, colId: 'amount', rawText: '' },
    ]);
  });
});
