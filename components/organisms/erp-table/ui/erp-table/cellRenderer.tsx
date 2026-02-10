import React, {
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';

import moment from 'moment-jalaali';
import { useLocale } from 'next-intl';

import {
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import { IRequestConfig } from '@type/elementType';

import { UITableController } from '../../adapters/ui/UITableController';
import { FieldType } from '../../bootstrap/type';
import { RowStateEnum } from '../../domain/value-objects';
import {
  ItemType,
  TCell,
} from '../../engine/type';

/* ======================================================
   Types
   ====================================================== */

export type CellMeta = {
  renderType: FieldType;
  editable?: boolean;
  options?: { label: string; value: string }[];
  dynamicValue?: IRequestConfig;
  // store: string;
  // tableKey: string;
  tableId: string;
  columnId: string;
  indexOptions?: (
    tableId: string,
    rowId: number,
    row: {
      id: string | number;
      cells: Record<string, TCell>;
      rowState: RowStateEnum;
      isExpanded: boolean;
    },
    controller: UITableController,
  ) => ItemType[];
};

interface CellRendererProps {
  tableKey: string;
  rowId: number;
  columnId: string;
  cell: TCell;
  meta?: CellMeta;
  controller: UITableController;
  tabIndex: number;
  row: {
    id: number;
    cells: Record<string, TCell>;
    rowState: RowStateEnum;
    isExpanded: boolean;
  };
  onActiveColChange(colId: string): void;
}

/* ======================================================
   Cell Renderer
   ====================================================== */

export const CellRenderer: React.FC<CellRendererProps> = ({
  row,
  rowId,
  tableKey,
  columnId,
  cell,
  meta,
  controller,
  tabIndex,
  onActiveColChange,
}) => {
  const { value, display } = cell;
  const refElement = useRef<HTMLElement>(null);
  const [, forceUpdate] = useState(0);
  const isActive = controller.isActiveCell(tableKey, rowId, columnId);
  const locale = useLocale();
  const dispatchChangeValue = (newValue: unknown) => {
    controller.dispatch({
      type: "UI_CELL_CHANGE",
      rowId,
      columnId,
      value: newValue,
    });
  };
  const dispatchChangeDisplay = (label: string | null) => {
    controller.dispatch({
      type: "UI_CELL_CHANGE_DISPLAY",
      rowId,
      columnId,
      value: label,
    });
  };
  const activeCell = () => {
    controller.dispatch({ type: "UI_ACTIVE_CELL", rowId, columnId });
  };

  const type = meta.renderType;
  const editable = meta.editable;
  const isDeleted = row.rowState === RowStateEnum.Deleted;

  const blockDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const valueParser = (val) => {
    if (val == null || val == undefined) {
      return "—";
    }
    switch (type) {
      case "text":
      case "number":
      case "select":
      case "selectOption":
      case "static":
        return val;

      case "date":
        if (locale === "fa") {
          return moment(val).format("jYYYY/jMM/jDD");
        } else {
          return moment(val).format("YYYY/MM/DD");
        }

      default:
        return "—";
    }
  };
useEffect(() => {
  if (!controller) return;
  const unsubscribe = controller.subscribeCell(rowId, columnId, () => {
    forceUpdate(t => t + 1);
  });
  return () => unsubscribe?.();
}, [controller, rowId, columnId]);
  /* ===== close on outside click ===== */
  // useEffect(() => {
  //   if (!editMode) return;

  //   const close = (e: MouseEvent) => {
  //     if (!refElement.current) return;
  //     if (refElement.current.contains(e.target as Node)) return;

  //     setEditMode(false);
  //   };

  //   document.addEventListener("click", close);
  //   return () => document.removeEventListener("click", close);
  // }, [editMode]);

  // useEffect(() => {
  //   if (isActive && refElement.current) {
  //     refElement.current.focus();
  //   }
  // }, [isActive]);
  /* ===== not editable ===== */
  if (editable == false || type == "index") {
    return (
      <span
        className="text-xs"
      >
        {String(value ?? "")}
      </span>
    );
  }

  /* ===== view mode ===== */
  if (!isActive) {
    return (
      <span
        ref={refElement as Ref<HTMLSpanElement>}
        tabIndex={tabIndex}
        className={`flex items-center  px-2 w-full h-full text-xs cursor-text`}
        onClick={() => {
          activeCell();
        }}
      >
        {valueParser(display ?? value)}
      </span>
    );
  }

  /* ===== edit mode ===== */
  switch (type) {
    case "number":
      return (
        <input
          autoFocus
          value={value === "" || value == null ? "" : Number(value)}
          disabled={isDeleted || !editable}
          className={`${isDeleted && "cursor-not-allowed"}
          flex items-center bg-transparent px-3 outline-none 
          focus-visible:outline-none focus:outline-none ring-0 focus:!ring-0 
          focus:ring-offset-0 w-36 h-8 text-xs transition-colors ]`}
          draggable={false}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          onChange={(e) =>
            dispatchChangeValue(
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
        />
      );

    case "date":
      return (
        <NewDatePicker
          disabled={isDeleted || !editable}
          value={value ? new Date(value as string).valueOf() : undefined}
          onChange={(v) => {
            dispatchChangeValue(v);
          }}
        />
      );

    case "select":
      return (
        <select
          // autoFocus
          // ref={refElement as Ref<HTMLSelectElement>}
          disabled={isDeleted || !editable}
          className={`!w-36 h-8 ${isDeleted && "cursor-not-allowed"}`}
          value={String(value ?? "")}
          // onFocus={() => onActiveColChange(columnId)}
          onClick={() => activeCell()}
          onChange={(e) => {
            dispatchChangeValue(e.target.value);
          }}
        >
          <option value="" />
          {(meta?.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "selectOption":
      return (
        <DynamicSelect
          autoFocus
          ref={refElement as Ref<HTMLSelectElement>}
          disabled={isDeleted || !editable}
          value={{ value: String(value ?? ""), label: cell.display }}
          dynamicValue={meta?.dynamicValue}
          onFocus={() => onActiveColChange(columnId)}
          className={`!w-36 h-8 ${isDeleted && "cursor-not-allowed"} relative`}
          infinite
          onClick={() => activeCell()}
          onChange={(v, o) => {
            dispatchChangeValue(v);
            if (!Array.isArray(o)) {
              if (o?.label) {
                dispatchChangeDisplay(o.label as string);
              } else {
                console.log("change display to null");
                dispatchChangeDisplay(null);
              }
            }
          }}
        />
      );

    case "static":
      return (
        <span
          // ref={refElement as Ref<HTMLSpanElement>}
          tabIndex={tabIndex}
          className="flex items-center px-2 w-full h-full text-xs cursor-text"
          onClick={() => activeCell()}

          // onFocus={(e) => {
          //   activeCell();

          //   onActiveColChange(columnId);
          // }}
        >
          {String(display ?? value ?? "") || "—"}
        </span>
      );

    case "text":
    default:
      return (
        <input
          // autoFocus
          // ref={refElement as Ref<HTMLInputElement>}
          disabled={isDeleted || !editable}
          value={value == null ? "" : String(value)}
          className={`${isDeleted && "cursor-not-allowed"}
            flex items-center bg-transparent px-2 outline-none focus-visible:outline-none
           focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0 w-36 h-8 transition-colors ]`}
          draggable={false}
          // onBlur={() => activeCell()}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          onChange={(e) => dispatchChangeValue(e.target.value)}
          // onFocus={() => onActiveColChange(columnId)}
                    onClick={() => activeCell()}

        />
      );
  }
};
