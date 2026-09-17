/**
 * Document PDF template options (PR-141).
 * Consumed by {@link VazirmatnPdfRenderer} for ERP voucher-style output.
 */

export type DocumentPdfLogo = {
  /** Raw JPEG bytes (DCTDecode). PNG is not supported in this slice. */
  jpegBytes: Uint8Array;
  /** Display width in PDF points. Default 64. */
  width?: number;
  /** Display height in PDF points. Default 48. */
  height?: number;
};

export type DocumentPdfHeader = {
  /** Primary header title (defaults to render `title` option). */
  title?: string;
  subtitle?: string;
  /** Extra meta lines (doc no, date, …). */
  meta?: readonly string[];
};

export type DocumentPdfFooter = {
  text?: string;
  /** Default true when a template is provided. */
  showPageNumber?: boolean;
  /** Tokens: `{page}` `{pages}`. Default `{page} / {pages}`. */
  pageNumberFormat?: string;
};

export type DocumentPdfSignature = {
  label?: string;
  /** Blank ruled lines under the label. Default 2. */
  lines?: number;
};

export type DocumentPdfStamp = {
  label?: string;
};

export type DocumentPdfPageTotals = {
  /** Column fieldNames to sum on each page (price/number). */
  columns: readonly string[];
  label?: string;
};

/**
 * ERP document chrome for Persian PDF export.
 * When omitted, {@link VazirmatnPdfRenderer} keeps the simple title + table layout.
 */
export type DocumentPdfTemplate = {
  header?: DocumentPdfHeader;
  footer?: DocumentPdfFooter;
  logo?: DocumentPdfLogo;
  /** Repeat column headers on every page. Default true. */
  repeatTableHeader?: boolean;
  signature?: DocumentPdfSignature;
  stamp?: DocumentPdfStamp;
  pageTotals?: DocumentPdfPageTotals;
};
