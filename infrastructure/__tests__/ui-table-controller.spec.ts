import { describe, expect, it } from 'vitest';

import { UITableController } from '../ui/UITableController';

const engineStub = {
  getViewState: () => null,
  getMobileViewState: () => null,
  getRowView: () => null,
  getAllRows: () => [],
  getSnapShot: () => ({ rows: [] }),
  getCell: () => null,
  getActiveRow: () => null,
  getSelectedRows: () => ({}),
  getActiveCell: () => null,
  getMobileEditor: () => null,
  isActiveCell: () => false,
  isActiveRow: () => false,
  isSelectedRow: () => false,
  isCutRow: () => false,
  subscribe: () => () => {},
  subscribeColumn: () => () => {},
  validation: () => {},
  isValidCell: () => null,
  dispatch: async () => {},
};

const auditStub = {
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
};

describe('UITableController changelog API', () => {
  it('returns safe defaults when no changelog projection is injected', () => {
    const controller = new UITableController(
      engineStub as any,
      'store-1',
      'table-1',
      auditStub as any,
    );

    expect(controller.getChangelog()).toEqual([]);
    expect(controller.getChangelogCount()).toBe(0);
    expect(controller.getHistoryItems()).toEqual([]);
    expect(controller.getHistoryItemCount()).toBe(0);
    expect(typeof controller.subscribeChangelog(() => {})).toBe('function');
    expect(typeof controller.subscribeHistoryItems(() => {})).toBe('function');
  });
});
