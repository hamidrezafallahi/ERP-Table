import React, {
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { useLocale } from '../host';
import { valueParser } from '../helper';

interface Props {
  controller: UITableController;
  footer?: boolean | ReactNode;
}

export function ERPTableFooter({controller, footer}: Props) {
  const locale = useLocale();
  const [totals, setTotals] = useState<Record<string, number>>({});
  const table = controller.getViewState();
  const calculateTotals = () => {
    const view = controller.getViewState();
    if (!view) return;
    const data = controller.getSnapShot("active") as {
      rows: Array<{ cells: Record<string, { value?: unknown } | unknown> }>;
    } | null;
    if (!data) return;
    const result: Record<string, number> = {};
    view.columns.forEach((column) => {
      if (column.fieldType === "price" || column.fieldType === "number") {
        result[column.fieldName] = data.rows.reduce((sum: number, row) => {
          const cell = row.cells[column.fieldName];
          const value = typeof cell === "object" && cell !== null && "value" in cell
            ? (cell as { value?: unknown }).value
            : cell;
          return sum + (Number(value) || 0);
        }, 0);
      }
    });
    setTotals(result);
  };

  useEffect(() => {
    const view = controller.getViewState();
    if (!view) return;
    calculateTotals();
    const unsubscribes: (() => void)[] = [];
    view.columns.forEach((column) => {
      if (column.fieldType === "price" || column.fieldType === "number") {
        const unsubscribe = controller.subscribeColumn<{ value?: unknown }>(
          column.fieldName,
          "active",
          (values) => {
            setTotals((prev) => ({
              ...prev,
              [column.fieldName]: values.reduce(
                (sum, item) => sum + (Number(item.value) || 0),
                0,
              ),
            }));
          },
        );

        if (unsubscribe) unsubscribes.push(unsubscribe);
      }
    });

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [controller]);

  if (!table || !table.columns) return null;
  const cols = table.columns.filter((c) => !c.hidden).length;
  if (typeof footer === "boolean" && footer === true) {
    return (
      <tfoot>
        <tr
          className={`w-full border border-gray-gray5 bg-main-white !h-9 rounded `}
        >
          {table.columns
            .filter((c) => !c.hidden)
            .map((c) => (
              <td key={c.fieldName}>
                {c.fieldType === "price" ||
                c.fieldType === "number" ||
                c.fieldType === "static"
                  ? valueParser(totals[c.fieldName], c.fieldType, locale)
                  : null}
              </td>
            ))}
        </tr>
      </tfoot>
    );
  } else {
    return (
      <tfoot>
        <tr
          className={`w-full border border-gray-gray5 bg-main-white h-9 rounded `}
        >
          <td colSpan={cols}>{footer}</td>
        </tr>
      </tfoot>
    );
  }
}