/**
 * Verifies tsup publish artifacts exist, look like a real bundle, and stay
 * within min/max size budgets (raw + gzip) for the main entry.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
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
  'UITableController',
  'RowStateEnum',
  'GridTheme',
  'themeErp',
  'themeErpDark',
];
const missingDts = expectedDts.filter((name) => !dts.includes(name));
if (missingDts.length) {
  console.error(
    'dist/index.d.ts is missing expected public exports:',
    missingDts.join(', '),
  );
  process.exit(1);
}

if (dts.includes('Curated public typings') || dts.includes('HAND_WRITTEN')) {
  console.error('dist/index.d.ts still looks curated/hand-written');
  process.exit(1);
}

const css = readFileSync(join(dist, 'styles.css'), 'utf8');
if (!css.includes('.erp-table')) {
  console.error('dist/styles.css missing .erp-table');
  process.exit(1);
}

console.log('dist verification ok');
