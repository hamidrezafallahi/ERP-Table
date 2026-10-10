/**
 * Streaming xlsx export for page-window mode (persistence 'paged-idb').
 *
 * Memory Iron Rule: two cursor passes over IndexedDB (columns-with-data, then
 * chunk-by-chunk XML coalesced into Blobs) — the dataset is never in the heap.
 * Ported from the arianERP host table; used by `exportActiveCollectionToExcel`
 * when the controller is in paged mode.
 */
import { RowStateEnum } from '../../../../domain/value-objects';
import type { ColumnSchema } from '../../../../domain/types/ColumnSchema';
import type { UITableController } from '../../../../infrastructure/ui/UITableController';
import { formatExportValue } from './formatExportValue';

const EMPTY_PLACEHOLDERS = new Set(['انتخاب کنید', 'select', 'Select']);

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const hasMeaningfulValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

/** Plain serialized cell as streamed from IndexedDB. */
type StreamCell = { value: unknown; originalValue: unknown; display: unknown };
type StreamRecord = {
  rowId: number;
  collection: string;
  sortIndex: number;
  rowState: string;
  cells: Record<string, StreamCell>;
};

const getExportColumns = (controller: UITableController): ColumnSchema[] => {
  const view = controller.getViewState();
  const columns =
    view?.activeCollectionColumn?.length
      ? view.activeCollectionColumn
      : (view?.columns ?? []);

  return columns
    .filter((col) => col.fieldType !== 'index')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

const isExportableRecord = (record: StreamRecord): boolean => {
  if (record.rowState === RowStateEnum.Deleted) return false;

  return Object.entries(record.cells).some(
    ([key, cell]) => key !== 'index' && hasMeaningfulValue(cell.value),
  );
};

const getRecordExportText = (record: StreamRecord, column: ColumnSchema): string => {
  const cell = record.cells[column.fieldName];
  if (!cell) return '';

  const raw = cell.display ?? cell.value;
  if (!hasMeaningfulValue(raw)) return '';

  const text = formatExportValue(raw, column.fieldType).trim();
  if (!text || EMPTY_PLACEHOLDERS.has(text)) return '';

  return text;
};

/** 0-based column index → A, B, … Z, AA, … */
const toColumnLetter = (index: number): string => {
  let n = index + 1;
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 8;
      c = c >>> 0;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

/** Rolling CRC32 over a byte stream (chunk-by-chunk, no full buffer). */
class IncrementalCrc {
  private crc = 0xffffffff;
  private length = 0;

  update(data: Uint8Array): void {
    for (let i = 0; i < data.length; i += 1) {
      this.crc = crcTable[(this.crc ^ data[i]) & 0xff] ^ (this.crc >>> 8);
      this.crc = this.crc >>> 0;
    }
    this.length += data.length;
  }

  finish(): { crc: number; size: number } {
    return { crc: (this.crc ^ 0xffffffff) >>> 0, size: this.length };
  }
}

const textEncoder = new TextEncoder();

type ZipEntry = { name: string; data: Uint8Array<ArrayBuffer> | Blob; crc?: number; size?: number };

/** Minimal ZIP (store / no compression) for OOXML .xlsx. */
const buildZip = (entries: ZipEntry[]): Blob => {
  const parts: BlobPart[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = textEncoder.encode(entry.name);
    const data = entry.data;
    const size =
      entry.size ?? (data instanceof Uint8Array ? data.length : data.size);
    const crc = entry.crc ?? (data instanceof Uint8Array ? crc32(data) : 0);

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); // store
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    parts.push(local, data);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + size;
  }

  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...parts, ...centralParts, end] as BlobPart[], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

const buildStylesXml = (direction: 'rtl' | 'ltr') => {
  // OOXML readingOrder: 1 = LTR, 2 = RTL
  const readingOrder = direction === 'rtl' ? 2 : 1;
  const horizontal = direction === 'rtl' ? 'right' : 'left';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="10"/><name val="Tahoma"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Tahoma"/></font>
    <font><b/><sz val="10"/><name val="Tahoma"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2F5496"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD6EAF8"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFBDD7EE"/></left>
      <right style="thin"><color rgb="FFBDD7EE"/></right>
      <top style="thin"><color rgb="FFBDD7EE"/></top>
      <bottom style="thin"><color rgb="FFBDD7EE"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1" readingOrder="${readingOrder}"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="${horizontal}" vertical="center" readingOrder="${readingOrder}"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment horizontal="${horizontal}" vertical="center" readingOrder="${readingOrder}"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" readingOrder="${readingOrder}"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" readingOrder="${readingOrder}"/>
    </xf>
  </cellXfs>
</styleSheet>`;
};

const inlineStrCell = (ref: string, text: string, styleId: number) =>
  `<c r="${ref}" t="inlineStr" s="${styleId}"><is><t>${escapeXml(text)}</t></is></c>`;

const numberCell = (ref: string, value: number, styleId: number) =>
  `<c r="${ref}" s="${styleId}"><v>${value}</v></c>`;

const recordToRowXml = (
  record: StreamRecord,
  columns: ColumnSchema[],
  excelRow: number,
): string => {
  const isOdd = (excelRow - 2) % 2 === 0;
  const dataStyle = isOdd ? 2 : 3;
  const rowNumStyle = isOdd ? 4 : 5;

  const cells = [
    numberCell(`A${excelRow}`, excelRow - 1, rowNumStyle),
    ...columns.map((col, i) =>
      inlineStrCell(
        `${toColumnLetter(i + 1)}${excelRow}`,
        getRecordExportText(record, col),
        dataStyle,
      ),
    ),
  ].join('');

  return `<row r="${excelRow}" ht="18" customHeight="1">${cells}</row>`;
};

const buildSheetHeaderXml = (
  columns: ColumnSchema[],
  options: { direction: 'rtl' | 'ltr'; rowHeaderLabel: string },
): string => {
  const { direction, rowHeaderLabel } = options;
  const rightToLeft = direction === 'rtl' ? '1' : '0';
  const totalCols = columns.length + 1;

  const colsXml = Array.from({ length: totalCols }, (_, i) => {
    const width = i === 0 ? 6 : 18;
    return `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>`;
  }).join('');

  const headerCells = [
    inlineStrCell('A1', rowHeaderLabel, 1),
    ...columns.map((col, i) =>
      inlineStrCell(
        `${toColumnLetter(i + 1)}1`,
        col.fieldCaption ?? col.fieldName,
        1,
      ),
    ),
  ].join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView workbookViewId="0" rightToLeft="${rightToLeft}"/>
  </sheetViews>
  <cols>${colsXml}</cols>
  <sheetData>
    <row r="1" ht="22" customHeight="1">${headerCells}</row>`;
};

/**
 * Pass 1: stream records to find which columns have data (same semantics as
 * the previous full-array getColumnsWithData) — nothing retained per row.
 */
const findColumnsWithData = async (
  controller: UITableController,
  candidates: ColumnSchema[],
): Promise<ColumnSchema[]> => {
  const pending = new Set(candidates.map((c) => c.fieldName));
  const byField = new Map(candidates.map((c) => [c.fieldName, c]));

  await controller.iterateRowsFromDb('active', async (records) => {
    for (const record of records) {
      if (!isExportableRecord(record)) continue;
      for (const field of Array.from(pending)) {
        if (getRecordExportText(record, byField.get(field)!) !== '') {
          pending.delete(field);
        }
      }
      if (pending.size === 0) return false; // early stop
    }
  });

  return candidates.filter((c) => !pending.has(c.fieldName));
};

/**
 * Pass 2: stream records again, converting each filtered row to an XML chunk
 * immediately. Chunks are coalesced into disk-backed Blobs periodically, so
 * the JS heap holds only the current batch — the full dataset never lands
 * in memory. The sheet's CRC32 and size are computed incrementally so the
 * ZIP entry metadata is known without buffering the whole sheet.
 */
const buildSheetBlobStreaming = async (
  controller: UITableController,
  columns: ColumnSchema[],
  options: { direction: 'rtl' | 'ltr'; rowHeaderLabel: string },
): Promise<{ blob: Blob; rowCount: number; crc: number; size: number }> => {
  const crc = new IncrementalCrc();
  const blobParts: BlobPart[] = [];
  let pendingChunks: Uint8Array[] = [];
  let pendingBytes = 0;
  let rowCount = 0;

  const pushChunk = (text: string) => {
    const bytes = textEncoder.encode(text);
    crc.update(bytes);
    pendingChunks.push(bytes);
    pendingBytes += bytes.length;
    // Coalesce into a Blob so bytes leave the JS heap (browser blob store).
    if (pendingBytes >= 4 * 1024 * 1024) {
      blobParts.push(new Blob(pendingChunks as BlobPart[]));
      pendingChunks = [];
      pendingBytes = 0;
    }
  };

  pushChunk(buildSheetHeaderXml(columns, options));

  await controller.iterateRowsFromDb('active', async (records) => {
    for (const record of records) {
      if (!isExportableRecord(record)) continue;
      rowCount += 1;
      // Excel row numbers are 1-based with the header at row 1.
      pushChunk(recordToRowXml(record, columns, rowCount + 1));
    }
  });

  pushChunk(`
  </sheetData>
</worksheet>`);

  if (pendingChunks.length > 0) {
    blobParts.push(new Blob(pendingChunks as BlobPart[]));
  }

  const { crc: sheetCrc, size } = crc.finish();
  return { blob: new Blob(blobParts), rowCount, crc: sheetCrc, size };
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export type ExportActiveCollectionResult = {
  rowCount: number;
  columnCount: number;
};

export type ExportActiveCollectionOptions = {
  fileName?: string;
  sheetName?: string;
  direction?: 'rtl' | 'ltr';
  rowHeaderLabel?: string;
  /** When false, skip browser download (tests). */
  download?: boolean;
};

/**
 * Exports all meaningful rows of the active collection (streamed from
 * IndexedDB — the source of truth) with column captions to Excel.
 * The dataset streams through in bounded batches; the full row set is never
 * held in the JS heap, so a 50k-row export costs the same heap as a 10-row one.
 * Sheet direction follows app RTL/LTR (Excel / Google Sheets sheet view).
 */
export async function exportActiveCollectionToExcelStreaming(
  controller: UITableController,
  options?: ExportActiveCollectionOptions,
): Promise<ExportActiveCollectionResult> {
  const allColumns = getExportColumns(controller);
  // Two-pass streaming preserves the previous behavior of dropping columns
  // that have no data in any exported row.
  const columns = await findColumnsWithData(controller, allColumns);

  const direction = options?.direction ?? 'rtl';
  const rowHeaderLabel = options?.rowHeaderLabel ?? 'ردیف';
  const sheetName = options?.sheetName ?? 'Sheet1';
  const fileName =
    options?.fileName ??
    `export-${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Yield so UI can paint loading state before the streaming build.
  await new Promise<void>((resolve) => {
    if (typeof setTimeout === 'function') setTimeout(resolve, 0);
    else resolve();
  });

  const { blob: sheetBlob, rowCount, crc: sheetCrc, size: sheetSize } =
    await buildSheetBlobStreaming(controller, columns, {
      direction,
      rowHeaderLabel,
    });

  if (columns.length === 0 && rowCount === 0) {
    throw new Error('NO_COLUMNS');
  }

  const safeSheetName = (sheetName.slice(0, 31) || 'Sheet1').replace(
    /[\\/*?:\[\]]/g,
    '',
  );

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(safeSheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const styles = buildStylesXml(direction);

  const zip = buildZip([
    { name: '[Content_Types].xml', data: textEncoder.encode(contentTypes) },
    { name: '_rels/.rels', data: textEncoder.encode(rootRels) },
    { name: 'xl/workbook.xml', data: textEncoder.encode(workbook) },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: textEncoder.encode(workbookRels),
    },
    { name: 'xl/styles.xml', data: textEncoder.encode(styles) },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: sheetBlob,
      crc: sheetCrc,
      size: sheetSize,
    },
  ]);
  if (options?.download !== false) downloadBlob(zip, fileName);

  // +1 for the synthetic row-number column
  return { rowCount, columnCount: columns.length + 1 };
}
