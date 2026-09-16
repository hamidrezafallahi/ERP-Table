import React, {
  useMemo,
  useState,
} from 'react';

import { useTranslations } from '../host';
import { NoData } from '../primitives';

import { ColumnSchema } from '../../bootstrap/type';
import { columnSizeStyle } from '../../engine/columnWidth';
import {
  cellRangeClassName,
  cellRangeEdgeAttr,
  resolveCellRangePresentation,
} from '../../engine/selection/cellRangePresentation';
import { resolveFillCorner } from '../../engine/selection/fillHandle';
import { FillHandle } from './FillHandle';
import { RowStateEnum } from '../../domain/value-objects';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { ariaColIndex, ariaDataRowIndex, gridCellA11y } from '../a11y/gridRoles';
import { columnPinCellProps } from '../columnPin';
import { CellRenderer } from '../cellRenderer';
import { UIRow } from '../type';
import { useColumnWindowOrAll } from '../virtual/columnWindow';
import { ColumnWindowCells } from '../virtual/ColumnWindowCells';
import { IndexCol } from './indexCol';

interface ERPTableRowProps {
  row: UIRow;
  index: number;
  stripeIndex: number;
  /** Pinned-top row count for aria-rowindex offset (PR-116). */
  pinnedTopCount?: number;
  table: Pick<
    import('../../engine/type').TableViewState,
    'columns' | 'columnWidths' | 'activeCell' | 'cellRanges'
  >;
  controller: UITableController;
  tableKey: string;
  draggedRowIdRef: React.MutableRefObject<number | null>;
  moreDetailComponent?: React.ComponentType<{data: unknown}>;
  isSelected: boolean;
  isActive: boolean;
  isCut: boolean;
}

