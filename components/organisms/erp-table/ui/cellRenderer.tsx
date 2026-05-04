import React, { useEffect } from 'react';

import { Tooltip } from 'antd';
import moment from 'moment-jalaali';
import { useLocale } from 'next-intl';

import {
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import { Info } from '@components/atoms/iconComponents';
import { IRequestConfig } from '@type/elementType';

import { FieldType } from '../bootstrap/type';
import { RowStateEnum } from '../domain/value-objects';
import {
  ItemType,
  TCell,
  ValidCell,
} from '../engine/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import { IRow } from './type';

/* ======================================================
   Types
   ====================================================== */

export type CellMeta = {
  renderType: FieldType;
  width?: number;
  popUpWidth?: number;
  labelValue?: "selectDisplay" | "selectValue";
  editable?: boolean;
  expandable?: boolean;
  options?: { label: string; value: string }[];
  dynamicValue?: IRequestConfig;
  // store: string;
  // tableKey: string;
  tableId: string;
  columnId: string;
  onChange?: (
    tableId: string,
    rowId: number,
    row: {
      id: string | number;
      cells: Record<string, TCell>;
      rowState: RowStateEnum;
      isExpanded: boolean;
    },
    controller: UITableController,
  ) => void;

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
  row: IRow;
  columnId: string;
  idx: number;
  meta?: CellMeta;
  controller: UITableController;
  tabIndex: number;
}

/* ======================================================
   Cell Renderer
   ====================================================== */

export const CellRenderer: React.FC<CellRendererProps> = ({
  tableKey,
  row,
  columnId,
  meta,
  controller,
  tabIndex,
  idx,
}) => {
  const disable =
    typeof row.visibilityCondition[columnId] === "boolean" &&
    row.visibilityCondition[columnId] === false;
  const viewCell = controller.getCell(row.id, columnId);
  const value = viewCell.getValue().value;
  const display = viewCell.getDisplay().value;
  const isActive = controller.isActiveCell(row.id, columnId);
  const validation: ValidCell = controller.isValidCell(row.id, columnId);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const locale = useLocale();
  const dispatchChangeValue = (newValue: unknown) => {
    meta.onChange?.(tableKey, row.id, row, controller);
    controller.dispatch({
      type: "UI_CELL_CHANGE",
      rowId: row.id,
      columnId,
      value: newValue,
    });
  };
  const dispatchChangeDisplay = (label: string | null) => {
    controller.dispatch({
      type: "UI_CELL_CHANGE_DISPLAY",
      rowId: row.id,
      columnId,
      value: label,
    });
  };
  const activeCell = () => {
    controller.dispatch({ type: "UI_ACTIVE_CELL", rowId: row.id, columnId });
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
      case "price":
        return `${val} تومان`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    if (isActive && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isActive]);

  if (editable == false || type == "index" || disable) {
    return (
      <span
        key={idx}
        className={`text-xs
          ${validation.isValid ? "" : "border border-red-300"}

      `}
      >
        {disable ? "disable" : String(value ?? "")}
      </span>
    );
  }
  /* ===== view mode ===== */
  if (!isActive || isDeleted) {
    return (
      <button
        key={idx}
        tabIndex={tabIndex}
        disabled={isDeleted}
        className={`flex items-center justify-between  px-2 w-full h-9 text-xs  
          ${isDeleted ? "cursor-not-allowed " : "cursor-text"}
          ${validation.isValid ? "" : "border border-red-300"}
          
          `}
        onClick={() => {
          activeCell();
        }}
      >
        {valueParser(display ?? value)}
        {!validation.isValid && (
          <Tooltip title={validation.cellError.message}>
            <span>
              <Info config={{ width: 18, height: 18, stroke: "#f87171" }} />
            </span>
          </Tooltip>
        )}
      </button>
    );
  }

  /* ===== edit mode ===== */
  switch (type) {
    case "number":
      return (
        <input
          key={idx}
          ref={inputRef}
          value={value === "" || value == null ? "" : Number(value)}
          disabled={isDeleted || !editable}
          className={`${isDeleted && "cursor-not-allowed"}
          flex items-center bg-transparent px-3 outline-none 
          focus-visible:outline-none focus:outline-none ring-0 focus:!ring-0 
          focus:ring-offset-0 w-36 min-w-36 h-8 text-xs transition-colors
             ${validation.isValid ? "" : "border border-red-300"}
          `}
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
    case "price":
      return (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          min={0}
          key={idx}
          ref={inputRef}
          value={value === "" || value == null ? "" : Number(value)}
          disabled={isDeleted || !editable}
          className={`${isDeleted && "cursor-not-allowed"}
          flex items-center bg-transparent px-3 outline-none  !bg-white !rounded  
          focus-visible:outline-none focus:outline-none ring-0 focus:!ring-0 
          focus:ring-offset-0 w-36 min-w-36 h-8 text-xs transition-colors 
             ${validation.isValid ? "" : "border border-red-300"}`}
          draggable={false}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          onChange={(e) => {
            dispatchChangeValue(e.target.value);
          }}
        />
      );

    case "date":
      return (
        <NewDatePicker
          key={idx}
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
          key={idx}
          disabled={isDeleted || !editable}
          className={`!w-36 !min-w-36 h-8 ${isDeleted && "cursor-not-allowed"}`}
          value={String(value ?? "")}
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
          labelValue={meta.labelValue}
          key={idx}
          showSearch
          onSearchPhrase={(v, o) => {
            dispatchChangeValue(v);
            if (!Array.isArray(o)) {
              if (o) {
                dispatchChangeDisplay(o);
              } else {
                dispatchChangeDisplay(null);
              }
            }
          }}
          autoFocus
          popupMatchSelectWidth={meta.popUpWidth}
          popupRender={(menu) => <div className="w-full">{menu}</div>}
          disabled={isDeleted || !editable}
          value={{ value: String(value ?? ""), label: display }}
          dynamicValue={meta?.dynamicValue}
          className={`!bg-white !border-[0.4px] !border-gray-gray7 !w-36 !min-w-36 h-8 ${isDeleted && "cursor-not-allowed"}    ${validation.isValid ? "" : "border border-red-300"} relative`}
          infinite
          onClick={() => activeCell()}
          onChange={(v, o) => {
            dispatchChangeValue(v);
            if (!Array.isArray(o)) {
              if (o?.label) {
                dispatchChangeDisplay(o.label as string);
              } else {
                dispatchChangeDisplay(null);
              }
            }
          }}
        />
      );
    case "static":
      return (
        <span
          key={idx}
          tabIndex={tabIndex}
          className={`flex items-center px-2 w-full h-full text-xs cursor-text ${validation.isValid ? "" : "border border-red-300"}`}
          onClick={() => activeCell()}
        >
          {String(display ?? value ?? "") || "—"}
        </span>
      );
    // case "textArea":
    //   return (
    //     <textarea
    //       key={idx}
    //       ref={inputRef as any}
    //       disabled={isDeleted || !editable}
    //       value={value == null ? "" : String(value)}
    //       className={`${isDeleted && "cursor-not-allowed"}
    //         flex items-center bg-transparent px-2 outline-none focus-visible:outline-none
    //        focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0 w-36 min-w-36 h-8 transition-colors  ${validation.isValid ? "" : "border border-red-300"}`}
    //       draggable={false}
    //       onDragStart={blockDrag}
    //       onDragOver={blockDrag}
    //       onDrop={blockDrag}
    //       onChange={(e) => dispatchChangeValue(e.target.value)}
    //       onClick={() => activeCell()}
    //     />
    //   );
    case "text":
    default:
      return (
        <input
          key={idx}
          ref={inputRef}
          disabled={isDeleted || !editable}
          value={value == null ? "" : String(value)}
          className={`${isDeleted && "cursor-not-allowed"}
            flex items-center bg-transparent px-2 outline-none focus-visible:outline-none
           focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0 w-36 min-w-36 h-8 transition-colors ${validation.isValid ? "" : "border border-red-300"}`}
          draggable={false}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          onChange={(e) => dispatchChangeValue(e.target.value)}
          onClick={() => activeCell()}
        />
      );
  }
};
