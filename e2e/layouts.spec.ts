import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { FORMAT_SIZES, LAYOUT_CATALOGUE, LayoutId } from '@dloizides/poster-render';
import { expect, test } from '@playwright/test';

const OUT = join(process.cwd(), 'docs', 'design', 'FLIER-1-build');
const LIST_FLIER = '4';
const FIRST_FLIER = '1';

for (const entry of LAYOUT_CATALOGUE) {
  const format = entry.formats[0];
  test(`layout ${entry.designId} is selectable for ${format} and exports a PNG drawn in the self-hosted fonts`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    const flier = entry.id === LayoutId.List ? LIST_FLIER : FIRST_FLIER;
    await page.goto('/');
    await page.locator('canvas').first().waitFor();
    await page.getByTestId(`edit-${flier}`).click();
    const canvas = page.getByTestId(`preview-${flier}`).locator('canvas');
    const before = await canvas.elementHandle();
    const unchanged = (await page.getByTestId('pick-layout').inputValue()) === entry.id;
    await page.getByTestId('pick-format').selectOption(format);
    await page.getByTestId('pick-layout').selectOption(entry.id);
    if (!unchanged) await page.waitForFunction((node) => node?.isConnected !== true, before);
    await expect(canvas).toHaveJSProperty('width', FORMAT_SIZES[format].width);
    const fontsLoaded = await page.evaluate(() => ['700 48px "Oswald"', '400 48px "Sacramento"', '600 48px "Fredoka"'].every((f) => document.fonts.check(f)));

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId(`download-${flier}`).click()]);

    expect(fontsLoaded).toBe(true);
    expect(download.suggestedFilename()).toBe(`flier-${flier}-${format}.png`);
    if (process.env.RENDER_LAYOUTS !== undefined) {
      mkdirSync(OUT, { recursive: true });
      await download.saveAs(join(OUT, `${entry.designId}-${format}.png`));
    }
  });
}
