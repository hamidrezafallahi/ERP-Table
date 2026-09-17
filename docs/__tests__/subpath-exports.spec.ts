import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function distUrl(rel: string): string {
  return pathToFileURL(join(root, 'dist', rel)).href;
}

describe('PR-76 subpath export contract', () => {
  it('package.json exports map lists every D15 subpath', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>;
    };
    for (const key of [
      '.',
      './headless',
      './presence',
      './sync',
      './plugins/excel',
      './plugins/csv',
      './plugins/pdf',
      './plugins/pdf/fonts/vazirmatn',
      './adapters/arian-erp',
      './locales',
      './locales/fa',
      './locales/en',
      './locales/ar',
      './date-picker-jalali',
      './finance',
      './styles.css',
    ]) {
      expect(pkg.exports[key], key).toBeTruthy();
    }
  });

  it('dist artifacts exist after build', () => {
    for (const rel of [
      'index.js',
      'headless.js',
      'presence.js',
      'sync.js',
      'plugins/excel.js',
      'plugins/csv.js',
      'plugins/pdf.js',
      'plugins/pdf/fonts/vazirmatn.js',
      'adapters/arian-erp.js',
      'locales/index.js',
      'locales/fa.js',
      'locales/en.js',
      'locales/ar.js',
      'date-picker-jalali.js',
      'finance.js',
      'styles.css',
    ]) {
      expect(existsSync(join(root, 'dist', rel)), rel).toBe(true);
    }
  });

  it('each subpath import() yields the key export', async () => {
    if (!existsSync(join(root, 'dist/index.js'))) return;

    const main = await import(distUrl('index.js'));
    expect(typeof main.ERPTable).toBe('function');
    expect(typeof main.DataGrid).toBe('function');
    expect(main.DataGrid).toBe(main.ERPTable);
    expect(typeof main.themeDefault).toBe('object');
    expect(main.themeDefault).toBe(main.themeErp);
    expect(main.themeDark).toBe(main.themeErpDark);
    expect(typeof main.useGrid).toBe('function');
    expect(main.useGrid).toBe(main.useERPTable);
    expect(typeof main.createERPTable).toBe('function');
    expect(typeof main.createGrid).toBe('function');
    expect(main.createGrid).not.toBe(main.createERPTable);
    expect(typeof main.createGridApi).toBe('function');
    expect(main.UITableController).toBeUndefined();
    expect(typeof main.injectGridStyles).toBe('function');
    expect(typeof main.injectERPTableStyles).toBe('function');
    // Deprecated aliases still resolve from `.`
    expect(typeof main.ExcelExportPlugin).toBe('function');
    expect(typeof main.PdfExportPlugin).toBe('function');
    expect(main.FetchRemoteApi).toBeUndefined();
    expect(typeof main.DEFAULT_EVENT_STORE_PREFIX).toBe('string');
    expect(typeof main.toColumnDef).toBe('function');
    expect(typeof main.toColumnSchema).toBe('function');
    expect(typeof main.mapRowDataToRowInputs).toBe('function');
    expect(typeof main.defaultGetRowId).toBe('function');
    expect(main.DEFAULT_MEMORY_STORE).toBe('memory');
    expect(main.DEFAULT_GRID_ACTOR.userId).toBe('anonymous');

    const headless = await import(distUrl('headless.js'));
    expect(typeof headless.createERPTable).toBe('function');
    expect(typeof headless.createGrid).toBe('function');
    expect(headless.createGrid).not.toBe(headless.createERPTable);
    expect(typeof headless.createGridApi).toBe('function');
    expect(typeof headless.UITableController).toBe('function');
    expect(headless.ERPTable).toBeUndefined();
    expect(typeof headless.toColumnDef).toBe('function');

    const excel = await import(distUrl('plugins/excel.js'));
    expect(typeof excel.ExcelExportPlugin).toBe('function');
    expect(typeof excel.ExcelImportPlugin).toBe('function');

    const csv = await import(distUrl('plugins/csv.js'));
    expect(typeof csv.CsvExportPlugin).toBe('function');
    expect(typeof csv.buildCsvText).toBe('function');

    const pdf = await import(distUrl('plugins/pdf.js'));
    expect(typeof pdf.PdfExportPlugin).toBe('function');
    expect(typeof pdf.VazirmatnPdfRenderer).toBe('function');
    expect(typeof pdf.TextPdfRenderer).toBe('function');

    const font = await import(distUrl('plugins/pdf/fonts/vazirmatn.js'));
    expect(typeof font.vazirmatnRegularBytes).toBe('function');
    expect(typeof font.createVazirmatnPdfExportPlugin).toBe('function');
    expect(font.vazirmatnRegularBytes().byteLength).toBeGreaterThan(1000);

    const adapter = await import(distUrl('adapters/arian-erp.js'));
    expect(typeof adapter.FetchRemoteApi).toBe('function');

    const indexJs = readFileSync(join(root, 'dist/index.js'), 'utf8');
    expect(indexJs).not.toContain('arianERP');
    expect(readFileSync(join(root, 'dist/adapters/arian-erp.js'), 'utf8')).toContain(
      'persist:arianERP',
    );

    const css = readFileSync(join(root, 'dist/styles.css'), 'utf8');
    const sourceCss = readFileSync(join(root, 'ui/styles/erp-table.css'), 'utf8');
    expect(css).toContain('.erp-table');
    expect(css).toContain('.pdg-grid');
    expect(css).toContain('--pdg-accent');
    expect(css).toBe(sourceCss);
  });

  it('MIGRATION.md documents the PR-76 subpath moves', () => {
    const mig = readFileSync(join(root, 'MIGRATION.md'), 'utf8');
    expect(mig).toContain('PR-76');
    expect(mig).toContain('plugins/excel');
    expect(mig).toContain('plugins/pdf/fonts/vazirmatn');
    expect(mig).toContain('adapters/arian-erp');
    expect(mig).toContain('createVazirmatnPdfExportPlugin');
  });

  it('MIGRATION.md documents PR-77 explicit CSS (D16)', () => {
    const mig = readFileSync(join(root, 'MIGRATION.md'), 'utf8');
    expect(mig).toContain('PR-77');
    expect(mig).toContain("import 'persian-data-grid/styles.css'");
    expect(mig).toContain('injectGridStyles');
    expect(mig).toContain('injectERPTableStyles');
  });

  it('MIGRATION.md documents PR-80 FetchRemoteApi removal and IndexedDB rename', () => {
    const mig = readFileSync(join(root, 'MIGRATION.md'), 'utf8');
    expect(mig).toContain('PR-80');
    expect(mig).toContain('persian-data-grid/adapters/arian-erp');
    expect(mig).toContain('persian-data-grid-events');
    expect(mig).toContain('eventStoreName');
    expect(mig).toContain('erp-table-events');
  });
});
