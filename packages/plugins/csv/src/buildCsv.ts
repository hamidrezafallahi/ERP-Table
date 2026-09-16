/**
 * CSV export helpers (PR-122). Pure — no React/DOM.
 * Group rows emit a leading key column when `includeGroupColumn` is true,
 * otherwise the group label is written into the first data column.
 */

import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import { buildExportTable } from '../../excel/src/buildExportTable';

export type BuildCsvOptions = {
  /** Default `,` */
  delimiter?: string;
  /** Include a leading "Group" column (default true when any group row). */
  includeGroupColumn?: boolean;
  groupColumnCaption?: string;
};

function escapeCsvCell(value: string, delimiter: string): string {
  if (
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r') ||
    value.includes(delimiter)
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsvText(
  source: ExportSource,
  options: BuildCsvOptions = {},
): string {
  const delimiter = options.delimiter ?? ',';
  const table = buildExportTable(source);
  const hasGroups = (table.rowKinds ?? []).some((k) => k === 'group');
  const includeGroup =
    options.includeGroupColumn ?? hasGroups;
  const groupCaption = options.groupColumnCaption ?? 'Group';

  const header = [
    ...(includeGroup ? [groupCaption] : []),
    ...table.columns.map((c) => c.caption),
  ]
    .map((h) => escapeCsvCell(h, delimiter))
    .join(delimiter);

  const lines = table.rows.map((cells, i) => {
    const kind = table.rowKinds?.[i] ?? 'leaf';
    const groupKey =
      kind === 'group'
        ? (source.rows[i]?.groupKey ?? cells.find((c) => c !== '') ?? '')
        : '';
    const cols = [
      ...(includeGroup ? [kind === 'group' ? groupKey : ''] : []),
      ...cells,
    ];
    return cols.map((c) => escapeCsvCell(c, delimiter)).join(delimiter);
  });

  return [header, ...lines].join('\n');
}

export function buildCsvBlob(
  source: ExportSource,
  options: BuildCsvOptions = {},
): Blob {
  const text = buildCsvText(source, options);
  // UTF-8 BOM helps Excel open Persian CSV correctly.
  return new Blob([`\uFEFF${text}`], { type: 'text/csv;charset=utf-8' });
}
