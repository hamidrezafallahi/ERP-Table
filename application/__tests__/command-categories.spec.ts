import { describe, expect, it } from 'vitest';

import {
  isApplicationTableCommand,
  type TableCommand,
} from '../commands';

describe('command categories', () => {
  it('classifies app-service commands separately from engine-managed commands', () => {
    const appCommand: TableCommand = {
      type: 'CHANGE_CELL_VALUE',
      store: 'store-1',
      tableKey: 'table-1',
      rowId: 1,
      columnId: 'name',
      newValue: 'beta',
    };

    const engineCommand: TableCommand = {
      type: 'ACTIVE_CELL',
      tableKey: 'table-1',
      rowId: 1,
      columnId: 'name',
    };

    expect(isApplicationTableCommand(appCommand)).toBe(true);
    expect(isApplicationTableCommand(engineCommand)).toBe(false);
  });
});
