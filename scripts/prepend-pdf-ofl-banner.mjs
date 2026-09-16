/**
 * Prepends the Vazirmatn SIL OFL 1.1 banner to PDF publish artifacts.
 * Invoked after tsup so the notice sits at the top of the file (PR-78).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const VAZIRMATN_OFL_BANNER =
  '/*! Vazirmatn: Copyright 2015 The Vazirmatn Project Authors (https://github.com/rastikerdar/vazirmatn). Licensed under the SIL Open Font License, Version 1.1. Full license: OFL.txt */';

export const PDF_BANNER_FILES = [
  'plugins/pdf.js',
  'plugins/pdf.cjs',
  'plugins/pdf/fonts/vazirmatn.js',
  'plugins/pdf/fonts/vazirmatn.cjs',
];

export function prependPdfOflBanner(distDir = join(root, 'dist')) {
  const prefix = `${VAZIRMATN_OFL_BANNER}\n`;
  for (const rel of PDF_BANNER_FILES) {
    const full = join(distDir, rel);
    if (!existsSync(full)) continue;
    const body = readFileSync(full, 'utf8');
    if (body.startsWith(VAZIRMATN_OFL_BANNER)) continue;
    writeFileSync(full, prefix + body);
  }
}

prependPdfOflBanner();
