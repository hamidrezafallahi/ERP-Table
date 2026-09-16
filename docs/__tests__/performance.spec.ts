import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-100 performance docs', () => {
  it('docs/performance.md publishes numeric 100k results locked by harness', () => {
    const doc = load('docs/performance.md');
    expect(doc).toContain('100');
    expect(doc).toContain('1675 ms');
    expect(doc).toContain('156 ms');
    expect(doc).toContain('674 ms');
    expect(doc).toContain('2014 ms');
    expect(doc).toContain('215 MB');
    expect(doc).toContain('PR-101');
  });

  it('README Performance section links numbers to docs/performance.md', () => {
    const readme = load('README.md');
    expect(readme).toContain('## Performance');
    expect(readme).toContain('docs/performance.md');
    expect(readme).toContain('215 MB');
    expect(readme).toContain('100');
    expect(readme).not.toMatch(/tens of thousands/i);
  });

  it('budget JSON is the tunable source for CI ceilings', () => {
    const budget = JSON.parse(
      load('infrastructure/perf/grid-performance-budgets.json'),
    ) as { rowCount: number; hydrateMaxMs: number };
    expect(budget.rowCount).toBe(100_000);
    expect(budget.hydrateMaxMs).toBeGreaterThan(1675);
  });
});
