/**
 * Verifies tsup publish artifacts exist, look like a real bundle, and stay
 * within min/max size budgets (raw + gzip) for the main entry.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MAIN_GZIP_LIMIT_BYTES,
  MIN_RAW_BYTES,
  MAX_RAW_BYTES,
  checkGzipUnderLimit,
  checkRawBounds,
} from './sizeBudget.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const required = [
  'index.js',
  'index.cjs',
  'index.d.ts',
  'headless.js',
  'plugins/excel.js',
  'plugins/pdf.js',
  'plugins/pdf/fonts/vazirmatn.js',
  'adapters/arian-erp.js',
  'styles.css',
];
const missing = required.filter((f) => !existsSync(join(dist, f)));
if (missing.length) {
  console.error('Missing dist artifacts:', missing.join(', '));
  process.exit(1);
}

const esm = readFileSync(join(dist, 'index.js'), 'utf8');
if (esm.includes("export * from '../index.ts'")) {
  console.error('dist/index.js still looks like the legacy stub build');
  process.exit(1);
}

if (!/createERPTable|ERPTable|EVENT_CATALOG/.test(esm)) {
  console.error('dist/index.js does not appear to contain package exports');
  process.exit(1);
}

// Font bytes must not ship in the main entry (D15).
if (/vazirmatnRegularBytes|DEFLATED_B64/.test(esm)) {
  console.error('dist/index.js still embeds Vazirmatn font bytes');
  process.exit(1);
}

// arianERP cookie/persist adapter must stay off `.` (PR-80).
if (esm.includes('arianERP')) {
  console.error('dist/index.js still contains arianERP');
  process.exit(1);
}
const cjs = readFileSync(join(dist, 'index.cjs'), 'utf8');
if (cjs.includes('arianERP')) {
  console.error('dist/index.cjs still contains arianERP');
  process.exit(1);
}
const adapterEsm = readFileSync(join(dist, 'adapters/arian-erp.js'), 'utf8');
if (!adapterEsm.includes('persist:arianERP')) {
  console.error('dist/adapters/arian-erp.js is missing persist:arianERP');
  process.exit(1);
}
console.log('dist/index.js has zero arianERP; adapter subpath keeps persist:arianERP');

// Optional jalali picker peer must stay off `.` (PR-128 / D21).
if (esm.includes('react-persian-range-picker') || cjs.includes('react-persian-range-picker')) {
  console.error('dist/index still references react-persian-range-picker');
  process.exit(1);
}
console.log('dist/index has zero react-persian-range-picker');

for (const file of ['index.js', 'index.cjs']) {
  const full = join(dist, file);
  const size = statSync(full).size;
  const raw = checkRawBounds(size, { min: MIN_RAW_BYTES, max: MAX_RAW_BYTES });
  if (!raw.ok) {
    console.error(`${file} raw size ${raw.reason}`);
    process.exit(1);
  }

  const buf = readFileSync(full);
  const gz = checkGzipUnderLimit(buf, MAIN_GZIP_LIMIT_BYTES);
  if (!gz.ok) {
    console.error(
      `${file} gzip ${(gz.gzipBytes / 1024).toFixed(1)} KB exceeds limit ` +
        `${(gz.limitBytes / 1024).toFixed(0)} KB`,
    );
    process.exit(1);
  }
  console.log(
    `${file}: raw ${(size / 1024).toFixed(1)} KB, gzip ${(gz.gzipBytes / 1024).toFixed(1)} KB ` +
      `(limit ${(MAIN_GZIP_LIMIT_BYTES / 1024).toFixed(0)} KB)`,
  );
}

const dts = readFileSync(join(dist, 'index.d.ts'), 'utf8');
const expectedDts = [
  'createERPTable',
  'ERPTable',
  'VirtualList',
  'EVENT_CATALOG',
  'PluginHost',
  'ExcelExportPlugin',
  'PdfExportPlugin',
  'GridApi',
  'createGridApi',
  'UITableController',
  'RowStateEnum',
  'GridTheme',
  'DataGrid',
  'themeDefault',
  'themeDark',
  'themeErp',
  'themeErpDark',
  'injectGridStyles',
  'DEFAULT_EVENT_STORE_PREFIX',
  'ColumnDef',
  'toColumnDef',
  'toColumnSchema',
  'applySort',
];
const missingDts = expectedDts.filter((name) => !dts.includes(name));
if (missingDts.length) {
  console.error(
    'dist/index.d.ts is missing expected public exports:',
    missingDts.join(', '),
  );
  process.exit(1);
}

if (
  /export(?:\s+declare)?\s+class FetchRemoteApi/.test(dts) ||
  /export\s*\{[^}]*\bFetchRemoteApi\b/.test(dts)
) {
  console.error('dist/index.d.ts still exports FetchRemoteApi');
  process.exit(1);
}

if (dts.includes('Curated public typings') || dts.includes('HAND_WRITTEN')) {
  console.error('dist/index.d.ts still looks curated/hand-written');
  process.exit(1);
}

const css = readFileSync(join(dist, 'styles.css'), 'utf8');
if (!css.includes('.erp-table') || !css.includes('.pdg-grid')) {
  console.error('dist/styles.css missing .erp-table / .pdg-grid');
  process.exit(1);
}

const sourceCss = readFileSync(join(root, 'ui/styles/erp-table.css'), 'utf8');
if (css !== sourceCss) {
  console.error('dist/styles.css does not match ui/styles/erp-table.css');
  process.exit(1);
}

if (esm.includes('erp-table-injected-css') && /injectERPTableStyles\(\);\s*$/m.test(esm)) {
  console.error('dist/index.js still auto-injects CSS at module load');
  process.exit(1);
}

const oflBannerFiles = [
  'plugins/pdf.js',
  'plugins/pdf.cjs',
  'plugins/pdf/fonts/vazirmatn.js',
  'plugins/pdf/fonts/vazirmatn.cjs',
];
for (const rel of oflBannerFiles) {
  const body = readFileSync(join(dist, rel), 'utf8');
  if (!body.startsWith('/*! Vazirmatn:') || !body.includes('SIL Open Font License')) {
    console.error(`${rel} is missing the Vazirmatn OFL banner`);
    process.exit(1);
  }
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const files = pkg.files ?? [];
for (const requiredFile of ['dist', 'LICENSE', 'OFL.txt']) {
  if (!files.includes(requiredFile)) {
    console.error(`package.json files is missing ${requiredFile}`);
    process.exit(1);
  }
}

console.log('dist/styles.css matches ui/styles/erp-table.css');
console.log('PDF OFL banners present');

const pack = spawnSync('npm pack --dry-run', {
  cwd: root,
  encoding: 'utf8',
  shell: true,
});
if (pack.error || pack.status !== 0) {
  console.error('npm pack --dry-run failed');
  console.error(pack.error ?? '');
  console.error(pack.stderr || pack.stdout);
  process.exit(1);
}
const packOut = `${pack.stdout}\n${pack.stderr}`;
if (!/\bLICENSE\b/.test(packOut) || !/\bOFL\.txt\b/.test(packOut)) {
  console.error('npm pack --dry-run did not list LICENSE and OFL.txt');
  console.error(packOut);
  process.exit(1);
}
console.log('npm pack includes LICENSE and OFL.txt');

function walkDts(dir, acc = []) {
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

const dtsAnyHits = [];
for (const file of walkDts(dist)) {
  const text = stripStringLiterals(stripComments(readFileSync(file, 'utf8')));
  if (/\bany\b/.test(text)) dtsAnyHits.push(file.slice(dist.length + 1));
}
if (dtsAnyHits.length) {
  console.error('Published .d.ts still contains `any`:', dtsAnyHits.join(', '));
  process.exit(1);
}
console.log('published d.ts has zero `any`');
console.log('dist verification ok');
