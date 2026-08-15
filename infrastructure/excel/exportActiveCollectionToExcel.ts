import { ColumnSchema } from '../../bootstrap/type';
import { Row } from '../../domain/entities/Row';
import { RowStateEnum } from '../../domain/value-objects';
import { valueParser } from '../../ui/helper';
import { UITableController } from '../ui/UITableController';

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

const getExportRows = (controller: UITableController): Row[] => {
  const rows = controller.getAllRows() ?? [];

  return rows.filter((row) => {
    if (row.rowState.value === RowStateEnum.Deleted) return false;

    return Array.from(row.getCells().entries()).some(
      ([key, cell]) => key !== 'index' && hasMeaningfulValue(cell.getValue()),
    );
  });
};

const getCellExportText = (row: Row, column: ColumnSchema): string => {
  const cell = row.getCells().get(column.fieldName);
  if (!cell) return '';

  const raw = cell.getDisplay() ?? cell.getValue();
  if (!hasMeaningfulValue(raw)) return '';

  const parsed = valueParser(raw, column.fieldType);
  if (parsed == null) return '';

  const text = String(parsed).trim();
  if (!text || EMPTY_PLACEHOLDERS.has(text)) return '';

  return text;
};

const getColumnsWithData = (
  columns: ColumnSchema[],
  rows: Row[],
): ColumnSchema[] =>
  columns.filter((column) =>
    rows.some((row) => getCellExportText(row, column) !== ''),
  );

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
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
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

const textEncoder = new TextEncoder();

type ZipEntry = { name: string; data: Uint8Array };

/** Minimal ZIP (store / no compression) for OOXML .xlsx */
const buildZip = (entries: ZipEntry[]): Blob => {
  const parts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = textEncoder.encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const size = data.length;

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

    offset += local.length + data.length;
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

const buildSheetXml = (
  columns: ColumnSchema[],
  rows: Row[],
  options: {
    direction: 'rtl' | 'ltr';
    rowHeaderLabel: string;
  },
): string => {
  const { direction, rowHeaderLabel } = options;
  // Sheet layout direction (Excel / Google Sheets RTL sheet view)
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

  const bodyRows = rows
    .map((row, rowIndex) => {
      const excelRow = rowIndex + 2;
      const isOdd = rowIndex % 2 === 0;
      const dataStyle = isOdd ? 2 : 3;
      const rowNumStyle = isOdd ? 4 : 5;

      const cells = [
        numberCell(`A${excelRow}`, rowIndex + 1, rowNumStyle),
        ...columns.map((col, i) =>
          inlineStrCell(
            `${toColumnLetter(i + 1)}${excelRow}`,
            getCellExportText(row, col),
            dataStyle,
          ),
        ),
      ].join('');

      return `<row r="${excelRow}" ht="18" customHeight="1">${cells}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView workbookViewId="0" rightToLeft="${rightToLeft}"/>
  </sheetViews>
  <cols>${colsXml}</cols>
  <sheetData>
    <row r="1" ht="22" customHeight="1">${headerCells}</row>
    ${bodyRows}
  </sheetData>
</worksheet>`;
};

const buildXlsxBlob = (
  columns: ColumnSchema[],
  rows: Row[],
  sheetName: string,
  options: {
    direction: 'rtl' | 'ltr';
    rowHeaderLabel: string;
  },
): Blob => {
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

  const styles = buildStylesXml(options.direction);
  const sheet = buildSheetXml(columns, rows, options);

  return buildZip([
    { name: '[Content_Types].xml', data: textEncoder.encode(contentTypes) },
    { name: '_rels/.rels', data: textEncoder.encode(rootRels) },
    { name: 'xl/workbook.xml', data: textEncoder.encode(workbook) },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: textEncoder.encode(workbookRels),
    },
    { name: 'xl/styles.xml', data: textEncoder.encode(styles) },
    { name: 'xl/worksheets/sheet1.xml', data: textEncoder.encode(sheet) },
  ]);
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
};

/**
 * Exports all meaningful rows of the active collection (same data as IndexedDB
 * active collection, via the live controller) with column captions to Excel.
 * Sheet direction follows app RTL/LTR (Excel / Google Sheets sheet view).
 */
export async function exportActiveCollectionToExcel(
  controller: UITableController,
  options?: ExportActiveCollectionOptions,
): Promise<ExportActiveCollectionResult> {
  const rows = getExportRows(controller);
  const columns = getColumnsWithData(getExportColumns(controller), rows);

  if (columns.length === 0 && rows.length === 0) {
    throw new Error('NO_COLUMNS');
  }

  const direction = options?.direction ?? 'rtl';
  const rowHeaderLabel = options?.rowHeaderLabel ?? 'ردیف';
  const sheetName = options?.sheetName ?? 'Sheet1';
  const fileName =
    options?.fileName ??
    `export-${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Yield so UI can paint loading state before sync build.
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

  const blob = buildXlsxBlob(columns, rows, sheetName, {
    direction,
    rowHeaderLabel,
  });
  downloadBlob(blob, fileName);

  // +1 for the synthetic row-number column
  return { rowCount: rows.length, columnCount: columns.length + 1 };
}
