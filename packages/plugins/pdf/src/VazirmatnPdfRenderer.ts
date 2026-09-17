import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import type {
  PdfRenderOptions,
  PdfRenderer,
} from '../../../../application/ports/PdfRenderer';
import { formatExportValue } from '../../excel/src/formatExportValue';
import type { DocumentPdfTemplate } from './documentTemplate';
import { PdfBuilder, pdfEscapeTextHex } from './pdfBuilder';
import { parseTtf, pdfWidth, type ParsedTtf } from './parseTtf';
import { rtlVisual } from './shapeRtl';

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 36;
const TITLE_SIZE = 12;
const SUB_SIZE = 9;
const CELL_SIZE = 8;
const ROW_H = 16;
const HEADER_H = 18;
const FOOTER_H = 22;
const SIGN_H = 56;

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

function fitText(
  font: ParsedTtf,
  text: string,
  size: number,
  maxWidth: number,
): string {
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

function toSumNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.trunc(raw);
  if (typeof raw === 'bigint') {
    const n = Number(raw);
    return Number.isSafeInteger(n) ? n : null;
  }
  if (typeof raw === 'string') {
    const n = Number(
      raw
        .trim()
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/,/g, ''),
    );
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return null;
}

function readJpegSize(bytes: Uint8Array): { w: number; h: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1]!;
    const len = (bytes[i + 2]! << 8) | bytes[i + 3]!;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const h = (bytes[i + 5]! << 8) | bytes[i + 6]!;
      const w = (bytes[i + 7]! << 8) | bytes[i + 8]!;
      return { w, h };
    }
    i += 2 + len;
  }
  return null;
}

