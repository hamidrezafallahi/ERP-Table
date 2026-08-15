import { Row } from '../../domain/entities/Row';
import { RowStateEnum } from '../../domain/value-objects';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { GridSearchMatch } from './types';

export function getCellSearchText(
  controller: UITableController,
  rowId: number,
  columnId: string,
): string {
  const cell = controller.getCell(rowId, columnId);
  const display = cell?.getDisplay();
  const value = cell?.getValue();
  if (display != null && display !== '') return String(display);
  return String(value ?? '');
}

export function findColumnMatches(
  controller: UITableController,
  columnId: string,
  query: string,
): GridSearchMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rows = controller.getAllRows() ?? [];
  const matches: GridSearchMatch[] = [];

  for (const row of rows) {
    if (row.rowState.value === RowStateEnum.Deleted) continue;
    const text = getCellSearchText(controller, row.id.value, columnId).toLowerCase();
    if (text.includes(q)) {
      matches.push({ rowId: row.id.value, columnId });
    }
  }

  return matches;
}

function getTargetPage(
  controller: UITableController,
  rowId: number,
): number | null {
  const allRows = controller.getAllRows() ?? [];
  const table = controller.getViewState();
  if (!table) return null;

  const rowIndex = allRows.findIndex((row: Row) => row.id.value === rowId);
  if (rowIndex === -1) return null;

  return Math.ceil((rowIndex + 1) / table.pagination.pageSize);
}

export async function navigateToMatch(
  controller: UITableController,
  match: GridSearchMatch,
): Promise<void> {
  const table = controller.getViewState();
  if (!table) return;

  const targetPage = getTargetPage(controller, match.rowId);
  if (!targetPage) return;

  if (table.pagination.page !== targetPage) {
    await controller.dispatch({ type: 'CHANGE_PAGE', page: targetPage });
  }

  await controller.dispatch({ type: 'UI_ACTIVE_ROW', rowId: match.rowId });
}
