import { test } from '@playwright/test';
import { join } from 'node:path';

const NAMES = ['workshop-20261031.png', 'workshop-20261107.png', 'workshop-20261129.png', 'upcoming-workshops.png'];
const OUT = process.env.REGEN_DIR ?? '';

test('regenerate the KizombaWarrior workshop fliers from the preset', async ({ page }) => {
  test.skip(OUT === '');
  await page.goto('/');
  await page.locator('canvas').nth(NAMES.length - 1).waitFor();
  await page.waitForTimeout(1500);

  for (const [i, name] of NAMES.entries()) {
    const download = page.waitForEvent('download');
    await page.getByTestId(`download-${String(i + 1)}`).click();
    await (await download).saveAs(join(OUT, name));
  }
});
