import React, {
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  tableId: string;
  rowId: number;
  columnId: string;
  cell: TCell;
  meta?: CellMeta;
  controller: UITableController;
  onMouseDown: () => void;
  onFocus: () => void;
  tabIndex: number;
  row: {
    id: number;
    cells: Record<string, TCell>;
    rowState: RowStateEnum;
    isExpanded: boolean;
  };
}

/* ======================================================
   Cell Renderer
   ====================================================== */

export const CellRenderer: React.FC<CellRendererProps> = ({
  row,
  rowId,
  columnId,
  cell,
  meta,
  controller,
  onMouseDown,
  onFocus,
  tabIndex,
}) => {
  const { value, display } = cell;

  const dispatchChange = (newValue: unknown) => {
    controller.dispatch({
      type: "UI_CELL_CHANGE",
      rowId,
      columnId,
      value: newValue,
    });
  };

  const [editMode, setEditMode] = useState(false);
  const [tempValue, setTempValue] = useState<unknown>(null);

  const refElement = useRef<HTMLElement>(null);

  const type = meta.renderType;
  const editable = meta.editable;
  const isDeleted = row.rowState === RowStateEnum.Deleted;

  const blockDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const closeIfNotChanged = () => {
    if (tempValue === value) {
      setEditMode(false);
    }
  };

  /* ===== close on outside click ===== */
  useEffect(() => {
    if (!editMode) return;

    const close = (e: MouseEvent) => {
      if (!refElement.current) return;
      if (refElement.current.contains(e.target as Node)) return;

      setEditMode(false);
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [editMode]);

  /* ===== not editable ===== */
  if (editable == false || type == "index") {
    return (
      <span
        // ref={refElement}
        onMouseDown={onMouseDown}
        onFocus={onFocus}
        className="text-xs"
      >
        {String(value ?? "")}
      </span>
    );
  }

  /* ===== view mode ===== */
  // if (!editMode) {
  //   return (
  //     <span
  //       ref={refElement as Ref<HTMLSpanElement>}
  //       tabIndex={tabIndex}
  //       className="flex items-center px-2 w-full h-full text-xs cursor-text"
  //       onMouseDown={onMouseDown}
  //       onFocus={(e) => {
  //         onFocus();
  //         setEditMode(true);
  //       }}
  //       onClick={() => setEditMode(true)}
  //     >
  //       {String(display ?? value ?? "") || "—"}
  //     </span>
  //   );
  // }

  /* ===== edit mode ===== */
  switch (type) {
    case "number":
      return (
        <input
          autoFocus
          ref={refElement as Ref<HTMLInputElement>}
          value={value === "" || value == null ? "" : Number(value)}
          disabled={isDeleted || !editable}
          className={`${isDeleted && "cursor-not-allowed"}
          flex items-center bg-transparent px-3 outline-none 
          focus-visible:outline-none focus:outline-none ring-0 focus:!ring-0 
          focus:ring-offset-0 w-36 h-8 text-xs transition-colors ]`}
          draggable={false}
          onBlur={() => setEditMode(false)}
          onMouseDown={onMouseDown}
          onFocus={onFocus}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          onChange={(e) =>
            dispatchChange(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      );

    case "date":
      return (
        <NewDatePicker
          disabled={isDeleted || !editable}
          value={value ? new Date(value as string).valueOf() : undefined}
          onChange={(v) => {
            dispatchChange(v);
            setEditMode(false);
          }}
        />
      );

    case "select":
      return (
        <select
          autoFocus
          ref={refElement as Ref<HTMLSelectElement>}
          disabled={isDeleted || !editable}
          className={`!w-36 h-8 ${isDeleted && "cursor-not-allowed"}`}
          value={String(value ?? "")}
          onMouseDown={onMouseDown}
          onFocus={onFocus}
          onBlur={closeIfNotChanged}
          onChange={(e) => {
            dispatchChange(e.target.value);
            setEditMode(false);
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
          // autoFocus
          ref={refElement as Ref<HTMLSelectElement>}
          disabled={isDeleted || !editable}
          value={String(value ?? "")}
          // onBlur={closeIfNotChanged}
          dynamicValue={meta?.dynamicValue}
          className={`!w-36 h-8 ${isDeleted && "cursor-not-allowed"}`}
          infinite
          onChange={(v) => {
            dispatchChange(v);
            setEditMode(false);
          }}
        />
      );
    case "static":
      return (
        <span
          ref={refElement as Ref<HTMLSpanElement>}
          tabIndex={tabIndex}
          className="flex items-center px-2 w-full h-full text-xs cursor-text"
          onMouseDown={onMouseDown}
          onFocus={(e) => {
            onFocus();
            setEditMode(true);
          }}
          onClick={() => setEditMode(true)}
        >
          {String(display ?? value ?? "") || "—"}
        </span>
      );

    case "text":
    default:
      return (
        <input
          autoFocus
          ref={refElement as Ref<HTMLInputElement>}
          disabled={isDeleted || !editable}
          value={value == null ? "" : String(value)}
          className={`${isDeleted && "cursor-not-allowed"}
            flex items-center bg-transparent px-2 outline-none focus-visible:outline-none
           focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0 w-36 h-8 transition-colors ]`}
          draggable={false}
          onBlur={() => setEditMode(false)}
          onMouseDown={onMouseDown}
          onFocus={onFocus}
          onDragStart={blockDrag}
          onDragOver={blockDrag}
          onDrop={blockDrag}
          onChange={(e) => dispatchChange(e.target.value)}
        />
      );
  }
};
