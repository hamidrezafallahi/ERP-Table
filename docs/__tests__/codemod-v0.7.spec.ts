import { cpSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import { transformSource } from '../../packages/codemod/index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('PR-131 persian-data-grid-codemod', () => {
  it('rewrites D13 names, styles, subpaths, and createERPTable await form', () => {
    const fixture = readFileSync(
      join(root, 'scripts/codemod-fixture-0.5/src/host.tsx'),
      'utf8',
    );
    const out = transformSource(fixture, 'host.tsx');
    expect(out).toContain('DataGrid');
    expect(out).toContain('DataGridProps');
    expect(out).toContain('useGrid');
    expect(out).toContain('themeDefault');
    expect(out).toContain('themeDark');
    expect(out).toContain('injectGridStyles');
    expect(out).toContain("import 'persian-data-grid/styles.css'");
    expect(out).toContain('persian-data-grid/adapters/arian-erp');
    expect(out).toContain('persian-data-grid/plugins/excel');
    expect(out).toContain('persian-data-grid/headless');
    expect(out).toContain('createGrid(');
    expect(out).toContain('await table.ready');
    expect(out).not.toMatch(/(?<![A-Za-z])ERPTable(?![A-Za-z])/);
    expect(out).toContain('D18 clipboard');
  });

  it('rewrites CSS tokens', () => {
    const css = readFileSync(
      join(root, 'scripts/codemod-fixture-0.5/src/host.css'),
      'utf8',
    );
    const out = transformSource(css, 'host.css');
    expect(out).toContain('.pdg-grid');
    expect(out).toContain('--pdg-accent');
    expect(out).not.toContain('.erp-table');
    expect(out).not.toContain('--erp-');
  });

  it(
    'fixture 0.5 compiles after codemod (tsc)',
    () => {
      const dir = join(root, 'scripts/.tmp-codemod-out');
      rmSync(dir, { recursive: true, force: true });
      try {
        cpSync(join(root, 'scripts/codemod-fixture-0.5'), dir, { recursive: true });
        execFileSync(process.execPath, [join(root, 'packages/codemod/cli.mjs'), join(dir, 'src')], {
          stdio: 'pipe',
        });
        execFileSync(
          process.execPath,
          [
            join(root, 'node_modules/typescript/lib/tsc.js'),
            '-p',
            join(dir, 'tsconfig.json'),
            '--noEmit',
          ],
          { stdio: 'pipe', cwd: root },
        );
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
    30_000,
  );

  it('package exposes npx bin name persian-data-grid-codemod', () => {
    const pkg = JSON.parse(
      readFileSync(join(root, 'packages/codemod/package.json'), 'utf8'),
    ) as { name: string; bin?: Record<string, string> };
    expect(pkg.name).toBe('persian-data-grid-codemod');
    expect(pkg.bin?.['persian-data-grid-codemod']).toBe('./cli.mjs');
  });
});
