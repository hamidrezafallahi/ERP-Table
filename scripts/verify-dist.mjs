/**
 * Verifies tsup publish artifacts exist and look like a real bundle (not the old stub).
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const required = ['index.js', 'index.cjs', 'index.d.ts'];
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

if (!/Viewport|EVENT_CATALOG|createERPTable|InMemoryEventStore|ERPTable/.test(esm)) {
  console.error('dist/index.js does not appear to contain package exports');
  process.exit(1);
}

const minBytes = 5_000;
for (const file of ['index.js', 'index.cjs']) {
  const size = statSync(join(dist, file)).size;
  if (size < minBytes) {
    console.error(`${file} is too small (${size} bytes) — expected a real bundle`);
    process.exit(1);
  }
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

// Auto-emitted DTS should not be the old hand-written curated stub marker.
if (dts.includes('Curated public typings') || dts.includes('HAND_WRITTEN')) {
  console.error('dist/index.d.ts still looks curated/hand-written');
  process.exit(1);
}

console.log('dist verification ok');
