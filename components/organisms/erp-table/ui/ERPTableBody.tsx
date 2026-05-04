import React, { useRef } from 'react';

import { UITableController } from '../infrastructure/ui/UITableController';
import { ERPTableRow } from './eRPTableRow';
import { IRow } from './type';

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
  const table = controller.getViewState();
  const dragRowId = useRef<number | null>(null);
  if (!table) return null;
  const rows:  IRow[] = table.rows;
   return (
   <tbody
   className='overflow-x-auto'
   >
  {rows
    .sort((a, b) => 
      (a.cells['index'].value as number) - 
      (b.cells['index'].value as number)
    )
    .map((row, index) => (
      <ERPTableRow
        key={row.id}
        row={row}
        index={index+((table.pagination.page-1)*table.pagination.pageSize)}
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
