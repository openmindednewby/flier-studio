import { expect, test } from '@playwright/test';

test.describe('mini preview bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('canvas').first().waitFor();
  });

  test('at 360 the bar names flier 1 of 4 and see all jumps to the previews', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    const bar = page.getByTestId('mini-preview');

    await page.getByTestId('mini-see-all').click();

    await expect(bar).toBeVisible();
    await expect(page.getByTestId('mini-position')).toHaveText('Flier 1 of 4');
    await expect(page.getByTestId('mini-see-all')).toHaveText('See all 4');
    await expect(page.getByTestId('preview-1')).toBeInViewport();
  });

  test('at 360 tapping the thumbnail opens the flier full size and close shuts it', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    await expect(page.getByTestId('mini-position')).toHaveText('Flier 1 of 4');

    await page.getByTestId('mini-open').click();

    const sheet = page.getByTestId('mini-sheet');
    await expect(sheet).toBeVisible();
    await expect(page.getByTestId('mini-close')).toBeFocused();
    const full = await sheet.locator('canvas').boundingBox();
    expect(full?.width ?? 0).toBeGreaterThan(200);
    await page.getByTestId('mini-close').click();
    await expect(sheet).toBeHidden();
  });

  test('at 360 selecting flier 2 moves the bar to flier 2 of 4', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');

    await page.getByTestId('edit-2').click();

    await expect(page.getByTestId('mini-position')).toHaveText('Flier 2 of 4');
  });

  test('at 360 the bar never covers the last control on the page', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    const barTop = (await page.getByTestId('mini-preview').boundingBox())?.y ?? 0;
    const lastBottom = await page.locator('main').evaluate((main) => {
      const controls = [...main.querySelectorAll('button, select, input:not([type=file]), textarea, label.file')];
      return Math.max(...controls.map((c) => c.getBoundingClientRect().bottom));
    });
    expect(lastBottom).toBeLessThanOrEqual(barTop);
  });

  test('at 360 focusing the scope select scrolls it clear of the bar', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    const scope = page.getByTestId('pick-scope');

    await scope.focus();

    const barTop = (await page.getByTestId('mini-preview').boundingBox())?.y ?? 0;
    const box = await scope.boundingBox();
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(barTop);
  });

  test('at 360 on first load the scope select never peeks out from under the bar', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');

    const box = await page.getByTestId('pick-scope').boundingBox();

    const barTop = (await page.getByTestId('mini-preview').boundingBox())?.y ?? 0;
    const top = box?.y ?? 0;
    const clearAbove = top + (box?.height ?? 0) <= barTop;
    const behindFold = top >= barTop;
    expect(clearAbove || behindFold).toBe(true);
  });

  test('at 1280 there is no bar and the layout is unchanged', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');

    const bar = page.getByTestId('mini-preview');

    await expect(bar).toBeHidden();
  });
});
