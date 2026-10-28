import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const HIT = 44;

const contents = (page: Page): Promise<string[]> =>
  page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { content: object }[]).map((f) => JSON.stringify(f.content)));

const count = (text: string, word: string): number => text.split(word).length - 1;

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  await openPanel(page, Panel.All);
}

async function search(page: Page, find: string, replacement: string): Promise<void> {
  await page.getByTestId('replace-with').fill(replacement);
  await page.getByTestId('replace-find').fill(find);
}

test.describe('AC-32 / AC-33 Replace text previews every match before any change', () => {
  test('a case-insensitive search lists each match, counts it and marks it on the fliers, changing nothing', async ({ page }) => {
    await open(page);
    const before = await contents(page);

    await search(page, 'intermediates', 'Improvers');

    const rows = page.getByTestId('replace-matches').getByRole('checkbox');
    await expect(rows.first()).toBeVisible();
    const n = await rows.count();
    expect(n).toBeGreaterThan(1);
    await expect(page.getByTestId('replace-count')).toHaveText(new RegExp(`^${String(n)} matches in \\d fliers, ${String(n)} ticked$`));
    await expect(page.getByTestId('replace-match-1')).toContainText('Intermediates');
    await expect(page.getByTestId('replace-match-1')).toContainText('Improvers');
    await expect(page.locator('[data-testid^="preview-"] .replace-mark')).toHaveCount(n);
    expect(await contents(page)).toEqual(before);
    expect((await page.getByTestId('replace-apply').boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(HIT);
  });

  test('unticking a match lowers the count and dashes its mark', async ({ page }) => {
    await open(page);
    await search(page, 'Intermediates', 'Improvers');
    await expect(page.getByTestId('replace-tick-1')).toBeVisible();
    const n = await page.getByTestId('replace-matches').getByRole('checkbox').count();

    await page.getByTestId('replace-tick-1').uncheck();

    await expect(page.getByTestId('replace-count')).toContainText(`${String(n - 1)} ticked`);
    await expect(page.getByTestId('replace-apply')).toHaveText(`Replace ${String(n - 1)} ticked`);
    await expect(page.locator('.replace-mark.off')).toHaveCount(1);
  });

  test('Whole word only drops matches inside longer words', async ({ page }) => {
    await open(page);
    await search(page, 'Intermediate', 'Improver');
    await expect(page.getByTestId('replace-tick-1')).toBeVisible();

    await page.getByTestId('replace-word').check();

    await expect(page.getByTestId('replace-matches').getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByTestId('replace-count')).toHaveText('0 matches in 0 fliers, 0 ticked');
  });
});

test.describe('AC-34 Replace applies only the ticked matches after saving a draft', () => {
  test('Replace changes the ticked matches in one step, keeps the unticked one and saves a draft first', async ({ page }) => {
    await open(page);
    await search(page, 'Intermediates', 'Improvers');
    await expect(page.getByTestId('replace-tick-1')).toBeVisible();
    const n = await page.getByTestId('replace-matches').getByRole('checkbox').count();
    await page.getByTestId('replace-tick-1').uncheck();

    await page.getByTestId('replace-apply').click();

    await expect.poll(async () => count((await contents(page)).join(','), 'Improvers')).toBe(n - 1);
    expect(count((await contents(page)).join(','), 'Intermediates')).toBe(1);
    await openPanel(page, Panel.Drafts);
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(2);
    await page.getByTestId('draft-restore-2').click();
    await expect.poll(async () => count((await contents(page)).join(','), 'Improvers')).toBe(0);
  });
});
