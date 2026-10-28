import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '@playwright/test';

const STAGE = process.env.CAPTURE ?? '';
const OUT = join('docs', 'design', 'BGREMOVE-1');
const ANCHOR = '#form-group-pictures';
const MARGIN = 8;

test('captures the picture upload area for the before/after pair', async ({ page }, info) => {
  test.skip(STAGE === '', 'set CAPTURE=before|after to capture');
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  const group = page.locator(ANCHOR).locator('..');
  await group.evaluate((node) => node.scrollIntoView({ block: 'start' }));
  const box = await group.boundingBox();
  const viewport = page.viewportSize() ?? { width: 0, height: 0 };
  const clip = { x: 0, y: Math.max(0, (box?.y ?? 0) - MARGIN), width: viewport.width, height: Math.min(viewport.height, (box?.height ?? 0) + MARGIN * 2) };

  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: join(OUT, `${STAGE}-${info.project.name}.png`), clip });
  const pair = { route: '/', state: 'first load, flier 1 of 4, no edits', fixture: 'kizomba preset', viewport, anchor: ANCHOR, crop: clip };
  writeFileSync(join(OUT, `${STAGE}-${info.project.name}.json`), JSON.stringify({ pairMethod: 'same-steps', frames: [{ name: `${STAGE}-${info.project.name}`, pair }] }, null, 2));
});
