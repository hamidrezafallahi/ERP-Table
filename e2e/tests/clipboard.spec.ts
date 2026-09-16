import { test, expect, gotoHarness, cell } from './helpers';

test.describe('clipboard', () => {
  test('Ctrl+V pastes clipboard text into a cell', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoHarness(page, { scenario: 'clipboard', rows: 10 });

    const dest = cell(page, 2, 0);
    await dest.click();
    await page.locator('[data-pdg-grid-focus]').focus();

    await page.evaluate(async () => {
      const readText = async () => 'PastedSku';
      Object.defineProperty(navigator.clipboard, 'readText', {
        configurable: true,
        value: readText,
      });
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'v',
          code: 'KeyV',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
      await new Promise((r) => setTimeout(r, 150));
    });

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
          const rowId = c.__pdgApi?.getRowNode('3')?.rowId;
          if (rowId == null) return null;
          return String(c.__pdgController?.getCell(rowId, 'item')?.getValue() ?? '');
        });
      })
      .toBe('PastedSku');
  });
});
