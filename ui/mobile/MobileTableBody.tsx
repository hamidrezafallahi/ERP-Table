import { ColumnSchema } from '../../bootstrap/type';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { UIRow } from '../type';
import { MobileTableRow } from './MobileTableRow';

interface MobileTableBodyProps {
  controller: UITableController;
  tableKey: string;
  rows: UIRow[];
  columns: ColumnSchema[];
}

export function MobileTableBody({
  controller,
  tableKey,
  rows,
  columns,
}: MobileTableBodyProps) {
  return (
    <tbody className="w-full min-w-0 overflow-x-auto">
      {rows.map((row, index) => (
        <MobileTableRow
          key={row.id}
          row={row}
          index={index}
          columns={columns}
          controller={controller}
          tableKey={tableKey}
        />
      ))}
    </tbody>
  );
}
