import React from 'react';

import { useLocale, useTranslations } from '../host';
import { CustomCheckbox } from '../primitives';

import { valueParser } from '../helper';
import { IMultiSelectConfig } from '../type';

interface Props {
  rows: any[];
  ListConfig: IMultiSelectConfig["ListConfig"];
  selectedRows: Map<any, any>;
  fieldKey:string
  onToggleRow: (id: any) => void;
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
    const id = row[fieldKey];

    return (
      <tr key={id} className="border h-10">
        {ListConfig.filter((c: any) => c.hidden !== true).map((col, idx: number) => (
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
 