import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  isApplicationTableCommand,
  type TableCommand,
} from '../commands';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

const APPLICATION_TYPES = [
  'CHANGE_CELL_VALUE',
  'SAVE_DESCRIPTION',
  'CHANGE_CELL_DISPLAY_VALUE',
  'ADD_EMPTY_ROW',
  'ADD_NEW_ROWS',
  'DUPLICATE_ROW',
  'PASTE_ROW',
  'PASTE_CELLS',
  'ROW_DELETED',
  'RESTORE_ADDED_ROW',
  'TABLE_DELETED',
  'SET_ACTIVE_COLLECTION',
  'TABLE_RESET',
  'ROW_REORDERED',
  'COLUMN_REORDERED',
  'CHANGE_PAGE',
  'CHANGE_PAGE_SIZE',
  'APPLY_DYNAMIC_PROJECTION',
  'APPLY_ROW_VISIBILITY',
] as const;

const ENGINE_TYPES_WITH_CASE = [
  'ACTIVE_CELL',
  'ACTIVE_ROW',
  'MOVE_ACTIVE_CELL',
  'MOVE_ACTIVE_CELL_VERTICAL',
  'ACTIVATE_FIRST_CELL',
  'TABLE_REGISTERED',
  'TABLE_DELETED',
  'TABLE_DISPOSED',
  'TABLE_RESET',
  'ROW_EXPANDED',
  'ROW_EXPAND_TOGGLED',
  'COLLAPSE_ALL_ROWS',
  'MOVE_VERTICAL_SELECTED_ROWS',
  'MOVE_VERTICAL_ACTIVE_ROW',
  'ROWS_DELETED',
  'TOGGLE_SELECT_ALL_ROWS',
  'TOGGLE_SELECT_PAGE_ROWS',
  'CLEAR_ROW_SELECTION',
  'ROW_SELECTION_TOGGLED',
  'ROW_RANGE_SELECTED',
  'ROW_SELECTED',
  'SELECT_FROM_ACTIVE_TO_LAST',
  'SET_TABLE_ACTION',
  'SET_GRID_SEARCH',
  'SET_MOBILE_EDITOR',
  'RESIZE_COLUMN',
  'SET_COLUMN_VISIBLE',
  'TOGGLE_COLUMN_GROUP',
  'SET_COLUMN_PIN',
  'SET_SORT_MODEL',
] as const;

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
    expect(
      isApplicationTableCommand({
        type: 'CLEAR_ROW_SELECTION',
        tableKey: 'table-1',
      }),
    ).toBe(false);
  });

  it('every ApplicationTableCommand type has a TableAppService case', () => {
    const service = load('application/TableAppService.ts');
    for (const type of APPLICATION_TYPES) {
      expect(service, `missing case ${type}`).toContain(`case '${type}'`);
    }
    expect(service).not.toContain('SET_UNIT_LEVEL');
  });

  it('every TableCommand type has an engine or AppService case', () => {
    const commandsSrc = load('application/commands/index.ts');
    const engine = load('engine/tableEngine.ts');
    const service = load('application/TableAppService.ts');
    const handler = load('application/handlers/tableCommandHandler.ts');
    const types = [
      ...new Set(
        [...commandsSrc.matchAll(/readonly type:\s*['"]([A-Z_]+)['"]/g)].map(
          (m) => m[1],
        ),
      ),
    ];
    const app = new Set<string>(APPLICATION_TYPES);

    expect(types).toContain('CLEAR_ROW_SELECTION');
    expect(types).not.toContain('SET_UNIT_LEVEL');

    for (const type of types) {
      if (app.has(type)) {
        expect(service, `missing AppService case ${type}`).toContain(
          `case '${type}'`,
        );
        continue;
      }
      expect(engine, `missing engine case ${type}`).toContain(`case '${type}'`);
    }

    for (const type of ENGINE_TYPES_WITH_CASE) {
      expect(engine, `missing case ${type}`).toContain(`case '${type}'`);
    }
    expect(engine).not.toContain('SET_UNIT_LEVEL');
    expect(handler).not.toContain('ChangeUnitLevelHandler');
    expect(handler).not.toContain('addColumns([])');
  });
});
