import React from 'react';

import { useLocale, useTranslations } from '../host';
import { CustomCheckbox } from '../primitives';

import { valueParser } from '../helper';
import { IMultiSelectConfig } from '../type';

type MultiSelectRow = Record<string, unknown>;
type MultiSelectRowId = string | number;

interface Props {
  rows: MultiSelectRow[];
  ListConfig: IMultiSelectConfig["ListConfig"];
  selectedRows: Map<MultiSelectRowId, MultiSelectRow>;
  fieldKey: string;
  onToggleRow: (row: MultiSelectRow) => void;
}

export function MultiSelectListBody({
  rows,
  ListConfig,
  selectedRows,
  fieldKey,
  onToggleRow,
}: Props) {
  const locale = useLocale()
  const t = useTranslations()
  return (
   <tbody>
  {rows.map((row) => {
    const rawId = row[fieldKey];
    const id =
      typeof rawId === 'string' || typeof rawId === 'number' ? rawId : String(rawId);

    return (
      <tr key={String(id)} className="border h-10">
        {ListConfig.filter((c) => c.hidden !== true).map((col, idx: number) => (
          <td key={idx} className="px-2 border text-xs">
            {idx === 0 && (
              <CustomCheckbox
                checked={selectedRows.has(id)}
                onClick={() => onToggleRow(row)}
              />
            )}

            {valueParser(row[col.fieldName],col.fieldType)}
          </td>
        ))}
      </tr>
    );
  })}
</tbody>

  );
}
 