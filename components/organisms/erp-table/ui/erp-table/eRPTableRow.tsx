import {
  useEffect,
  useState,
} from 'react';

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

interface ERPTableRowProps {
  row: {
    id: number;
    rowState: RowStateEnum;
    cells: Record<string, TCell>;
    isExpanded: boolean;
  };
  index: number;
  table: any;
  controller: UITableController;
  tableKey: string;
  onActiveRowChange: (rowId: number) => void;
  onActiveColChange: (colId: string) => void;
  draggedRowIdRef: React.MutableRefObject<number | null>;
}

export function ERPTableRow({
  row,
  index,
  table,
  controller,
  tableKey,
  onActiveRowChange,
  onActiveColChange,
  draggedRowIdRef,
}: ERPTableRowProps) {
  const [, forceUpdate] = useState(0);
  const t = useTranslations();
  const [dropZone, setDropZone] = useState<"before" | "after" | null>(null);
  const isDeleted = row.rowState === RowStateEnum.Deleted;
  const activeRow = (rowId: number) => {
    controller.dispatch({ type: "UI_ACTIVE_ROW", rowId });
  };
  const isActiveRow = controller.isActiveRow(tableKey, row.id);
  const handleDragOverLocal = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const isUpperHalf = mouseY < rect.height / 2;

    const newZone = isUpperHalf ? "before" : "after";

    if (newZone !== dropZone) {
      setDropZone(newZone);
    }
  };
  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    draggedRowIdRef.current = null;
    e.currentTarget.setAttribute("draggable", "false");
  };
  const handleDragLeaveLocal = () => {
    setDropZone(null);
  };
  const handleDropLocal = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.stopPropagation();

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
  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    rowId: number,
  ) => {
    draggedRowIdRef.current = rowId;
    e.dataTransfer.setData("text/plain", String(rowId));
    e.dataTransfer.effectAllowed = "move";
  };
 

  useEffect(() => {
    if (!controller) return;
    const unsubscribe = controller.subscribeRow(row.id, () => {
      forceUpdate((t) => t + 1);
    });
    return () => unsubscribe?.();
  }, [controller, row.id]);
  if(isActiveRow){
      console.log('ERPTableRow',row.id,isActiveRow)
  }
  return (
    <>
    <tr
      className={`relative flex !items-center border border-gray-gray4
        ${isActiveRow ? "border-gray-gray8" : "border-gray-gray4"}
          ${
            isDeleted
              ? "!bg-gray-gray5 w-full flex z-10 absolute inset-0 text-gray-gray8 items-center line-through"
              : ""
          } ${index % 2 ? "bg-blue-blue11" : "bg-main-white"} w-full h-9`}
      data-rowid={row.id}
      draggable={false}
      onDragStart={(e) => handleDragStart(e, row.id)}
      onDragOver={handleDragOverLocal} //
      onDragLeave={handleDragLeaveLocal} //
      onDrop={handleDropLocal} //
      onDragEnd={handleDragEnd}
      onMouseDownCapture={() => onActiveRowChange(row.id)}
      onClick={() => {
        activeRow(row.id);
      }}
    >
      {table.columns
        .filter((c) => !c.hidden)
        .map((c, idx) => {
          const meta: CellMeta = {
            renderType: c.renderType,
            editable: c.editable,
            tableId: tableKey,
            columnId: c.id,
            options: c.options,
            dynamicValue: c.dynamicValue,
            indexOptions: c.indexOptions,
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
          } else {
            return (
              <td
                key={c.id}
                className="flex justify-start items-center w-36 h-full"
              >
                <CellRenderer
                  row={row}
                  tableKey={tableKey}
                  rowId={row.id}
                  columnId={c.id}
                  meta={meta}
                  cell={row.cells[c.id]}
                  controller={controller}
                  tabIndex={idx}
                  onActiveColChange={onActiveColChange}
                />
              </td>
            );
          }
        })}
    </tr>
      {row.isExpanded && (
        <div
          style={{
            maxHeight: row.isExpanded ? "500px" : "0px",
            opacity: row.isExpanded ? 1 : 0,
            padding: row.isExpanded ? "0.5rem" : "0rem",
          }}
          className="flex justify-center items-center bg-gray-100 shadow my-1 rounded overflow-hidden transition-all duration-300 ease-in-out"
        >
          <div className="flex flex-col justify-center items-center gap-2 m-12">
            <NoData config={{ width: 60, height: 60 }} />
            <span className="text-gray-gray9 text-md">
              {t("general.noData")}
            </span>
          </div>
        </div>
      )}
    </>

  );
}
