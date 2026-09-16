import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatMessage, EN_MESSAGES, FA_MESSAGES } from '../../host/messages';
import {
  announceFilterChange,
  announceSelectionChange,
  announceSortChange,
  announceValidationError,
  countActiveFilters,
  countSelectedRows,
  filterFingerprint,
  sortFingerprint,
} from '../liveAnnouncements';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

const tEn = (key: string, vars?: Record<string, string | number>) => {
  const raw = EN_MESSAGES[key] ?? key;
  return vars ? formatMessage(raw, vars) : raw;
};

describe('PR-125 live announcements', () => {
  it('formats sort ascending/descending and clear', () => {
    const cols = [{ fieldName: 'amount', fieldCaption: 'Amount' }];
    expect(
      announceSortChange([{ colId: 'amount', sort: 'asc' }], cols, tEn),
    ).toBe('Sorted by Amount ascending');
    expect(
      announceSortChange([{ colId: 'amount', sort: 'desc' }], cols, tEn),
    ).toBe('Sorted by Amount descending');
    expect(announceSortChange([], cols, tEn)).toBe('Sort cleared');
  });

  it('formats filter and selection announcements', () => {
    expect(
      announceFilterChange(12, 500, 1, false, tEn),
    ).toBe('12 of 500 rows after filter');
    expect(announceFilterChange(500, 500, 0, false, tEn)).toBe(
      'Filter cleared',
    );
    expect(announceSelectionChange(3, tEn)).toBe('3 rows selected');
    expect(announceSelectionChange(0, tEn)).toBe('Selection cleared');
    expect(announceValidationError('required', tEn)).toBe(
      'Validation error: required',
    );
  });

  it('fa pack carries the same a11y keys', () => {
    expect(FA_MESSAGES['a11y.sortedAsc']).toContain('{column}');
    expect(FA_MESSAGES['a11y.filterResult']).toContain('{visible}');
    expect(FA_MESSAGES['a11y.rowsSelected']).toContain('{count}');
  });

  it('fingerprints change when sort or filter changes', () => {
    expect(sortFingerprint([{ colId: 'a', sort: 'asc' }])).not.toBe(
      sortFingerprint([{ colId: 'a', sort: 'desc' }]),
    );
    expect(filterFingerprint({ a: { filterType: 'text', type: 'contains', filter: 'x' } }, '')).not.toBe(
      filterFingerprint({}, ''),
    );
    expect(
      countActiveFilters({
        a: { filterType: 'text', type: 'contains', filter: 'x' },
      }),
    ).toBe(1);
    expect(countSelectedRows({ 1: true, 2: true })).toBe(2);
  });

  it('wires GridLiveRegion into desktop/mobile and CSS', () => {
    expect(load('ui/a11y/GridLiveRegion.tsx')).toContain('aria-live="polite"');
    expect(load('ui/a11y/GridLiveRegion.tsx')).toContain('announceSortChange');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('GridLiveRegion');
    expect(load('ui/mobile/MobileTable.tsx')).toContain('GridLiveRegion');
    expect(load('ui/styles/erp-table.css')).toContain('.pdg-live-region');
    expect(load('ui/locales/fa.ts')).toContain('a11y.sortedAsc');
    expect(load('ui/host/ERPTableHost.tsx')).toContain('formatMessage');
  });
});
