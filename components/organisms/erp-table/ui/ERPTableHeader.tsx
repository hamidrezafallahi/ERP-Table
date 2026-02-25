import React from 'react';

import CustomCheckbox from '@components/atoms/defaultElements/checkbox';

import { UITableController } from '../adapters/ui/UITableController';

interface Props {
 controller: UITableController
  tableKey: string
}

export function ERPTableHeader({ controller ,tableKey}: Props) {
  const table = controller.getViewState(tableKey)
  if (!table || !table.columns) return null; 

  const isSelectedAllRows = table.rows.every(row => !!table.selectedRows[row.id]);
  const handleSelectAllRows = () => {
    controller.dispatch({type:"TOGGLE_ROW_SELECTED"})
  };

  return (
    <thead className="top-0 right-0 left-0 z-20 sticky">
      <tr className="flex bg-gray-gray3 rounded-t-lg w-full h-8">
        {table.columns.filter(c => !c.hidden).map((col, index) => (
          <th
            key={col.id}
            scope="col"
            className="flex justify-start items-center px-2 w-36 text-xs"
          >
            {index === 0 && (
              <CustomCheckbox
                checked={isSelectedAllRows}
                onClick={handleSelectAllRows}
              />
            )}
            {col.title}
          </th>
        ))}
      </tr>
    </thead>
  );
}