function ERPTableRowComponent({
  row,
  index,
  stripeIndex,
  pinnedTopCount = 0,
  table,
  controller,
  tableKey,
  draggedRowIdRef,
  moreDetailComponent: MoreDetailComponent,
  isSelected: isSelectedRow,
  isActive: isActiveRow,
  isCut,
}: ERPTableRowProps) {
  const t = useTranslations();
  const colWindow = useColumnWindowOrAll(
    table.columns ?? [],
    table.columnWidths,
  );
  const totalColSpan = colWindow.allVisible.length;
  const [dropZone, setDropZone] = useState<"before" | "after" | null>(null);
  const isDeleted = row.rowState === RowStateEnum.Deleted;
  const cellRanges = controller.getViewState()?.cellRanges ?? [];
  const columnOrder = (table.columns ?? [])
    .filter((c) => !c.hidden)
    .map((c) => c.fieldName);
  const fillCorner = resolveFillCorner(cellRanges, columnOrder);

  const rangeCellProps = (colId: string) => {
    const flags = resolveCellRangePresentation(
      { rowIndex: index, colId },
      cellRanges,
    );
    const edge = cellRangeEdgeAttr(flags);
    return {
      className: cellRangeClassName(flags),
      'data-pdg-cell-range': flags.inRange ? 'true' : undefined,
      'data-pdg-range-edge': edge,
    };
  };

  const handleRowClick = (e: React.MouseEvent) => {
    controller.onRowClick(row.id, {
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    });
  };

  const handleSelectRow = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.target as HTMLElement;
    if (el.tagName !== "TR") return;

    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      controller.onRowSelect(row.id);
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    rowId: number,
  ) => {
    draggedRowIdRef.current = rowId;
    e.dataTransfer.setData("text/plain", String(rowId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverLocal = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    setDropZone(mouseY < rect.height / 2 ? "before" : "after");
  };

  const handleDropLocal = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    if (!dropZone) return;

    const sourceId = draggedRowIdRef.current;
    if (!sourceId || sourceId === row.id) return;
    controller.dispatch({
      type: "ROW_REORDERED",
      draggedRowId: sourceId,
      droppedRowId: row.id,
      position: dropZone,
    });

    setDropZone(null);
  };

  const isGroupedLeaf =
    (controller.getRowGroupColumns?.()?.length ?? 0) > 0;

  const rowClass = useMemo(() => {
    const zebraClass = stripeIndex % 2 ? "bg-blue-blue11" : "bg-main-white";

    return `relative w-full border
      ${isActiveRow ? "border-gray-gray8" : "border-gray-gray5"}
      ${isSelectedRow && !isDeleted ? "bg-blue-100" : ""}
      ${
        isDeleted
          ? "!bg-gray-gray5 absolute inset-0 line-through"
          : isSelectedRow
            ? ""
            : zebraClass
      }
      ${isCut ? " border-dashed opacity-30" : ""}
        h-9 rounded 
    `;
  }, [isActiveRow, isSelectedRow, isDeleted, stripeIndex, isCut]);

  return (
    <>
      <tr
        role="row"
        aria-rowindex={ariaDataRowIndex(index, pinnedTopCount)}
        className={rowClass}
        data-rowid={row.id}
        data-pdg-row-loading={row.loading ? 'true' : undefined}
        aria-busy={row.loading ? true : undefined}
        style={isGroupedLeaf ? { paddingInlineStart: 20 } : undefined}
        draggable={!row.loading}
        onDragStart={(e) => handleDragStart(e, row.id)}
        onDragOver={handleDragOverLocal}
        onDrop={handleDropLocal}
        onClick={handleRowClick}
        onDoubleClick={handleSelectRow}
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
          const meta: ColumnSchema = {
            ...c,
            enableDeleteButton: c.enableDeleteButton ?? true,
            enableExpandButton: c.enableExpandButton ?? true,
            enableMoveButton: c.enableMoveButton ?? true,
            enableOptionsButton: c.enableOptionsButton ?? true,
          };

          if (row.loading) {
            const rangeProps = rangeCellProps(c.fieldName);
            return (
              <td
                key={c.fieldName}
                role="gridcell"
                aria-colindex={ariaColIndex(absoluteColIndex)}
                className={`p-0 h-full overflow-hidden border ${pin.className} ${rangeProps.className}`.trim()}
                data-columnid={c.fieldName}
                data-pdg-row-index={index}
                data-pdg-col-index={absoluteColIndex}
                data-erp-col-pin={pin['data-erp-col-pin']}
                data-pdg-cell-range={rangeProps['data-pdg-cell-range']}
                data-pdg-range-edge={rangeProps['data-pdg-range-edge']}
                style={{ ...columnSizeStyle(c, table.columnWidths, colWindow.layoutWidths), ...pin.style }}
              >
                <div className="pdg-row-skeleton" data-pdg-skeleton>
                  <span className="pdg-row-skeleton__bar" />
                </div>
              </td>
            );
          }

          if (c.fieldName === "index" || c.fieldType === "index") {
            const rangeProps = rangeCellProps(c.fieldName);
            return (
              <td
                role="gridcell"
                aria-colindex={ariaColIndex(absoluteColIndex)}
                {...gridCellA11y(tableKey, row.id, c.fieldName, table.activeCell)}
                className={`p-0 h-full overflow-hidden border ${pin.className} ${rangeProps.className}`.trim()}
                key={c.fieldName}
                data-columnid={c.fieldName}
                data-pdg-row-index={index}
                data-pdg-col-index={absoluteColIndex}
                data-erp-col-pin={pin['data-erp-col-pin']}
                data-pdg-cell-range={rangeProps['data-pdg-cell-range']}
                data-pdg-range-edge={rangeProps['data-pdg-range-edge']}
                style={{ ...columnSizeStyle(c, table.columnWidths, colWindow.layoutWidths), ...pin.style }}
              >
                <IndexCol
                  idx={index}
                  tableKey={tableKey}
                  row={row}
                  controller={controller}
                  meta={meta}
                />
              </td>
            );
          }

          const rangeProps = rangeCellProps(c.fieldName);
          const showFillHandle =
            fillCorner?.rowIndex === index &&
            fillCorner.colId === c.fieldName;
          return (
            <td
              key={c.fieldName}
              role="gridcell"
              aria-colindex={ariaColIndex(absoluteColIndex)}
              {...gridCellA11y(tableKey, row.id, c.fieldName, table.activeCell)}
              className={`p-0 h-full overflow-hidden border relative ${pin.className} ${rangeProps.className}`.trim()}
              data-columnid={c.fieldName}
              data-pdg-row-index={index}
              data-pdg-col-index={absoluteColIndex}
              data-erp-col-pin={pin['data-erp-col-pin']}
              data-pdg-cell-range={rangeProps['data-pdg-cell-range']}
              data-pdg-range-edge={rangeProps['data-pdg-range-edge']}
              style={{ ...columnSizeStyle(c, table.columnWidths, colWindow.layoutWidths), ...pin.style }}
            >
              <CellRenderer
                idx={absoluteColIndex}
                tableKey={tableKey}
                row={row}
                columnId={c.fieldName}
                meta={meta}
                controller={controller}
                tabIndex={-1}
                mode="cell"
              />
              {showFillHandle ? <FillHandle controller={controller} /> : null}
            </td>
          );
          }}
        />
      </tr>

      {row.isExpanded && (
        <tr role="row">
          <td
            role="gridcell"
            colSpan={totalColSpan}
            aria-colindex={1}
            aria-colspan={totalColSpan}
          >
            {MoreDetailComponent ? (
              <MoreDetailComponent data={row} />
            ) : (
              <div className="flex justify-center items-center bg-gray-100 shadow my-1 rounded transition-all duration-300">
                <div className="flex flex-col items-center gap-2 m-12">
                  <NoData config={{width: 60, height: 60}} />
                  <span className="text-gray-gray9 text-md">
                    {t("general.noData")}
                  </span>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export const ERPTableRow = React.memo(ERPTableRowComponent, (prev, next) => {
  return (
    prev.row === next.row &&
    prev.index === next.index &&
    prev.stripeIndex === next.stripeIndex &&
    prev.controller === next.controller &&
    prev.tableKey === next.tableKey &&
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isCut === next.isCut &&
    prev.table.columns === next.table.columns &&
    prev.table.columnWidths === next.table.columnWidths &&
    prev.table.activeCell?.rowId === next.table.activeCell?.rowId &&
    prev.table.activeCell?.columnId === next.table.activeCell?.columnId &&
    prev.table.cellRanges === next.table.cellRanges &&
    prev.moreDetailComponent === next.moreDetailComponent
  );
});
