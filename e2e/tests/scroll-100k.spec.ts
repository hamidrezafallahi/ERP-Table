import { test, expect, gotoHarness } from './helpers';

test.describe('scroll 100k', () => {
  test('virtual body scrolls and mounts distant rows', async ({ page }) => {
    test.setTimeout(120_000);
    await gotoHarness(page, { scenario: 'scroll-100k', rows: 100_000 });
    const scroller = page.locator('[data-erp-table-scroll]');
    await expect(scroller).toHaveAttribute('data-erp-virtualization', 'on');

    await scroller.evaluate((el) => {
      el.scrollTop = Math.min(el.scrollHeight, 120_000);
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    // Virtual spacer above the window proves we scrolled past the first rows
    await expect
      .poll(
        async () => {
          const top = page.locator('[data-erp-virtual-spacer="top"]');
          if ((await top.count()) === 0) return 0;
          return top.locator('td').first().evaluate((el) => {
            const h = (el as HTMLElement).style.height || getComputedStyle(el).height;
            return Number.parseFloat(h) || 0;
          });
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThan(1_000);

    await expect
      .poll(async () => {
        const indexes = await page.locator('[data-pdg-row-index]').evaluateAll((nodes) =>
          nodes.map((n) => Number((n as HTMLElement).dataset.pdgRowIndex)),
        );
        const finite = indexes.filter((n) => Number.isFinite(n));
        return finite.length ? Math.max(...finite) : 0;
      })
      .toBeGreaterThan(50);
  });
});
