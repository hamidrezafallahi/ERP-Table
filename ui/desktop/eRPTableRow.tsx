import React, {
  useMemo,
  useState,
} from 'react';

import { useTranslations } from '../host';
import { NoData } from '../primitives';

import { ColumnSchema } from '../../bootstrap/type';
import { columnSizeStyle } from '../../engine/columnWidth';
import { RowStateEnum } from '../../domain/value-objects';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { ariaColIndex, ariaDataRowIndex, gridCellA11y } from '../a11y/gridRoles';
import { indexPinClassName, indexPinDataAttr } from '../columnPin';
import { CellRenderer } from '../cellRenderer';
import { UIRow } from '../type';
import { IndexCol } from './indexCol';

interface ERPTableRowProps {
  row: UIRow;
  index: number;
  stripeIndex: number;
  table: any;
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
  const visibleColumns = (table.columns ?? []).filter((c: ColumnSchema) => !c.hidden);
  const totalColSpan = visibleColumns.length;
  const [dropZone, setDropZone] = useState<"before" | "after" | null>(null);
  const isDeleted = row.rowState === RowStateEnum.Deleted;

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
        aria-rowindex={ariaDataRowIndex(index)}
        className={rowClass}
        data-rowid={row.id}
        draggable
        onDragStart={(e) => handleDragStart(e, row.id)}
        onDragOver={handleDragOverLocal}
        onDrop={handleDropLocal}
        onClick={handleRowClick}
        onDoubleClick={handleSelectRow}
      >
        {visibleColumns.map((c: ColumnSchema, idx: number) => {
          const meta: ColumnSchema = {
            ...c,
            enableDeleteButton: c.enableDeleteButton ?? true,
            enableExpandButton: c.enableExpandButton ?? true,
            enableMoveButton: c.enableMoveButton ?? true,
            enableOptionsButton: c.enableOptionsButton ?? true,
          };

          if (c.fieldName === "index" || c.fieldType === "index") {
            return (
              <td
                role="gridcell"
                aria-colindex={ariaColIndex(idx)}
                {...gridCellA11y(tableKey, row.id, c.fieldName, table.activeCell)}
                className={`p-0 h-full overflow-hidden border ${indexPinClassName(c)}`}
                key={c.fieldName}
                data-columnid={c.fieldName}
                data-erp-col-pin={indexPinDataAttr(c)}
                style={columnSizeStyle(c, table.columnWidths)}
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

          return (
            <td
              key={c.fieldName}
              role="gridcell"
              aria-colindex={ariaColIndex(idx)}
              {...gridCellA11y(tableKey, row.id, c.fieldName, table.activeCell)}
              className="p-0 h-full overflow-hidden border"
              data-columnid={c.fieldName}
              style={columnSizeStyle(c, table.columnWidths)}
            >
              <CellRenderer
                idx={idx}
                tableKey={tableKey}
                row={row}
                columnId={c.fieldName}
                meta={meta}
                controller={controller}
                tabIndex={idx}
                mode="cell"
              />
            </td>
          );
        })}
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
    prev.table === next.table &&
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isCut === next.isCut &&
    prev.table?.activeCell?.rowId === next.table?.activeCell?.rowId &&
    prev.table?.activeCell?.columnId === next.table?.activeCell?.columnId
  );
});
