import React from 'react';

import { columnSizeStyle } from '../../engine/columnWidth';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import { ariaColIndex, ariaDataRowIndex } from '../a11y/gridRoles';
import { columnPinCellProps } from '../columnPin';
import type { UIRow } from '../type';
import { useColumnWindowOrAll } from '../virtual/columnWindow';
import { ColumnWindowCells } from '../virtual/ColumnWindowCells';

export type ERPTableGroupRowProps = {
  row: UIRow;
  index: number;
  pinnedTopCount?: number;
  table: Pick<
    import('../../engine/type').TableViewState,
    'columns' | 'columnWidths' | 'activeCell'
  >;
  controller: UITableController;
  tableKey: string;
  isSelected: boolean;
  isActive: boolean;
};

/** Synthetic group header row (PR-121). */
function ERPTableGroupRowComponent({
  row,
  index,
  pinnedTopCount = 0,
  table,
  controller,
  isSelected,
  isActive,
}: ERPTableGroupRowProps) {
  const colWindow = useColumnWindowOrAll(
    table.columns ?? [],
    table.columnWidths,
  );
  const expanded = row.groupExpanded !== false;
  const groupField = row.groupField;
  const label = row.groupKey ?? '';
  const hasIndex = colWindow.allVisible.some(
    (col) => col.fieldName === 'index' || col.fieldType === 'index',
  );

  const toggle = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (row.groupKey != null) controller.toggleRowGroup(row.groupKey);
  };

  return (
    <tr
      role="row"
      className={`pdg-group-row font-semibold ${
        isSelected ? 'bg-blue-100' : 'bg-blue-blue11'
      }${isActive ? ' border-gray-gray8' : ' border-gray-gray5'}`}
      data-rowid={row.id}
      data-pdg-row-kind="group"
      data-pdg-group-key={row.groupKey}
      aria-rowindex={ariaDataRowIndex(index, pinnedTopCount)}
      aria-expanded={expanded}
      aria-level={1}
      onClick={(e) =>
        controller.onRowClick(row.id, {
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
        })
      }
      onDoubleClick={(e) => {
        if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          controller.onRowSelect(row.id);
        }
      }}
    >
      <ColumnWindowCells
        window={colWindow}
        spacerElement="td"
        spacerRole="presentation"
        renderColumn={(c, absoluteColIndex) => {
          const pin = columnPinCellProps(
            c,
            colWindow.startPinOffsets,
            colWindow.endPinOffsets,
          );
          const isIndex = c.fieldName === 'index' || c.fieldType === 'index';
          const isGroupField = groupField != null && c.fieldName === groupField;
          const showChevron = isIndex || (isGroupField && !hasIndex);
          const cellValue = isGroupField
            ? label
            : (row.cells[c.fieldName]?.display ??
              row.cells[c.fieldName]?.value ??
              '');

          const chevron = showChevron ? (
            <button
              type="button"
              className="pdg-group-row__chevron inline-flex items-center justify-center w-6 h-6 border-0 bg-transparent cursor-pointer"
              aria-label={expanded ? 'Collapse group' : 'Expand group'}
              aria-expanded={expanded}
              onClick={toggle}
            >
              <span aria-hidden>{expanded ? '▾' : '▸'}</span>
            </button>
          ) : null;

          return (
            <td
              key={c.fieldName}
              role="gridcell"
              aria-colindex={ariaColIndex(absoluteColIndex)}
              className={`p-0 h-full overflow-hidden border ${pin.className}`.trim()}
              data-columnid={c.fieldName}
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
              {isIndex ? (
                <div className="flex items-center h-full px-2">{chevron}</div>
              ) : isGroupField ? (
                <div className="flex items-center gap-1.5 h-full px-2">
                  {chevron}
                  <span>
                    {label}
                    {typeof row.groupChildCount === 'number'
                      ? ` (${row.groupChildCount})`
                      : ''}
                  </span>
                </div>
              ) : (
                <div className="flex items-center h-full px-2 tabular-nums">
                  {cellValue == null || cellValue === ''
                    ? null
                    : String(cellValue)}
                </div>
              )}
            </td>
          );
        }}
      />
    </tr>
  );
}

export const ERPTableGroupRow = React.memo(
  ERPTableGroupRowComponent,
  (prev, next) =>
    prev.row === next.row &&
    prev.index === next.index &&
    prev.controller === next.controller &&
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.table.columns === next.table.columns &&
    prev.table.columnWidths === next.table.columnWidths &&
    prev.pinnedTopCount === next.pinnedTopCount,
);
