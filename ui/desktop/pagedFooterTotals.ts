// Page-window ('paged-idb') footer totals — loaded lazily by ERPTableFooter.
// Sums fold over the WHOLE dataset streamed from IndexedDB (O(batch) heap).
import type { ColumnSchema } from '../../bootstrap/type';
import type { UITableController } from '../../infrastructure/ui/UITableController';

export function subscribePagedTotals(
  controller: UITableController,
  columns: readonly ColumnSchema[],
  setAggs: (update: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
): () => void {
  const unsubscribes: Array<(() => void) | null> = [];
  for (const column of columns) {
    if (column.fieldType !== 'price' && column.fieldType !== 'number') continue;
    unsubscribes.push(
      controller.subscribeColumn<number>(
        column.fieldName,
        'active',
        (sum, item) => sum + (Number(item.value) || 0),
        0,
        (total) => {
          setAggs((prev) => ({ ...prev, [column.fieldName]: total }));
        },
      ),
    );
  }
  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe?.());
  };
}
