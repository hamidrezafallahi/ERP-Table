import React, { useRef } from 'react';

import { useTranslations } from 'next-intl';

import { NoData } from '@components/atoms/iconComponents';

import { UITableController } from '../../adapters/ui/UITableController';
import { RowStateEnum } from '../../domain/value-objects';
import { TCell } from '../../engine/type';
import {
  CellMeta,
  CellRenderer,
} from './cellRenderer';
import { IndexCol } from './indexCol';

interface Props {
  controller: UITableController;
  tableId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onActiveRowChange: (rowId: number) => void;
}

export function ERPTableBody({
  controller,
  tableId,
  onActiveRowChange,
}: Props) {
  const t = useTranslations();

  // همه hook‌ها همیشه در بالای کامپوننت
  const dragRowId = useRef<number | null>(null);
  const table = controller.getViewState(tableId);

  const rows: Array<{
    id: number;
    rowState: RowStateEnum;
    cells: Record<string, TCell>;
    isExpanded: boolean;
  }> = table.rows;

  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    rowId: number,
  ) => {
    dragRowId.current = rowId;
    e.dataTransfer.setData("text/plain", String(rowId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableRowElement>,
    targetRowId: number,
  ) => {
    e.preventDefault();
    const sourceId = dragRowId.current;
    if (!sourceId || sourceId === targetRowId) return;
    controller.dispatch({
      type: "ROW_REORDERED",
      draggedRowId: sourceId,
      droppedRowId: targetRowId,
    });
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    dragRowId.current = null;
    e.currentTarget.setAttribute("draggable", "false");
  };
  return (
    <tbody>
      {rows.length === 0 && (
        <tr>
          <td
            colSpan={table.columns.filter((c) => !c.hidden).length}
            className="py-2 text-center"
          >
            <NoData config={{ width: 60, height: 60 }} />
          </td>
        </tr>
      )}

      {rows.map((row, index) => {
        const isEven = index % 2 === 0;
        const isDeleted = row.rowState === RowStateEnum.Deleted;

        return (
          <React.Fragment key={row.id}>
            <tr
              className={`relative flex !items-center border border-gray-gray4
                ${
                  isDeleted
                    ? "!bg-gray-gray5 w-full flex z-10 absolute inset-0 text-gray-gray8 items-center line-through"
                    : ""
                } ${isEven ? "bg-white" : "bg-gray-gray2"} w-full h-9`}
              data-rowid={row.id}
              draggable={false}
              onDragStart={(e) => handleDragStart(e, row.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, row.id)}
              onDragEnd={handleDragEnd}
              onMouseDown={() => onActiveRowChange(row.id)}
            >
              {table.columns
                .filter((c) => !c.hidden)
                .map((c, idx) => {
                  const meta: CellMeta = {
                    renderType: c.renderType,
                    editable: c.editable,
                    tableId,
                    columnId: c.id,
                    options: c.options,
                    dynamicValue: c.dynamicValue,
                    indexOptions: c.indexOptions,
                  };
                  if (c.id === "index") {
                    return (
                      <td key={c.id}>
                        <IndexCol
                          tableId={tableId}
                          row={row}
                          controller={controller}
                          meta={meta}
                        />
                      </td>
                    );
                  } else {
                    return (
                      <td
                        key={c.id}
                        className="flex justify-start items-center w-36 h-full"
                      >
                        <CellRenderer
                          row={row}
                          tableId={tableId}
                          rowId={row.id}
                          columnId={c.id}
                          meta={meta}
                          cell={row.cells[c.id]}
                          controller={controller}
                          onMouseDown={() => onActiveRowChange(row.id)}
                          onFocus={() => onActiveRowChange(row.id)}
                          tabIndex={idx}
                        />
                      </td>
                    );
                  }
                })}
            </tr>
            {row.isExpanded && (
              <tr>
                <td
                  colSpan={table.columns.filter((c) => !c.hidden).length}
                  style={{
                    maxHeight: row.isExpanded ? "500px" : "0px",
                    opacity: row.isExpanded ? 1 : 0,
                    padding: row.isExpanded ? "0.5rem" : "0rem",
                  }}
                  className="flex justify-center items-center bg-gray-100 shadow my-1 rounded overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out"
                >
                  <div className="flex flex-col justify-center items-center gap-2 m-12">
                    <NoData config={{ width: 60, height: 60 }} />
                    <span className="text-gray-gray9 text-md">
                      {t("general.noData")}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  );
}
