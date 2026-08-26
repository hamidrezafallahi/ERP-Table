import React, { ReactNode, useEffect, useState } from 'react';

import { CustomDropdownButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';

import { ValidationCallbackResult } from '../../engine/type';
import { UITableController } from '../../infrastructure/ui/UITableController';

interface MobileTableHeaderProps {
  controller: UITableController;
  header?: ReactNode;
}

export function MobileTableHeader({
  controller,
  header,
}: MobileTableHeaderProps) {
  const table = controller.getViewState();
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

  const visibleColumns = table.columns.filter((c) => !c.hidden);
  const isSelectedActivePageRows = table.rows.every(
    (row) => !!table.selectedRows[row.id],
  );
  const handleSelectActivePageRows = () => {
    controller.dispatch({ type: "TOGGLE_PAGE_ROW_SELECTED" });
  };

  const allRows = controller.getAllRows() ?? [];
  const handleNavigateToError = (rowId: number) => {
    const currentTable = controller.getViewState();
    if (!currentTable || allRows.length === 0) return;
    const rowIndex = allRows.findIndex((r) => r.id.value == rowId) + 1;
    const { pageSize } = currentTable.pagination;
    const targetPage = Math.ceil(rowIndex / pageSize);
    controller.dispatch({ type: "CHANGE_PAGE", page: targetPage });
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

  return (
    <thead className="top-0 right-0 left-0 z-20 sticky inset-0">
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
      <tr className="relative h-10 bg-gray-gray3 rounded-t-lg w-full">
        {visibleColumns.map((col) => {
          if (col.fieldType === "index") {
            return (
              <th
                key={col.fieldName}
                style={{ ...col.style, width: 120 }}
                className={`px-2 text-xs border text-start whitespace-nowrap ${col.className || ""}`}
              >
                <CustomCheckbox
                  checked={isSelectedActivePageRows}
                  onClick={handleSelectActivePageRows}
                />
                {col.fieldCaption}
              </th>
            );
          }

          return (
            <th
              key={col.fieldName}
              style={{ ...col.style, minWidth: col.minWidth }}
              className={`px-2 text-xs border text-start min-w-24 ${col.className || ""}`}
            >
              {col.fieldCaption}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
