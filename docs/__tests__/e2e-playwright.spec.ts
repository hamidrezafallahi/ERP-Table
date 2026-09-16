import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-133 Playwright e2e', () => {
  const pkg = JSON.parse(load('package.json')) as {
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it('ships Playwright scripts and CI job', () => {
    expect(pkg.devDependencies?.['@playwright/test']).toBeTruthy();
    expect(pkg.scripts?.e2e).toContain('playwright test');
    expect(pkg.scripts?.['e2e:flake']).toContain('e2e-flake-check');
    expect(load('.github/workflows/ci.yml')).toContain('yarn e2e');
    expect(load('.github/workflows/ci.yml')).toContain('playwright install');
  });

  it('covers required scenarios', () => {
    for (const name of [
      'edit-undo.spec.ts',
      'clipboard.spec.ts',
      'scroll-100k.spec.ts',
      'sort-filter.spec.ts',
      'export-excel.spec.ts',
      'visual.spec.ts',
    ]) {
      expect(existsSync(join(root, 'e2e/tests', name)), name).toBe(true);
    }
    expect(existsSync(join(root, 'e2e/harness/main.tsx'))).toBe(true);
  });
});
