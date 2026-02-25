import React, {
  useMemo,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import { NoData } from '@components/atoms/iconComponents';

import { UITableController } from '../adapters/ui/UITableController';
import { RowStateEnum } from '../domain/value-objects';
import { TCell } from '../engine/type';
import {
  CellMeta,
  CellRenderer,
} from './cellRenderer';
import { IndexCol } from './indexCol';

interface ERPTableRowProps {
  row: {
    id: number;
    rowState: RowStateEnum;
    cells: Record<string, TCell>;
    isExpanded: boolean;
    moreDetails?: unknown;
  };
  index: number;
  table: any;
  controller: UITableController;
  tableKey: string;
  draggedRowIdRef: React.MutableRefObject<number | null>;
  moreDetailComponent?: React.ComponentType<{ data: unknown }>;
}

function ERPTableRowComponent({
  row,
  index,
  table,
  controller,
  tableKey,
  draggedRowIdRef,
  moreDetailComponent: MoreDetailComponent,
}: ERPTableRowProps) {
  const t = useTranslations();
  const rowNum = row.cells["index"].value as number
  const [dropZone, setDropZone] = useState<"before" | "after" | null>(null);
  const isDeleted = row.rowState === RowStateEnum.Deleted;
  const isActiveRow = controller.isActiveRow(tableKey, row.id);
  const isSelectedRow = controller.isSelectedRow(tableKey, row.id);

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
      controller.onRowSelect(rowNum);
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
    return `
      relative flex items-center border  
      ${isActiveRow ? "border-gray-gray8" : "border-gray-gray5"}
      ${isSelectedRow ? "bg-blue-100" : ""}
      ${
        isDeleted
          ? "!bg-gray-gray5 absolute inset-0 line-through"
          : index % 2
            ? "bg-blue-blue11"
            : "bg-main-white"
      }
      w-full h-9 rounded
    `;
  }, [isActiveRow, isSelectedRow, isDeleted, index]);
  return (
    <>
      <tr
        className={rowClass}
        data-rowid={row.id}
        draggable
        onDragStart={(e) => handleDragStart(e, row.id)}
        onDragOver={handleDragOverLocal}
        onDrop={handleDropLocal}
        onClick={handleRowClick}
        onDoubleClick={handleSelectRow}
      >
        {table.columns
          .filter((c: any) => !c.hidden)
          .map((c: any, idx: number) => {
            const meta: CellMeta = {
              renderType: c.renderType,
              editable: c.editable,
              tableId: tableKey,
              columnId: c.id,
              options: c.options,
              dynamicValue: c.dynamicValue,
              indexOptions: c.indexOptions,
              expandable: c.expandable,
            };

            if (c.id === "index") {
              return (
                <td key={c.id}>
                  <IndexCol
                    tableKey={tableKey}
                    row={row}
                    controller={controller}
                    meta={meta}
                  />
                </td>
              );
            }

            return (
              <td key={c.id} className="w-36">
                <CellRenderer
                  idx={idx}
                  tableKey={tableKey}
                  row={row}
                  columnId={c.id}
                  meta={meta}
                  controller={controller}
                  tabIndex={idx}
                />
              </td>
            );
          })}
      </tr>

      {row.isExpanded && (
        <tr>
          <td>
            {row.moreDetails && MoreDetailComponent ? (
              <MoreDetailComponent data={row.moreDetails} />
            ) : (
              <div className="flex justify-center items-center bg-gray-100 shadow my-1 rounded transition-all duration-300">
                <div className="flex flex-col items-center gap-2 m-12">
                  <NoData config={{ width: 60, height: 60 }} />
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
    prev.table === next.table
  );
});
