import type { ExportSource } from '../plugins/GridPlugin';

/**
 * Port so PDF libraries (jsPDF, etc.) stay out of Core.
 * Host or plugin package injects a concrete renderer.
 */
export interface PdfRenderer {
  render(
    source: ExportSource,
    options?: { title?: string; direction?: 'rtl' | 'ltr' },
  ): Promise<Blob>;
}
