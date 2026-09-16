/**
 * Session-only cell edit draft (PR-126). Not EventStore.
 * Typing updates drafts; Commit writes; Cancel discards.
 */

export type CellEditType = 'cell' | 'fullRow';

export type CellEditValue = {
  value: unknown;
  display: unknown;
};

export type CellEditSession = {
  rowId: number;
  /** Focused column while editing. */
  columnId: string;
  editType: CellEditType;
  /** Values at edit start — restored on cancel. */
  baseline: Readonly<Record<string, CellEditValue>>;
  /** Working copies. */
  drafts: Record<string, CellEditValue>;
};

export type CellEditOptions = {
  /** Default true — activate cell starts edit. False ⇒ need Enter / double-click / api.startEditingCell. */
  singleClickEdit: boolean;
  /** Default true — leaving the grid / clearActiveCell commits the draft. */
  stopEditingWhenCellsLoseFocus: boolean;
  /** Default `cell`. `fullRow` edits every editable column on the row. */
  editType: CellEditType;
};

export const DEFAULT_CELL_EDIT_OPTIONS: CellEditOptions = {
  singleClickEdit: true,
  stopEditingWhenCellsLoseFocus: true,
  editType: 'cell',
};

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
  return {
    rowId: input.rowId,
    columnId: input.columnId,
    editType: input.editType,
    baseline: input.baseline,
    drafts,
  };
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
  return {
    ...session,
    columnId,
    drafts: {
      ...session.drafts,
      [columnId]: {
        value: patch.value !== undefined ? patch.value : prev.value,
        display: patch.display !== undefined ? patch.display : prev.display,
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
