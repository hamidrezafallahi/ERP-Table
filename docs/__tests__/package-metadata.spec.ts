import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-78 package metadata and license compliance', () => {
  const pkg = JSON.parse(load('package.json')) as {
    files?: string[];
    keywords?: string[];
    license?: string;
  };

  it('npm files include LICENSE and OFL.txt; docs stay out', () => {
    expect(pkg.files).toEqual(['dist', 'LICENSE', 'OFL.txt']);
    expect(existsSync(join(root, 'LICENSE'))).toBe(true);
    expect(existsSync(join(root, 'OFL.txt'))).toBe(true);
    expect(load('LICENSE')).toMatch(/MIT License/);
    expect(load('OFL.txt')).toContain('SIL OPEN FONT LICENSE');
    expect(load('OFL.txt')).toBe(load('packages/plugins/pdf/fonts/OFL.txt'));
  });

  it('keywords are market data-grid terms, not erp grid / excel-like', () => {
    const keywords = pkg.keywords ?? [];
    expect(keywords).not.toContain('erp grid');
    expect(keywords).not.toContain('erp');
    expect(keywords).not.toContain('excel-like');
    for (const term of [
      'react',
      'datagrid',
      'data-grid',
      'jalali',
      'rtl',
      'persian',
      'offline-first',
    ]) {
      expect(keywords, term).toContain(term);
    }
  });

  it('CHANGELOG, CONTRIBUTING, SECURITY, and issue templates exist', () => {
    const changelog = load('CHANGELOG.md');
    expect(changelog).toContain('Keep a Changelog');
    expect(changelog).toMatch(/\[0\.6\.0\]/);
    expect(changelog).toContain('PR-78');
    expect(load('CONTRIBUTING.md')).toContain('yarn test');
    expect(load('CONTRIBUTING.md')).toContain('domain/');
    expect(load('SECURITY.md')).toMatch(/security\/advisories/i);
    expect(existsSync(join(root, '.github/ISSUE_TEMPLATE/bug.yml'))).toBe(true);
    expect(existsSync(join(root, '.github/ISSUE_TEMPLATE/feature.yml'))).toBe(
      true,
    );
    expect(load('.github/ISSUE_TEMPLATE/config.yml')).toContain(
      'blank_issues_enabled',
    );
  });

  it('README license claims are backed by files', () => {
    const readme = load('README.md');
    expect(readme).toContain('[CHANGELOG.md](./CHANGELOG.md)');
    expect(readme).toContain('[CONTRIBUTING.md](./CONTRIBUTING.md)');
    expect(readme).toContain('[SECURITY.md](./SECURITY.md)');
    expect(readme).toMatch(/SIL Open Font License 1\.1/);
    expect(readme).toContain('OFL.txt');
    expect(pkg.license).toBe('MIT');
  });

  it('build prepends the OFL banner onto pdf dist files', () => {
    const script = load('scripts/prepend-pdf-ofl-banner.mjs');
    expect(script).toContain('prependPdfOflBanner');
    expect(script).toContain('SIL Open Font License');
    expect(script).toContain("'plugins/pdf.js'");
    expect(script).toContain("'plugins/pdf/fonts/vazirmatn.js'");
    expect(load('package.json')).toContain('prepend-pdf-ofl-banner.mjs');
    expect(load('publish/plugins/pdf.ts')).toContain('SIL Open Font License');
    expect(load('publish/plugins/pdf-fonts-vazirmatn.ts')).toContain(
      'SIL Open Font License',
    );
  });
});
