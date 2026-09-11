import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { CustomDropdownButton, CustomCheckbox } from '../primitives';

import { ColumnSchema } from '../../bootstrap/type';
import { resolveColumnReorder } from '../../engine/columnReorder';
import { columnSizeStyle, isIndexColumn } from '../../engine/columnWidth';
import { ValidationCallbackResult } from '../../engine/type';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { revealRow } from '../gridSearch/utils';
import { useDirection } from '../host';
import {
  ARIA_HEADER_ROW_INDEX,
  ariaColIndex,
} from '../a11y/gridRoles';
import { indexPinClassName, indexPinDataAttr } from '../columnPin';
import { ColumnResizeHandle } from './ColumnResizeHandle';

interface Props {
  controller: UITableController;
  tableKey: string;
  header?: ReactNode;
}

export function ERPTableHeader({controller, tableKey, header}: Props) {
  const direction = useDirection();
  const table = controller.getViewState();
  const draggedFieldRef = useRef<string | null>(null);
  const [dropField, setDropField] = useState<string | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationCallbackResult>({
      valid: true,
      data: null,
      errors: new Map(),
    });

  useEffect(() => {
    const validation = controller.validation();
    validation((res) => {
      setValidationResult(res);
    });
  }, [controller, table?.activeCell?.columnId, table?.activeCell?.rowId]);

  if (!table || !table.columns) return null;

  const displayColumns = table.columns ?? [];
  const visibleColumns = displayColumns.filter((c: ColumnSchema) => !c.hidden);
  const isSelectedActivePageRows = table.rows.every(
    (row) => !!table.selectedRows[row.id],
  );
  const handleSelectActivePageRows = () => {
    controller.dispatch({type: "TOGGLE_PAGE_ROW_SELECTED"});
  };
  const allRows = controller.getAllRows() ?? [];
  const handleNavigateToError = (rowId: number) => {
    void revealRow(controller, rowId);
  };
  const items = Array.from((validationResult.errors ?? new Map()).entries()).map(
    ([key, value], errorIndex) => {
      const Index = allRows.findIndex((r) => r.id.value == value.rowId) + 1;

      return {
        key: errorIndex.toString(),

        label: (
          <button
            className="flex bg-red-300 text-red-600 text-xs"
            onClick={() => {
              handleNavigateToError(value.rowId);
            }}
          >
            {`
            در سطر
            ${Index}
            در ستون
            ${value.caption} :
            ${value.message}`}
          </button>
        ),
      };
    },
  );
  const cols = visibleColumns.length;

  const beginColumnDrag = (
    e: React.DragEvent<HTMLTableCellElement>,
    fieldName: string,
  ) => {
    draggedFieldRef.current = fieldName;
    e.dataTransfer.setData("text/plain", fieldName);
    e.dataTransfer.effectAllowed = "move";
  };

  const hoverColumnDrop = (fieldName: string) => {
    setDropField((current) => (current === fieldName ? current : fieldName));
  };

  const leaveColumnDrop = (
    fieldName: string,
    currentTarget: HTMLElement,
    relatedTarget: EventTarget | null,
  ) => {
    if (relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
      return;
    }
    setDropField((current) => (current === fieldName ? null : current));
  };

  const dropColumn = (destField: string) => {
    const sourceField = draggedFieldRef.current;
    draggedFieldRef.current = null;
    setDropField(null);
    if (!sourceField) return;
    const move = resolveColumnReorder(displayColumns, sourceField, destField);
    if (!move) return;
    void controller.dispatch({
      type: "COLUMN_REORDERED",
      sourceIndex: move.sourceIndex,
      destIndex: move.destIndex,
    });
  };

  const endColumnDrag = () => {
    draggedFieldRef.current = null;
    setDropField(null);
  };

  return (
    <thead className="top-0 z-20 sticky" role="rowgroup">
      {header}
      {!validationResult.valid && (
        <CustomDropdownButton
          placement="bottom"
          className="top-1 z-10 absolute flex m-0 p-0 rounded start-1"
          items={items as any}
        >
          <span className="bg-red-600 border rounded-full w-2 h-2"></span>
        </CustomDropdownButton>
      )}
      <tr
        role="row"
        aria-rowindex={ARIA_HEADER_ROW_INDEX}
        style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`}}
        className={`relative h-10  bg-gray-gray3 rounded-t-lg w-full `}
      >
        {visibleColumns.map((col, index) => {
          const size = columnSizeStyle(col, table.columnWidths);
          const handle = (
            <ColumnResizeHandle
              columnId={col.fieldName}
              currentWidth={size.width}
              column={col}
              direction={direction}
              onResize={(width) => {
                void controller.dispatch({
                  type: "UI_RESIZE_COLUMN",
                  columnId: col.fieldName,
                  width,
                });
              }}
            />
          );
          if (isIndexColumn(col)) {
            return (
              <th
                key={col.fieldName}
                role="columnheader"
                aria-colindex={ariaColIndex(index)}
                style={{...col.style, ...size}}
                className={`relative px-2 text-xs border  text-start whitespace-nowrap ${indexPinClassName(col)} ${col.className || ""}`}
                data-erp-col-pin={indexPinDataAttr(col)}
              >
                <div className="flex items-center gap-2">
                  <CustomCheckbox
                    checked={isSelectedActivePageRows}
                    onClick={handleSelectActivePageRows}
                  />

                  {col.fieldCaption}
                </div>
                {handle}
              </th>
            );
          }

          return (
            <th
              key={col.fieldName}
              role="columnheader"
              aria-colindex={ariaColIndex(index)}
              style={{...col.style, ...size}}
              className={`relative px-2 text-xs border text-start min-w-36 ${indexPinClassName(col)} ${col.className || ""}`}
              data-erp-col-pin={indexPinDataAttr(col)}
              data-erp-col-drag={col.fieldName}
              data-erp-col-drop={dropField === col.fieldName ? col.fieldName : undefined}
              draggable
              onDragStart={(e) => beginColumnDrag(e, col.fieldName)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                hoverColumnDrop(col.fieldName);
              }}
              onDragLeave={(e) => {
                leaveColumnDrop(
                  col.fieldName,
                  e.currentTarget,
                  e.relatedTarget,
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                dropColumn(col.fieldName);
              }}
              onDragEnd={endColumnDrag}
            >
              {index === 0 && (
                <CustomCheckbox
                  checked={isSelectedActivePageRows}
                  onClick={handleSelectActivePageRows}
                />
              )}
              {col.fieldCaption}
              {handle}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