/**
 * Persian table PDF: embeds Vazirmatn (OFL) as CIDFontType2, RTL grid, no 8×40 cap.
 * PR-141: optional {@link DocumentPdfTemplate} for document chrome.
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
    options?: PdfRenderOptions,
  ): Promise<Blob> {
    const font = parseTtf(this.fontBytes);
    const rtl = options?.direction !== 'ltr';
    const template = options?.template as DocumentPdfTemplate | undefined;
    const title =
      template?.header?.title ?? options?.title ?? 'اقلام سند';
    const columns = source.columns.filter((c) => c.fieldName !== 'index');
    const colCount = Math.max(1, columns.length);
    const tableWidth = PAGE_W - MARGIN * 2;
    const colW = tableWidth / colCount;
    const used: Array<{ gid: number; unicode: number }> = [];

    const note = (text: string) => {
      const visual = rtl ? rtlVisual(text) : text;
      for (const ch of visual) {
        const cp = ch.codePointAt(0) ?? 0;
        used.push({ gid: font.glyphId(cp), unicode: cp });
      }
      return visual;
    };

    const titleVisual = note(title);
    const subtitleVisual = template?.header?.subtitle
      ? note(template.header.subtitle)
      : null;
    const metaVisuals = (template?.header?.meta ?? []).map((m) => note(m));
    const footerTextVisual = template?.footer?.text
      ? note(template.footer.text)
      : null;
    const pageFmt = template?.footer?.pageNumberFormat ?? '{page} / {pages}';
    const showPageNumber =
      template != null && template.footer?.showPageNumber !== false;
    const repeatHeader = template == null || template.repeatTableHeader !== false;
    const totalsLabelVisual = template?.pageTotals
      ? note(template.pageTotals.label ?? 'جمع صفحه')
      : null;
    const signLabelVisual = template?.signature
      ? note(template.signature.label ?? 'امضا')
      : null;
    const stampLabelVisual = template?.stamp
      ? note(template.stamp.label ?? 'مهر')
      : null;

    // Pre-register digits / separators used in page numbers & totals
    note('0123456789 /');

    const headers = columns.map((c) =>
      note(c.fieldCaption ?? c.fieldName),
    );
    const body = source.rows.map((row) =>
      columns.map((col) => {
        const cell = row.cells[col.fieldName];
        const raw = cell?.display ?? cell?.value ?? '';
        return note(cellText(raw, col.fieldType));
      }),
    );
    const bodyNums = source.rows.map((row) => {
      const map = new Map<string, number | null>();
      for (const col of columns) {
        const cell = row.cells[col.fieldName];
        const raw = cell?.value ?? cell?.display ?? '';
        map.set(col.fieldName, toSumNumber(raw));
      }
      return map;
    });

    let logoDrawW = template?.logo?.width ?? 64;
    let logoDrawH = template?.logo?.height ?? 48;
    if (template?.logo?.jpegBytes?.byteLength) {
      const size = readJpegSize(template.logo.jpegBytes);
      if (size && template.logo.height == null) {
        logoDrawH = Math.round((logoDrawW * size.h) / Math.max(1, size.w));
      }
    }

    const headerBand = template
      ? Math.max(
          logoDrawH,
          28 + (subtitleVisual ? 14 : 0) + metaVisuals.length * 12,
        ) + 12
      : TITLE_SIZE + 16;
    const footerBand =
      template && (footerTextVisual || showPageNumber) ? FOOTER_H + 8 : 0;
    const signBand =
      template && (signLabelVisual || stampLabelVisual) ? SIGN_H + 8 : 0;
    const totalsBand = template?.pageTotals ? ROW_H + 4 : 0;

    const usable = (withSign: boolean) =>
      PAGE_H -
      MARGIN * 2 -
      headerBand -
      footerBand -
      (repeatHeader ? HEADER_H : 0) -
      totalsBand -
      (withSign ? signBand : 0);

    const pageRowCounts: number[] = [];
    let remaining = body.length;
    if (remaining === 0) {
      pageRowCounts.push(0);
    } else {
      while (remaining > 0) {
        const isLikelyLast = remaining <= Math.floor(usable(false) / ROW_H);
        const budget = Math.max(
          1,
          Math.floor(usable(isLikelyLast && signBand > 0) / ROW_H),
        );
        const take = Math.min(remaining, budget);
        pageRowCounts.push(take);
        remaining -= take;
        if (pageRowCounts.length > 10_000) break;
      }
      if (signBand > 0) {
        const lastBudget = Math.max(1, Math.floor(usable(true) / ROW_H));
        const lastIdx = pageRowCounts.length - 1;
        if ((pageRowCounts[lastIdx] ?? 0) > lastBudget) {
          const overflow = (pageRowCounts[lastIdx] ?? 0) - lastBudget;
          pageRowCounts[lastIdx] = lastBudget;
          pageRowCounts.push(overflow);
        }
      }
    }
    const pageCount = Math.max(1, pageRowCounts.length);

    // Register page-number & totals glyph strings before embedding the font
    const pageLabels = Array.from({ length: pageCount }, (_, p) =>
      note(
        pageFmt
          .replace('{page}', String(p + 1))
          .replace('{pages}', String(pageCount)),
      ),
    );
    const pageTotalCells: string[][] = pageRowCounts.map((take, p) => {
      if (!template?.pageTotals || !totalsLabelVisual) return [];
      const start = pageRowCounts
        .slice(0, p)
        .reduce((a, n) => a + n, 0);
      const numSlice = bodyNums.slice(start, start + take);
      const sums = new Map<string, number>();
      for (const colId of template.pageTotals.columns) {
        let s = 0;
        for (const row of numSlice) {
          const n = row.get(colId);
          if (n != null) s += n;
        }
        sums.set(colId, s);
      }
      return columns.map((col, colIdx) => {
        const isTotalCol = template.pageTotals!.columns.includes(col.fieldName);
        if (isTotalCol) return note(String(sums.get(col.fieldName) ?? 0));
        const labelCol = columns.findIndex(
          (c) => !template.pageTotals!.columns.includes(c.fieldName),
        );
        if (colIdx === (labelCol >= 0 ? labelCol : 0)) return totalsLabelVisual;
        return '';
      });
    });

    const metrics = font.metrics;
    const scale = 1000 / metrics.unitsPerEm;
    const bbox = [
      Math.round(metrics.xMin * scale),
      Math.round(metrics.yMin * scale),
      Math.round(metrics.xMax * scale),
      Math.round(metrics.yMax * scale),
    ];
    const ascent = Math.round(metrics.ascent * scale);
    const descent = Math.round(metrics.descent * scale);

    const usedGids = [...new Set(used.map((u) => u.gid))].sort((a, b) => a - b);
    const wParts = usedGids.map((gid) => {
      const w = Math.round(pdfWidth(font.advance(gid), metrics.unitsPerEm));
      return `${gid} [${w}]`;
    });

    const pdf = new PdfBuilder();
    pdf.addAscii('<< /Type /Catalog /Pages 2 0 R >>\n');
    const pagesObj = 2;
    pdf.addAscii('<< /Type /Pages /Kids [] /Count 0 >>\n');

    const fontFile = pdf.addFlate(
      font.bytes,
      `/Length1 ${font.bytes.length} `,
    );
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

    let logoXObject: number | null = null;
    if (template?.logo?.jpegBytes?.byteLength) {
      const jpeg = template.logo.jpegBytes;
      const size = readJpegSize(jpeg) ?? { w: logoDrawW, h: logoDrawH };
      logoXObject = pdf.addRawStream(
        jpeg,
        `<< /Type /XObject /Subtype /Image /Width ${size.w} /Height ${size.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
      );
    }

    const pageObjNums: number[] = [];

    const drawText = (
      ops: string[],
      text: string,
      size: number,
      x: number,
      y: number,
    ) => {
      ops.push('BT');
      ops.push(`/F1 ${size} Tf`);
      ops.push(`${x.toFixed(2)} ${y.toFixed(2)} Td`);
      ops.push(`<${pdfEscapeTextHex(toGids(font, text))}> Tj`);
      ops.push('ET');
    };

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
        ops.push(
          `${x.toFixed(2)} ${(top - height).toFixed(2)} ${colW.toFixed(2)} ${height.toFixed(2)} re f`,
        );
        ops.push('0 g');
      }
      ops.push('0.55 w 0.35 g');
      ops.push(
        `${x.toFixed(2)} ${(top - height).toFixed(2)} ${colW.toFixed(2)} ${height.toFixed(2)} re S`,
      );
      ops.push('0 g');
      if (!text) return;
      const fitted = fitText(font, text, CELL_SIZE, colW - 6);
      const tw = measure(font, fitted, CELL_SIZE);
      const tx = rtl ? x + colW - 3 - tw : x + 3;
      const ty = top - height + 4.5;
      drawText(ops, fitted, CELL_SIZE, tx, ty);
    };

    let rowCursor = 0;
    for (let p = 0; p < pageCount; p += 1) {
      const ops: string[] = [];
      const isLast = p === pageCount - 1;
      let y = PAGE_H - MARGIN;

      if (template) {
        if (logoXObject != null) {
          const lx = rtl ? PAGE_W - MARGIN - logoDrawW : MARGIN;
          const ly = y - logoDrawH;
          ops.push('q');
          ops.push(
            `${logoDrawW} 0 0 ${logoDrawH} ${lx.toFixed(2)} ${ly.toFixed(2)} cm /Im1 Do`,
          );
          ops.push('Q');
        }
        const textOriginX = rtl
          ? PAGE_W -
            MARGIN -
            (logoXObject != null ? logoDrawW + 10 : 0)
          : MARGIN + (logoXObject != null ? logoDrawW + 10 : 0);
        let ty = y - 12;
        const tw = measure(font, titleVisual, TITLE_SIZE);
        drawText(
          ops,
          titleVisual,
          TITLE_SIZE,
          rtl ? textOriginX - tw : textOriginX,
          ty,
        );
        ty -= 14;
        if (subtitleVisual) {
          const sw = measure(font, subtitleVisual, SUB_SIZE);
          drawText(
            ops,
            subtitleVisual,
            SUB_SIZE,
            rtl ? textOriginX - sw : textOriginX,
            ty,
          );
          ty -= 12;
        }
        for (const meta of metaVisuals) {
          const mw = measure(font, meta, SUB_SIZE);
          drawText(
            ops,
            meta,
            SUB_SIZE,
            rtl ? textOriginX - mw : textOriginX,
            ty,
          );
          ty -= 12;
        }
        y = PAGE_H - MARGIN - headerBand;
      } else {
        const titleW = measure(font, titleVisual, TITLE_SIZE);
        drawText(
          ops,
          titleVisual,
          TITLE_SIZE,
          rtl ? PAGE_W - MARGIN - titleW : MARGIN,
          y - 12,
        );
        y = PAGE_H - MARGIN - headerBand;
      }

      if (repeatHeader || p === 0) {
        headers.forEach((h, col) => drawCell(ops, col, y, HEADER_H, h, true));
        y -= HEADER_H;
      }

      const take = pageRowCounts[p] ?? 0;
      const slice = body.slice(rowCursor, rowCursor + take);
      for (const row of slice) {
        row.forEach((cell, col) => drawCell(ops, col, y, ROW_H, cell, false));
        y -= ROW_H;
      }

      const totalRow = pageTotalCells[p];
      if (totalRow && totalRow.length > 0) {
        totalRow.forEach((text, colIdx) =>
          drawCell(ops, colIdx, y, ROW_H, text, true),
        );
        y -= ROW_H;
      }

      if (isLast && (signLabelVisual || stampLabelVisual)) {
        const boxW = (tableWidth - 12) / 2;
        const boxH = SIGN_H - 8;
        const by = MARGIN + footerBand + 4;
        const boxes: Array<{ label: string; x: number }> = [];
        if (rtl) {
          if (signLabelVisual) {
            boxes.push({ label: signLabelVisual, x: PAGE_W - MARGIN - boxW });
          }
          if (stampLabelVisual) {
            boxes.push({
              label: stampLabelVisual,
              x: PAGE_W - MARGIN - boxW * 2 - 12,
            });
          }
        } else {
          if (signLabelVisual) boxes.push({ label: signLabelVisual, x: MARGIN });
          if (stampLabelVisual) {
            boxes.push({ label: stampLabelVisual, x: MARGIN + boxW + 12 });
          }
        }
        for (const box of boxes) {
          ops.push('0.55 w 0.35 g');
          ops.push(
            `${box.x.toFixed(2)} ${by.toFixed(2)} ${boxW.toFixed(2)} ${boxH.toFixed(2)} re S`,
          );
          ops.push('0 g');
          const lw = measure(font, box.label, SUB_SIZE);
          drawText(
            ops,
            box.label,
            SUB_SIZE,
            rtl ? box.x + boxW - 6 - lw : box.x + 6,
            by + boxH - 14,
          );
          const lineCount = template?.signature?.lines ?? 2;
          for (let li = 0; li < lineCount; li += 1) {
            const ly = by + 10 + li * 14;
            ops.push('0.4 w 0.6 g');
            ops.push(
              `${(box.x + 8).toFixed(2)} ${ly.toFixed(2)} m ${(box.x + boxW - 8).toFixed(2)} ${ly.toFixed(2)} l S`,
            );
            ops.push('0 g');
          }
        }
      }

      if (footerBand > 0) {
        const fy = MARGIN + 6;
        if (footerTextVisual) {
          const fw = measure(font, footerTextVisual, SUB_SIZE);
          drawText(
            ops,
            footerTextVisual,
            SUB_SIZE,
            rtl ? PAGE_W - MARGIN - fw : MARGIN,
            fy,
          );
        }
        if (showPageNumber) {
          const label = pageLabels[p]!;
          const pw = measure(font, label, SUB_SIZE);
          drawText(
            ops,
            label,
            SUB_SIZE,
            rtl ? MARGIN : PAGE_W - MARGIN - pw,
            fy,
          );
        }
      }

      const content = pdf.addFlate(
        new TextEncoder().encode(ops.join('\n') + '\n'),
      );
      const xobjRes =
        logoXObject != null ? `/XObject << /Im1 ${logoXObject} 0 R >>` : '';
      const pageNo = pdf.addAscii(
        `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${content} 0 R /Resources << /Font << /F1 ${type0} 0 R >> ${xobjRes} >> >>\n`,
      );
      pageObjNums.push(pageNo);
      rowCursor += take;
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
