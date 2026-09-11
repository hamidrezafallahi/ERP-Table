import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import type { PdfRenderer } from '../../../../application/ports/PdfRenderer';
import { formatExportValue } from '../../excel/src/formatExportValue';
import { PdfBuilder, pdfEscapeTextHex } from './pdfBuilder';
import { parseTtf, pdfWidth, type ParsedTtf } from './parseTtf';
import { rtlVisual } from './shapeRtl';

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 36;
const TITLE_SIZE = 12;
const CELL_SIZE = 8;
const ROW_H = 16;
const HEADER_H = 18;

function cellText(raw: unknown, fieldType?: string): string {
  if (fieldType === 'checkbox') {
    return raw ? 'بله' : 'خیر';
  }
  return formatExportValue(raw, fieldType);
}

function measure(font: ParsedTtf, text: string, size: number): number {
  let w = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    const gid = font.glyphId(cp);
    w += pdfWidth(font.advance(gid), font.metrics.unitsPerEm);
  }
  return (w * size) / 1000;
}

function fitText(font: ParsedTtf, text: string, size: number, maxWidth: number): string {
  if (measure(font, text, size) <= maxWidth) return text;
  const ellipsis = '...';
  let lo = 0;
  let hi = [...text].length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const slice = [...text].slice(0, mid).join('') + ellipsis;
    if (measure(font, slice, size) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  if (lo <= 0) return ellipsis;
  return [...text].slice(0, lo).join('') + ellipsis;
}

function toGids(font: ParsedTtf, text: string): number[] {
  const gids: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    gids.push(font.glyphId(cp));
  }
  return gids;
}

function toUnicodeCmap(pairs: Array<{ gid: number; unicode: number }>): string {
  const unique = new Map<number, number>();
  for (const p of pairs) {
    if (!unique.has(p.gid)) unique.set(p.gid, p.unicode);
  }
  const entries = [...unique.entries()];
  const chunks: string[] = [];
  for (let i = 0; i < entries.length; i += 100) {
    const slice = entries.slice(i, i + 100);
    chunks.push(`${slice.length} beginbfchar`);
    for (const [gid, uni] of slice) {
      const g = gid.toString(16).padStart(4, '0');
      const u = uni.toString(16).padStart(uni > 0xffff ? 8 : 4, '0');
      chunks.push(`<${g}> <${u}>`);
    }
    chunks.push('endbfchar');
  }
  return `%!PS-Adobe-3.0 Resource-CMap
%%BeginResource: CMap (Vazirmatn-UCS)
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /Vazirmatn-UCS def
/CMapType 2 def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
${chunks.join('\n')}
endcmap
CMapName currentdict /CMap defineresource pop
end
end
%%EndResource
`;
}

/**
 * Persian table PDF: embeds Vazirmatn (OFL) as CIDFontType2, RTL grid, no 8×40 cap.
 *
 * Font bytes are required (PR-76 / D15). Load them from
 * `persian-data-grid/plugins/pdf/fonts/vazirmatn` — not bundled into `./plugins/pdf`.
 */
export class VazirmatnPdfRenderer implements PdfRenderer {
  constructor(private readonly fontBytes: Uint8Array) {
    if (!fontBytes?.byteLength) {
      throw new Error(
        'VazirmatnPdfRenderer requires font bytes from persian-data-grid/plugins/pdf/fonts/vazirmatn',
      );
    }
  }

