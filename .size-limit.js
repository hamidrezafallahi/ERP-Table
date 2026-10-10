/**
 * Size budgets for the published package (PR-76 / D15).
 * Main `.` ceiling is 66 KB gzip. Subpath limits measured after first build.
 */
import { existsSync } from 'node:fs';

/** @type {Array<{ name: string; path: string; limit: string }>} */
const ALL_BUDGETS = [
  { name: '.', path: 'dist/index.js', limit: '66 KB' },
  { name: './headless', path: 'dist/headless.js', limit: '100 KB' },
  { name: './presence', path: 'dist/presence.js', limit: '20 KB' },
  { name: './sync', path: 'dist/sync.js', limit: '20 KB' },
  { name: './plugins/excel', path: 'dist/plugins/excel.js', limit: '60 KB' },
  { name: './plugins/csv', path: 'dist/plugins/csv.js', limit: '15 KB' },
  { name: './plugins/pdf', path: 'dist/plugins/pdf.js', limit: '50 KB' },
  {
    name: './plugins/pdf/fonts/vazirmatn',
    path: 'dist/plugins/pdf/fonts/vazirmatn.js',
    limit: '100 KB',
  },
  { name: './adapters/arian-erp', path: 'dist/adapters/arian-erp.js', limit: '20 KB' },
  { name: './date-picker-jalali', path: 'dist/date-picker-jalali.js', limit: '25 KB' },
  { name: './finance', path: 'dist/finance.js', limit: '15 KB' },
  { name: './styles.css', path: 'dist/styles.css', limit: '30 KB' },
];

export default ALL_BUDGETS.filter((entry) => existsSync(entry.path)).map((entry) => ({
  ...entry,
  gzip: true,
}));
