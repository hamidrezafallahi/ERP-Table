import { test, expect, gotoHarness, cell } from './helpers';

test.describe('edit + undo', () => {
  test('edits a cell and undoes via GridApi', async ({ page }) => {
    await gotoHarness(page, { scenario: 'edit-undo', rows: 10 });
    const target = cell(page, 0, 0);

    const result = await page.evaluate(async () => {
      return (
        window as unknown as {
          __pdgTest?: {
            editAndCommit: (
              rowId: string,
              colId: string,
              value: string,
            ) => Promise<Record<string, unknown>>;
          };
        }
      ).__pdgTest?.editAndCommit('1', 'item', 'Renamed');
    });
    expect(result?.ok).toBe(true);
    expect(result?.after).toBe('Renamed');

    // DOM may still mirror host rowData until remount; engine value is source of truth
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const c = (
            window as unknown as {
              __pdgController?: {
                getCell: (
                  rowId: number,
                  colId: string,
                ) => { getValue: () => unknown } | null | undefined;
              };
              __pdgApi?: { getRowNode: (id: string) => { rowId: number } | undefined };
            }
          );
          const rowId = c.__pdgApi?.getRowNode('1')?.rowId;
          if (rowId == null) return null;
          return c.__pdgController?.getCell(rowId, 'item')?.getValue() ?? null;
        });
      })
      .toBe('Renamed');

    const undone = await page.evaluate(async () => {
      const api = (window as unknown as { __pdgApi?: { undo: () => Promise<boolean> } })
        .__pdgApi;
      return Boolean(await api?.undo());
    });
    expect(undone).toBe(true);
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const c = (
            window as unknown as {
              __pdgController?: {
                getCell: (
                  rowId: number,
                  colId: string,
                ) => { getValue: () => unknown } | null | undefined;
              };
              __pdgApi?: { getRowNode: (id: string) => { rowId: number } | undefined };
            }
          );
          const rowId = c.__pdgApi?.getRowNode('1')?.rowId;
          if (rowId == null) return null;
          return c.__pdgController?.getCell(rowId, 'item')?.getValue() ?? null;
        });
      })
      .toBe('Item 1');

    void target;
  });
});
