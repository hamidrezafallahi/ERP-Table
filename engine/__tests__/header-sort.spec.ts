import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ariaSortForColumn,
  cycleSortModel,
  HEADER_SORT_CLICK_MAX_MOVE_PX,
  isHeaderColumnSortable,
  shouldCommitHeaderSortClick,
  sortPriorityForColumn,
} from '../dataOps/sortModel';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-91 cycleSortModel', () => {
  it('cycles single-column: none → asc → desc → none', () => {
    expect(cycleSortModel([], 'name')).toEqual([{ colId: 'name', sort: 'asc' }]);
    expect(cycleSortModel([{ colId: 'name', sort: 'asc' }], 'name')).toEqual([
      { colId: 'name', sort: 'desc' },
    ]);
    expect(cycleSortModel([{ colId: 'name', sort: 'desc' }], 'name')).toEqual([]);
  });

  it('replaces multi-sort with a single column on plain click', () => {
    expect(
      cycleSortModel(
        [
          { colId: 'name', sort: 'asc' },
          { colId: 'amount', sort: 'desc' },
        ],
        'amount',
      ),
    ).toEqual([{ colId: 'amount', sort: 'asc' }]);
  });

  it('Shift+Click appends, flips, then removes', () => {
    const one = cycleSortModel([], 'name', { multi: true });
    expect(one).toEqual([{ colId: 'name', sort: 'asc' }]);
    const two = cycleSortModel(one, 'amount', { multi: true });
    expect(two).toEqual([
      { colId: 'name', sort: 'asc' },
      { colId: 'amount', sort: 'asc' },
    ]);
    const flipped = cycleSortModel(two, 'name', { multi: true });
    expect(flipped).toEqual([
      { colId: 'name', sort: 'desc' },
      { colId: 'amount', sort: 'asc' },
    ]);
    expect(cycleSortModel(flipped, 'name', { multi: true })).toEqual([
      { colId: 'amount', sort: 'asc' },
    ]);
  });

  it('never sorts the index column', () => {
    expect(cycleSortModel([], 'index')).toEqual([]);
    expect(
      cycleSortModel([{ colId: 'name', sort: 'asc' }], 'index', { multi: true }),
    ).toEqual([{ colId: 'name', sort: 'asc' }]);
  });
});

describe('PR-91 aria-sort + priority helpers', () => {
  it('maps sort model to aria-sort="ascending"', () => {
    expect(ariaSortForColumn([{ colId: 'name', sort: 'asc' }], 'name')).toBe(
      'ascending',
    );
    expect(ariaSortForColumn([{ colId: 'name', sort: 'desc' }], 'name')).toBe(
      'descending',
    );
    expect(ariaSortForColumn([], 'name')).toBe('none');
  });

  it('reports 1-based multi-sort priority', () => {
    const model = [
      { colId: 'name', sort: 'asc' as const },
      { colId: 'amount', sort: 'desc' as const },
    ];
    expect(sortPriorityForColumn(model, 'name')).toBe(1);
    expect(sortPriorityForColumn(model, 'amount')).toBe(2);
    expect(sortPriorityForColumn(model, 'other')).toBeUndefined();
  });
});

describe('PR-91 click vs drag threshold', () => {
  it('treats movement under 5px as a sort click; 5px+ is drag', () => {
    expect(HEADER_SORT_CLICK_MAX_MOVE_PX).toBe(5);
    expect(shouldCommitHeaderSortClick(0)).toBe(true);
    expect(shouldCommitHeaderSortClick(4.9)).toBe(true);
    expect(shouldCommitHeaderSortClick(5)).toBe(false);
    expect(shouldCommitHeaderSortClick(12)).toBe(false);
  });
});

describe('PR-91 sortable:false and index', () => {
  it('blocks index and sortable:false', () => {
    expect(isHeaderColumnSortable({ fieldName: 'index', fieldType: 'index' })).toBe(
      false,
    );
    expect(
      isHeaderColumnSortable({
        fieldName: 'locked',
        columnDef: { sortable: false },
      }),
    ).toBe(false);
    expect(isHeaderColumnSortable({ fieldName: 'name' })).toBe(true);
  });
});

describe('PR-91 header DOM wiring', () => {
  it('sets aria-sort on th and cycles via setSortModel', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    expect(header).toContain('aria-sort={ariaSort}');
    expect(header).toContain("ariaSortForColumn(sortModel, col.fieldName)");
    expect(header).toContain('controller.setSortModel(next)');
    expect(header).toContain('cycleSortModel(sortModel, fieldName, { multi: e.shiftKey })');
    expect(header).toContain('HEADER_SORT_CLICK_MAX_MOVE_PX');
    expect(header).toContain('shouldCommitHeaderSortClick');
    expect(header).toContain('onDragStart');
    expect(header).toContain('COLUMN_REORDERED');
  });

  it('does not make the index header sortable', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    const indexBlock = header.match(
      /if \(isIndexColumn\(col\)\) \{[\s\S]*?return \([\s\S]*?<\/th>/,
    )?.[0];
    expect(indexBlock).toBeTruthy();
    expect(indexBlock).not.toContain('aria-sort');
    expect(indexBlock).not.toContain('commitHeaderSort');
    expect(indexBlock).not.toContain('data-pdg-sortable');
  });

  it('demo documents two-column header sort', () => {
    const demo = load('demo/src/LiveGridPreview.tsx');
    const fixtures = load('demo/src/fixtures.ts');
    expect(demo).toContain('data-demo-sort-hint');
    expect(demo).toMatch(/Shift\+?کلیک|multi-sort|مرتب‌سازی/);
    expect(fixtures).toContain("fieldName: 'DetailDesc'");
    expect(fixtures).toContain("fieldName: 'Bed'");
  });
});
