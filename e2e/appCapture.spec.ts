import { join } from 'node:path';
import { test, type Page } from '@playwright/test';

const STAGE = process.env.CAPTURE ?? '';
const OUT = join('docs', 'design', 'FLIER-1-build');

async function anchorShot(page: Page, testId: string, name: string): Promise<void> {
  await page.getByTestId(testId).evaluate((node) => node.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: join(OUT, `app-${STAGE}-${name}.png`) });
}

test('capture the app form at the pair anchors', async ({ page }, info) => {
  test.skip(STAGE === '', 'set CAPTURE=before|after to capture');
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await page.evaluate(() => document.fonts.ready);

  if (info.project.name === 'mobile') {
    await anchorShot(page, 'flier-form', '360-form-top');
    await anchorShot(page, 'previews', '360-previews');
  } else {
    await anchorShot(page, 'flier-form', '1280');
  }
});
