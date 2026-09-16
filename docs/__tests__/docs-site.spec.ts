import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-129 docs site (D23)', () => {
  const pkg = JSON.parse(load('package.json')) as {
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it('ships VitePress + TypeDoc scripts and deps', () => {
    expect(pkg.devDependencies?.vitepress).toBeTruthy();
    expect(pkg.devDependencies?.typedoc).toBeTruthy();
    expect(pkg.scripts?.['docs:api']).toContain('typedoc');
    expect(pkg.scripts?.['docs:build']).toContain('vitepress build website');
    expect(pkg.scripts?.['docs:build']).toContain('check-docs-links');
  });

  it('TypeDoc entry is publish/entry.ts (not a hand-maintained table)', () => {
    const typedoc = JSON.parse(load('typedoc.json')) as {
      entryPoints?: string[];
      out?: string;
    };
    expect(typedoc.entryPoints).toEqual(['publish/entry.ts']);
    expect(typedoc.out).toBe('website/public/api');
  });

  it('English is source locale; Persian translation pages exist', () => {
    expect(existsSync(join(root, 'website/getting-started.md'))).toBe(true);
    expect(existsSync(join(root, 'website/fa/getting-started.md'))).toBe(true);
    expect(existsSync(join(root, 'website/guide/sorting.md'))).toBe(true);
    expect(existsSync(join(root, 'website/fa/guide/sorting.md'))).toBe(true);
    const config = load('website/.vitepress/config.mts');
    expect(config).toContain("label: 'English'");
    expect(config).toContain("label: 'فارسی'");
    expect(config).toContain("lang: 'fa-IR'");
  });

  it('feature guide pages mount a live React demo', () => {
    for (const name of [
      'sorting',
      'filtering',
      'editing',
      'selection',
      'grouping',
      'virtualization',
      'keyboard',
      'theming',
      'i18n',
      'dates',
      'export',
    ]) {
      const en = load(`website/guide/${name}.md`);
      expect(en, name).toMatch(/<LiveDemo\s+name="/);
      const fa = load(`website/fa/guide/${name}.md`);
      expect(fa, `fa/${name}`).toMatch(/<LiveDemo\s+name="/);
    }
  });
});
