/**
 * Session-only cell edit draft (PR-126). Not EventStore.
 * Typing updates drafts; Commit writes; Cancel discards.
 */

export type CellEditType = 'cell' | 'fullRow';

/**
 * When typed values become durable.
 * - `immediate`: every editor change is written to the table at once (the
 *   draft only mirrors it for a stable input). Host reads — `getRowView`,
 *   snapshots, totals, `computed` / `resolveOn` — always see what the user
 *   typed. `Esc` ends editing and keeps the value. Default for
 *   `persistence: 'paged-idb'` (the arianERP document-grid contract).
 * - `deferred`: typing only updates a session draft; the value is written when
 *   the edit is committed (move / Enter / Tab / focus leaves the grid / a
 *   durable read such as `getFullSnapShot`). `Esc` discards the draft.
 *   Default for the event-sourced mode (no EventStore write per keystroke).
 */
export type CellEditCommit = 'immediate' | 'deferred';

/**
 * What `Enter` does on an active cell.
 * - `nextCell`: like `Tab` — next editable cell of the row, then the first
 *   cell of the next row; past the last row a new empty row is added.
 *   `Shift+Enter` goes back. (Default; the data-entry behaviour.)
 * - `down`: commit and move to the cell below (spreadsheet style).
 */
export type EnterNavigation = 'nextCell' | 'down';

export type CellEditValue = {
  value: unknown;
  display: unknown;
};

export type CellEditSession = {
  rowId: number;
  /** Focused column while editing. */
  columnId: string;
  editType: CellEditType;
  /**
   * Values at edit start — restored on cancel. Moves forward when the draft
   * is written without ending the session (immediate commit / flush).
   */
  baseline: Readonly<Record<string, CellEditValue>>;
  /** Working copies. */
  drafts: Record<string, CellEditValue>;
  /** Writes of one session share it, so undo reverts the whole edit at once. */
  correlationId: string;
};

export type CellEditOptions = {
  /** Default true — activate cell starts edit. False ⇒ need Enter / double-click / api.startEditingCell. */
  singleClickEdit: boolean;
  /** Default true — leaving the grid / clearActiveCell commits the draft. */
  stopEditingWhenCellsLoseFocus: boolean;
  /** Default `cell`. `fullRow` edits every editable column on the row. */
  editType: CellEditType;
  /** Default `deferred` (createGrid picks `immediate` for `paged-idb`). */
  commit: CellEditCommit;
  /** Default `nextCell`. */
  enterNavigation: EnterNavigation;
};

export const DEFAULT_CELL_EDIT_OPTIONS: CellEditOptions = {
  singleClickEdit: true,
  stopEditingWhenCellsLoseFocus: true,
  editType: 'cell',
  commit: 'deferred',
  enterNavigation: 'nextCell',
};

let sessionSeq = 0;

export function createCellEditSession(input: {
  rowId: number;
  columnId: string;
  editType: CellEditType;
  baseline: Readonly<Record<string, CellEditValue>>;
}): CellEditSession {
  const drafts: Record<string, CellEditValue> = {};
  for (const [colId, cell] of Object.entries(input.baseline)) {
    drafts[colId] = { value: cell.value, display: cell.display };
  }
  sessionSeq += 1;
  return {
    rowId: input.rowId,
    columnId: input.columnId,
    editType: input.editType,
    baseline: input.baseline,
    drafts,
    correlationId: `cell-edit-${Date.now()}-${sessionSeq}`,
  };
}

/** Moves the baseline of `columnIds` to their current drafts (they are written). */
export function rebaseDraft(
  session: CellEditSession,
  columnIds: readonly string[],
): CellEditSession {
  if (columnIds.length === 0) return session;
  const baseline: Record<string, CellEditValue> = { ...session.baseline };
  for (const colId of columnIds) {
    const draft = session.drafts[colId];
    if (draft) baseline[colId] = { value: draft.value, display: draft.display };
  }
  return { ...session, baseline };
}

export function readDraft(
  session: CellEditSession | null | undefined,
  rowId: number,
  columnId: string,
): CellEditValue | null {
  if (!session || session.rowId !== rowId) return null;
  return session.drafts[columnId] ?? null;
}

/** True when this cell shows an editor for the active session. */
export function isEditingCell(
  session: CellEditSession | null | undefined,
  rowId: number,
  columnId: string,
): boolean {
  if (!session || session.rowId !== rowId) return false;
  if (session.editType === 'fullRow') return true;
  return session.columnId === columnId;
}

/** True when navigating away should end the current session. */
export function leavesEditSession(
  session: CellEditSession | null | undefined,
  nextRowId: number,
  nextColumnId: string,
): boolean {
  if (!session) return false;
  if (session.editType === 'fullRow') {
    return session.rowId !== nextRowId;
  }
  return session.rowId !== nextRowId || session.columnId !== nextColumnId;
}

export function patchDraft(
  session: CellEditSession,
  columnId: string,
  patch: Partial<CellEditValue>,
): CellEditSession {
  const prev = session.drafts[columnId] ??
    session.baseline[columnId] ?? { value: null, display: null };
  // Presence, not `undefined`, decides: clearing a Select sends `value: undefined`.
  return {
    ...session,
    columnId,
    drafts: {
      ...session.drafts,
      [columnId]: {
        value: 'value' in patch ? patch.value : prev.value,
        display: 'display' in patch ? patch.display : prev.display,
      },
    },
  };
}

/** Columns whose draft differs from baseline (need commit). */
export function dirtyDraftColumns(session: CellEditSession): string[] {
  const out: string[] = [];
  for (const colId of Object.keys(session.drafts)) {
    const draft = session.drafts[colId]!;
    const base = session.baseline[colId];
    if (!base) {
      out.push(colId);
      continue;
    }
    if (draft.value !== base.value || draft.display !== base.display) {
      out.push(colId);
    }
  }
  return out;
}
