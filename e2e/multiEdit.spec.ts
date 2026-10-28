import { expect, test, type Page } from '@playwright/test';

const HIT = 44;

const footers = (page: Page): Promise<(string | undefined)[]> =>
  page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { content: { blocks: { footer?: string } } }[]).map((f) => f.content.blocks.footer));

test.describe('multi edit scope (AC-10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('canvas').first().waitFor();
  });

  test('with All fliers, a footer edit lands on every flier; with This flier, only on the current one', async ({ page }) => {
    const scope = page.getByTestId('pick-scope');
    expect((await scope.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(HIT);

    await scope.selectOption('all');
    await page.getByTestId('field-footer').fill('Hosted by Bailemos');

    await expect.poll(() => footers(page)).toEqual(Array(4).fill('Hosted by Bailemos'));
    await scope.selectOption('this');
    await page.getByTestId('field-footer').fill('Only flier one');
    await expect.poll(() => footers(page)).toEqual(['Only flier one', 'Hosted by Bailemos', 'Hosted by Bailemos', 'Hosted by Bailemos']);
  });

  test('the preset shows Beginners, Intermediates and the new footer (AC-11)', async ({ page }) => {
    const schedule = page.getByTestId('field-schedule');

    await page.getByTestId('edit-1').click();

    await expect(schedule).toHaveValue(/Beginners \| .*\nIntermediates \| /);
    await expect(page.getByTestId('field-footer')).toHaveValue('Classes by Jimmy & Ismini');
  });
});
