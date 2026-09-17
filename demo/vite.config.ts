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
    alias: [
      // More-specific subpaths must come before their parents (Vite prefix match).
      {
        find: 'persian-data-grid/plugins/pdf/fonts/vazirmatn',
        replacement: path.resolve(repoRoot, 'publish/plugins/pdf-fonts-vazirmatn.ts'),
      },
      {
        find: 'persian-data-grid/plugins/excel',
        replacement: path.resolve(repoRoot, 'publish/plugins/excel.ts'),
      },
      {
        find: 'persian-data-grid/plugins/pdf',
        replacement: path.resolve(repoRoot, 'publish/plugins/pdf.ts'),
      },
      {
        find: 'persian-data-grid/adapters/arian-erp',
        replacement: path.resolve(repoRoot, 'publish/adapters/arian-erp.ts'),
      },
      {
        find: 'persian-data-grid/headless',
        replacement: path.resolve(repoRoot, 'publish/headless.ts'),
      },
      {
        find: 'persian-data-grid/styles.css',
        replacement: path.resolve(repoRoot, 'ui/styles/erp-table.css'),
      },
      {
        find: 'persian-data-grid',
        replacement: path.resolve(repoRoot, 'publish/entry.ts'),
      },
    ],
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
