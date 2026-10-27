import { expect, test } from '@playwright/test';

const MIN_HIT = 44;

test('the studio fits the viewport, every control is at least 44x44 and every text fits its box', async ({ page }) => {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();

  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const small = await page.$$eval('button, select, input:not([type=file]), summary, label.file', (els, min) =>
    els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < min || r.height < min); }).map((e) => e.outerHTML.slice(0, 80)), MIN_HIT);
  const clipped = await page.$$eval('button, label, h1, h2, p', (els) =>
    els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));

  expect(overflowX).toBeLessThanOrEqual(0);
  expect(small).toEqual([]);
  expect(clipped).toEqual([]);
});

test('at 1280 the form and the previews sit side by side in a bounded column', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  await page.locator('canvas').first().waitFor();

  const form = await page.getByTestId('flier-form').boundingBox();
  const previews = await page.getByTestId('previews').boundingBox();
  const main = await page.locator('main').boundingBox();

  expect(previews?.x ?? 0).toBeGreaterThan((form?.x ?? 0) + (form?.width ?? 0) - 1);
  expect(main?.width ?? 0).toBeLessThanOrEqual(1200);
});
