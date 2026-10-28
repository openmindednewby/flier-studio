import { expect, test, type Page } from '@playwright/test';

const SAVE_MS = 1000;
const TOLERANCE_PX = 1;

test.use({ locale: 'en-GB' });

const overflowingText = (page: Page): Promise<string[]> =>
  page.getByTestId('drafts-list').evaluate((list, tolerance) => {
    const found: string[] = [];
    for (const row of Array.from(list.children)) {
      const cells = Array.from(row.children);
      cells.forEach((cell, i) => {
        const box = cell.getBoundingClientRect();
        const next = cells[i + 1]?.getBoundingClientRect();
        if (next !== undefined && box.right > next.left + tolerance) found.push(`cell ${String(i)} runs into cell ${String(i + 1)}`);
        for (const inner of Array.from(cell.querySelectorAll('*'))) {
          const r = inner.getBoundingClientRect();
          if (r.right > box.right + tolerance || inner.scrollWidth > inner.clientWidth + tolerance) found.push(inner.textContent ?? '');
        }
      });
    }
    return found;
  }, TOLERANCE_PX);

test.describe('drafts list text fit (TEXT-FIT-1)', () => {
  test('with two drafts in en-GB, every date and count stays inside its cell and Restore lines up', async ({ page }) => {
    await page.goto('/');
    const rows = page.getByTestId('drafts-list').getByRole('listitem');
    await expect(rows).toHaveCount(1);
    await page.getByTestId('field-title').fill('Text fit check');
    await expect(rows).toHaveCount(2, { timeout: SAVE_MS });

    const overflow = await overflowingText(page);

    expect(overflow).toEqual([]);
    const first = await page.getByTestId('draft-restore-1').boundingBox();
    const second = await page.getByTestId('draft-restore-2').boundingBox();
    expect(Math.abs((first?.x ?? 0) - (second?.x ?? -TOLERANCE_PX * 2))).toBeLessThanOrEqual(TOLERANCE_PX);
  });
});
