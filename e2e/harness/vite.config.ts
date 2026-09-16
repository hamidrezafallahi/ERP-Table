import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, '../..');

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: 'persian-data-grid/styles.css',
        replacement: path.resolve(repoRoot, 'ui/styles/erp-table.css'),
      },
      {
        find: 'persian-data-grid/plugins/excel',
        replacement: path.resolve(repoRoot, 'publish/plugins/excel.ts'),
      },
      {
        find: 'persian-data-grid/plugins/csv',
        replacement: path.resolve(repoRoot, 'publish/plugins/csv.ts'),
      },
      {
        find: /^persian-data-grid$/,
        replacement: path.resolve(repoRoot, 'publish/entry.ts'),
      },
    ],
  },
  server: {
    port: 5180,
    strictPort: true,
    host: '127.0.0.1',
    fs: { allow: [repoRoot] },
  },
});
