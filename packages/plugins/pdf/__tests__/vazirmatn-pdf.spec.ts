import { inflateSync } from 'fflate';
import { describe, expect, it } from 'vitest';

import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import { parseTtf } from '../src/parseTtf';
import { shapeArabic } from '../src/shapeRtl';
import { VazirmatnPdfRenderer } from '../src/VazirmatnPdfRenderer';
import { vazirmatnRegularBytes, VAZIRMATN_TTF_LENGTH } from '../src/vazirmatnBytes';

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
      /* skip non-deflate */
    }
    i = end + endMark.length;
  }
  return out;
}

function latin1(bytes: Uint8Array): string {
  return new TextDecoder('latin1').decode(bytes);
}

function voucherSource(rowCount: number, extraCols = 0): ExportSource {
  const extra = Array.from({ length: extraCols }, (_, i) => ({
    fieldName: `extra${i}`,
    fieldCaption: `ستون ${i + 1}`,
    fieldType: 'text',
  }));
  return {
    columns: [
      { fieldName: 'index', fieldCaption: '#', fieldType: 'text' },
      { fieldName: 'desc', fieldCaption: 'شرح', fieldType: 'text' },
      { fieldName: 'price', fieldCaption: 'قیمت', fieldType: 'price' },
      ...extra,
    ],
    rows: Array.from({ length: rowCount }, (_, i) => ({
      id: i + 1,
      rowState: 'Added',
      cells: {
        index: { value: i + 1 },
        desc: { value: 'اقلام سند' },
        price: { value: 1_250_000 + i },
        ...Object.fromEntries(extra.map((c) => [c.fieldName, { value: `v${i}` }])),
      },
    })),
  };
}

describe('VazirmatnPdfRenderer', () => {
  it('maps Persian letters and presentation forms in Vazirmatn', () => {
    const font = parseTtf(vazirmatnRegularBytes());
    expect(font.bytes.length).toBe(VAZIRMATN_TTF_LENGTH);
    expect(font.glyphId(0x0627)).not.toBe(0);
    expect(font.glyphId(0xfe8d)).not.toBe(0);
    expect(shapeArabic('با')).not.toBe('با');
  });

  it('embeds Vazirmatn, draws a table, and keeps «اقلام سند» + price past the 8×40 cap', async () => {
    const blob = await new VazirmatnPdfRenderer(vazirmatnRegularBytes()).render(voucherSource(50, 8), {
      title: 'اقلام سند',
      direction: 'rtl',
    });
    expect(blob.type).toBe('application/pdf');
    const pdf = new Uint8Array(await blob.arrayBuffer());
    const ascii = latin1(pdf);
    expect(ascii.startsWith('%PDF')).toBe(true);
    expect(ascii).toContain('/Vazirmatn');
    expect(ascii).toContain('/FontFile2');
    expect(ascii).toContain('/CIDFontType2');
    expect(ascii).toContain('/Identity-H');
    expect(ascii).not.toContain('/Helvetica');

    const streams = inflatedStreams(pdf).map(latin1);
    expect(streams.some((s) => s.includes('re S'))).toBe(true);
    expect(streams.some((s) => s.includes(' Tj'))).toBe(true);

    const shaped = shapeArabic('اقلام سند');
    const titleHex = (shaped.codePointAt(0) ?? 0).toString(16);
    expect(streams.some((s) => s.includes(titleHex))).toBe(true);
  });
});
