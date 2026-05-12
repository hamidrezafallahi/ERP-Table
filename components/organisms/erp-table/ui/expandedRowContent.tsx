import React, { ReactNode } from 'react';

import {
  TableViewState,
  TCell,
} from '../engine/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import { CellMeta } from './cellRenderer';

interface Props {
  row: {
    id: number;
    rowState: string;
    cells: Record<string, TCell>;
    isExpanded: boolean;
  };
  controller: UITableController;
  tableId: string;
   table: TableViewState;
}

export const ExpandedRowContent: React.FC<Props> = ({ row, controller, tableId,table }) => {
  // گرفتن ستون‌های visible
 
  const columns = table.columns.filter((c) => !c.hidden);

  return (
    <div className="gap-2 grid grid-cols-2 bg-gray-50 p-2 rounded">
      {columns.map((col) => {
        // skip index column inside expanded content
        if (col.id === "index") return null;

        const meta: CellMeta = {
          renderType: col.renderType,
          editable: col.editable,
          className:col.className,
          tableId,
          columnId: col.id,
          options: col.options,
          dynamicValue: col.dynamicValue,
        };
        const value = row.cells[col.id]?.value ?? "";
        return (
          <div key={col.id} className="flex flex-col">
            <label className="font-semibold text-gray-600 text-xs">{col.title}</label>
            <div className="flex items-center">
              {/* <CellRenderer
                tableId={tableId}
                rowId={row.id}
                columnId={col.id}
                meta={meta}
                cell={row.cells[col.id]}
                controller={controller}

              /> */}
              {value as ReactNode}
            </div>
          </div>
        );
      })}
    </div>
  );
};
