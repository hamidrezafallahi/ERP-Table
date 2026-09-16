import { defineConfig } from 'vitepress';
import react from '@vitejs/plugin-react-swc';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

const enNav = [
  { text: 'Getting Started', link: '/getting-started' },
  { text: 'Concepts', link: '/concepts/architecture' },
  { text: 'Guide', link: '/guide/sorting' },
  { text: 'API', link: '/api/' },
];

const enSidebar = {
  '/concepts/': [
    {
      text: 'Concepts',
      items: [
        { text: 'Architecture', link: '/concepts/architecture' },
        { text: 'Event sourcing', link: '/concepts/event-sourcing' },
      ],
    },
  ],
  '/guide/': [
    {
      text: 'Guide',
      items: [
        { text: 'Sorting', link: '/guide/sorting' },
        { text: 'Filtering', link: '/guide/filtering' },
        { text: 'Editing', link: '/guide/editing' },
        { text: 'Selection & clipboard', link: '/guide/selection' },
        { text: 'Grouping & aggregation', link: '/guide/grouping' },
        { text: 'Virtualization', link: '/guide/virtualization' },
        { text: 'Keyboard', link: '/guide/keyboard' },
        { text: 'Theming', link: '/guide/theming' },
        { text: 'Internationalization', link: '/guide/i18n' },
        { text: 'Dates', link: '/guide/dates' },
        { text: 'Export', link: '/guide/export' },
      ],
    },
  ],
};

const faNav = [
  { text: 'شروع سریع', link: '/fa/getting-started' },
  { text: 'مفاهیم', link: '/fa/concepts/architecture' },
  { text: 'راهنما', link: '/fa/guide/sorting' },
  { text: 'API', link: '/api/' },
];

const faSidebar = {
  '/fa/concepts/': [
    {
      text: 'مفاهیم',
      items: [
        { text: 'معماری', link: '/fa/concepts/architecture' },
        { text: 'Event sourcing', link: '/fa/concepts/event-sourcing' },
      ],
    },
  ],
  '/fa/guide/': [
    {
      text: 'راهنما',
      items: [
        { text: 'مرتب‌سازی', link: '/fa/guide/sorting' },
        { text: 'فیلتر', link: '/fa/guide/filtering' },
        { text: 'ویرایش', link: '/fa/guide/editing' },
        { text: 'انتخاب و کلیپ‌بورد', link: '/fa/guide/selection' },
        { text: 'گروه‌بندی و جمع', link: '/fa/guide/grouping' },
        { text: 'مجازی‌سازی', link: '/fa/guide/virtualization' },
        { text: 'صفحه‌کلید', link: '/fa/guide/keyboard' },
        { text: 'تم', link: '/fa/guide/theming' },
        { text: 'چندزبانه', link: '/fa/guide/i18n' },
        { text: 'تاریخ', link: '/fa/guide/dates' },
        { text: 'خروجی', link: '/fa/guide/export' },
      ],
    },
  ],
};

export default defineConfig({
  title: 'persian-data-grid',
  description: 'Persian / Jalali React data grid — event-sourced, RTL, offline-first',
  base: '/ERP-Table/',
  cleanUrls: true,
  ignoreDeadLinks: [
    /^\/api(?:\/|$)/,
  ],
  head: [
    ['link', { rel: 'icon', href: '/ERP-Table/favicon.svg' }],
  ],
  vite: {
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'persian-data-grid/styles.css',
          replacement: resolve(repoRoot, 'ui/styles/erp-table.css'),
        },
        {
          find: 'persian-data-grid/locales/fa',
          replacement: resolve(repoRoot, 'publish/locales/fa.ts'),
        },
        {
          find: 'persian-data-grid/locales/en',
          replacement: resolve(repoRoot, 'publish/locales/en.ts'),
        },
        {
          find: 'persian-data-grid/plugins/excel',
          replacement: resolve(repoRoot, 'publish/plugins/excel.ts'),
        },
        {
          find: 'persian-data-grid/plugins/csv',
          replacement: resolve(repoRoot, 'publish/plugins/csv.ts'),
        },
        {
          find: 'persian-data-grid/plugins/pdf',
          replacement: resolve(repoRoot, 'publish/plugins/pdf.ts'),
        },
        {
          find: /^persian-data-grid$/,
          replacement: resolve(repoRoot, 'publish/entry.ts'),
        },
      ],
    },
    server: {
      fs: { allow: [repoRoot] },
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
        socialLinks: [
          { icon: 'github', link: 'https://github.com/hamidrezafallahi/ERP-Table' },
        ],
        outline: { level: [2, 3] },
        search: { provider: 'local' },
      },
    },
    fa: {
      label: 'فارسی',
      lang: 'fa-IR',
      dir: 'rtl',
      link: '/fa/',
      themeConfig: {
        nav: faNav,
        sidebar: faSidebar,
        socialLinks: [
          { icon: 'github', link: 'https://github.com/hamidrezafallahi/ERP-Table' },
        ],
        outline: { level: [2, 3], label: 'در این صفحه' },
        search: { provider: 'local' },
        docFooter: { prev: 'قبلی', next: 'بعدی' },
        darkModeSwitchLabel: 'تم',
        sidebarMenuLabel: 'فهرست',
        returnToTopLabel: 'بازگشت به بالا',
      },
    },
  },
  themeConfig: {
    logo: { text: 'PDG' },
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © persian-data-grid contributors',
    },
  },
});
