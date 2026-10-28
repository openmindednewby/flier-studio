import { devices, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-AC24-27/build-r2');
const SIDE = process.env.CAPTURE_SIDE ?? 'after';
const CLOCK = new Date('2026-10-28T15:00:00Z');
const strip = ({ defaultBrowserType: _b, ...rest }: (typeof devices)[string]): Omit<(typeof devices)[string], 'defaultBrowserType'> => rest;
const DESKTOP = { ...strip(devices['Desktop Chrome']), viewport: { width: 1280, height: 800 } };
const RUNS = [
  { name: '360', use: strip(devices['Galaxy S5']) },
  { name: '1280', use: DESKTOP },
] as const;

async function focused(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const n = document.activeElement;
    const r = n?.getBoundingClientRect();
    const inView = !!r && r.height > 1 && r.top >= 0 && r.bottom <= innerHeight;
    return { focused: n?.getAttribute('data-testid') ?? n?.tagName ?? null, focusedInView: inView, flier1Top: Math.round(document.querySelector('[data-testid="preview-1"]')?.getBoundingClientRect().top ?? -1) };
  });
}

for (const run of RUNS) {
  test.describe(run.name, () => {
    test.use({ ...run.use, colorScheme: 'light' });
    test(`top ${run.name}`, async ({ page }) => {
      await page.clock.setFixedTime(CLOCK);
      await page.goto('/');
      await page.locator('canvas').first().waitFor();
      await page.evaluate(() => window.scrollTo(0, 0));
      mkdirSync(OUT, { recursive: true });
      const name = `${SIDE}-${run.name}-light-top`;
      await page.screenshot({ path: join(OUT, `${name}.png`) });
      writeFileSync(join(OUT, `${name}.json`), JSON.stringify({ side: SIDE, pair: { route: '/', state: 'load', fixture: 'kizomba preset, 4 fliers, fresh storage, clock 2026-10-28 15:00Z', viewport: run.name, anchor: 'window.scrollTo(0, 0)' }, ...(await focused(page)) }, null, 2));
    });
  });
}

test.describe('1280 text folded', () => {
  test.use({ ...DESKTOP, colorScheme: 'light' });
  test('top after Text folded and reload', async ({ page }) => {
    await page.clock.setFixedTime(CLOCK);
    await page.goto('/');
    await page.locator('canvas').first().waitFor();
    await page.getByTestId('group-toggle-text').click();
    await page.reload();
    await page.locator('canvas').first().waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    const name = `${SIDE}-1280-light-text-folded-reload`;
    await page.screenshot({ path: join(OUT, `${name}.png`) });
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify({ side: SIDE, pair: { route: '/', state: 'Text group folded, reload', fixture: 'kizomba preset, 4 fliers, clock 2026-10-28 15:00Z', viewport: '1280', anchor: 'window.scrollTo(0, 0)' }, ...(await focused(page)) }, null, 2));
  });
});
