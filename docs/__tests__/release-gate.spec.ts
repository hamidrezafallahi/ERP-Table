import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-135 release-gate (D25)', () => {
  const pkg = JSON.parse(load('package.json')) as {
    scripts?: Record<string, string>;
  };

  it('ships release:gate script and documents 1.0.0 dependency', () => {
    expect(existsSync(join(root, 'scripts/release-gate.mjs'))).toBe(true);
    expect(pkg.scripts?.['release:gate']).toContain('release-gate.mjs');
    expect(load('CONTRIBUTING.md')).toContain('release-gate');
    expect(load('EXECUTION_PLAN.md')).toContain('release-gate.mjs');
    expect(load('.github/workflows/ci.yml')).toContain('release:gate');
  });

  it('is red on today\'s tree with precise failing reasons', () => {
    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts/release-gate.mjs')],
      { cwd: root, encoding: 'utf8' },
    );
    expect(result.status, result.stdout + result.stderr).not.toBe(0);
    const out = result.stdout + result.stderr;
    expect(out).toContain('release-gate RED');
    // Known blockers until Phase 25 / D22 / §۴ 60 KB:
    expect(out).toMatch(/FAIL\s+scorecard-diff/);
    expect(out).toMatch(/FAIL\s+bundle-60kb/);
    expect(out).toMatch(/FAIL\s+monorepo-core/);
  });
});
