import { test as base, expect, type Page } from '@playwright/test';

export async function gotoHarness(
  page: Page,
  opts: {
    scenario?: string;
    rows?: number;
    locale?: 'en' | 'fa';
    theme?: 'light' | 'dark';
  } = {},
) {
  const q = new URLSearchParams();
  if (opts.scenario) q.set('scenario', opts.scenario);
  if (opts.rows != null) q.set('rows', String(opts.rows));
  if (opts.locale) q.set('locale', opts.locale);
  if (opts.theme) q.set('theme', opts.theme);
  await page.goto(`/?${q.toString()}`);
  await expect(page.locator('[data-e2e="status"]')).toHaveText('grid-ready', {
    timeout: 30_000,
  });
  await expect(page.locator('[data-pdg-grid]')).toBeVisible();
}

export function cell(page: Page, rowIndex: number, colIndex: number) {
  return page.locator(
    `[data-pdg-row-index="${rowIndex}"][data-pdg-col-index="${colIndex}"]`,
  );
}

export const test = base.extend({});
export { expect };
