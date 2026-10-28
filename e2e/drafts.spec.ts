import { expect, test } from '@playwright/test';

const SAVE_MS = 1000;
const KEEP = 50;
const TITLE = 'Draft check title';

test.describe('drafts on this device (AC-21, AC-22, AC-23)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(1);
  });

  test('a change saves a new draft within 1 s, a reload keeps it, and Restore brings an older one back', async ({ page }) => {
    const original = await page.getByTestId('field-title').inputValue();
    const rows = page.getByTestId('drafts-list').getByRole('listitem');

    await page.getByTestId('field-title').fill(TITLE);

    await expect(rows).toHaveCount(2, { timeout: SAVE_MS });
    await expect(rows.first().getByRole('img')).toBeVisible();
    await expect(rows.first()).toContainText('4 fliers');
    await page.reload();
    await expect(page.getByTestId('field-title')).toHaveValue(TITLE);
    await page.getByTestId('draft-restore-2').click();
    await expect(page.getByTestId('field-title')).toHaveValue(original);
  });

  test('a starred draft shows under Favourites and stays starred after a reload', async ({ page }) => {
    await page.getByTestId('field-title').fill(TITLE);
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(2, { timeout: SAVE_MS });

    await page.getByTestId('draft-star-2').click();

    await expect(page.getByTestId('draft-star-2')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('drafts-favourites').click();
    await expect(page.getByTestId('drafts-favourites')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(1);
    await page.reload();
    await expect(page.getByTestId('drafts-favourites')).toHaveText('Favourites (1)');
  });

  test('unstarred drafts stop at the last 50 and a starred one is never pruned', async ({ page }) => {
    test.setTimeout(120_000);
    await page.getByTestId('draft-star-1').click();
    for (let i = 1; i <= KEEP + 2; i++) {
      await page.getByTestId('field-title').fill(`${TITLE} ${String(i)}`);
      await expect(page.getByTestId('drafts-all')).toHaveText(`All (${String(Math.min(i, KEEP) + 1)})`, { timeout: 2 * SAVE_MS });
    }

    await page.getByTestId('drafts-favourites').click();

    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(1);
  });
});

test('when storage is full the change is kept and the page says the draft was not saved', async ({ page }) => {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.add = function full(): IDBRequest {
      throw new DOMException('full', 'QuotaExceededError');
    };
  });
  await page.goto('/');
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');

  await page.getByTestId('field-title').fill(TITLE);

  await expect(page.getByTestId('status')).toContainText('Storage on this device is full');
  await page.reload();
  await expect(page.getByTestId('field-title')).toHaveValue(TITLE);
});
