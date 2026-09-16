import React, { Suspense, useRef } from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { ERPTableRow } from './eRPTableRow';

const ERPTableGroupRow = React.lazy(() =>
  import('./ERPTableGroupRow').then((m) => ({ default: m.ERPTableGroupRow })),
);

interface Props {
  controller: UITableController;
  tableKey: string;
  moreDetailComponent?: React.ComponentType<{data: unknown}>;
  /** Shifts aria-rowindex when pinned-top rows are present (PR-116). */
  pinnedTopCount?: number;
}

export function ERPTableBody({
  controller,
  tableKey,
  moreDetailComponent: MoreDetailComponent,
  pinnedTopCount = 0,
}: Props) {
  const table = controller.getViewState();
  const dragRowId = useRef<number | null>(null);

  if (!table) return null;

  // Preserve UI index order (sort/filter/group — PR-120). Do not re-sort by index cell.
  const rows = table.rows;
  const hasGroups = rows.some((r) => r.rowKind === 'group');
  const displayRows = hasGroups
    ? rows
    : [...rows].sort(
        (a, b) =>
          Number(a.cells['index']?.value ?? 0) -
          Number(b.cells['index']?.value ?? 0),
      );

  return (
    <tbody className="w-full min-w-0 overflow-x-auto" role="rowgroup">
      <Suspense fallback={null}>
        {displayRows.map((row, index) => {
          const absIndex =
            index + (table.pagination.page - 1) * table.pagination.pageSize;
          if (row.rowKind === 'group') {
            return (
              <ERPTableGroupRow
                key={row.id}
                row={row}
                index={absIndex}
                pinnedTopCount={pinnedTopCount}
                table={table}
                controller={controller}
                tableKey={tableKey}
                isSelected={!!table.selectedRows?.[row.id]}
                isActive={!!controller.isActiveRow(row.id)}
              />
            );
          }
          return (
            <ERPTableRow
              key={row.id}
              row={row}
              stripeIndex={index}
              index={absIndex}
              pinnedTopCount={pinnedTopCount}
              table={table}
              controller={controller}
              tableKey={tableKey}
              draggedRowIdRef={dragRowId}
              moreDetailComponent={MoreDetailComponent}
              isSelected={!!table.selectedRows?.[row.id]}
              isActive={!!controller.isActiveRow(row.id)}
              isCut={!!controller.isCutRow(row.id)}
            />
          );
        })}
      </Suspense>
    </tbody>
  );
}
