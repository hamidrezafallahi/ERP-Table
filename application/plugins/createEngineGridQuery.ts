import { RowStateEnum } from '../../domain/value-objects';
import type { CollectionScope } from '../../domain/entities/Table';
import type { TableEngine } from '../../engine/tableEngine';
import type { UIRow } from '../../ui/type';
import type {
  ExportRowSource,
  ExportSource,
  GridQueryPort,
} from './GridPlugin';

const hasMeaningfulValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

function cellsFromUiRow(row: UIRow): ExportRowSource['cells'] {
  const cells: Record<string, { value: unknown; display?: unknown }> = {};
  for (const [key, cell] of Object.entries(row.cells)) {
    cells[key] = { value: cell.value, display: cell.display };
  }
  return cells;
}

/**
 * Adapter: TableEngine → GridQueryPort for export plugins.
 * When row grouping is active, projects the flat UI index (group + leaf).
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

      const uiRows = engine.getAllUIRows() ?? [];
      const grouped = uiRows.some((r) => r.rowKind === 'group');

      let rows: ExportRowSource[];
      if (grouped) {
        rows = uiRows
          .filter((row) => {
            if (row.rowKind === 'group') return true;
            return row.rowState !== RowStateEnum.Deleted;
          })
          .map((row) => {
            if (row.rowKind === 'group') {
              return {
                id: row.id,
                rowState: String(row.rowState),
                cells: cellsFromUiRow(row),
                kind: 'group' as const,
                groupKey: row.groupKey,
                outlineLevel: 0,
              };
            }
            return {
              id: row.id,
              rowState: String(row.rowState),
              cells: cellsFromUiRow(row),
              kind: 'leaf' as const,
              outlineLevel: 1,
            };
          });
      } else {
        rows = (engine.getAllRows() ?? [])
          .filter((row) => {
            if (row.rowState.value === RowStateEnum.Deleted) return false;
            return Array.from(row.getCells().entries()).some(
              ([key, cell]) =>
                key !== 'index' && hasMeaningfulValue(cell.getValue()),
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
            kind: 'leaf' as const,
          }));
      }

      void collectionScope;

      return { columns, rows };
    },
  };
}
