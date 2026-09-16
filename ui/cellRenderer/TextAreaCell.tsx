import { highlightIfCurrentSearch } from '../gridSearch/highlightText';
import type { CellRenderContext } from './cellRenderContext';

/**
 * Default `textArea` editor (PR-56). Registered in DEFAULT_CELL_COMPONENTS —
 * not a `switch (FieldType)` case in CellRenderer.
 */
export function TextAreaCell(ctx: CellRenderContext) {
  const showSearchHit = !!(
    ctx.isCurrentSearchMatch && ctx.searchQuery?.trim()
  );
  const editing =
    !showSearchHit &&
    (ctx.mode === 'form' || (ctx.mode === 'cell' && ctx.isActive));
  const disabled = ctx.isDeleted || !ctx.isEditable;
  const text = ctx.value == null ? '' : String(ctx.value);

  if (!editing || disabled) {
    return (
      <span className="whitespace-pre-wrap break-words py-1 text-start">
        {showSearchHit
          ? highlightIfCurrentSearch(text, ctx.searchQuery, true)
          : text || (ctx.mode === 'view' ? '—' : '')}
      </span>
    );
  }

  return (
    <textarea
      data-erp-cell-textarea
      autoFocus={ctx.mode !== 'form'}
      disabled={disabled}
      value={text}
      rows={2}
      className={`pdg-cell-editor w-full min-h-9 py-1 text-xs bg-transparent resize-none ${
        ctx.isDeleted ? 'cursor-not-allowed' : ''
      }`}
      onChange={(e) => ctx.dispatchChangeValue(e.target.value)}
      onClick={() => ctx.activeCell()}
    />
  );
}
