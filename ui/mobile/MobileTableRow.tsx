import React, { useMemo } from 'react';

import { ColumnSchema } from '../../bootstrap/type';
import { overlayStoredColumnWidth } from '../../engine/columnWidth';
import { RowStateEnum } from '../../domain/value-objects';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { ariaColIndex, ariaDataRowIndex } from '../a11y/gridRoles';
import { indexPinClassName, indexPinDataAttr } from '../columnPin';
import { CellRenderer } from '../cellRenderer';
import { UIRow } from '../type';
import { MobileIndexCol } from './MobileIndexCol';

interface MobileTableRowProps {
  row: UIRow;
  index: number;
  columns: ColumnSchema[];
  controller: UITableController;
  tableKey: string;
  isSelected: boolean;
  isActive: boolean;
  isCut: boolean;
}

function MobileTableRowComponent({
  row,
  index,
  columns,
  controller,
  tableKey,
  isSelected: isSelectedRow,
  isActive: isActiveRow,
  isCut,
}: MobileTableRowProps) {
  const columnWidths = controller.getViewState()?.columnWidths;
  const visibleColumns = columns.filter(
    (c: ColumnSchema) => !c.hidden,
  );
  const isDeleted = row.rowState === RowStateEnum.Deleted;

  const handleRowClick = (e: React.MouseEvent) => {
    controller.onRowClick(row.id, {
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    });
  };

  const rowClass = useMemo(() => {
    return `relative w-full border bg-main-white
      ${isActiveRow ? "border-gray-gray8" : "border-gray-gray5"}
      ${isSelectedRow && !isDeleted ? "bg-blue-100" : ""}
      ${
        isDeleted
          ? "!bg-gray-gray5 absolute inset-0 line-through"
          : isSelectedRow
            ? ""
            : "bg-main-white"
      }
      ${isCut ? " border-dashed opacity-30" : ""}
      h-9 rounded`;
  }, [isActiveRow, isSelectedRow, isDeleted, isCut]);

  return (
    <tr
      role="row"
      aria-rowindex={ariaDataRowIndex(index)}
      className={rowClass}
      data-rowid={row.id}
      onClick={handleRowClick}
    >
      {visibleColumns.map((c: ColumnSchema, idx: number) => {
        const meta: ColumnSchema = {
          ...c,
          enableDeleteButton: c.enableDeleteButton ?? true,
          enableExpandButton: c.enableExpandButton ?? true,
          enableMoveButton: c.enableMoveButton ?? true,
          enableOptionsButton: c.enableOptionsButton ?? true,
        };

        if (c.fieldName === "index") {
          return (
            <td
              className={`p-0 h-full ${indexPinClassName(c)}`}
              key={c.fieldName}
              role="gridcell"
              aria-colindex={ariaColIndex(idx)}
              data-columnid={c.fieldName}
              data-erp-col-pin={indexPinDataAttr(c)}
              style={overlayStoredColumnWidth(c, columnWidths, {})}
            >
              <MobileIndexCol
                idx={index}
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
            className="p-0 h-full"
            data-columnid={c.fieldName}
            style={overlayStoredColumnWidth(c, columnWidths, {})}
          >
            <CellRenderer
              idx={idx}
              tableKey={tableKey}
              row={row}
              columnId={c.fieldName}
              meta={meta}
              controller={controller}
              tabIndex={idx}
              mode="view"
            />
          </td>
        );
      })}
    </tr>
  );
}

export const MobileTableRow = React.memo(
  MobileTableRowComponent,
  (prev, next) => {
    return (
      prev.row === next.row &&
      prev.index === next.index &&
      prev.columns === next.columns &&
      prev.isSelected === next.isSelected &&
      prev.isActive === next.isActive &&
      prev.isCut === next.isCut
    );
  },
);
