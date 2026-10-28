import { test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encodeShare } from '../../../src/share/shareCodec';
import { kizombaPreset } from '../../../src/presets/kizomba';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-share-scope');
const SIDE = process.env.CAPTURE_SIDE ?? 'after';
const BUILD = process.env.CAPTURE_BUILD ?? 'unknown';
const FIXTURE = 'kizomba preset: 31 Oct / 7 Nov / 29 Nov / Upcoming, fresh browser storage';

async function itemsAndRows(page: Page, fullPage: boolean): Promise<{ items: string[]; misaligned: string[][] }> {
  return page.evaluate((full) => {
    const box = (n: Element): DOMRect => ((n as HTMLInputElement).type === 'file' && n.parentElement ? n.parentElement : n).getBoundingClientRect();
    const seen = (n: Element): boolean => { const r = box(n); return r.width > 1 && r.height > 1 && (full || (r.bottom > 0 && r.top < innerHeight)); };
    const items = [...document.querySelectorAll('main [data-testid], dialog [data-testid]')].filter(seen).map((n) => n.getAttribute('data-testid') ?? '');
    const controls = (row: Element): Element[] => [...row.children]
      .map((c) => (c.matches('input, select, textarea, button, .file') ? c : c.querySelector('input:not([type=file]), select, textarea, button, .file')))
      .filter((c): c is Element => c !== null);
    const misaligned = [...document.querySelectorAll('main .row, dialog .row')].map(controls).filter((cs) => cs.length > 1)
      .filter((cs) => { const rs = cs.map((c) => c.getBoundingClientRect()); return rs.some((r) => Math.abs(r.bottom - rs[0].bottom) > 1 && Math.abs(r.top - rs[0].top) < r.height); })
      .map((cs) => cs.map((c) => c.getAttribute('data-testid') ?? c.tagName));
    return { items: [...new Set(items)].sort(), misaligned };
  }, fullPage);
}

async function record(page: Page, option: string, shot: string, pair: Record<string, string>, fullPage: boolean, countPage = fullPage): Promise<void> {
  const file = `${option}-${SIDE}-${shot}.png`;
  await page.screenshot({ path: join(OUT, file), fullPage });
  const { items, misaligned } = await itemsAndRows(page, countPage);
  const frame = { option, shot, side: SIDE, build: BUILD, file, pair, itemsCounted: countPage ? 'whole page' : 'in frame', visibleItems: { before: items, after: items }, formRows: { misaligned } };
  mkdirSync(join(OUT, 'frames'), { recursive: true });
  writeFileSync(join(OUT, 'frames', `${option}-${SIDE}-${shot}.json`), `${JSON.stringify(frame, null, 1)}\n`);
}

for (const [width, height] of [[360, 640], [1280, 800]]) {
  test(`scope toggle at ${width}`, async ({ page }) => {
    test.skip(process.env.CAPTURE_ONLY === 'share');
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.locator('canvas').first().waitFor();

    await record(page, 'scope', String(width), { route: '/', state: 'first load, flier 1 of 4, no edits', fixture: FIXTURE, viewport: `${width}x${height}`, scrollAnchor: 'page top', crop: 'full page' }, true);
  });

  test(`share import dialog at ${width}`, async ({ page }) => {
    test.skip(process.env.CAPTURE_ONLY === 'scope');
    const { fragment } = await encodeShare(kizombaPreset());
    await page.setViewportSize({ width, height });
    await page.goto(`/#share=${fragment}`);
    await page.locator('canvas').first().waitFor();
    await page.waitForTimeout(600);

    await record(page, 'share', String(width), { route: '/#share=<4-flier kizomba link>', state: 'opened a share link in a fresh browser', fixture: FIXTURE, viewport: `${width}x${height}`, scrollAnchor: 'page top', crop: 'full page' }, true);
  });
}

test('scope control at 360 scrolled to the form card', async ({ page }) => {
  test.skip(process.env.CAPTURE_ONLY === 'share');
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await page.getByTestId('flier-form').evaluate((n) => window.scrollTo(0, n.getBoundingClientRect().top + window.scrollY));
  await page.waitForTimeout(300);

  await record(page, 'scope', '360-anchor', { route: '/', state: 'first load, flier 1 of 4, no edits', fixture: FIXTURE, viewport: '360x640', scrollAnchor: 'flier-form card top at y 0', crop: 'viewport' }, false, true);
});

test('share import dialog at 1280 in the viewport', async ({ page }) => {
  test.skip(process.env.CAPTURE_ONLY === 'scope');
  const { fragment } = await encodeShare(kizombaPreset());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/#share=${fragment}`);
  await page.locator('canvas').first().waitFor();
  await page.waitForTimeout(600);

  await record(page, 'share', '1280-viewport', { route: '/#share=<4-flier kizomba link>', state: 'opened a share link in a fresh browser', fixture: FIXTURE, viewport: '1280x800', scrollAnchor: 'page top', crop: 'viewport' }, false, true);
});
