/*!
 * Vazirmatn font software: Copyright 2015 The Vazirmatn Project Authors
 * https://github.com/rastikerdar/vazirmatn
 * Licensed under the SIL Open Font License, Version 1.1. See OFL.txt.
 */
/**
 * Vazirmatn font bytes + helpers (PR-76 / D15).
 * Import explicitly — not part of `.` or `./plugins/pdf`.
 */
import { PdfExportPlugin } from '../../packages/plugins/pdf/src/PdfExportPlugin';
import type { PdfExportPluginOptions } from '../../packages/plugins/pdf/src/PdfExportPlugin';
import { VazirmatnPdfRenderer } from '../../packages/plugins/pdf/src/VazirmatnPdfRenderer';
import { vazirmatnRegularBytes } from '../../packages/plugins/pdf/src/vazirmatnBytes';

export { vazirmatnRegularBytes };

export function createVazirmatnPdfRenderer(): VazirmatnPdfRenderer {
  return new VazirmatnPdfRenderer(vazirmatnRegularBytes());
}

/** Persian PDF plugin with embedded Vazirmatn (OFL). */
export function createVazirmatnPdfExportPlugin(
  options: PdfExportPluginOptions = {},
): PdfExportPlugin {
  return new PdfExportPlugin({
    ...options,
    renderer: options.renderer ?? createVazirmatnPdfRenderer(),
  });
}

export { VazirmatnPdfRenderer, PdfExportPlugin };
export type { PdfExportPluginOptions };
