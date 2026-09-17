import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  gregorianAdapter,
  jalaliAdapter,
} from '../index';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('PR-128 DateAdapter', () => {
  it('jalaliAdapter round-trips a known civil date', () => {
    const parsed = jalaliAdapter.parse('1403/01/01');
    expect(parsed).toBeTruthy();
    expect(jalaliAdapter.format(parsed!)).toBe('1403/01/01');
    const next = jalaliAdapter.addDays(parsed!, 1);
    expect(jalaliAdapter.format(next)).toBe('1403/01/02');
    expect(jalaliAdapter.compare(next, parsed!)).toBeGreaterThan(0);
  });

  it('gregorianAdapter formats ISO and compares', () => {
    const parsed = gregorianAdapter.parse('2024-03-20');
    expect(parsed).toBeTruthy();
    expect(gregorianAdapter.format(parsed!)).toBe('2024-03-20');
    const start = gregorianAdapter.startOfMonth(parsed!);
    expect(gregorianAdapter.format(start)).toBe('2024-03-01');
  });

  it('default DatePicker does not statically import an external calendar peer', () => {
    const src = readFileSync(
      join(root, 'ui/primitives/DatePicker.tsx'),
      'utf8',
    );
    expect(src).not.toContain("from 'react-persian-range-picker'");
    expect(src).toContain('useDateAdapter');
  });

  it('package.json has no react-persian-range-picker dependency (PR-140)', () => {
    const pkg = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    expect(pkg.dependencies?.['react-persian-range-picker']).toBeUndefined();
    expect(pkg.peerDependencies?.['react-persian-range-picker']).toBeUndefined();
    expect(pkg.devDependencies?.['react-persian-range-picker']).toBeUndefined();
  });
});
