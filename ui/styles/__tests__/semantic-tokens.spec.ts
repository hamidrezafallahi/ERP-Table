import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Canonical tokens (PR-87 / D13). Palette values are unchanged. */
const PDG_SEMANTIC: Record<string, string> = {
  '--pdg-bg': 'var(--pdg-main-white)',
  '--pdg-fg': 'var(--pdg-black-6)',
  '--pdg-accent': 'var(--pdg-blue-6)',
  '--pdg-header-bg': 'var(--pdg-gray-3)',
  '--pdg-row-stripe': 'var(--pdg-blue-11)',
  '--pdg-row-selected': 'var(--pdg-blue-100)',
  '--pdg-border': 'var(--pdg-gray-5)',
  '--pdg-danger': 'var(--pdg-red-600)',
  '--pdg-search-match': 'var(--pdg-yellow-400)',
  '--pdg-search-other': 'var(--pdg-yellow-200)',
  '--pdg-muted': 'var(--pdg-neutral-500)',
  '--pdg-font': 'IRANSans, Tahoma, sans-serif',
  '--pdg-row-height': '40px',
  '--pdg-font-size': '12px',
  '--pdg-radius': '0.25rem',
};

/** One-version `--erp-*` aliases that point at the canonical `--pdg-*` tokens. */
const ERP_ALIASES: Record<string, string> = {
  '--erp-bg': 'var(--pdg-bg)',
  '--erp-fg': 'var(--pdg-fg)',
  '--erp-accent': 'var(--pdg-accent)',
  '--erp-header-bg': 'var(--pdg-header-bg)',
  '--erp-row-stripe': 'var(--pdg-row-stripe)',
  '--erp-row-selected': 'var(--pdg-row-selected)',
  '--erp-border': 'var(--pdg-border)',
  '--erp-danger': 'var(--pdg-danger)',
  '--erp-search-match': 'var(--pdg-search-match)',
  '--erp-search-other': 'var(--pdg-search-other)',
  '--erp-muted': 'var(--pdg-muted)',
  '--erp-font': 'var(--pdg-font)',
  '--erp-row-height': 'var(--pdg-row-height)',
  '--erp-font-size': 'var(--pdg-font-size)',
  '--erp-radius': 'var(--pdg-radius)',
};

function load(name: string): string {
  return readFileSync(join(root, name), 'utf8');
}

describe('PR-39 semantic CSS tokens', () => {
  it.each(['erp-table.css', 'injectStyles.ts'] as const)(
    '%s defines role aliases matching the ERP palette',
    (file) => {
      const css = load(file);
      for (const [token, value] of Object.entries(PDG_SEMANTIC)) {
        expect(css, `${file} missing ${token}`).toContain(`${token}: ${value}`);
      }
      for (const [token, value] of Object.entries(ERP_ALIASES)) {
        expect(css, `${file} missing alias ${token}`).toContain(`${token}: ${value}`);
      }
      expect(css).toContain('font-family: var(--pdg-font)');
      expect(css).toContain('color: var(--pdg-fg)');
    },
  );
});

describe('PR-40 hex only in palette', () => {
  it.each(['erp-table.css', 'injectStyles.ts'] as const)(
    '%s has no #hex outside the first .erp-table token block',
    (file) => {
      const css = load(file);
      const start = css.indexOf('.pdg-grid');
      expect(start).toBeGreaterThanOrEqual(0);
      expect(css).toContain('.erp-table {');
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
