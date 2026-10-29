import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const SLACK_PX = 1;

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  await openPanel(page, Panel.All);
}

async function search(page: Page, find: string): Promise<void> {
  await page.getByTestId('replace-with').fill('Improvers');
  await page.getByTestId('replace-find').fill(find);
}

test('replacing one ticked match says Replaced 1 match, in the singular', async ({ page }) => {
  await open(page);
  await search(page, 'Intermediates');
  const rows = page.getByTestId('replace-matches').getByRole('checkbox');
  await expect(rows.first()).toBeVisible();
  const n = await rows.count();
  for (let i = 1; i < n; i++) await rows.nth(i).uncheck();

  await page.getByTestId('replace-apply').click();

  await expect(page.getByTestId('status')).toContainText('Replaced 1 match.');
});

test('at 360 a long match list keeps Replace N ticked on screen, above the mini bar', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', '360 layout only');
  await open(page);
  await search(page, 'e');
  await expect(page.getByTestId('replace-match-1')).toBeVisible();

  await page.getByTestId('replace-match-1').scrollIntoViewIfNeeded();

  const apply = page.getByTestId('replace-apply');
  const hit = await apply.evaluate((node) => {
    const r = node.getBoundingClientRect();
    return r.bottom <= window.innerHeight && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === node;
  });
  expect(hit).toBe(true);
});

test('a match on the first line of each flier keeps its badge on screen and never above the flier', async ({ page }) => {
  await open(page);
  const title = (await page.locator('[data-testid="preview-1"] canvas').getAttribute('aria-label')) ?? '';
  const word = title.split(/\s+/)[0];

  await search(page, word);

  await expect(page.locator('[data-testid="preview-1"] .replace-mark').first()).toBeVisible();
  const off = await page.locator('.replace-mark').evaluateAll((marks, slack) => marks.flatMap((m) => {
    const trim = m.closest('.trim')?.getBoundingClientRect();
    const b = m.querySelector('b')?.getBoundingClientRect();
    if (trim === undefined || b === undefined) return ['no trim'];
    const inside = b.left >= -slack && b.right <= document.documentElement.clientWidth + slack && b.top >= trim.top - slack && b.bottom <= trim.bottom + slack;
    return inside ? [] : [`${m.textContent ?? ''} badge ${String(Math.round(b.top))} vs trim ${String(Math.round(trim.top))}`];
  }), SLACK_PX);
  expect(off).toEqual([]);
});