  async render(
    source: ExportSource,
    options?: { title?: string; direction?: 'rtl' | 'ltr' },
  ): Promise<Blob> {
    const font = parseTtf(this.fontBytes);
    const rtl = options?.direction !== 'ltr';
    const title = options?.title ?? 'اقلام سند';
    const columns = source.columns.filter((c) => c.fieldName !== 'index');
    const colCount = Math.max(1, columns.length);
    const tableWidth = PAGE_W - MARGIN * 2;
    const colW = tableWidth / colCount;
    const used: Array<{ gid: number; unicode: number }> = [];

    const note = (text: string, size: number) => {
      const visual = rtl ? rtlVisual(text) : text;
      for (const ch of visual) {
        const cp = ch.codePointAt(0) ?? 0;
        used.push({ gid: font.glyphId(cp), unicode: cp });
      }
      return visual;
    };

    const titleVisual = note(title, TITLE_SIZE);
    const headers = columns.map((c) =>
      note(c.fieldCaption ?? c.fieldName, CELL_SIZE),
    );
    const body = source.rows.map((row) =>
      columns.map((col) => {
        const cell = row.cells[col.fieldName];
        const raw = cell?.display ?? cell?.value ?? '';
        return note(cellText(raw, col.fieldType), CELL_SIZE);
      }),
    );

    const m = font.metrics;
    const scale = 1000 / m.unitsPerEm;
    const bbox = [
      Math.round(m.xMin * scale),
      Math.round(m.yMin * scale),
      Math.round(m.xMax * scale),
      Math.round(m.yMax * scale),
    ];
    const ascent = Math.round(m.ascent * scale);
    const descent = Math.round(m.descent * scale);

    const usedGids = [...new Set(used.map((u) => u.gid))].sort((a, b) => a - b);
    const wParts = usedGids.map((gid) => {
      const w = Math.round(pdfWidth(font.advance(gid), m.unitsPerEm));
      return `${gid} [${w}]`;
    });

    const pdf = new PdfBuilder();
    pdf.addAscii('<< /Type /Catalog /Pages 2 0 R >>\n');
    const pagesObj = 2;
    pdf.addAscii('<< /Type /Pages /Kids [] /Count 0 >>\n');

    const fontFile = pdf.addFlate(font.bytes, `/Length1 ${font.bytes.length} `);
    const descriptor = pdf.addAscii(
      `<< /Type /FontDescriptor /FontName /Vazirmatn /Flags 32 /FontBBox [${bbox.join(' ')}] /ItalicAngle 0 /Ascent ${ascent} /Descent ${descent} /CapHeight ${ascent} /StemV 80 /FontFile2 ${fontFile} 0 R >>\n`,
    );
    const cidFont = pdf.addAscii(
      `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Vazirmatn /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /DW 500 /W [${wParts.join(' ')}] /CIDToGIDMap /Identity >>\n`,
    );
    const toUnicode = pdf.addFlate(
      new TextEncoder().encode(toUnicodeCmap(used)),
    );
    const type0 = pdf.addAscii(
      `<< /Type /Font /Subtype /Type0 /BaseFont /Vazirmatn /Encoding /Identity-H /DescendantFonts [${cidFont} 0 R] /ToUnicode ${toUnicode} 0 R >>\n`,
    );

    const rowsPerPage = Math.floor(
      (PAGE_H - MARGIN * 2 - TITLE_SIZE - 16 - HEADER_H) / ROW_H,
    );
    const pageCount = Math.max(1, Math.ceil(body.length / Math.max(1, rowsPerPage)));
    const pageObjNums: number[] = [];

    const drawCell = (
      ops: string[],
      col: number,
      top: number,
      height: number,
      text: string,
      header: boolean,
    ) => {
      const x = rtl
        ? PAGE_W - MARGIN - (col + 1) * colW
        : MARGIN + col * colW;
      if (header) {
        ops.push('0.92 g');
        ops.push(`${x.toFixed(2)} ${(top - height).toFixed(2)} ${colW.toFixed(2)} ${height.toFixed(2)} re f`);
        ops.push('0 g');
      }
      ops.push('0.55 w 0.35 g');
      ops.push(`${x.toFixed(2)} ${(top - height).toFixed(2)} ${colW.toFixed(2)} ${height.toFixed(2)} re S`);
      ops.push('0 g');
      const fitted = fitText(font, text, CELL_SIZE, colW - 6);
      const gids = toGids(font, fitted);
      const tw = measure(font, fitted, CELL_SIZE);
      const tx = rtl ? x + colW - 3 - tw : x + 3;
      const ty = top - height + 4.5;
      ops.push('BT');
      ops.push(`/F1 ${CELL_SIZE} Tf`);
      ops.push(`${tx.toFixed(2)} ${ty.toFixed(2)} Td`);
      ops.push(`<${pdfEscapeTextHex(gids)}> Tj`);
      ops.push('ET');
    };

    for (let p = 0; p < pageCount; p += 1) {
      const ops: string[] = [];
      ops.push('BT');
      ops.push(`/F1 ${TITLE_SIZE} Tf`);
      const titleW = measure(font, titleVisual, TITLE_SIZE);
      const titleX = rtl ? PAGE_W - MARGIN - titleW : MARGIN;
      ops.push(`${titleX.toFixed(2)} ${(PAGE_H - MARGIN - 12).toFixed(2)} Td`);
      ops.push(`<${pdfEscapeTextHex(toGids(font, titleVisual))}> Tj`);
      ops.push('ET');

      let y = PAGE_H - MARGIN - 28;
      headers.forEach((h, col) => drawCell(ops, col, y, HEADER_H, h, true));
      y -= HEADER_H;

      const start = p * rowsPerPage;
      const slice = body.slice(start, start + rowsPerPage);
      for (const row of slice) {
        row.forEach((cell, col) => drawCell(ops, col, y, ROW_H, cell, false));
        y -= ROW_H;
      }

      const content = pdf.addFlate(
        new TextEncoder().encode(ops.join('\n') + '\n'),
      );
      const pageNo = pdf.addAscii(
        `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${content} 0 R /Resources << /Font << /F1 ${type0} 0 R >> >> >>\n`,
      );
      pageObjNums.push(pageNo);
    }

    const kids = pageObjNums.map((n) => `${n} 0 R`).join(' ');
    pdf.replaceAscii(
      pagesObj,
      `<< /Type /Pages /Kids [${kids}] /Count ${pageObjNums.length} >>\n`,
    );

    const bytes = pdf.build();
    return new Blob([bytes] as BlobPart[], { type: 'application/pdf' });
  }
}
