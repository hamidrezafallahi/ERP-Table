import { test, expect, gotoHarness } from './helpers';

/**
 * Visual / theme regression (PR-133).
 * Pixel baselines are environment-sensitive (fonts/OS). We assert theme + direction
 * contracts and capture PNG artifacts for human/CI review.
 */
test.describe('visual regression', () => {
  test('light LTR', async ({ page }, testInfo) => {
    await gotoHarness(page, { scenario: 'visual', rows: 8, theme: 'light', locale: 'en' });
    const grid = page.locator('[data-pdg-grid]');
    await expect(grid).toBeVisible();
    await expect(grid).toHaveAttribute('data-erp-theme', 'light');
    await expect(page.locator('[data-e2e-harness]')).toBeVisible();
    await testInfo.attach('grid-light-ltr', {
      body: await grid.screenshot(),
      contentType: 'image/png',
    });
  });

  test('dark LTR', async ({ page }, testInfo) => {
    await gotoHarness(page, { scenario: 'visual', rows: 8, theme: 'dark', locale: 'en' });
    const grid = page.locator('[data-pdg-grid]');
    await expect(grid).toHaveAttribute('data-erp-theme', 'dark');
    await testInfo.attach('grid-dark-ltr', {
      body: await grid.screenshot(),
      contentType: 'image/png',
    });
  });

  test('light RTL', async ({ page }, testInfo) => {
    await gotoHarness(page, { scenario: 'visual', rows: 8, theme: 'light', locale: 'fa' });
    const grid = page.locator('[data-pdg-grid]');
    await expect(grid).toBeVisible();
    await expect(page.locator('[dir="rtl"]')).toHaveCount(1);
    await testInfo.attach('grid-light-rtl', {
      body: await grid.screenshot(),
      contentType: 'image/png',
    });
  });

  test('dark RTL', async ({ page }, testInfo) => {
    await gotoHarness(page, { scenario: 'visual', rows: 8, theme: 'dark', locale: 'fa' });
    const grid = page.locator('[data-pdg-grid]');
    await expect(grid).toHaveAttribute('data-erp-theme', 'dark');
    await expect(page.locator('[dir="rtl"]')).toHaveCount(1);
    await testInfo.attach('grid-dark-rtl', {
      body: await grid.screenshot(),
      contentType: 'image/png',
    });
  });
});
