import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const root = join(dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  entry: {
    index: 'publish/entry.ts',
    headless: 'publish/headless.ts',
    'plugins/excel': 'publish/plugins/excel.ts',
    'plugins/pdf': 'publish/plugins/pdf.ts',
    'plugins/pdf/fonts/vazirmatn': 'publish/plugins/pdf-fonts-vazirmatn.ts',
    'adapters/arian-erp': 'publish/adapters/arian-erp.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: 'es2020',
  outDir: 'dist',
  injectStyle: true,
  loader: {
    '.css': 'css',
  },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react-persian-range-picker',
    'fflate',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  async onSuccess() {
    const cssSrc = join(root, 'ui/styles/erp-table.css');
    const cssDest = join(root, 'dist/styles.css');
    mkdirSync(dirname(cssDest), { recursive: true });
    copyFileSync(cssSrc, cssDest);
  },
});
