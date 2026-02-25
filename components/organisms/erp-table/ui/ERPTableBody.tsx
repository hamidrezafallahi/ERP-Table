import React, { useRef } from 'react';

import { UITableController } from '../adapters/ui/UITableController';
import { RowStateEnum } from '../domain/value-objects';
import { TCell } from '../engine/type';
import { ERPTableRow } from './eRPTableRow';

interface Props {
  controller: UITableController;
  tableKey: string;
  moreDetailComponent?: React.ComponentType<{ data: unknown }>;
}

export function ERPTableBody({
  controller,
  tableKey,
  moreDetailComponent: MoreDetailComponent,
}: Props) {
  const table = controller.getViewState(tableKey);
  const dragRowId = useRef<number | null>(null);
  if (!table) return null;
  const rows: Array<{
    id: number;
    rowState: RowStateEnum;
    cells: Record<string, TCell>;
    isExpanded: boolean;
  }> = table.rows;
  return (
   <tbody>
  {rows
    .sort((a, b) => 
      (a.cells['index'].value as number) - 
      (b.cells['index'].value as number)
    )
    .map((row, index) => (
      <ERPTableRow
        key={row.id}
        row={row}
        index={index}
        table={table}
        controller={controller}
        tableKey={tableKey}
        draggedRowIdRef={dragRowId}
        moreDetailComponent={MoreDetailComponent}
      />
    ))}
</tbody>
  );
}
