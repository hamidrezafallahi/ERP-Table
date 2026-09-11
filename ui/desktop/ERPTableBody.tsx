import React, { useRef } from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { ERPTableRow } from './eRPTableRow';

interface Props {
  controller: UITableController;
  tableKey: string;
  moreDetailComponent?: React.ComponentType<{data: unknown}>;
}

export function ERPTableBody({
  controller,
  tableKey,
  moreDetailComponent: MoreDetailComponent,
}: Props) {
  const table = controller.getViewState();
  const dragRowId = useRef<number | null>(null);

  if (!table) return null;

  const rows = table.rows;
  const sortedRows = [...rows].sort(
    (a, b) =>
      (a.cells["index"].value as number) - (b.cells["index"].value as number),
  );

  return (
    <tbody className="w-full min-w-0 overflow-x-auto" role="rowgroup">
      {sortedRows.map((row, index) => (
        <ERPTableRow
          key={row.id}
          row={row}
          stripeIndex={index}
          index={index + (table.pagination.page - 1) * table.pagination.pageSize}
          table={table}
          controller={controller}
          tableKey={tableKey}
          draggedRowIdRef={dragRowId}
          moreDetailComponent={MoreDetailComponent}
          isSelected={!!table.selectedRows?.[row.id]}
          isActive={!!controller.isActiveRow(row.id)}
          isCut={!!controller.isCutRow(row.id)}
        />
      ))}
    </tbody>
  );
}
