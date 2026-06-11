"use client";
import React, { useEffect } from 'react';

import { DefaultOptionType } from 'antd/es/select';
import {
  useLocale,
  useTranslations,
} from 'next-intl';

import {
  CustomSelect,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import { IRequestConfig } from '@type/elementType';

import { FieldType } from '../../bootstrap/type';
import { RowStateEnum } from '../../domain/value-objects';
import {
  ItemType,
  TCell,
} from '../../engine/type';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { valueParser } from '../helper';
import { IRow } from '../type';
import { DescriptionComponent } from './descriptionComponent';

/* ======================================================
   Types
   ====================================================== */

export type CellMeta = {
  renderType: FieldType;
  minWidth?: number;
  style?: React.CSSProperties;
  popUpWidth?: number;
  labelValue?: "selectDisplay" | "selectValue";
  editable?: boolean;
  enableDeleteButton?: boolean;
  enableExpandButton?: boolean;
  enableMoveButton?: boolean;
  enableOptionsButton?: boolean;

  expandable?: boolean;
  options?: { label: string; value: string | number }[];
  dynamicValue?: IRequestConfig;
  dynamicSelectFilterOption?: (
    inputValue: string,
    option?: DefaultOptionType,
  ) => boolean;
  // store: string;
  // tableKey: string;
  className: string;
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
  const t = useTranslations();
  const disable =
    typeof row.visibilityCondition[columnId] === "boolean" &&
    row.visibilityCondition[columnId] === false;
  const viewCell = controller.getCell(row.id, columnId);
  const value = viewCell.getValue().value;
  const display = viewCell.getDisplay().value;
  const isActive = controller.isActiveCell(row.id, columnId);
  // const validation: ValidCell = controller.isValidCell(row.id, columnId);

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


  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isActive]);
