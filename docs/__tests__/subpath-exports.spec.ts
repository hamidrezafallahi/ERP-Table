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
      './plugins/excel',
      './plugins/pdf',
      './plugins/pdf/fonts/vazirmatn',
      './adapters/arian-erp',
      './styles.css',
    ]) {
      expect(pkg.exports[key], key).toBeTruthy();
    }
  });

  it('dist artifacts exist after build', () => {
    for (const rel of [
      'index.js',
      'headless.js',
      'plugins/excel.js',
      'plugins/pdf.js',
      'plugins/pdf/fonts/vazirmatn.js',
      'adapters/arian-erp.js',
      'styles.css',
    ]) {
      expect(existsSync(join(root, 'dist', rel)), rel).toBe(true);
    }
  });

  it('each subpath import() yields the key export', async () => {
    if (!existsSync(join(root, 'dist/index.js'))) return;

    const main = await import(distUrl('index.js'));
    expect(typeof main.ERPTable).toBe('function');
    expect(typeof main.createERPTable).toBe('function');
    // Deprecated aliases still resolve from `.`
    expect(typeof main.ExcelExportPlugin).toBe('function');
    expect(typeof main.PdfExportPlugin).toBe('function');
    expect(typeof main.FetchRemoteApi).toBe('function');

    const headless = await import(distUrl('headless.js'));
    expect(typeof headless.createERPTable).toBe('function');
    expect(typeof headless.createGrid).toBe('function');
    expect(headless.createGrid).toBe(headless.createERPTable);
    expect(headless.ERPTable).toBeUndefined();

    const excel = await import(distUrl('plugins/excel.js'));
    expect(typeof excel.ExcelExportPlugin).toBe('function');
    expect(typeof excel.ExcelImportPlugin).toBe('function');

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

    const css = readFileSync(join(root, 'dist/styles.css'), 'utf8');
    expect(css).toContain('.erp-table');
  });

  it('MIGRATION.md documents the PR-76 subpath moves', () => {
    const mig = readFileSync(join(root, 'MIGRATION.md'), 'utf8');
    expect(mig).toContain('PR-76');
    expect(mig).toContain('plugins/excel');
    expect(mig).toContain('plugins/pdf/fonts/vazirmatn');
    expect(mig).toContain('adapters/arian-erp');
    expect(mig).toContain('createVazirmatnPdfExportPlugin');
  });
});
