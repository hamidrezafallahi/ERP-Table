import React, {
  ReactNode,
  useEffect,
  useState,
} from 'react';

import CustomCheckbox from '@components/atoms/defaultElements/checkbox';

import { ValidationCallbackResult } from '../engine/type';
import { UITableController } from '../infrastructure/ui/UITableController';

interface Props {
  controller: UITableController;
  tableKey: string;
  header?: ReactNode;
}

export function ERPTableHeader({ controller, tableKey, header }: Props) {
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
  }, [table?.activeCell?.columnId, table?.activeCell?.rowId]);
  if (!table || !table.columns) return null;

  const isSelectedActivePageRows = table.rows.every(
    (row) => !!table.selectedRows[row.id],
  );
  const handleSelectActivePageRows = () => {
    controller.dispatch({ type: "TOGGLE_PAGE_ROW_SELECTED" });
  };
  const allRows = controller.getAllRows();
  const handleNavigateToError = (rowId: number) => {
    const table = controller.getViewState();
    if (!table) return null;
    const rowIndex = allRows.findIndex((r) => r.id == rowId) + 1;
    const { pageSize } = table.pagination;
    const targetPage = Math.ceil(rowIndex / pageSize);
    controller.dispatch({ type: "CHANGE_PAGE", page: targetPage });
  };
  const items = Array.from(validationResult.errors.entries()).map(
    ([key, value], errorIndex) => {
      const Index = allRows.findIndex((r) => r.id == value.rowId) + 1;

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
    <thead className="top-0 right-0 left-0 z-20 sticky">
      {header}
      <tr className="relative flex bg-gray-gray3 rounded-t-lg w-fit h-9">
        {/* {!validationResult.valid && (
          <CustomDropdownButton
            placement="bottom"
            className="top-1 z-10 absolute flex m-0 p-0 rounded start-1"
            items={items as any}
          >
            <span className="bg-red-600 border rounded-full w-2 h-2"></span>
          </CustomDropdownButton>
        )} */}
        {table.columns
          .filter((c) => !c.hidden)
          .map((col, index) => (
            <th
              key={col.id}
              scope="col"
              className="flex justify-start items-center px-2 w-36 min-w-36 text-xs"
            >
              {index === 0 && (
                <CustomCheckbox
                  checked={isSelectedActivePageRows}
                  onClick={handleSelectActivePageRows}
                />
              )}
              {col.title}
            </th>
          ))}
      </tr>
    </thead>
  );
}
