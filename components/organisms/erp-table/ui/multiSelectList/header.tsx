import React from 'react';

import CustomCheckbox from '@components/atoms/defaultElements/checkbox';

import { IMultiSelectConfig } from '../type';

interface Props {
  ListConfig: IMultiSelectConfig["ListConfig"];
  rows: any[];
  fieldKey: string;
  selectedRows: Map<any, any>;
  onToggleAll: () => void;
}

export function MultiSelectListHeader({
  ListConfig,
  rows,
  fieldKey,
  selectedRows,
  onToggleAll,
}: Props) {
  const isAllSelected =
    rows.length > 0 && rows.every((r) => selectedRows.has(r[fieldKey]));

  return (
    <thead className="top-0 z-20 sticky">
      <tr className="bg-gray-gray3 h-10">
        {ListConfig.map((col, index) => (
          <th key={index} className="px-2 border text-xs text-start">
            {col.fieldName == "index" ? (
              <CustomCheckbox checked={isAllSelected} onClick={onToggleAll} />
            ) : (
              <>{col.fieldCaption}</>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}
