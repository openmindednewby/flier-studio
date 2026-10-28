import { expect, test, type Locator, type Page } from '@playwright/test';

const HIT = 44;
const FLIERS = 4;

const themeIds = (page: Page): Promise<string[]> =>
  page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { themeId: string }[]).map((f) => f.themeId));

const flier = (page: Page, n: number): Locator => page.getByTestId(`preview-${String(n)}`).getByRole('button', { name: new RegExp(`^Flier ${String(n)}:`) });

const overflowing = (page: Page, testId: string): Promise<string[]> =>
  page.getByTestId(testId).evaluate((card) =>
    [...card.querySelectorAll<HTMLElement>('span, label, button, select, h2, p, strong')].filter((e) => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent ?? ''));

test.describe('flier set (AC-18, AC-19, AC-20, D13)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  });

  test('clicking a flier selects it with crop marks and aria-pressed', async ({ page }) => {
    await flier(page, 2).click();

    await expect(page.getByTestId('preview-2')).toHaveClass(/selected/);
    await expect(flier(page, 2)).toHaveAttribute('aria-pressed', 'true');
    await expect(flier(page, 1)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('flier-form')).toContainText(`Editing flier 2 of ${String(FLIERS)}`);
    await expect(page.getByTestId('mini-sheet')).toBeHidden();
  });

  test('Enter and Space on a focused flier select it', async ({ page }) => {
    await flier(page, 3).focus();
    await page.keyboard.press('Enter');
    await expect(flier(page, 3)).toHaveAttribute('aria-pressed', 'true');
    await flier(page, 4).focus();

    await page.keyboard.press(' ');

    await expect(flier(page, 4)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('flier-form')).toContainText(`Editing flier 4 of ${String(FLIERS)}`);
  });

  test('the All fliers card holds Theme, shared edits and Add flier, and a theme change re-renders every flier', async ({ page }) => {
    const card = page.getByTestId('all-fliers');
    await expect(card.getByTestId('pick-theme')).toBeVisible();
    await expect(card.getByTestId('pick-scope')).toBeVisible();
    await expect(card.getByTestId('add-flier')).toBeVisible();
    await expect(page.getByTestId('pick-theme-scope')).toHaveCount(0);
    await expect(page.getByTestId('flier-form').getByTestId('pick-theme')).toHaveCount(0);
    await flier(page, 2).click();

    await card.getByTestId('pick-theme').selectOption({ label: 'Golden hour' });

    await expect.poll(() => themeIds(page)).toEqual(Array(FLIERS).fill('golden-hour'));
    expect(await overflowing(page, 'all-fliers')).toEqual([]);
  });

  test('the Previews heading is gone and Download all PNGs stays', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'Previews' });

    await expect(heading).toHaveCount(0);

    await expect(page.getByTestId('download-all')).toBeVisible();
  });

  test('double-clicking a flier opens it enlarged inside the viewport, and Escape returns focus to it', async ({ page }) => {
    await flier(page, 2).dblclick();

    const sheet = page.getByTestId('mini-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('aria-label', 'Flier 2 full size');
    const view = page.viewportSize() ?? { width: 0, height: 0 };
    const box = (await sheet.locator('canvas').boundingBox()) ?? { x: -1, y: -1, width: 0, height: 0 };
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(view.width);
    expect(box.y + box.height).toBeLessThanOrEqual(view.height);
    await expect(flier(page, 2)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(flier(page, 2)).toBeFocused();
  });

  for (const [card, probe] of [['all-fliers', 'pick-theme'], ['drafts-panel', 'drafts-list']] as const) {
    test(`the ${card} card folds with a 44 px keyboard toggle and remembers it after a reload`, async ({ page }) => {
      const toggle = page.getByTestId(`${card}-toggle`);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const box = (await toggle.boundingBox()) ?? { width: 0, height: 0 };
      expect(box.height).toBeGreaterThanOrEqual(HIT);
      expect(box.width).toBeGreaterThanOrEqual(HIT);

      await toggle.click();

      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByTestId(probe)).toBeHidden();
      await page.reload();
      await expect(page.getByTestId(`${card}-toggle`)).toHaveAttribute('aria-expanded', 'false');
      await page.getByTestId(`${card}-toggle`).focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId(probe)).toBeVisible();
    });
  }
});
