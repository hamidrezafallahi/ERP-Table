import React, {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { AggFuncName } from '../../domain/types/ColumnDef';
import { columnSizeStyle } from '../../engine/columnWidth';
import { isIndexColumn } from '../../engine/columnWidth';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { ariaColIndex, ariaFooterRowIndex } from '../a11y/gridRoles';
import { columnPinCellProps } from '../columnPin';
import { useLocale, useTranslations } from '../host';
import { valueParser } from '../helper';
import { useColumnWindowOrAll } from '../virtual/columnWindow';
import { ColumnWindowCells } from '../virtual/ColumnWindowCells';

/** Multi-row footer aggregation chrome (PR-119 / RFC-002). */
export type FooterRowDef = {
  id: string;
  label?: string;
  /** Override column aggFunc for this row. */
  aggFunc?: AggFuncName;
};

interface Props {
  controller: UITableController;
  footer?: boolean | ReactNode;
  footerRows?: readonly FooterRowDef[];
  dataRowCount?: number;
  pinnedTopCount?: number;
  pinnedBottomCount?: number;
}

const DEFAULT_FOOTER_ROWS: FooterRowDef[] = [{ id: 'default' }];

function resolveFooterRows(
  footer: boolean | ReactNode | undefined,
  footerRows: readonly FooterRowDef[] | undefined,
): FooterRowDef[] | null {
  if (typeof footer !== 'boolean' || footer !== true) return null;
  if (footerRows && footerRows.length > 0) return [...footerRows];
  return DEFAULT_FOOTER_ROWS;
}

export function ERPTableFooter({
  controller,
  footer,
  footerRows,
  dataRowCount,
  pinnedTopCount = 0,
  pinnedBottomCount = 0,
}: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const [aggs, setAggs] = useState<Record<string, unknown>>({});
  const table = controller.getViewState();
  const rows = useMemo(
    () => resolveFooterRows(footer, footerRows),
    [footer, footerRows],
  );

  useEffect(() => {
    const view = controller.getViewState();
    if (!view || !rows) return;
    setAggs(controller.getColumnAggs());
    const unsubscribe = controller.subscribeColumnAggs(setAggs);
    return () => {
      unsubscribe?.();
    };
  }, [controller, rows]);

  const colWindow = useColumnWindowOrAll(
    table?.columns ?? [],
    table?.columnWidths,
  );

  if (!table || !table.columns) return null;
  if (typeof footer !== 'boolean' || footer !== true) {
    if (!footer) return null;
    const visibleColumns = table.columns.filter((c) => !c.hidden);
    const cols = visibleColumns.length;
    const footerRowIndex = ariaFooterRowIndex(
      dataRowCount ?? table.pagination.totalRows,
      pinnedTopCount,
      pinnedBottomCount,
    );
    return (
      <tfoot role="rowgroup" className="erp-table-footer" data-erp-footer="">
        <tr
          role="row"
          aria-rowindex={footerRowIndex}
          className={`w-full border border-gray-gray5 bg-main-white h-9 rounded `}
        >
          <td
            role="gridcell"
            colSpan={cols}
            aria-colindex={1}
            aria-colspan={cols}
          >
            {footer}
          </td>
        </tr>
      </tfoot>
    );
  }

  if (!rows) return null;
  const baseRowIndex = ariaFooterRowIndex(
    dataRowCount ?? table.pagination.totalRows,
    pinnedTopCount,
    pinnedBottomCount,
  );

  return (
    <tfoot role="rowgroup" className="erp-table-footer" data-erp-footer="">
      {rows.map((rowDef, rowOffset) => (
        <tr
          key={rowDef.id}
          role="row"
          aria-rowindex={baseRowIndex + rowOffset}
          data-pdg-footer-row={rowDef.id}
          className={`w-full border border-gray-gray5 bg-main-white !h-9 rounded `}
        >
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
              let content: React.ReactNode = null;
              if (isIndexColumn(c)) {
                content =
                  rowDef.label ??
                  (rowDef.id === 'sum' || rowDef.id === 'default'
                    ? t('general.footerTotal')
                    : rowDef.id === 'avg'
                      ? t('general.footerAvg')
                      : (rowDef.label ?? rowDef.id));
              } else if (rowDef.aggFunc) {
                const value = controller.getColumnAggValue(
                  c.fieldName,
                  rowDef.aggFunc,
                );
                content =
                  value == null
                    ? null
                    : valueParser(value, c.fieldType, locale);
              } else {
                const value = aggs[c.fieldName];
                content =
                  value == null
                    ? null
                    : valueParser(value, c.fieldType, locale);
              }
              return (
                <td
                  key={c.fieldName}
                  role="gridcell"
                  aria-colindex={ariaColIndex(index)}
                  className={pin.className}
                  data-erp-col-pin={pin['data-erp-col-pin']}
                  style={{
                    ...columnSizeStyle(
                      c,
                      table.columnWidths,
                      colWindow.layoutWidths,
                    ),
                    ...pin.style,
                  }}
                >
                  {content}
                </td>
              );
            }}
          />
        </tr>
      ))}
    </tfoot>
  );
}
