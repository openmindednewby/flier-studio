import { expect, test } from '@playwright/test';
import { Panel, openPanel } from './panel';

const NAME = 'Enter saved';

test.describe('Enter in a single-line input runs its action (ENTER-SUBMIT-1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  });

  test('typing a template name and pressing Enter saves it under My templates', async ({ page }) => {
    await openPanel(page, Panel.Templates);
    await page.getByTestId('templates-save-name').fill(NAME);

    await page.getByTestId('templates-save-name').press('Enter');

    await expect(page.getByTestId('templates-mine').getByRole('listitem')).toHaveCount(1);
    await expect(page.getByTestId('templates-mine')).toContainText(NAME);
  });

  test('typing a config name and pressing Enter saves it into the saved list', async ({ page }) => {
    await openPanel(page, Panel.Configs);
    await page.getByTestId('config-name').fill(NAME);

    await page.getByTestId('config-name').press('Enter');

    await expect(page.getByTestId('config-pick')).toHaveValue(NAME);
  });
});
