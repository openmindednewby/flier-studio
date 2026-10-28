import { devices, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mockup } from './mockups';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-AC18-20');
const BUILD = process.env.CAPTURE_BUILD ?? '98ca2bc';
const FIXTURE = 'kizomba preset, 4 fliers, fresh browser storage';
const DEVICES = [
  { name: '360', use: devices['Galaxy S5'], size: '360x640' },
  { name: '1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, size: '1280x800' },
];
const SIDES = ['before', 'A', 'B', 'C'];

async function scan(page: Page): Promise<{ items: string[]; misaligned: string[][] }> {
  return page.evaluate(() => {
    const box = (n: Element): DOMRect => ((n as HTMLInputElement).type === 'file' && n.parentElement ? n.parentElement : n).getBoundingClientRect();
    const items = [...document.querySelectorAll('[data-testid]')].filter((n) => { const r = box(n); return r.width > 1 && r.height > 1; })
      .map((n) => (n.getAttribute('data-testid') ?? '').replace(/-\d+$/, '-n'));
    const controls = (row: Element): Element[] => [...row.children]
      .map((c) => (c.matches('input, select, textarea, button, .file') ? c : c.querySelector('input:not([type=file]), select, textarea, button, .file')))
      .filter((c): c is Element => c !== null);
    const misaligned = [...document.querySelectorAll('main .row, dialog .row')].map(controls).filter((cs) => cs.length > 1)
      .filter((cs) => { const rs = cs.map((c) => c.getBoundingClientRect()); return rs.some((r) => Math.abs(r.bottom - rs[0].bottom) > 1 && Math.abs(r.top - rs[0].top) < r.height); })
      .map((cs) => cs.map((c) => c.getAttribute('data-testid') ?? c.tagName));
    return { items: [...new Set(items)].sort(), misaligned };
  });
}

async function record(page: Page, side: string, shot: string, pair: Record<string, string>, fullPage: boolean): Promise<void> {
  const file = `${side}-${shot}.png`;
  await page.screenshot({ path: join(OUT, file), fullPage });
  const { items, misaligned } = await scan(page);
  const frame = { option: side, shot, side: side === 'before' ? 'before' : 'after', build: side === 'before' ? BUILD : `${BUILD} + mockup ${side}`, file, pair, visibleItems: items, formRows: { misaligned } };
  writeFileSync(join(OUT, 'frames', `${side}-${shot}.json`), `${JSON.stringify(frame, null, 1)}\n`);
}

async function ready(page: Page, side: string): Promise<void> {
  await page.goto('/');
  await page.locator('[data-testid="preview-grid"][data-render="done"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (side !== 'before') { await page.evaluate(mockup, side); await page.waitForTimeout(400); }
}

mkdirSync(join(OUT, 'frames'), { recursive: true });
for (const d of DEVICES) {
  test.describe(`at ${d.name}`, () => {
    const { defaultBrowserType: _browser, ...use } = d.use;
    test.use(use);
    for (const side of SIDES) {
      test(`${side} first load ${d.name}`, async ({ page }) => {
        await ready(page, side);
        await record(page, side, `load-${d.name}`, { route: '/', state: 'first load, flier 1 of 4 selected, no edits', fixture: FIXTURE, viewport: d.size, scrollAnchor: 'page top', crop: 'full page' }, true);
      });
      test(`${side} double-click flier 2 ${d.name}`, async ({ page }) => {
        await ready(page, side);
        await page.locator('[data-testid="preview-2"] canvas').scrollIntoViewIfNeeded();
        await page.locator('[data-testid="preview-2"] canvas').dblclick();
        await page.waitForTimeout(700);
        await record(page, side, `dblclick-${d.name}`, { route: '/', state: 'first load, then double-click on flier 2 canvas', fixture: FIXTURE, viewport: d.size, scrollAnchor: 'flier 2 canvas scrolled into view (scrollIntoViewIfNeeded)', crop: 'viewport' }, false);
      });
    }
  });
}
