"use client";
import React, { useEffect } from 'react';

import { useERPTableHost } from '../host';
import {
  CustomCheckbox,
  InfoIcon,
  NewDatePicker,
  Select,
  Tooltip,
} from '../primitives';
import { ERPTableDynamicSelect as DynamicSelect } from './ERPTableDynamicSelect';

import {
  ColumnSchema,
  DefaultOptionType,
} from '../../bootstrap/type';
import { RowStateEnum } from '../../domain/value-objects';
import { ValidCell } from '../../engine/type';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { highlightIfCurrentSearch } from '../gridSearch/highlightText';
import { valueParser } from '../helper';
import { useGridSearchState } from '../hooks/useEngineSelector';
import { UIRow } from '../type';
import { type CellRenderContext } from './cellRenderContext';
import { resolveBoundCellNode } from './cellRegistry';
import { DescriptionComponent } from './descriptionComponent';

export type { CellRenderContext } from './cellRenderContext';
export { resolveCustomCellNode } from './cellRenderContext';
export type { CellComponent, CellComponentMap } from './cellRegistry';
export {
  DEFAULT_CELL_COMPONENTS,
  mergeCellComponents,
  resolveBoundCellNode,
  resolveRegisteredCellNode,
} from './cellRegistry';
export { TextAreaCell } from './TextAreaCell';
export {
  highlightIfCurrentSearch,
  highlightSearchText,
} from '../gridSearch/highlightText';

/* ======================================================
   Types
   ====================================================== */

