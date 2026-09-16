/**
 * Embeds ui/styles/erp-table.css into ui/styles/injectStyles.ts.
 * erp-table.css is the source of truth (PR-77 / D16).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const CSS_SOURCE = join(root, 'ui/styles/erp-table.css');
export const INJECT_DEST = join(root, 'ui/styles/injectStyles.ts');

export function escapeForTemplateLiteral(css) {
  return css
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

export function buildInjectStylesSource(css) {
  const body = escapeForTemplateLiteral(css);
  return `/**
 * GENERATED from ui/styles/erp-table.css — do not edit by hand.
 * Regenerate: yarn generate:inject-styles
 */
const STYLE_ID = 'erp-table-injected-css';

const CSS = \`${body}\`;

export function injectGridStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/** @deprecated Use \`injectGridStyles()\` (PR-77 / D16). */
export function injectERPTableStyles(): void {
  injectGridStyles();
}
`;
}

export function generateInjectStyles() {
  const css = readFileSync(CSS_SOURCE, 'utf8');
  writeFileSync(INJECT_DEST, buildInjectStylesSource(css));
  return INJECT_DEST;
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  const self = fileURLToPath(import.meta.url).replace(/\\/g, '/').toLowerCase();
  const argv = process.argv[1].replace(/\\/g, '/').toLowerCase();
  return self === argv;
}

if (isDirectRun()) {
  generateInjectStyles();
  console.log('wrote ui/styles/injectStyles.ts from ui/styles/erp-table.css');
}
