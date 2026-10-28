import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '@playwright/test';

const SIDE = process.env.CAPTURE ?? '';
const BUILD = process.env.CAPTURE_BUILD ?? '';
const OUT = process.env.CAPTURE_OUT ?? join('docs', 'design', 'BGREMOVE-1');
const SCROLL_ANCHOR = 'form-group-pictures';

test('captures the picture upload area for the before/after pair, scrolled by anchor, cropped to the viewport', async ({ page }, info) => {
  test.skip(SIDE === '' || BUILD === '', 'set CAPTURE=before|after and CAPTURE_BUILD=<sha> to capture');
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  const anchor = page.locator(`#${SCROLL_ANCHOR}`).locator('..');
  await anchor.evaluate((node) => node.scrollIntoView({ block: 'start' }));
  const anchorTop = (await anchor.boundingBox())?.y ?? -1;
  const viewport = page.viewportSize() ?? { width: 0, height: 0 };
  const file = `${SIDE}-${info.project.name}.png`;

  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: join(OUT, file) });
  const pair = { route: '/', state: 'first load, flier 1 of 4, no edits', fixture: 'kizomba preset', viewport: `${viewport.width}x${viewport.height}`, scrollAnchor: SCROLL_ANCHOR, crop: 'viewport' };
  const frame = { option: 'A', shot: `pictures-${info.project.name}`, side: SIDE, build: BUILD, file, anchorTop, pair };
  writeFileSync(join(OUT, `${SIDE}-${info.project.name}.json`), JSON.stringify(frame, null, 2));
});
