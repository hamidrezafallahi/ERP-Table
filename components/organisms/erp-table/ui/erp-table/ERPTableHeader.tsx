import React from 'react';

import CustomCheckbox from '@components/atoms/defaultElements/checkbox';

import { TableViewState } from '../../engine/type';

interface Props {
  table: TableViewState | null; // حالا ممکن است null باشد
}

export function ERPTableHeader({ table }: Props) {
  if (!table || !table.columns) return null; // اگر هنوز load نشده باشد

  return (
    <thead className="top-0 right-0 left-0 z-20 sticky">
      <tr className="flex bg-gray-gray3 rounded-t-lg w-full h-8">
        {table.columns.filter(c => !c.hidden).map((col,index) => (
          <th
            key={col.id}
            scope="col"
            className="flex justify-start items-center px-2 w-36 text-xs"
          >
            {index == 0 && <CustomCheckbox   />}
            {col.title}
          </th>
        ))}
      </tr>
    </thead>
  );
}
