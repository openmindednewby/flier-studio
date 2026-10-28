import { expectFieldsAligned } from '@dloizides/e2e-helpers';
import { expect, test, type Page } from '@playwright/test';

const ROW_CONTROLS = 'select, input:not([type=file]), textarea, button, label.file';

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
}

test('the form groups its controls under Layout, Pictures and Text', async ({ page }) => {
  await open(page);
  const form = page.getByTestId('flier-form');

  const headings = await form.locator('[role=group] > h3').allTextContents();

  expect(headings).toEqual(['Layout', 'Pictures', 'Text']);
  await expect(form.getByRole('group', { name: 'Layout' }).getByTestId('pick-layout')).toBeVisible();
  await expect(form.getByRole('group', { name: 'Pictures' }).getByTestId('pick-anchor')).toBeVisible();
  await expect(form.getByRole('group', { name: 'Text' }).getByTestId('field-title')).toBeVisible();
});

test('the picture size slider shows its value and follows it', async ({ page }) => {
  await open(page);
  const value = page.getByTestId('pick-scale-value');
  await expect(value).toHaveText('100%');

  await page.getByTestId('pick-scale').fill('0.5');

  await expect(value).toHaveText('50%');
});

test('the picture alignment says it places the picture within its area, not the layout', async ({ page }) => {
  await open(page);

  const selected = await page.getByTestId('pick-anchor').evaluate((n: HTMLSelectElement) => n.selectedOptions[0]?.textContent);

  expect(selected).toBe('Bottom of its area');
});

test('every side-by-side form row shares one top edge and height', async ({ page }, info) => {
  const rows = info.project.name === 'mobile' ? '[data-testid="flier-form"] .row:not(.stack-narrow)' : '[data-testid="flier-form"] .row';
  await open(page);

  await expectFieldsAligned(page, rows, { controlSelector: ROW_CONTROLS });
});
