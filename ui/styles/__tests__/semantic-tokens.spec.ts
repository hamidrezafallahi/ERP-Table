import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const SEMANTIC_ALIASES: Record<string, string> = {
  '--erp-bg': 'var(--erp-main-white)',
  '--erp-fg': 'var(--erp-black-6)',
  '--erp-accent': 'var(--erp-blue-6)',
  '--erp-header-bg': 'var(--erp-gray-3)',
  '--erp-row-stripe': 'var(--erp-blue-11)',
  '--erp-row-selected': 'var(--erp-blue-100)',
  '--erp-border': 'var(--erp-gray-5)',
  '--erp-danger': 'var(--erp-red-600)',
  '--erp-search-match': 'var(--erp-yellow-400)',
  '--erp-search-other': 'var(--erp-yellow-200)',
  '--erp-muted': 'var(--erp-neutral-500)',
  '--erp-font': 'IRANSans, Tahoma, sans-serif',
  '--erp-row-height': '40px',
  '--erp-font-size': '12px',
  '--erp-radius': '0.25rem',
};

function load(name: string): string {
  return readFileSync(join(root, name), 'utf8');
}

describe('PR-39 semantic CSS tokens', () => {
  it.each(['erp-table.css', 'injectStyles.ts'] as const)(
    '%s defines role aliases matching the ERP palette',
    (file) => {
      const css = load(file);
      for (const [token, value] of Object.entries(SEMANTIC_ALIASES)) {
        expect(css, `${file} missing ${token}`).toContain(`${token}: ${value}`);
      }
      expect(css).toContain('font-family: var(--erp-font)');
      expect(css).toContain('color: var(--erp-fg)');
    },
  );
});

describe('PR-40 hex only in palette', () => {
  it.each(['erp-table.css', 'injectStyles.ts'] as const)(
    '%s has no #hex outside the first .erp-table token block',
    (file) => {
      const css = load(file);
      const start = css.indexOf('.erp-table {');
      expect(start).toBeGreaterThanOrEqual(0);
      const afterOpen = css.indexOf('{', start);
      const end = css.indexOf('\n}', afterOpen);
      const tokenBlock = css.slice(start, end + 2);
      const rest = css.slice(end + 2);
      expect(tokenBlock).toMatch(/--erp-bg:/);
      expect(rest).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(css).toContain('background-color: var(--erp-row-stripe)');
      expect(css).toContain('background: var(--erp-bg)');
      expect(css).toContain('.h-9 { height: var(--erp-row-height); }');
      expect(css).toContain('mark.erp-search-hit');
      expect(css).toContain('tfoot.erp-table-footer');
    },
  );
});
