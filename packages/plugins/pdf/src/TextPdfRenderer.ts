import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import type { PdfRenderer } from '../../../../application/ports/PdfRenderer';
import { formatExportValue } from '../../excel/src/formatExportValue';

/**
 * Legacy Helvetica PDF (8 columns × 40 rows). Kept for tests and Host opt-in.
 * Product default is {@link VazirmatnPdfRenderer}.
 *
 * @deprecated Use VazirmatnPdfRenderer.
 */
export class TextPdfRenderer implements PdfRenderer {
  async render(
    source: ExportSource,
    options?: { title?: string },
  ): Promise<Blob> {
    const lines: string[] = [options?.title ?? 'Export'];
    const columns = source.columns.slice(0, 8);
    lines.push(columns.map((c) => c.fieldCaption ?? c.fieldName).join(' | '));

    for (const row of source.rows.slice(0, 40)) {
      lines.push(
        columns
          .map((col) => {
            const cell = row.cells[col.fieldName];
            const raw = cell?.display ?? cell?.value ?? '';
            return formatExportValue(raw, col.fieldType).slice(0, 24);
          })
          .join(' | '),
      );
    }

    const content = lines
      .map((line, i) => {
        const safe = line.replace(/[()\\]/g, ' ');
        const y = 750 - i * 14;
        return `BT /F1 10 Tf 40 ${y} Td (${safe}) Tj ET`;
      })
      .join('\n');

    const stream = content;
    const objects = [
      '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n',
      '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n',
      '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n',
      `4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream\nendobj\n`,
      '5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n',
    ];

    let body = '%PDF-1.1\n';
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(body.length);
      body += obj;
    }
    const xrefStart = body.length;
    body += `xref\n0 ${objects.length + 1}\n`;
    body += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i += 1) {
      body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    body += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    body += `startxref\n${xrefStart}\n%%EOF\n`;

    return new Blob([body], { type: 'application/pdf' });
  }
}