// console.log({disable},{editable},{isActive},{type},{columnId})
   if (disable) {
     return (
      <span key={idx} className={` "text-xs"  ${meta.className}`}>
        {disable ? "--" : String(value ?? "")}
      </span>
    );
  } else if (editable === false) {
    if (meta.renderType === "selectOption") {
      return (
        <span key={idx} className={`text-xs text-start  ${meta.className} `}>
          {value ? valueParser(value,meta.renderType,locale,t)   : "--"}
        </span>
      );
    } else {
      return (
        <span key={idx} className={`text-xs ${meta.className} `}>
          {valueParser(value,meta.renderType,locale,t)}
        </span>
      );
    }
  } else if (!isActive || isDeleted) {
    /* ===== view mode ===== */
    return (
      <>
        <button
          key={idx}
          tabIndex={tabIndex}
          disabled={isDeleted}
          className={`  px-2 w-full 
             text-start h-9  ${meta.className}
          ${isDeleted ? "cursor-not-allowed " : "cursor-text"}
          `}
          onClick={() => {
            activeCell();
          }}
        >
          <div
            className={`flex items-center w-full min-w-36 max-w-72 h-full overflow-hidden text-xs text-ellipsis whitespace-nowrap 
    ${meta.renderType === "checkbox" ? "justify-center" : "justify-start"}`}
          >
            <div className="truncate">
              {valueParser(display ?? value, meta.renderType,locale,t)}
            </div>
          </div>
        </button>
      </>
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
            bg-transparent px-3 outline-none 
          focus-visible:outline-none focus:outline-none ring-0 focus:!ring-0 
          focus:ring-offset-0 !h-full w-full  text-xs transition-colors ${meta.className}`}
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
          pattern="[0-9,]*"
          min={0}
          key={idx}
          ref={inputRef}
          disabled={isDeleted || !editable}
          className={`${isDeleted && "cursor-not-allowed"}
        bg-transparent px-3 outline-none !bg-white !rounded 
        focus-visible:outline-none focus:outline-none ring-0 focus:!ring-0 
        focus:ring-offset-0 h-9 w-full text-xs transition-colors  
        ${meta.className}`}
          draggable={false}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          value={
            value === "" || value == null
              ? ""
              : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(e) => {
            const inputValue = e.target.value;
            const parsedValue = inputValue.replace(/\$\s?|(,*)/g, "");
            if (parsedValue === "" || !isNaN(Number(parsedValue))) {
              dispatchChangeValue(
                parsedValue === "" ? "" : Number(parsedValue),
              );
            }
          }}
        />
      );
    case "date":
      return (
        <NewDatePicker
          className={`${meta.className}`}
          key={idx}
          disabled={isDeleted || !editable}
          value={value ? new Date(value as string).valueOf() : undefined}
          onChange={(v) => {
            dispatchChangeValue(v);
          }}
        />
      );
    case "checkbox":
      return (
        <CustomCheckbox
          className={`${meta.className} w-full  flex justify-center items-center`}
          key={idx}
          disabled={isDeleted || !editable}
          // value={value === true as boolean}
          checked={value === (true as boolean)}
          onChange={(e) => {
            dispatchChangeValue(e.target.checked);
          }}
        />
      );
    case "select":
      return (
        <CustomSelect
          key={idx}
          options={(meta?.options ?? []).map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          disabled={isDeleted || !editable}
          className={`  h-9 ${isDeleted && "cursor-not-allowed"} ${meta.className}`}
          value={value}
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
            if (v) {
              controller.dispatch({
                type: "UI_MOVE_ACTIVE_CELL",
                rowId: row.id,
                columnId,
                direction: "next",
              });
            }
          }}
        />
      );
    case "selectOption":
      return (
        <DynamicSelect
          labelValue={meta.labelValue}
          key={idx}
          showSearch
          infinite
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
          filterOption={(input, option) => {
            if (meta?.dynamicSelectFilterOption) {
              return meta.dynamicSelectFilterOption(input, option);
            } else {
              const label = option?.label;
              return (
                typeof label === "string" &&
                option.option._SelectDisplay.toLowerCase().includes(input)
              );
            }
          }}
          className={`bg-white !border-[0.4px] !border-gray-gray7 h-9 ${meta.className} ${isDeleted && "cursor-not-allowed"}  relative`}
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
            if (v) {
              controller.dispatch({
                type: "UI_MOVE_ACTIVE_CELL",
                rowId: row.id,
                columnId,
                direction: "next",
              });
            }
          }}
        />
      );
    case "static":
      return (
        <span
          key={idx}
          tabIndex={tabIndex}
          className={`  px-2 w-full h-full text-xs cursor-text ${meta.className}`}
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
    //        focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0   h-8 transition-colors  `}
    //       draggable={false}
    //       onDragStart={blockDrag}
    //       onDragOver={blockDrag}
    //       onDrop={blockDrag}
    //       onChange={(e) => dispatchChangeValue(e.target.value)}
    //       onClick={() => activeCell()}
    //     />
    //   );
    case "description":
      return (
        <DescriptionComponent
          activeCell={activeCell}
          blockDrag={blockDrag}
          isDeleted={isDeleted}
          editable={editable}
          dispatchChangeValue={dispatchChangeValue}
          idx={idx}
          inputRef={inputRef}
          tableKey={tableKey}
          row={row}
          controller={controller}
          columnId={columnId}
          key={idx}
          ref={inputRef as any}
          disabled={isDeleted || !editable}
          value={value == null ? "" : String(value)}
          className={`${isDeleted && "cursor-not-allowed"}
            flex items-center bg-transparent px-2 outline-none focus-visible:outline-none
           focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0   h-8 transition-colors  `}
          draggable={false}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          onChange={(e) => dispatchChangeValue(e)}
          onClick={() => activeCell()}
          meta={meta}
        />
      );
    case "text":
    default:
      return (
        <input
          key={idx}
          ref={inputRef}
          disabled={isDeleted || !editable}
          value={value == null ? "" : String(value)}
          className={`${isDeleted && "cursor-not-allowed"}
              bg-transparent px-2 outline-none focus-visible:outline-none
           focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0  transition-colors !h-full w-full text-xs  ${meta.className}`}
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
