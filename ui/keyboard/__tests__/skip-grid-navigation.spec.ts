import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { shouldSkipGridNavigation } from '../skipGridNavigation';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function fakeClosest(match: string | null) {
  return {
    closest: (selector: string) =>
      match && selector.includes(match) ? {} : null,
  };
}

describe('PR-56 skip grid navigation inside textarea', () => {
  it('does not steal Enter or arrows from data-erp-cell-textarea', () => {
    const target = fakeClosest('data-erp-cell-textarea');
    expect(shouldSkipGridNavigation(target, 'Enter')).toBe(true);
    expect(shouldSkipGridNavigation(target, 'NumpadEnter')).toBe(true);
    expect(shouldSkipGridNavigation(target, 'ArrowLeft')).toBe(true);
    expect(shouldSkipGridNavigation(target, 'Tab')).toBe(false);
  });

  it('keeps the select skip for Enter / vertical arrows', () => {
    const target = fakeClosest('erp-table-select');
    expect(shouldSkipGridNavigation(target, 'Enter')).toBe(true);
    expect(shouldSkipGridNavigation(target, 'ArrowUp')).toBe(true);
    expect(shouldSkipGridNavigation(target, 'Tab')).toBe(false);
  });

  it('does not skip a normal input', () => {
    const target = fakeClosest(null);
    expect(shouldSkipGridNavigation(target, 'Enter')).toBe(false);
  });

  it('ERPTable capture handler uses the helper', () => {
    expect(load('ui/index.tsx')).toContain('shouldSkipGridNavigation');
    expect(load('demo/src/DemoComponent.tsx')).toContain(
      'shouldSkipGridNavigation',
    );
  });
});
