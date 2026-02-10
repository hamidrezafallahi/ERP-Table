import React, { useRef } from 'react';

import { NoData } from '@components/atoms/iconComponents';

import { UITableController } from '../../adapters/ui/UITableController';
import { RowStateEnum } from '../../domain/value-objects';
import { TCell } from '../../engine/type';
import { ERPTableRow } from './eRPTableRow';

interface Props {
  controller: UITableController;
  tableKey: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onActiveRowChange: (rowId: number) => void;
  onActiveColChange: (colId: string) => void;
}

export function ERPTableBody({
  controller,
  tableKey,
  onActiveRowChange,
  onActiveColChange,
}: Props) {
  // const [initialized, setInitialized] = useState(false);
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
      {rows.length === 0 && (
        <tr>
          <td
            colSpan={table.columns.filter((c) => !c.hidden).length}
            className="py-2 text-center"
          >
            <NoData config={{ width: 60, height: 60 }} />
          </td>
        </tr>
      )}

      {rows.map((row, index) => (
        <ERPTableRow
          key={row.id}
          row={row}
          index={index}
          table={table}
          controller={controller}
          tableKey={tableKey}
          onActiveRowChange={onActiveRowChange}
          onActiveColChange={onActiveColChange}
          draggedRowIdRef={dragRowId}
        />
      ))}
    </tbody>
  );
}
