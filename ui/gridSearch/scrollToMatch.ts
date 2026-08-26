import type { GridSearchState } from '../../engine/type';
import { GridSearchMatch } from './types';

const SCROLL_EDGE_PADDING = 12;

export function buildSearchScrollKey(
  search: NonNullable<GridSearchState>,
  match: GridSearchMatch,
): string {
  return `${search.columnId}:${search.query}:${search.currentIndex}:${match.rowId}:${match.columnId}`;
}

function findMatchInContainer(
  container: HTMLElement,
  match: GridSearchMatch,
): { rowEl: HTMLElement; cellEl: HTMLElement } | null {
  const rowEl = container.querySelector<HTMLElement>(
    `tr[data-rowid="${match.rowId}"]`,
  );
  if (!rowEl) return null;

  const cellEl = rowEl.querySelector<HTMLElement>(
    `td[data-columnid="${match.columnId}"]`,
  );
  if (!cellEl) return null;

  return { rowEl, cellEl };
}

function isHorizontallyVisible(
  cellRect: DOMRect,
  containerRect: DOMRect,
): boolean {
  return (
    cellRect.left >= containerRect.left + SCROLL_EDGE_PADDING &&
    cellRect.right <= containerRect.right - SCROLL_EDGE_PADDING
  );
}

function isVerticallyVisible(
  rowRect: DOMRect,
  containerRect: DOMRect,
): boolean {
  return (
    rowRect.top >= containerRect.top + SCROLL_EDGE_PADDING &&
    rowRect.bottom <= containerRect.bottom - SCROLL_EDGE_PADDING
  );
}

export function restoreScrollPosition(
  container: HTMLElement,
  left: number,
  top: number,
): void {
  if (Math.abs(container.scrollLeft - left) > 1) {
    container.scrollLeft = left;
  }
  if (Math.abs(container.scrollTop - top) > 1) {
    container.scrollTop = top;
  }
}

export function applyScrollToMatch(
  container: HTMLElement,
  match: GridSearchMatch,
): boolean {
  const elements = findMatchInContainer(container, match);
  if (!elements) return false;

  const { rowEl, cellEl } = elements;
  const cellRect = cellEl.getBoundingClientRect();
  const rowRect = rowEl.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  let deltaX = 0;
  let deltaY = 0;

  if (!isHorizontallyVisible(cellRect, containerRect)) {
    deltaX =
      (cellRect.left + cellRect.right) / 2 -
      (containerRect.left + containerRect.right) / 2;
  }

  if (!isVerticallyVisible(rowRect, containerRect)) {
    deltaY = rowRect.top - containerRect.top - SCROLL_EDGE_PADDING;
  }

  if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
    return true;
  }

  container.scrollBy({ left: deltaX, top: deltaY, behavior: 'auto' });
  return true;
}
