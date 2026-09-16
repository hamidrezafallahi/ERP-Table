import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildInjectStylesSource,
  CSS_SOURCE,
  INJECT_DEST,
} from '../../../scripts/generate-inject-styles.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

type FakeStyle = { id: string; textContent: string };

function installDocumentMock() {
  const styles = new Map<string, FakeStyle>();
  const appended: FakeStyle[] = [];
  const document = {
    getElementById(id: string) {
      return styles.get(id) ?? null;
    },
    createElement(_tag: string): FakeStyle {
      return { id: '', textContent: '' };
    },
    head: {
      appendChild(el: FakeStyle) {
        styles.set(el.id, el);
        appended.push(el);
        return el;
      },
    },
    appended,
  };
  vi.stubGlobal('document', document);
  return document;
}

describe('PR-77 explicit CSS / injectGridStyles (D16)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('injectStyles.ts is generated from erp-table.css (single source of truth)', () => {
    const css = readFileSync(CSS_SOURCE, 'utf8');
    const expected = buildInjectStylesSource(css);
    expect(readFileSync(INJECT_DEST, 'utf8')).toBe(expected);
    expect(expected).toContain('export function injectGridStyles');
    expect(expected).toContain('@deprecated');
    expect(expected).toContain('export function injectERPTableStyles');
    expect(expected).not.toMatch(/^injectGridStyles\(\);$/m);
    expect(expected).not.toMatch(/^injectERPTableStyles\(\);$/m);
  });

  it('does not inject CSS when the module is evaluated', async () => {
    const doc = installDocumentMock();
    await import('../injectStyles');
    expect(doc.appended).toEqual([]);
  });

  it('injectGridStyles inserts a style tag once (idempotent)', async () => {
    const doc = installDocumentMock();
    const { injectGridStyles } = await import('../injectStyles');
    injectGridStyles();
    injectGridStyles();
    expect(doc.appended).toHaveLength(1);
    expect(doc.appended[0]?.id).toBe('erp-table-injected-css');
    expect(doc.appended[0]?.textContent).toContain('.erp-table');
    expect(doc.appended[0]?.textContent).toContain('.pdg-grid');
    expect(doc.appended[0]?.textContent).toContain('--erp-accent');
    expect(doc.appended[0]?.textContent).toContain('--pdg-accent');
  });

  it('injectERPTableStyles is a deprecated alias that still injects', async () => {
    const doc = installDocumentMock();
    const { injectERPTableStyles, injectGridStyles } = await import(
      '../injectStyles'
    );
    injectERPTableStyles();
    expect(doc.appended).toHaveLength(1);
    injectGridStyles();
    expect(doc.appended).toHaveLength(1);
  });

  it('injectGridStyles is a no-op when document is undefined (SSR)', async () => {
    vi.stubGlobal('document', undefined);
    const { injectGridStyles } = await import('../injectStyles');
    expect(() => injectGridStyles()).not.toThrow();
  });

  it('ERPTable and publish entry do not auto-inject', () => {
    const ui = load('ui/index.tsx');
    expect(ui).not.toContain('injectERPTableStyles');
    expect(ui).not.toContain('injectGridStyles');

    const entry = load('publish/entry.ts');
    expect(entry).not.toMatch(/import\s+['"]\.\.\/ui\/styles\/injectStyles['"]/);
    expect(entry).toContain('injectGridStyles');
    expect(entry).toContain('injectERPTableStyles');
  });

  it('package sideEffects allow JS tree-shaking and keep CSS', () => {
    const pkg = JSON.parse(load('package.json')) as { sideEffects: unknown };
    expect(pkg.sideEffects).toEqual(['**/*.css']);
  });

  it('demo imports styles.css; hosts without that import stay unstyled', () => {
    expect(load('demo/src/main.tsx')).toContain(
      "import 'persian-data-grid/styles.css'",
    );
    expect(load('demo/vite.config.ts')).toContain('persian-data-grid/styles.css');
    expect(load('README.md')).toContain("import 'persian-data-grid/styles.css'");
    expect(load('docs/public-api.md')).toMatch(/unstyled/i);
  });
});
