/**
 * Port so PDF libraries stay out of Core.
 * Host or plugin package injects a concrete renderer.
 */
import type { ExportSource } from '../plugins/GridPlugin';

/**
 * Options bag for {@link PdfRenderer}.
 * `template` is defined by `persian-data-grid/plugins/pdf` (`DocumentPdfTemplate`).
 */
export type PdfRenderOptions = {
  title?: string;
  direction?: 'rtl' | 'ltr';
  /** Opaque to Core — interpreted by VazirmatnPdfRenderer (PR-141). */
  template?: unknown;
};

export interface PdfRenderer {
  render(source: ExportSource, options?: PdfRenderOptions): Promise<Blob>;
}
