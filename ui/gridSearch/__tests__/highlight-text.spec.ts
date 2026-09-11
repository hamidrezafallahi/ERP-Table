import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { highlightIfCurrentSearch, highlightSearchText } from '../highlightText';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function collectMarks(
  node: React.ReactNode,
): { className: string; text: string }[] {
  if (node == null || typeof node === 'boolean') return [];
  if (typeof node === 'string' || typeof node === 'number') return [];
  if (Array.isArray(node)) return node.flatMap(collectMarks);
  if (!React.isValidElement(node)) return [];
  const props = node.props as { className?: string; children?: React.ReactNode };
  if (node.type === 'mark') {
    return [{ className: props.className ?? '', text: String(props.children ?? '') }];
  }
  return collectMarks(props.children);
}

describe('PR-69 search highlight tokens', () => {
  it('marks current vs other hits with semantic classes', () => {
    const src = load('ui/gridSearch/highlightText.tsx');
    expect(src).toContain('erp-search-hit is-current');
    expect(src).toContain('erp-search-hit');
    expect(src).not.toContain('bg-yellow-400');
    expect(src).not.toContain('bg-yellow-200');
  });

  it('wraps an ASCII query inside a Persian-digit display', () => {
    const node = highlightSearchText('۱۲۳۱۲۴', '123', true);
    expect(collectMarks(node)).toEqual([
      { className: 'erp-search-hit is-current', text: '۱۲۳' },
    ]);
  });

  it('keeps other matches on the non-current class', () => {
    const node = highlightSearchText('abc-xyz', 'xyz', false);
    expect(collectMarks(node)).toEqual([
      { className: 'erp-search-hit', text: 'xyz' },
    ]);
  });

  it('highlightIfCurrentSearch is a no-op without a current hit', () => {
    expect(highlightIfCurrentSearch('123', '123', false)).toBe('123');
    expect(highlightIfCurrentSearch('123', undefined, true)).toBe('123');
  });
});
