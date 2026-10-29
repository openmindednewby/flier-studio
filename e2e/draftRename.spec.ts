import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const offsetInRow = (page: Page, testId: string): Promise<number> =>
  page.getByTestId(testId).evaluate((node) => node.getBoundingClientRect().top - (node.closest('li')?.getBoundingClientRect().top ?? 0));

test('AC-36 Rename edits the name in place: the input takes the name line, above the row buttons', async ({ page }) => {
  await page.goto('/');
  await openPanel(page, Panel.Drafts);
  const nameTop = await offsetInRow(page, 'draft-name-1');

  await page.getByTestId('draft-more-1').click();
  await page.getByTestId('draft-menu-rename').click();

  const inputTop = await offsetInRow(page, 'draft-name-input-1');
  const input = await page.getByTestId('draft-name-input-1').boundingBox();
  const restore = await page.getByTestId('draft-restore-1').boundingBox();
  expect([Math.round(inputTop), (input?.y ?? 0) + (input?.height ?? 0) <= (restore?.y ?? -1) + 1]).toEqual([Math.round(nameTop), true]);
});
