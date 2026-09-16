/**
 * PR-135 / D25 — release gate for tagging `1.0.0`.
 *
 * Checks the “آماده برای انتشار جدی” checklist from
 * `docs/ag-grid-gap-analysis.md` §۴ plus the PR-135 verify list.
 * Exit 0 only when every check passes. Today this script is expected red.
 *
 * Usage: node ./scripts/release-gate.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { MAIN_GZIP_LIMIT_BYTES } from './sizeBudget.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** §۴ “آماده برای انتشار جدی” still uses 60 KB; D15/PR-76 publish ceiling is 65 KB. */
const SERIOUS_RELEASE_GZIP_LIMIT_BYTES = 60 * 1024;
const MIN_GENERAL_SCORE = 70;
const MIN_DIFF_SCORE = 90;
const MIN_EXAMPLES = 12;

/**
 * @param {string} text
 */
function parseFaNumber(text) {
  const normalized = String(text)
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * @param {string} rel
 */
function load(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function walkDts(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkDts(full, acc);
    else if (name.endsWith('.d.ts') || name.endsWith('.d.cts')) acc.push(full);
  }
  return acc;
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
}

function stripStringLiterals(source) {
  return source
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ');
}

/**
 * @returns {{ general: number; diff: number }}
 */
function readScores() {
  const gap = load('docs/ag-grid-gap-analysis.md');
  // Primary table: | **جمع** | **۱۰۰** | **۹۶** | **۷۵** | **−۲۱** |
  const generalRow = gap.match(
    /\|\s*\*\*جمع\*\*\s*\|\s*\*\*[^*]+\*\*\s*\|\s*\*\*[^*]+\*\*\s*\|\s*\*\*([^*]+)\*\*/,
  );
  const diffBlock = gap.split('### محور مکمل')[1] ?? '';
  // Diff table: | **جمع** | **۱۰۰** | **۱۶** | **۸۱** |
  const diffRow = diffBlock.match(
    /\|\s*\*\*جمع\*\*\s*\|\s*\*\*[^*]+\*\*\s*\|\s*\*\*[^*]+\*\*\s*\|\s*\*\*([^*]+)\*\*/,
  );
  return {
    general: parseFaNumber(generalRow?.[1] ?? ''),
    diff: parseFaNumber(diffRow?.[1] ?? ''),
  };
}

/**
 * @typedef {{ id: string; ok: boolean; detail: string }} GateCheck
 */

/** @type {GateCheck[]} */
const checks = [];

function check(id, ok, detail) {
  checks.push({ id, ok: Boolean(ok), detail });
}

// 1) Scorecard — general ≥ 70 (PR-135)
const scores = readScores();
check(
  'scorecard-general',
  Number.isFinite(scores.general) && scores.general >= MIN_GENERAL_SCORE,
  `general score ${scores.general} (need ≥ ${MIN_GENERAL_SCORE})`,
);

// 1b) Differentiation ≥ 90 — WORKLOG / 1.0.0 goal (expected red today)
check(
  'scorecard-diff',
  Number.isFinite(scores.diff) && scores.diff >= MIN_DIFF_SCORE,
  `differentiation score ${scores.diff} (need ≥ ${MIN_DIFF_SCORE} for 1.0.0)`,
);

// 2) Bundle ≤ 65 KB gzip (PR-135 / D15)
const mainPath = join(root, 'dist/index.js');
if (!existsSync(mainPath)) {
  check('bundle-65kb', false, 'dist/index.js missing — run yarn build');
  check('bundle-60kb', false, 'dist/index.js missing — run yarn build');
} else {
  const raw = readFileSync(mainPath);
  const gzipBytes = gzipSync(raw, { level: 9 }).length;
  check(
    'bundle-65kb',
    gzipBytes <= MAIN_GZIP_LIMIT_BYTES,
    `main gzip ${gzipBytes} B (limit ${MAIN_GZIP_LIMIT_BYTES} = 65 KB)`,
  );
  // §۴ serious-release ceiling (expected red today at ~61.6 KB)
  check(
    'bundle-60kb',
    gzipBytes <= SERIOUS_RELEASE_GZIP_LIMIT_BYTES,
    `main gzip ${gzipBytes} B (gap-analysis §۴ limit ${SERIOUS_RELEASE_GZIP_LIMIT_BYTES} = 60 KB)`,
  );
}

// 3) axe صفر — suite must exist and assert empty violations
const axeSpec = join(root, 'ui/desktop/__tests__/grid-a11y.spec.tsx');
if (!existsSync(axeSpec)) {
  check('axe-zero', false, 'ui/desktop/__tests__/grid-a11y.spec.tsx missing');
} else {
  const axeSrc = readFileSync(axeSpec, 'utf8');
  const hasAxe = axeSrc.includes('axe-core') || axeSrc.includes("from 'axe-core'");
  const assertsClean =
    /results\.violations/.test(axeSrc) && /toEqual\(\[\]\)|toHaveLength\(0\)/.test(axeSrc);
  check(
    'axe-zero',
    hasAxe && assertsClean,
    hasAxe && assertsClean
      ? 'axe-core suite present with zero-violation asserts'
      : 'axe suite missing zero-violation asserts',
  );
}

// 4) 100k budgets present
const budgetsPath = join(root, 'infrastructure/perf/grid-performance-budgets.json');
const perfSpec = join(
  root,
  'infrastructure/__tests__/grid-performance-budget.spec.ts',
);
const memSpec = join(root, 'infrastructure/__tests__/grid-memory-budget.spec.ts');
if (!existsSync(budgetsPath) || !existsSync(perfSpec) || !existsSync(memSpec)) {
  check(
    'budget-100k',
    false,
    'missing performance budget JSON or vitest specs',
  );
} else {
  const budgets = JSON.parse(readFileSync(budgetsPath, 'utf8'));
  check(
    'budget-100k',
    budgets.rowCount === 100000 &&
      typeof budgets.hydrateMaxMs === 'number' &&
      load('docs/performance.md').includes('100k'),
    `budgets rowCount=${budgets.rowCount}; perf+memory specs present`,
  );
}

// 5) صفر any عمومی on published .d.ts
const dtsFiles = walkDts(join(root, 'dist'));
if (dtsFiles.length === 0) {
  check('zero-public-any', false, 'no dist .d.ts — run yarn build');
} else {
  const hits = dtsFiles.filter((file) =>
    /\bany\b/.test(
      stripStringLiterals(stripComments(readFileSync(file, 'utf8'))),
    ),
  );
  check(
    'zero-public-any',
    hits.length === 0,
    hits.length === 0
      ? `scanned ${dtsFiles.length} .d.ts — zero any`
      : `any in: ${hits
          .slice(0, 5)
          .map((f) => f.slice(root.length + 1))
          .join(', ')}`,
  );
}

// 6) هر ادعای README تست‌دار
const honestySpec = load('docs/__tests__/public-api-honesty.spec.ts');
check(
  'readme-claims-tested',
  honestySpec.includes("describe('PR-75 README") &&
    honestySpec.includes('README.md') &&
    existsSync(join(root, 'docs/public-api-honesty.md')),
  'PR-75 README honesty suite + public-api-honesty.md',
);

// 7) ≥ ۱۲ مثال
const examplesDir = join(root, 'examples/gallery/src/examples');
const exampleCount = existsSync(examplesDir)
  ? readdirSync(examplesDir).filter((f) => f.endsWith('.tsx')).length
  : 0;
check(
  'examples-12',
  exampleCount >= MIN_EXAMPLES,
  `${exampleCount} gallery examples (need ≥ ${MIN_EXAMPLES})`,
);

// 8) Phase 24 exit: monorepo core headless (D22) — expected red while D22 open
const monorepoCore = existsSync(join(root, 'packages/core/package.json'));
check(
  'monorepo-core',
  monorepoCore,
  monorepoCore
    ? 'packages/core present'
    : 'packages/core missing (D22 / PR-132 still open)',
);

// Report
let failed = 0;
console.log('persian-data-grid release gate (PR-135 / D25)\n');
for (const c of checks) {
  const mark = c.ok ? 'PASS' : 'FAIL';
  if (!c.ok) failed += 1;
  console.log(`${mark}  ${c.id}: ${c.detail}`);
}
console.log(
  failed === 0
    ? '\nrelease-gate GREEN — 1.0.0 may be tagged.'
    : `\nrelease-gate RED — ${failed} check(s) failed; do not tag 1.0.0.`,
);
process.exit(failed === 0 ? 0 : 1);
