import React, { useMemo } from 'react';

import { ColumnSchema } from '../../bootstrap/type';
import { RowStateEnum } from '../../domain/value-objects';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { CellRenderer } from '../cellRenderer';
import { UIRow } from '../type';
import { MobileIndexCol } from './MobileIndexCol';

interface MobileTableRowProps {
  row: UIRow;
  index: number;
  columns: ColumnSchema[];
  controller: UITableController;
  tableKey: string;
}

function MobileTableRowComponent({
  row,
  index,
  columns,
  controller,
  tableKey,
}: MobileTableRowProps) {
  const visibleColumns = columns.filter(
    (c: ColumnSchema) => !c.hidden,
  );
  const isDeleted = row.rowState === RowStateEnum.Deleted;
  const isActiveRow = controller.isActiveRow(row.id);
  const isSelectedRow = controller.isSelectedRow(row.id);
  const isCut = controller.isCutRow(row.id);

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
    <tr className={rowClass} data-rowid={row.id} onClick={handleRowClick}>
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
              className="p-0 h-full"
              key={c.fieldName}
              data-columnid={c.fieldName}
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
            className="p-0 h-full"
            data-columnid={c.fieldName}
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
      prev.controller.isSelectedRow(prev.row.id)
        === next.controller.isSelectedRow(next.row.id) &&
      prev.controller.isActiveRow(prev.row.id)
        === next.controller.isActiveRow(next.row.id)
    );
  },
);
