import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const SAVE_MS = 1000;
const UNDO_MS = 5000;
const UNDO_SLACK_MS = 1500;

async function makeDrafts(page: Page, titles: readonly string[]): Promise<void> {
  await openPanel(page, Panel.Form);
  for (const [i, title] of titles.entries()) {
    await page.getByTestId('field-title').fill(title);
    await expect(page.getByTestId('drafts-all')).toHaveText(`All (${String(i + 2)})`, { timeout: SAVE_MS });
  }
  await openPanel(page, Panel.Drafts);
}

test.describe('draft names, delete and clean up (AC-36, AC-37)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await openPanel(page, Panel.Drafts);
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(1);
  });

  test('AC-36 a row is named by its first title, and Rename in its menu changes the name in place', async ({ page }) => {
    await makeDrafts(page, ['Bachata night']);
    await expect(page.getByTestId('draft-name-1')).toContainText('Bachata night');

    await page.getByTestId('draft-more-1').click();
    await expect(page.getByTestId('draft-menu-rename')).toBeFocused();
    await page.getByTestId('draft-menu-rename').click();
    await expect(page.getByTestId('draft-name-input-1')).toBeFocused();
    await page.getByTestId('draft-name-input-1').fill('Friday class');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('draft-name-1')).toHaveText('Friday class');
    await page.reload();
    await openPanel(page, Panel.Drafts);

    await expect(page.getByTestId('draft-name-1')).toHaveText('Friday class');
  });

  test('AC-37 Delete removes the row, Undo in the toast brings it back, and the toast leaves after 5 s', async ({ page }) => {
    await makeDrafts(page, ['Undo check']);
    const rows = page.getByTestId('drafts-list').getByRole('listitem');

    await page.getByTestId('draft-more-1').click();
    await page.getByTestId('draft-menu-delete').click();
    await expect(rows).toHaveCount(1);
    await page.getByTestId('drafts-undo').click();
    await expect(rows).toHaveCount(2);
    await expect(page.getByTestId('draft-name-1')).toContainText('Undo check');
    await page.getByTestId('draft-more-1').click();
    await page.getByTestId('draft-menu-delete').click();

    await expect(page.getByTestId('drafts-toast')).toBeHidden({ timeout: UNDO_MS + UNDO_SLACK_MS });
    await expect(rows).toHaveCount(1);
  });

  test('AC-37 Clean up opens on Keep them and then deletes every draft that is not a favourite', async ({ page }) => {
    await makeDrafts(page, ['One', 'Two', 'Three']);
    const rows = page.getByTestId('drafts-list').getByRole('listitem');
    await page.getByTestId('draft-star-2').click();
    await expect(page.getByTestId('draft-star-2')).toHaveAttribute('aria-pressed', 'true');

    await page.getByTestId('drafts-cleanup').click();
    await expect(page.getByTestId('drafts-confirm-keep')).toBeFocused();
    await page.getByTestId('drafts-confirm-keep').click();
    await expect(rows).toHaveCount(4);
    await page.getByTestId('drafts-cleanup').click();
    await page.getByTestId('drafts-confirm-delete').click();

    await expect(rows).toHaveCount(1);
    await expect(page.getByTestId('draft-name-1')).toContainText('Two');
    await expect(page.getByTestId('draft-star-1')).toHaveAttribute('aria-pressed', 'true');
  });
});
