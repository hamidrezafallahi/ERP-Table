import { describe, expect, it, vi } from 'vitest';

import { CellUndoStack } from '../../application/undo/CellUndoStack';
import type { CellChangedEvent } from '../../application/events';

function cellChanged(
  overrides: Partial<CellChangedEvent> = {},
): CellChangedEvent {
  return {
    type: 'CELL_CHANGED',
    tableId: 't1',
    rowId: 1,
    columnId: 'name',
    newValue: 'beta',
    previousValue: 'alpha',
    ...overrides,
  };
}

describe('CellUndoStack', () => {
  it('undo restores previousValue via compensating CHANGE_CELL_VALUE', async () => {
    const stack = new CellUndoStack();
    stack.record(cellChanged());

    const dispatch = vi.fn().mockResolvedValue(undefined);
    const ok = await stack.undo('store-1', dispatch);

    expect(ok).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-1',
      tableKey: 't1',
      rowId: 1,
      columnId: 'name',
      newValue: 'alpha',
    });
    expect(stack.canUndo()).toBe(false);
    expect(stack.canRedo()).toBe(true);
  });

  it('redo re-applies newValue', async () => {
    const stack = new CellUndoStack();
    stack.record(cellChanged());
    const dispatch = vi.fn().mockResolvedValue(undefined);

    await stack.undo('store-1', dispatch);
    await stack.redo('store-1', dispatch);

    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-1',
      tableKey: 't1',
      rowId: 1,
      columnId: 'name',
      newValue: 'beta',
    });
    expect(stack.canUndo()).toBe(true);
    expect(stack.canRedo()).toBe(false);
  });

  it('does not stack events recorded while applying undo/redo', async () => {
    const stack = new CellUndoStack();
    stack.record(cellChanged());

    const dispatch = vi.fn().mockImplementation(async () => {
      stack.record(
        cellChanged({
          newValue: 'alpha',
          previousValue: 'beta',
        }),
      );
    });

    await stack.undo('store-1', dispatch);

    expect(stack.undoDepth()).toBe(0);
    expect(stack.redoDepth()).toBe(1);
  });

  it('ignores no-op cell changes where previous equals new', () => {
    const stack = new CellUndoStack();
    stack.record(cellChanged({ newValue: 'same', previousValue: 'same' }));
    expect(stack.canUndo()).toBe(false);
  });

  it('undo of ROW_ADDED dispatches ROW_DELETED', async () => {
    const stack = new CellUndoStack();
    stack.recordRowAdded({ tableId: 't1', rowId: 42 });

    const dispatch = vi.fn().mockResolvedValue(undefined);
    await stack.undo('store-1', dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'ROW_DELETED',
      store: 'store-1',
      tableKey: 't1',
      rowId: 42,
    });
    expect(stack.canRedo()).toBe(true);
  });

  it('redo of ROW_ADDED dispatches RESTORE_ADDED_ROW with same identity', async () => {
    const stack = new CellUndoStack();
    stack.recordRowAdded({
      tableId: 't1',
      rowId: 42,
      cells: {
        name: { value: 'draft', display: 'draft', originalValue: 'draft' },
        index: { value: 2, display: 2, originalValue: 2 },
      },
      collection: 'default',
    });
    const dispatch = vi.fn().mockResolvedValue(undefined);

    await stack.undo('store-1', dispatch);
    await stack.redo('store-1', dispatch);

    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'RESTORE_ADDED_ROW',
      store: 'store-1',
      tableKey: 't1',
      rowId: 42,
      cells: {
        name: { value: 'draft', display: 'draft', originalValue: 'draft' },
        index: { value: 2, display: 2, originalValue: 2 },
      },
      collection: 'default',
      isSaveDescription: undefined,
    });
  });

  it('merges events that share correlationId into one undo unit', async () => {
    const stack = new CellUndoStack();
    stack.record(cellChanged({ columnId: 'a', newValue: '1', previousValue: '0' }), 'paste-1');
    stack.record(cellChanged({ columnId: 'b', newValue: '2', previousValue: '0' }), 'paste-1');
    stack.recordRowAdded({ tableId: 't1', rowId: 9 }, 'paste-1');

    expect(stack.undoDepth()).toBe(1);

    const dispatch = vi.fn().mockResolvedValue(undefined);
    await stack.undo('store-1', dispatch);

    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[0][0].type).toBe('ROW_DELETED');
    expect(dispatch.mock.calls[1][0].columnId).toBe('b');
    expect(dispatch.mock.calls[2][0].columnId).toBe('a');
    expect(stack.undoDepth()).toBe(0);
    expect(stack.redoDepth()).toBe(1);
  });

  it('undo of soft ROW_DELETED toggles restore via ROW_DELETED', async () => {
    const stack = new CellUndoStack();
    stack.recordRowDeleted({ tableId: 't1', rowId: 7, mode: 'soft' });

    const dispatch = vi.fn().mockResolvedValue(undefined);
    await stack.undo('store-1', dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'ROW_DELETED',
      store: 'store-1',
      tableKey: 't1',
      rowId: 7,
    });
  });

  it('undo of hard ROW_DELETED restores via RESTORE_ADDED_ROW', async () => {
    const stack = new CellUndoStack();
    stack.recordRowDeleted({
      tableId: 't1',
      rowId: 8,
      mode: 'hard',
      cells: { name: { value: 'x' } },
      collection: 'default',
    });

    const dispatch = vi.fn().mockResolvedValue(undefined);
    await stack.undo('store-1', dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'RESTORE_ADDED_ROW',
      store: 'store-1',
      tableKey: 't1',
      rowId: 8,
      cells: { name: { value: 'x' } },
      collection: 'default',
      isSaveDescription: undefined,
    });
  });

  it('cut+paste unit undoes deletes before paste clones', async () => {
    const stack = new CellUndoStack();
    stack.recordRowAdded(
      { tableId: 't1', rowId: 100, cells: { name: { value: 'c' } } },
      'cut-paste',
    );
    stack.recordRowDeleted(
      { tableId: 't1', rowId: 1, mode: 'soft' },
      'cut-paste',
    );

    expect(stack.undoDepth()).toBe(1);
    const dispatch = vi.fn().mockResolvedValue(undefined);
    await stack.undo('store-1', dispatch);

    expect(dispatch.mock.calls[0][0]).toMatchObject({
      type: 'ROW_DELETED',
      rowId: 1,
    });
    expect(dispatch.mock.calls[1][0]).toMatchObject({
      type: 'ROW_DELETED',
      rowId: 100,
    });
  });

  it('keeps separate undo units when correlationIds differ', () => {
    const stack = new CellUndoStack();
    stack.record(cellChanged({ columnId: 'a' }), 'c1');
    stack.record(cellChanged({ columnId: 'b' }), 'c2');
    expect(stack.undoDepth()).toBe(2);
  });
});
