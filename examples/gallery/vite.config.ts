import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: 'persian-data-grid/styles.css',
        replacement: resolve(root, 'ui/styles/erp-table.css'),
      },
      {
        find: 'persian-data-grid/plugins/excel',
        replacement: resolve(root, 'publish/plugins/excel.ts'),
      },
      {
        find: 'persian-data-grid/plugins/csv',
        replacement: resolve(root, 'publish/plugins/csv.ts'),
      },
      {
        find: 'persian-data-grid/plugins/pdf',
        replacement: resolve(root, 'publish/plugins/pdf.ts'),
      },
      {
        find: 'persian-data-grid/date-picker-jalali',
        replacement: resolve(root, 'publish/date-picker-jalali.ts'),
      },
      {
        find: /^persian-data-grid$/,
        replacement: resolve(root, 'publish/entry.ts'),
      },
    ],
  },
  server: { fs: { allow: [root] } },
});
