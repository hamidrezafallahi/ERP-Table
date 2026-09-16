/**
 * Pinned top/bottom rows (PR-116). Rendered outside the virtual window so
 * they stay fixed while the scroll body moves.
 */

import React from 'react';

import type { ColumnSchema } from '../../bootstrap/type';
import { columnSizeStyle } from '../../engine/columnWidth';
import { readPinnedRowCellValue } from '../../engine/dataOps/pinnedRows';
import { UITableController } from '../../infrastructure/ui/UITableController';
import {
  ariaColIndex,
  ariaPinnedBottomRowIndex,
  ariaPinnedTopRowIndex,
} from '../a11y/gridRoles';
import { columnPinCellProps } from '../columnPin';
import { valueParser } from '../helper';
import { useLocale, type ERPTableLocale } from '../host';
import { useColumnWindowOrAll } from '../virtual/columnWindow';
import { ColumnWindowCells } from '../virtual/ColumnWindowCells';

export type PinnedRowSide = 'top' | 'bottom';

type Props<TRow> = {
  side: PinnedRowSide;
  rows: readonly TRow[];
  controller: UITableController;
  /** Absolute data row count (for bottom aria indices). */
  dataRowCount: number;
  pinnedTopCount: number;
};

function PinnedRowCells<TRow>({
  row,
  columns,
  columnWidths,
  locale,
}: {
  row: TRow;
  columns: ColumnSchema[];
  columnWidths: Record<string, number> | undefined;
  locale: ERPTableLocale;
}) {
  const colWindow = useColumnWindowOrAll(columns, columnWidths);
  return (
    <ColumnWindowCells
      window={colWindow}
      spacerElement="td"
      spacerRole="presentation"
      renderColumn={(c, index) => {
        const pin = columnPinCellProps(
          c,
          colWindow.startPinOffsets,
          colWindow.endPinOffsets,
        );
        const raw = readPinnedRowCellValue(row, c);
        return (
          <td
            key={c.fieldName}
            role="gridcell"
            aria-colindex={ariaColIndex(index)}
            className={pin.className}
            data-erp-col-pin={pin['data-erp-col-pin']}
            style={{
              ...columnSizeStyle(c, columnWidths, colWindow.layoutWidths),
              ...pin.style,
            }}
          >
            {valueParser(raw, c.fieldType, locale)}
          </td>
        );
      }}
    />
  );
}

export function ERPTablePinnedRows<TRow>({
  side,
  rows,
  controller,
  dataRowCount,
  pinnedTopCount,
}: Props<TRow>) {
  const locale = useLocale();
  const view = controller.getViewState();
  if (!view || rows.length === 0) return null;

  const columns = view.columns ?? [];
  const isTop = side === 'top';
  const className = isTop
    ? 'erp-pinned-rows erp-pinned-rows--top'
    : 'erp-pinned-rows erp-pinned-rows--bottom';

  return (
    <tbody
      role="rowgroup"
      className={className}
      data-erp-pinned-top={isTop ? '' : undefined}
      data-erp-pinned-bottom={isTop ? undefined : ''}
    >
      {rows.map((row, index) => {
        const ariaRowindex =
          side === 'top'
            ? ariaPinnedTopRowIndex(index)
            : ariaPinnedBottomRowIndex(index, dataRowCount, pinnedTopCount);
        return (
          <tr
            key={`pinned-${side}-${index}`}
            role="row"
            aria-rowindex={ariaRowindex}
            data-erp-pinned-row={side}
            className="erp-pinned-row"
          >
            <PinnedRowCells
              row={row}
              columns={columns}
              columnWidths={view.columnWidths}
              locale={locale}
            />
          </tr>
        );
      })}
    </tbody>
  );
}
