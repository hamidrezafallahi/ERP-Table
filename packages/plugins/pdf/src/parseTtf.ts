/** Minimal TrueType reader for CIDFontType2 embedding (cmap + metrics). */

export type TtfMetrics = {
  unitsPerEm: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  ascent: number;
  descent: number;
  italicAngle: number;
  numGlyphs: number;
};

export type ParsedTtf = {
  bytes: Uint8Array;
  metrics: TtfMetrics;
  glyphId: (codePoint: number) => number;
  advance: (glyphId: number) => number;
};

function u16(buf: Uint8Array, offset: number): number {
  return (buf[offset] << 8) | buf[offset + 1];
}

function u32(buf: Uint8Array, offset: number): number {
  return (
    ((buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3]) >>>
    0
  );
}

function i16(buf: Uint8Array, offset: number): number {
  const v = u16(buf, offset);
  return v > 32767 ? v - 65536 : v;
}

function tagAt(buf: Uint8Array, offset: number): string {
  return String.fromCharCode(buf[offset], buf[offset + 1], buf[offset + 2], buf[offset + 3]);
}

function tableMap(buf: Uint8Array): Map<string, { offset: number; length: number }> {
  const numTables = u16(buf, 4);
  const tables = new Map<string, { offset: number; length: number }>();
  for (let i = 0; i < numTables; i += 1) {
    const o = 12 + i * 16;
    tables.set(tagAt(buf, o), { offset: u32(buf, o + 8), length: u32(buf, o + 12) });
  }
  return tables;
}

function parseCmap(buf: Uint8Array, cmapOffset: number): (code: number) => number {
  const numTables = u16(buf, cmapOffset + 2);
  let format4 = -1;
  let format12 = -1;
  for (let i = 0; i < numTables; i += 1) {
    const rec = cmapOffset + 4 + i * 8;
    const platform = u16(buf, rec);
    const encoding = u16(buf, rec + 2);
    const offset = cmapOffset + u32(buf, rec + 4);
    const format = u16(buf, offset);
    if (format === 12 && (platform === 3 || platform === 0)) format12 = offset;
    if (format === 4 && (platform === 3 || platform === 0) && encoding <= 1) {
      format4 = offset;
    }
  }

  if (format12 >= 0) {
    const nGroups = u32(buf, format12 + 12);
    const groups: Array<{ start: number; end: number; glyph: number }> = [];
    for (let i = 0; i < nGroups; i += 1) {
      const o = format12 + 16 + i * 12;
      groups.push({
        start: u32(buf, o),
        end: u32(buf, o + 4),
        glyph: u32(buf, o + 8),
      });
    }
    return (code: number) => {
      for (const g of groups) {
        if (code >= g.start && code <= g.end) return g.glyph + (code - g.start);
      }
      return 0;
    };
  }

  if (format4 < 0) {
    return () => 0;
  }

  const segCount = u16(buf, format4 + 6) / 2;
  const endCodes = format4 + 14;
  const startCodes = endCodes + 2 + segCount * 2;
  const idDeltas = startCodes + segCount * 2;
  const idRangeOffsets = idDeltas + segCount * 2;

  return (code: number) => {
    for (let i = 0; i < segCount; i += 1) {
      const end = u16(buf, endCodes + i * 2);
      if (code > end) continue;
      const start = u16(buf, startCodes + i * 2);
      if (code < start) return 0;
      const rangeOffset = u16(buf, idRangeOffsets + i * 2);
      const delta = i16(buf, idDeltas + i * 2);
      if (rangeOffset === 0) return (code + delta) & 0xffff;
      const glyphOffset =
        idRangeOffsets + i * 2 + rangeOffset + (code - start) * 2;
      const glyph = u16(buf, glyphOffset);
      if (glyph === 0) return 0;
      return (glyph + delta) & 0xffff;
    }
    return 0;
  };
}

export function parseTtf(bytes: Uint8Array): ParsedTtf {
  const tables = tableMap(bytes);
  const head = tables.get('head');
  const hhea = tables.get('hhea');
  const hmtx = tables.get('hmtx');
  const maxp = tables.get('maxp');
  const cmap = tables.get('cmap');
  if (!head || !hhea || !hmtx || !maxp || !cmap) {
    throw new Error('VAZIRMATN_TTF_TABLES');
  }

  const unitsPerEm = u16(bytes, head.offset + 18);
  const metrics: TtfMetrics = {
    unitsPerEm,
    xMin: i16(bytes, head.offset + 36),
    yMin: i16(bytes, head.offset + 38),
    xMax: i16(bytes, head.offset + 40),
    yMax: i16(bytes, head.offset + 42),
    ascent: i16(bytes, hhea.offset + 4),
    descent: i16(bytes, hhea.offset + 6),
    italicAngle: 0,
    numGlyphs: u16(bytes, maxp.offset + 4),
  };

  const numberOfHMetrics = u16(bytes, hhea.offset + 34);
  const advances = new Uint16Array(metrics.numGlyphs);
  for (let i = 0; i < numberOfHMetrics; i += 1) {
    advances[i] = u16(bytes, hmtx.offset + i * 4);
  }
  const lastAdvance = advances[numberOfHMetrics - 1] ?? metrics.unitsPerEm;
  for (let i = numberOfHMetrics; i < metrics.numGlyphs; i += 1) {
    advances[i] = lastAdvance;
  }

  const glyphId = parseCmap(bytes, cmap.offset);
  return {
    bytes,
    metrics,
    glyphId,
    advance: (gid) => advances[gid] ?? lastAdvance,
  };
}

export function pdfWidth(advance: number, unitsPerEm: number): number {
  return (advance * 1000) / unitsPerEm;
}
