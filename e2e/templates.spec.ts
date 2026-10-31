import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const PRESET_FLIERS = 4;
const SAVED_NAME = 'Autumn social';
const RENAMED = 'Winter social';

const fliers = (page: Page): ReturnType<Page['locator']> => page.getByTestId('preview-grid').locator('canvas');

async function ready(page: Page, count: number): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  await expect(fliers(page)).toHaveCount(count);
}

test.describe('templates section (FLIER-TPL-1 "Flier templates section")', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await ready(page, PRESET_FLIERS);
    await openPanel(page, Panel.Templates);
  });

  test('the nav opens Templates with 4 built-ins and Use on the first one focused; Use adds exactly one flier', async ({ page }) => {
    await expect(page.getByTestId('templates-builtin').getByRole('listitem')).toHaveCount(PRESET_FLIERS);
    await expect(page.getByTestId('template-builtin-use-1')).toBeFocused();

    await page.getByTestId('template-builtin-use-2').click();

    await ready(page, PRESET_FLIERS + 1);
  });

  test('Save as template, Rename and Delete each survive a reload', async ({ page }) => {
    const mine = page.getByTestId('templates-mine').getByRole('listitem');
    await page.getByTestId('templates-save-name').fill(SAVED_NAME);
    await page.getByTestId('templates-save').click();
    await expect(mine).toHaveCount(1);
    await page.reload();
    await openPanel(page, Panel.Templates);
    await expect(page.getByTestId('template-name-1')).toHaveText(SAVED_NAME);

    await page.getByTestId('template-rename-1').click();
    await page.getByTestId('template-name-input-1').fill(RENAMED);
    await page.getByTestId('template-name-input-1').press('Enter');
    await expect(page.getByTestId('template-name-1')).toHaveText(RENAMED);
    await page.reload();
    await openPanel(page, Panel.Templates);
    await expect(page.getByTestId('template-name-1')).toHaveText(RENAMED);
    await page.getByTestId('template-use-1').click();
    await ready(page, PRESET_FLIERS + 1);

    await page.getByTestId('template-delete-1').click();
    await page.getByTestId('drafts-confirm-delete').click();
    await expect(mine).toHaveCount(0);
    await page.reload();
    await openPanel(page, Panel.Templates);
    await expect(page.getByTestId('templates-empty')).toBeVisible();
  });

  test('New template adds one blank flier and lists it under My templates; the Kizomba preset button stays', async ({ page }) => {
    await page.getByTestId('templates-layout').selectOption('arch');

    await page.getByTestId('templates-new').click();

    await ready(page, PRESET_FLIERS + 1);
    await expect(page.getByTestId('templates-mine').getByRole('listitem')).toHaveCount(1);
    await openPanel(page, Panel.Configs);
    await expect(page.getByTestId('config-preset')).toBeVisible();
  });
});
