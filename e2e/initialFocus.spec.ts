import { expect, test, type Page } from '@playwright/test';

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
}

async function revisit(page: Page): Promise<void> {
  await page.goto('about:blank');
  await open(page);
}

test.describe('FOCUS-1 initial focus on a desktop', () => {
  test.beforeEach(({ page: _page }, info) => {
    test.skip(info.project.name !== 'desktop');
  });

  test('on load, focuses the Title field inside the first viewport', async ({ page }) => {
    await open(page);

    const title = page.getByTestId('field-title');

    await expect(title).toBeFocused();
    await expect(title).toBeInViewport({ ratio: 1 });
  });

  test('with the Text group folded, still focuses a visible Title on the next visit', async ({ page }) => {
    await open(page);
    await page.getByTestId('group-toggle-text').click();

    await revisit(page);

    await expect(page.getByTestId('field-title')).toBeFocused();
    await expect(page.getByTestId('field-title')).toBeInViewport({ ratio: 1 });
  });

  test('with the Flier card folded, focuses the Flier header toggle on the next visit', async ({ page }) => {
    await open(page);
    await page.getByTestId('flier-form-toggle').click();

    await revisit(page);

    await expect(page.getByTestId('flier-form-toggle')).toBeFocused();
    await expect(page.getByTestId('flier-form-toggle')).toBeInViewport({ ratio: 1 });
  });
});

test.describe('contents card and header', () => {
  test('the contents card shows no visible heading and names itself On this page', async ({ page }) => {
    await open(page);

    const nav = page.getByTestId('section-nav');

    await expect(nav).toHaveAttribute('aria-label', 'On this page');
    await expect(nav.locator('h2')).toHaveCount(0);
  });

  test('on a desktop, the Generate entry shares the header top row with Download all', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await open(page);

    const [entry, download] = await Promise.all([page.getByTestId('ai-entry').boundingBox(), page.getByTestId('download-all').boundingBox()]);

    expect(entry).not.toBeNull();
    expect(download).not.toBeNull();
    expect(Math.abs((entry?.y ?? 0) + (entry?.height ?? 0) / 2 - ((download?.y ?? 0) + (download?.height ?? 0) / 2))).toBeLessThanOrEqual(2);
    expect((entry?.x ?? 0)).toBeLessThan(download?.x ?? 0);
  });
});
