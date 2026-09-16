import { test, expect, gotoHarness } from './helpers';

test.describe('sort / filter', () => {
  test('header sort updates aria-sort', async ({ page }) => {
    await gotoHarness(page, { scenario: 'sort-filter', rows: 20 });
    const priceHeader = page.locator('th', { hasText: 'Price' }).first();
    await priceHeader.click();
    await expect(priceHeader).toHaveAttribute('aria-sort', /ascending|descending/);
  });

  test('floating filter narrows visible rows', async ({ page }) => {
    await gotoHarness(page, { scenario: 'sort-filter', rows: 20 });
    const before = await page.locator('[data-pdg-row-index]').count();
    const input = page.locator('[data-pdg-floating-filter-input="category"]');
    await expect(input).toBeVisible();
    await input.fill('Parts');
    await expect
      .poll(async () => page.locator('[data-pdg-row-index]').count())
      .toBeLessThan(before);
  });
});
