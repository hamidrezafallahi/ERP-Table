import { test, expect, gotoHarness } from './helpers';

test.describe('excel export', () => {
  test('export triggers an xlsx download', async ({ page }) => {
    await gotoHarness(page, { scenario: 'export', rows: 10 });
    const downloadPromise = page.waitForEvent('download', { timeout: 20_000 });
    await page.locator('[data-e2e="export-excel"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.xlsx?$/);
  });
});
