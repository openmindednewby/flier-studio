import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SELECT_ARROW_PX = 28;
const FULL_ROW_SHARE = 0.9;
const FORMATS = ['story', 'phone', 'desktop'];

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
}

function canvasData(page: Page, flier: string): Promise<string> {
  return page.getByTestId(`preview-${flier}`).locator('canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL());
}

test('the layout picker is a full-width row and every layout label fits the select', async ({ page }) => {
  await open(page);
  const misfits: string[] = [];

  for (const format of FORMATS) {
    await page.getByTestId('pick-format').selectOption(format);
    const fit = await page.getByTestId('pick-layout').evaluate((node: HTMLSelectElement, arrow) => {
      const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
      const style = getComputedStyle(node);
      ctx.font = style.font;
      const room = node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - arrow;
      const card = node.closest('section') as HTMLElement;
      const cardStyle = getComputedStyle(card);
      const cardRoom = card.clientWidth - parseFloat(cardStyle.paddingLeft) - parseFloat(cardStyle.paddingRight);
      return { over: [...node.options].filter((o) => ctx.measureText(o.text).width > room).map((o) => o.text), share: node.getBoundingClientRect().width / cardRoom };
    }, SELECT_ARROW_PX);
    misfits.push(...fit.over);
    expect(fit.share).toBeGreaterThan(FULL_ROW_SHARE);
  }

  expect(misfits).toEqual([]);
});

test('an edited title and an uploaded picture survive a reload without Save', async ({ page }) => {
  await open(page);
  await page.getByTestId('field-title').fill('AUTOSAVED');
  await page.getByTestId('upload-picture').setInputFiles(join(process.cwd(), 'public', 'img', 'logo.png'));
  await expect.poll(() => page.evaluate(async () => (await indexedDB.databases()).length)).toBeGreaterThan(0);
  await page.waitForTimeout(600);
  const before = await canvasData(page, '1');

  await page.reload();
  await page.locator('canvas').first().waitFor();

  await expect(page.getByTestId('field-title')).toHaveValue('AUTOSAVED');
  await expect.poll(() => canvasData(page, '1')).toBe(before);
});

test('the list layout with no rows shows a hint pointing at the Dates field', async ({ page }) => {
  await open(page);
  await page.getByTestId('edit-4').click();

  await page.getByTestId('field-itemDates').fill('');

  await expect(page.getByTestId('preview-4').getByTestId('list-hint')).toBeVisible();
});
