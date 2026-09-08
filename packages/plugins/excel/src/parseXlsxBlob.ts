import { strFromU8, unzipSync } from 'fflate';

export type ParsedXlsxSheet = {
  /** First row cells (header captions / field names). */
  headers: string[];
  /** Body rows; each row length matches headers (padded with ''). */
  rows: string[][];
};

const textDecoder = new TextDecoder('utf-8');

function toUint8Array(data: Blob | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  if (data instanceof Uint8Array) return Promise.resolve(data);
  if (data instanceof ArrayBuffer) return Promise.resolve(new Uint8Array(data));
  return data.arrayBuffer().then((buf) => new Uint8Array(buf));
}

function decodeXml(bytes: Uint8Array): string {
  return strFromU8(bytes) || textDecoder.decode(bytes);
}

/** A1 / AA12 → 0-based column index */
function colIndexFromRef(ref: string): number {
  const letters = ref.match(/^([A-Za-z]+)/)?.[1];
  if (!letters) return 0;
  let n = 0;
  for (const ch of letters.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
}

function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  // <si>…<t>…</t>…</si> (may include rich text runs)
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const inner = m[1];
    const parts: string[] = [];
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/gi;
    let tm: RegExpExecArray | null;
    while ((tm = tRe.exec(inner))) {
      parts.push(decodeXmlEntities(tm[1]));
    }
    out.push(parts.join(''));
  }
  return out;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function findSheetPath(
  files: Record<string, Uint8Array>,
  sheetName?: string,
): string {
  const preferred = 'xl/worksheets/sheet1.xml';
  if (!sheetName) {
    if (files[preferred]) return preferred;
    const first = Object.keys(files).find((k) =>
      /^xl\/worksheets\/sheet\d+\.xml$/i.test(k),
    );
    if (!first) throw new Error('NO_SHEET');
    return first;
  }

  const workbook = files['xl/workbook.xml'];
  if (!workbook) throw new Error('NO_WORKBOOK');
  const wbXml = decodeXml(workbook);
  const sheetRe =
    /<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/gi;
  const nameToRid = new Map<string, string>();
  let sm: RegExpExecArray | null;
  while ((sm = sheetRe.exec(wbXml))) {
    nameToRid.set(sm[1], sm[2]);
  }
  const rid = nameToRid.get(sheetName);
  if (!rid) throw new Error('SHEET_NOT_FOUND');

  const rels = files['xl/_rels/workbook.xml.rels'];
  if (!rels) throw new Error('NO_RELS');
  const relsXml = decodeXml(rels);
  const relRe =
    /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/gi;
  let rm: RegExpExecArray | null;
  while ((rm = relRe.exec(relsXml))) {
    if (rm[1] === rid) {
      const target = rm[2].replace(/^\//, '');
      const path = target.startsWith('xl/') ? target : `xl/${target}`;
      if (!files[path]) throw new Error('NO_SHEET');
      return path;
    }
  }
  throw new Error('SHEET_NOT_FOUND');
}

type CellVal = { col: number; text: string };

function parseSheetRows(
  sheetXml: string,
  shared: string[],
): { headers: string[]; rows: string[][] } {
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/gi;
  const matrix: CellVal[][] = [];

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(sheetXml))) {
    const rowXml = rowMatch[1];
    const cells: CellVal[] = [];
    const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/gi;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rowXml))) {
      const attrs = cm[1] ?? cm[3] ?? '';
      const body = cm[2] ?? '';
      const ref = attrs.match(/\br="([^"]+)"/)?.[1] ?? '';
      const t = attrs.match(/\bt="([^"]+)"/)?.[1] ?? '';
      const col = colIndexFromRef(ref);

      let text = '';
      if (t === 'inlineStr') {
        const tm = body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/i);
        text = tm ? decodeXmlEntities(tm[1]) : '';
      } else if (t === 's') {
        const vm = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i);
        const idx = vm ? Number(vm[1]) : -1;
        text = idx >= 0 ? (shared[idx] ?? '') : '';
      } else {
        const vm = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i);
        text = vm ? decodeXmlEntities(vm[1]) : '';
      }
      cells.push({ col, text });
    }
    matrix.push(cells);
  }

  if (matrix.length === 0) {
    return { headers: [], rows: [] };
  }

  const maxCol = Math.max(
    0,
    ...matrix.flatMap((r) => r.map((c) => c.col)),
  );

  const dense = matrix.map((rowCells) => {
    const line = Array.from({ length: maxCol + 1 }, () => '');
    for (const c of rowCells) {
      if (c.col >= 0 && c.col <= maxCol) line[c.col] = c.text;
    }
    return line;
  });

  // Exported files put a row-number column in A; drop it when header looks like ردیف/Row/#.
  const header = dense[0] ?? [];
  const rowHeaderHints = new Set(['ردیف', 'row', '#', 'row · actions', 'row number']);
  const dropFirst =
    header.length > 1 &&
    rowHeaderHints.has(header[0].trim().toLowerCase());

  const slice = (line: string[]) => (dropFirst ? line.slice(1) : line);
  const headers = slice(header).map((h) => h.trim());
  const rows = dense
    .slice(1)
    .map(slice)
    .map((line) => {
      const padded = Array.from({ length: headers.length }, (_, i) => line[i] ?? '');
      return padded;
    })
    .filter((line) => line.some((c) => c.trim() !== ''));

  return { headers, rows };
}

/**
 * Parses a minimal OOXML .xlsx (store or deflate) into a string matrix.
 * Supports shared strings and inlineStr (as produced by buildXlsxBlob).
 */
export async function parseXlsxBlob(
  data: Blob | ArrayBuffer | Uint8Array,
  options?: { sheetName?: string },
): Promise<ParsedXlsxSheet> {
  const bytes = await toUint8Array(data);
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes);
  } catch {
    throw new Error('INVALID_XLSX');
  }

  const sharedPath = Object.keys(files).find((k) =>
    /xl\/sharedStrings\.xml$/i.test(k),
  );
  const shared = sharedPath
    ? parseSharedStrings(decodeXml(files[sharedPath]))
    : [];

  const sheetPath = findSheetPath(files, options?.sheetName);
  return parseSheetRows(decodeXml(files[sheetPath]), shared);
}
