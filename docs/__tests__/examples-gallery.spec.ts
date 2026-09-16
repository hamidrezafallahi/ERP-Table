import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-130 example gallery', () => {
  const pkg = JSON.parse(load('package.json')) as {
    scripts?: Record<string, string>;
  };

  it('exposes examples:typecheck and CI runs it', () => {
    expect(pkg.scripts?.['examples:typecheck']).toContain(
      'examples/gallery/tsconfig.json',
    );
    expect(load('.github/workflows/ci.yml')).toContain('examples:typecheck');
  });

  it('ships at least 12 example modules with StackBlitz links', () => {
    const dir = join(root, 'examples/gallery/src/examples');
    const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'));
    expect(files.length).toBeGreaterThanOrEqual(12);
    const readme = load('examples/gallery/README.md');
    expect(readme).toContain('stackblitz.com/github/hamidrezafallahi/ERP-Table');
    for (const f of files) {
      expect(readme, f).toContain(f);
    }
  });

  it('gallery package.json exists for StackBlitz/CodeSandbox import', () => {
    expect(existsSync(join(root, 'examples/gallery/package.json'))).toBe(true);
    expect(existsSync(join(root, 'examples/gallery/src/main.tsx'))).toBe(true);
  });
});
