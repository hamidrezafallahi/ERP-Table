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
  const q = query.trim();
  if (!q) return [];
  // PR-99: QuickFilterIndex candidates + UI order (no O(n) getAllRows scan).
  return controller.findColumnSearchMatches(columnId, q);
}

/** 0-based index in the same order as Desktop virtual body. */
export function getSortedRowAbsoluteIndex(
  controller: UITableController,
  rowId: number,
): number {
  return controller.getUiRowAbsoluteIndex(rowId);
}

export function computeVirtualScrollOffset(
  absoluteIndex: number,
  rowHeight: number,
  viewportSize: number,
): number {
  if (absoluteIndex < 0) return 0;
  const lead = Math.min(Math.floor(viewportSize / 3), rowHeight * 2);
  return Math.max(0, absoluteIndex * rowHeight - lead);
}

export function findTableScrollRoot(
  tableKey: string,
): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const safeKey = tableKey.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return document.querySelector(
    `[data-erp-table-scroll][data-erp-table-key="${safeKey}"]`,
  );
}

export function isVirtualScrollRoot(el: HTMLElement | null): boolean {
  return el?.dataset.erpVirtualization === 'on';
}

function getTargetPage(
  controller: UITableController,
  rowId: number,
): number | null {
  const absoluteIndex = getSortedRowAbsoluteIndex(controller, rowId);
  const table = controller.getViewState();
  if (!table || absoluteIndex < 0) return null;

  return Math.ceil((absoluteIndex + 1) / table.pagination.pageSize);
}

/**
 * Brings a row into view (pagination page change OR virtual viewport scroll).
 */
export async function revealRow(
  controller: UITableController,
  rowId: number,
): Promise<void> {
  const table = controller.getViewState();
  if (!table) return;

  const tableKey = controller.getTableKey();
  const scrollRoot = findTableScrollRoot(tableKey);
  const session = controller.getSession();

  if (isVirtualScrollRoot(scrollRoot) && session) {
    const absoluteIndex = getSortedRowAbsoluteIndex(controller, rowId);
    if (absoluteIndex < 0) return;

    const viewport = session.getViewport();
    const scrollOffset = computeVirtualScrollOffset(
      absoluteIndex,
      viewport.rowHeight,
      viewport.viewportSize,
    );

    await session.dispatchViewIntent({
      type: 'CHANGE_VIEWPORT',
      scrollOffset,
      viewportSize: viewport.viewportSize,
      rowHeight: viewport.rowHeight,
      overscan: viewport.overscan,
    });

    if (scrollRoot) {
      scrollRoot.scrollTop = scrollOffset;
    }
    return;
  }

  let targetPage: number | null;
  if (controller.isPagedWindow?.()) {
    // Stream from IDB and count the record's ordinal (sorted position) to
    // derive the page — no full row array in heap.
    const { findPagedRowPage } = await import('./pagedSearch');
    targetPage = await findPagedRowPage(controller, rowId, table.pagination.pageSize);
  } else {
    targetPage = getTargetPage(controller, rowId);
  }
  if (!targetPage) return;

  if (table.pagination.page !== targetPage) {
    await controller.dispatch({ type: 'CHANGE_PAGE', page: targetPage });
  }
}

export async function navigateToMatch(
  controller: UITableController,
  match: GridSearchMatch,
): Promise<void> {
  const table = controller.getViewState();
  if (!table) return;

  await revealRow(controller, match.rowId);
  await controller.dispatch({ type: 'UI_ACTIVE_ROW', rowId: match.rowId });
}
