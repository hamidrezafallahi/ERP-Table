import React, {
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { CustomDropdownButton, CustomCheckbox } from '../primitives';

import { ColumnSchema } from '../../bootstrap/type';
import { ValidationCallbackResult } from '../../engine/type';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { revealRow } from '../gridSearch/utils';

interface Props {
  controller: UITableController;
  tableKey: string;
  header?: ReactNode;
}

export function ERPTableHeader({controller, tableKey, header}: Props) {
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

  const visibleColumns = (table.columns ?? []).filter((c: ColumnSchema) => !c.hidden);
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
      <tr
        style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`}}
        className={`relative h-10  bg-gray-gray3 rounded-t-lg w-full `}
      >
        {visibleColumns.map((col, index) => {
          if (col.fieldType === "index") {
            return (
              <th
                key={col.fieldName}
                style={{...col.style, width: 168, minWidth: 168}}
                className={`  px-2 text-xs border  text-start whitespace-nowrap ${col.className || ""}`}
              >
                <div className="flex items-center gap-2">
                  <CustomCheckbox
                    checked={isSelectedActivePageRows}
                    onClick={handleSelectActivePageRows}
                  />

                  {col.fieldCaption}
                </div>
              </th>
            );
          }

          return (
            <th
              key={col.fieldName}
              style={{...col.style, minWidth: col.minWidth}}
              className={`px-2 text-xs border text-start min-w-36 ${col.className || ""}`}
            >
              {index === 0 && (
                <CustomCheckbox
                  checked={isSelectedActivePageRows}
                  onClick={handleSelectActivePageRows}
                />
              )}
              {col.fieldCaption}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
