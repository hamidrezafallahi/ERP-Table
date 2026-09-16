import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, '..');

export default defineConfig(({ command }) => ({
  root: rootDir,
  // gh-pages needs the repo base path; local `yarn dev` / `dev:docs` must use `/`
  base: command === 'build' ? '/ERP-Table/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      'persian-data-grid/plugins/excel': path.resolve(
        repoRoot,
        'publish/plugins/excel.ts',
      ),
      'persian-data-grid/plugins/pdf': path.resolve(
        repoRoot,
        'publish/plugins/pdf.ts',
      ),
      'persian-data-grid/plugins/pdf/fonts/vazirmatn': path.resolve(
        repoRoot,
        'publish/plugins/pdf-fonts-vazirmatn.ts',
      ),
      'persian-data-grid/adapters/arian-erp': path.resolve(
        repoRoot,
        'publish/adapters/arian-erp.ts',
      ),
      'persian-data-grid/headless': path.resolve(repoRoot, 'publish/headless.ts'),
      'persian-data-grid/styles.css': path.resolve(
        repoRoot,
        'ui/styles/erp-table.css',
      ),
      'persian-data-grid': path.resolve(repoRoot, 'publish/entry.ts'),
    },
  },
  publicDir: path.resolve(rootDir, 'public'),
  build: {
    outDir: path.resolve(rootDir, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5175,
    open: true,
  },
}));
