import { RowStateEnum } from '../../domain/value-objects';
import type { CollectionScope } from '../../domain/entities/Table';
import type { TableEngine } from '../../engine/tableEngine';
import type {
  ExportSource,
  GridQueryPort,
} from './GridPlugin';

const hasMeaningfulValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

/**
 * Adapter: TableEngine → GridQueryPort for export plugins.
 */
export function createEngineGridQuery(engine: TableEngine): GridQueryPort {
  return {
    getSnapShot(collectionScope: CollectionScope = 'active') {
      return engine.getSnapShot(collectionScope);
    },

    getExportSource(collectionScope: CollectionScope = 'active'): ExportSource | null {
      const view = engine.getViewState();
      if (!view) return null;

      const columns = (
        view.activeCollectionColumn?.length
          ? view.activeCollectionColumn
          : (view.columns ?? [])
      )
        .filter((col) => col.fieldType !== 'index')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((col) => ({
          fieldName: col.fieldName,
          fieldCaption: col.fieldCaption,
          fieldType: col.fieldType,
          order: col.order,
        }));

      const rows = (engine.getAllRows() ?? [])
        .filter((row) => {
          if (row.rowState.value === RowStateEnum.Deleted) return false;
          return Array.from(row.getCells().entries()).some(
            ([key, cell]) => key !== 'index' && hasMeaningfulValue(cell.getValue()),
          );
        })
        .map((row) => ({
          id: row.id.value,
          rowState: String(row.rowState.value),
          cells: Object.fromEntries(
            [...row.getCells()].map(([key, cell]) => [
              key,
              {
                value: cell.getValue(),
                display: cell.getDisplay(),
              },
            ]),
          ),
        }));

      // collectionScope is honored by getSnapShot; getAllRows is active-scoped today.
      void collectionScope;

      return { columns, rows };
    },
  };
}
