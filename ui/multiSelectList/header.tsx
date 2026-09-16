import React from 'react';

import { CustomCheckbox } from '../primitives';

import { IMultiSelectConfig } from '../type';

type MultiSelectRow = Record<string, unknown>;
type MultiSelectRowId = string | number;

interface Props {
  ListConfig: IMultiSelectConfig["ListConfig"];
  rows: MultiSelectRow[];
  fieldKey: string;
  selectedRows: Map<MultiSelectRowId, MultiSelectRow>;
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
    rows.length > 0 &&
    rows.every((r) => {
      const rawId = r[fieldKey];
      const id =
        typeof rawId === 'string' || typeof rawId === 'number'
          ? rawId
          : String(rawId);
      return selectedRows.has(id);
    });

  return (
    <thead className="top-0 z-20 sticky">
      <tr className="bg-gray-gray3 h-10">
        {ListConfig.filter((c) => c.hidden !== true).map((col, index) => (
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