interface CellRendererProps {
  tableKey: string;
  row: UIRow;
  columnId: string;
  idx: number;
  meta?: ColumnSchema;
  controller: UITableController;
  tabIndex: number;
  mode?: "view" | "cell" | "form";
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
  mode = "cell",
}) => {
  const dateHostRef = React.useRef<HTMLDivElement | null>(null);
  const { locale, components } = useERPTableHost();
  const searchState = useGridSearchState(controller);
  if (!meta) return null;
  const disable =
    typeof row.visibilityCondition[columnId] === "boolean" &&
    row.visibilityCondition[columnId] === false;
  const viewCell = controller.getCell(row.id, columnId);
  const value = viewCell?.getValue();
  const display = viewCell?.getDisplay();
  const isActive = controller.isActiveCell(row.id, columnId);
  const validation: ValidCell = controller.isValidCell(row.id, columnId) ?? {
    isValid: true,
    cellError: { rowId: row.id, caption: meta.fieldCaption, message: '' },
  };
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const dispatchChangeValue = (
    newValue: unknown,
    option?: DefaultOptionType,
  ) => {
    meta.onChange?.(tableKey, row.id, row, controller, newValue, option);
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
      value: label ?? '',
    });
  };
  const activeCell = () => {
    controller.dispatch({type: "UI_ACTIVE_CELL", rowId: row.id, columnId});
  };

  const type = meta.fieldType;
  const isEditable = meta.editable !== false;
  const isDeleted = row.rowState === RowStateEnum.Deleted;
  const isCurrentSearchMatch =
    !!searchState &&
    searchState.currentIndex >= 0 &&
    searchState.matches[searchState.currentIndex]?.rowId === row.id &&
    searchState.matches[searchState.currentIndex]?.columnId === columnId;

  const renderCellContent = (cellText: unknown) => {
    const parsed = valueParser(cellText, meta.fieldType, locale);
    return highlightIfCurrentSearch(
      parsed,
      searchState?.query,
      isCurrentSearchMatch,
    );
  };

  const blockDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const shouldFocus = mode === "form" || (mode === "cell" && isActive);
    if (!shouldFocus) return;
    if (type === "date") {
      const id = window.setTimeout(() => {
        const el = dateHostRef.current?.querySelector(
          '[role="button"][tabindex="0"]',
        ) as HTMLElement | null;
        el?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
    if (inputRef.current) {
      inputRef.current.focus();
      if (mode !== "form") {
        inputRef.current.select();
      }
    }
  }, [isActive, mode, type]);
  const cellRenderContext: CellRenderContext = {
    tableKey,
    row,
    columnId,
    meta,
    controller,
    value,
    display,
    isActive: !!isActive,
    isDeleted,
    isEditable,
    mode,
    tabIndex,
    validation,
    dispatchChangeValue,
    dispatchChangeDisplay,
    activeCell,
    searchQuery: searchState?.query,
    isCurrentSearchMatch,
  };

  const renderReadOnlyCell = (cellText: unknown) => (
    <span
      key={idx}
      className={`flex items-center px-2 w-full h-9 overflow-hidden text-xs text-ellipsis whitespace-nowrap ${meta.className}
        ${meta.fieldType === "checkbox" || meta.fieldType === "price" || meta.fieldType === "number" ? "justify-center" : "justify-start"}
        ${isCurrentSearchMatch ? "ring-2 ring-yellow-400" : ""}`}
    >
      <span className="truncate">{renderCellContent(cellText)}</span>
      {!validation?.isValid && (
        <Tooltip title={validation?.cellError?.message}>
          <span>
            <InfoIcon config={{width: 18, height: 18, stroke: "#f87171"}} />
          </span>
        </Tooltip>
      )}
    </span>
  );

  if (disable) {
    if (mode === "view") {
      return (
        <span key={idx} className={`text-xs ${meta.className}`}>
          --
        </span>
      );
    }
    return (
      <span key={idx} className={` "text-xs"  ${meta.className}`}>
        --
      </span>
    );
  }

  const customCell = resolveBoundCellNode(meta, components, cellRenderContext);
  if (customCell.hit) {
    const isColumnRender = typeof meta.render === 'function';
    return (
      <div
        key={idx}
        {...(isColumnRender
          ? { 'data-erp-custom-cell': columnId }
          : { 'data-erp-cell-component': type })}
        tabIndex={isDeleted ? -1 : tabIndex}
        className={`w-full h-full min-h-9 px-2 flex text-xs ${
          type === 'textArea' ? 'items-start' : 'items-center'
        } ${meta.className ?? ''} ${
          isDeleted ? 'cursor-not-allowed' : 'cursor-text'
        } ${isCurrentSearchMatch ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={() => {
          if (!isDeleted) activeCell();
        }}
      >
        {customCell.node}
      </div>
    );
  }

  if (mode === "view") {
    return renderReadOnlyCell(display ?? value);
  }

  if (isEditable === false) {
    if (meta.fieldType === "selectOption") {
      return (
        <span key={idx} className={`text-xs text-start  ${meta.className} `}>
          {value ? renderCellContent(value) : "--"}
        </span>
      );
    } else {
      return (
        <span key={idx} className={`text-xs ${meta.className} `}>
          {renderCellContent(value)}
        </span>
      );
    }
  } else if (
    mode !== "form" &&
    (!isActive || isDeleted || isCurrentSearchMatch)
  ) {
    return (
      <>
        <button
          key={idx}
          tabIndex={tabIndex}
          disabled={isDeleted}
          className={`  px-2 w-full 
             text-start h-9  ${meta.className}
          ${isDeleted ? "cursor-not-allowed " : "cursor-text"}
          ${isCurrentSearchMatch ? "ring-2 ring-yellow-400" : ""}
          `}
          onClick={() => {
            activeCell();
          }}
        >
          <div
            className={`flex items-center w-full min-w-36 max-w-72 h-full overflow-hidden text-xs text-ellipsis whitespace-nowrap 
    ${meta.fieldType === "checkbox" || meta.fieldType === "price" || meta.fieldType === "number" ? "justify-center" : "justify-start"}`}
          >
            <div className="truncate">
              {renderCellContent(display ?? value)}
              {!validation?.isValid && (
                <Tooltip title={validation?.cellError?.message}>
                  <span>
                    <InfoIcon
                      config={{width: 18, height: 18, stroke: "#f87171"}}
                    />
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        </button>
      </>
    );
  }

  switch (type) {
    case "number":
      return (
        <input
          key={idx}
          ref={inputRef}
          value={value === "" || value == null ? "" : Number(value)}
          disabled={isDeleted || !isEditable}
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
          disabled={isDeleted || !isEditable}
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
              dispatchChangeDisplay(
                parsedValue === ""
                  ? null
                  : `${Number(parsedValue)}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ",",
                    ),
              );
            }
          }}
        />
      );
    case "date":
      return (
        <div ref={dateHostRef} className="w-full h-full">
          <NewDatePicker
            showMask
            className={`${meta.className}`}
            key={idx}
            disabled={isDeleted || !isEditable}
            value={
              value == null || value === ''
                ? undefined
                : typeof value === 'number'
                  ? value
                  : new Date(value as string).valueOf()
            }
            onChange={(v) => {
              dispatchChangeValue(v);
            }}
          />
        </div>
      );
    case "checkbox":
      return (
        <CustomCheckbox
          className={`${meta.className} w-full  flex justify-center items-center`}
          key={idx}
          disabled={isDeleted || !isEditable}
          // value={value === true as boolean}
          checked={value === (true as boolean)}
          onChange={(e) => {
            dispatchChangeValue(e.target.checked);
          }}
        />
      );
    case "select":
      return (
        <Select
          key={idx}
          options={(meta?.options ?? []).map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          disabled={isDeleted || !isEditable}
          className={`  h-9 ${isDeleted && "cursor-not-allowed"} ${meta.className}`}
          value={value}
          onClick={() => activeCell()}
          onChange={(v, o) => {
            dispatchChangeValue(v);
            const option = o as { label?: string } | undefined;
            if (option?.label) {
              dispatchChangeDisplay(option.label);
            } else {
              dispatchChangeDisplay('');
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
    case "selectOption": {
      const selectValue =
        value != null && value !== "" ? String(value) : undefined;

      return (
        <DynamicSelect
          labelValue={meta.labelValue}
          noCache={meta.noCache}
          key={`${row.id}-${columnId}`}
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
          autoFocus={mode !== "form"}
          popupMatchSelectWidth={meta.popUpWidth}
          popupRender={(menu) => <div className="w-full">{menu}</div>}
          disabled={isDeleted || !isEditable}
          // labelInValue is false in DynamicSelect — pass a primitive, not {value,label}
          value={selectValue}
          dynamicValue={meta?.dynamicSource}
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
          filterOptions={(option) => {
            const unique = (controller.getAllRows() ?? []).some(
              (r) => r.getCell(columnId)?.getValue() === option.value,
            );
            if (meta.isUnique) {
              return !unique;
            }
            return true;
          }}
          className={`bg-white !border-[0.4px] !border-gray-gray7 h-9 ${meta.className} ${isDeleted && "cursor-not-allowed"}  relative`}
          onClick={() => activeCell()}
          onChange={(v, o) => {
            dispatchChangeValue(v, o as DefaultOptionType);
            const option = o as { label?: string } | undefined;
            dispatchChangeDisplay(option?.label ?? '');
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
    }
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
    case "description":
      return (
        <DescriptionComponent
          activeCell={activeCell}
          blockDrag={blockDrag}
          isDeleted={isDeleted}
          editable={isEditable}
          dispatchChangeValue={dispatchChangeValue}
          idx={idx}
          inputRef={inputRef}
          tableKey={tableKey}
          row={row}
          controller={controller}
          columnId={columnId}
          key={idx}
          ref={inputRef as any}
          disabled={isDeleted || !isEditable}
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
          searchQuery={searchState?.query}
          isCurrentSearchMatch={isCurrentSearchMatch}
        />
      );
    case "text":
    default:
      return (
        <input
          key={idx}
          ref={inputRef}
          disabled={isDeleted || !isEditable}
          value={value == null ? "" : String(value)}
          className={`${isDeleted && "cursor-not-allowed"}
              bg-transparent px-2 outline-none focus-visible:outline-none
           focus:outline-none ring-0 focus:ring-0! focus:ring-offset-0  transition-colors h-full! w-full text-xs  ${meta.className}`}
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
