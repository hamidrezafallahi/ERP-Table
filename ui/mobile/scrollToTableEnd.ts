export function scrollToTableEnd(
  container: HTMLElement | null,
  rowId?: number,
): void {
  if (!container) return;

  container.scrollLeft = Math.max(
    0,
    container.scrollWidth - container.clientWidth,
  );

  const rowEl = rowId
    ? container.querySelector<HTMLElement>(`tr[data-rowid="${rowId}"]`)
    : container.querySelector<HTMLElement>('tbody tr:last-child');

  rowEl?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
}
