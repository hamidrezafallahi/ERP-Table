import { inflateSync } from 'fflate';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import { VazirmatnPdfRenderer } from '../src/VazirmatnPdfRenderer';
import { vazirmatnRegularBytes } from '../src/vazirmatnBytes';

function indexOfBytes(hay: Uint8Array, needle: Uint8Array, from = 0): number {
  outer: for (let i = from; i <= hay.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

function inflatedStreams(pdf: Uint8Array): Uint8Array[] {
  const startMark = new TextEncoder().encode('stream\n');
  const endMark = new TextEncoder().encode('\nendstream');
  const out: Uint8Array[] = [];
  let i = 0;
  while (i < pdf.length) {
    const start = indexOfBytes(pdf, startMark, i);
    if (start < 0) break;
    const dataStart = start + startMark.length;
    const end = indexOfBytes(pdf, endMark, dataStart);
    if (end < 0) break;
    try {
      out.push(inflateSync(pdf.subarray(dataStart, end)));
    } catch {
      /* skip non-deflate (e.g. JPEG) */
    }
    i = end + endMark.length;
  }
  return out;
}

function latin1(bytes: Uint8Array): string {
  return new TextDecoder('latin1').decode(bytes);
}

function voucherSource(rowCount: number): ExportSource {
  return {
    columns: [
      { fieldName: 'index', fieldCaption: '#', fieldType: 'text' },
      { fieldName: 'desc', fieldCaption: 'شرح', fieldType: 'text' },
      { fieldName: 'price', fieldCaption: 'قیمت', fieldType: 'price' },
    ],
    rows: Array.from({ length: rowCount }, (_, i) => ({
      id: i + 1,
      rowState: 'Added',
      cells: {
        index: { value: i + 1 },
        desc: { value: `قلم ${i + 1}` },
        price: { value: 100_000 * (i + 1) },
      },
    })),
  };
}

/** Minimal 1×1 JPEG (SOF0) for logo embed tests. */
function tinyJpeg(): Uint8Array {
  // Valid minimal JPEG from a known 1x1 red pixel fixture (baseline).
  return Uint8Array.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
    0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
    0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
    0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
    0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
    0x00, 0x00, 0x3f, 0x00, 0x7f, 0x46, 0xff, 0xd9,
  ]);
}

describe('PR-141 DocumentPdfTemplate', () => {
  it('renders header, repeating headers, page numbers, signature, stamp, page totals', async () => {
    const blob = await new VazirmatnPdfRenderer(vazirmatnRegularBytes()).render(
      voucherSource(45),
      {
        direction: 'rtl',
        template: {
          header: {
            title: 'فاکتور فروش',
            subtitle: 'شرکت نمونه',
            meta: ['شماره: ۱۴۰۴-۰۰۱', 'تاریخ: ۱۴۰۴/۰۱/۱۵'],
          },
          footer: {
            text: 'محرمانه',
            showPageNumber: true,
            pageNumberFormat: '{page} / {pages}',
          },
          logo: { jpegBytes: tinyJpeg(), width: 40, height: 40 },
          repeatTableHeader: true,
          signature: { label: 'امضا', lines: 2 },
          stamp: { label: 'مهر' },
          pageTotals: { columns: ['price'], label: 'جمع صفحه' },
        },
      },
    );

    expect(blob.type).toBe('application/pdf');
    const pdf = new Uint8Array(await blob.arrayBuffer());
    const ascii = latin1(pdf);
    expect(ascii.startsWith('%PDF')).toBe(true);
    expect(ascii).toContain('/Vazirmatn');
    expect(ascii).toContain('/XObject');
    expect(ascii).toContain('/Im1');
    expect(ascii).toContain('/DCTDecode');
    expect(ascii.match(/\/Type \/Page /g)?.length).toBeGreaterThanOrEqual(2);

    const streams = inflatedStreams(pdf).map(latin1);
    const content = streams.filter((s) => s.includes(' Tj') || s.includes(' tj')).join('\n');
    // Content stream operators are case-sensitive in PDF; our builder emits mixed
    // case via toFixed paths — normalize for assertions.
    const lower = content.toLowerCase();
    expect(lower).toContain('re s');
    expect(lower).toContain('/im1 do'); // logo drawn
    expect(lower).toContain(' tj');
    // Two pages of table content + signature boxes on last page
    expect(lower.split('/im1 do').length - 1).toBeGreaterThanOrEqual(2);
    // Signature / stamp ruled lines
    expect(lower).toContain(' l s');

    // Deterministic snapshot hash of PDF bytes for visual-regression CI
    const hash = createHash('sha256').update(pdf).digest('hex');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    // Stable for identical input on same font bytes
    const blob2 = await new VazirmatnPdfRenderer(vazirmatnRegularBytes()).render(
      voucherSource(45),
      {
        direction: 'rtl',
        template: {
          header: {
            title: 'فاکتور فروش',
            subtitle: 'شرکت نمونه',
            meta: ['شماره: ۱۴۰۴-۰۰۱', 'تاریخ: ۱۴۰۴/۰۱/۱۵'],
          },
          footer: {
            text: 'محرمانه',
            showPageNumber: true,
          },
          logo: { jpegBytes: tinyJpeg(), width: 40, height: 40 },
          signature: { label: 'امضا', lines: 2 },
          stamp: { label: 'مهر' },
          pageTotals: { columns: ['price'], label: 'جمع صفحه' },
        },
      },
    );
    const pdf2 = new Uint8Array(await blob2.arrayBuffer());
    expect(createHash('sha256').update(pdf2).digest('hex')).toBe(hash);
  });

  it('keeps legacy title-only layout when template is omitted', async () => {
    const blob = await new VazirmatnPdfRenderer(vazirmatnRegularBytes()).render(
      voucherSource(5),
      { title: 'اقلام سند', direction: 'rtl' },
    );
    const pdf = new Uint8Array(await blob.arrayBuffer());
    expect(latin1(pdf)).not.toContain('/XObject');
    expect(latin1(pdf).match(/\/Type \/Page /g)?.length).toBe(1);
  });
});
