import { devices, expect, test, type Page } from '@playwright/test';
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

interface Scan { items: string[]; misaligned: string[][]; fit: string[]; textFit: string[] }

async function scan(page: Page): Promise<Scan> {
  return page.evaluate(() => {
    const box = (n: Element): DOMRect => ((n as HTMLInputElement).type === 'file' && n.parentElement ? n.parentElement : n).getBoundingClientRect();
    const name = (n: Element): string => n.getAttribute('data-testid') ?? `${n.tagName}:${(n.textContent ?? '').trim().slice(0, 24)}`;
    const items = [...document.querySelectorAll('[data-testid]')].filter((n) => { const r = box(n); return r.width > 1 && r.height > 1; })
      .map((n) => (n.getAttribute('data-testid') ?? '').replace(/-\d+$/, '-n'));
    const controls = (row: Element): Element[] => [...row.children]
      .map((c) => (c.matches('input, select, textarea, button, .file') ? c : c.querySelector('input:not([type=file]), select, textarea, button, .file')))
      .filter((c): c is Element => c !== null && box(c).height > 1);
    const sameLine = (a: DOMRect, b: DOMRect): boolean => a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const off = (a: DOMRect, b: DOMRect): boolean => Math.abs(a.top - b.top) > 1 || Math.abs(a.height - b.height) > 1;
    const say = (n: Element): string => { const r = box(n); return `${name(n)} top ${r.top.toFixed(0)} h ${r.height.toFixed(0)}`; };
    const misaligned = [...document.querySelectorAll('main .row, dialog[open] .row')].map(controls).filter((cs) => cs.length > 1)
      .flatMap((cs) => cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => sameLine(box(a), box(b)) && off(box(a), box(b))).map((b) => [say(a), say(b)])));
    const vw = innerWidth; const vh = innerHeight;
    const fit = [...document.querySelectorAll('dialog[open]')].flatMap((d) => {
      const out: string[] = []; const r = d.getBoundingClientRect();
      if (d.scrollHeight > d.clientHeight + 1) out.push(`${name(d)} scrolls ${String(d.scrollHeight)} > ${String(d.clientHeight)}`);
      if (r.top < -0.5 || r.left < -0.5 || r.bottom > vh + 0.5 || r.right > vw + 0.5) out.push(`${name(d)} outside ${String(vw)}x${String(vh)}`);
      d.querySelectorAll('canvas, button').forEach((c) => { const k = c.getBoundingClientRect(); if (k.top < r.top - 0.5 || k.bottom > r.bottom + 0.5 || k.top < 0 || k.bottom > vh + 0.5) out.push(`${name(c)} cut ${k.top.toFixed(0)}-${k.bottom.toFixed(0)}`); });
      return out;
    });
    const scopes = [...document.querySelectorAll('[data-testid="all-fliers"], [data-testid="drafts-panel"], dialog[open]')];
    const textFit = scopes.flatMap((sc) => { const c = sc.getBoundingClientRect(); return [...sc.querySelectorAll('button, strong, span, h2, h3, p, canvas')]
      .filter((n) => { const r = n.getBoundingClientRect(); return r.width > 1 && (r.right > c.right + 0.5 || r.left < c.left - 0.5 || (n.tagName === 'BUTTON' && n.scrollWidth > n.clientWidth + 1)); })
      .map((n) => `${name(sc)} > ${name(n)}`); });
    return { items: [...new Set(items)].sort(), misaligned, fit, textFit };
  });
}

async function record(page: Page, side: string, shot: string, pair: Record<string, string>, fullPage: boolean): Promise<void> {
  const file = `${side}-${shot}.png`;
  await page.screenshot({ path: join(OUT, file), fullPage });
  const { items, misaligned, fit, textFit } = await scan(page);
  const frame = { option: side, shot, side: side === 'before' ? 'before' : 'after', build: side === 'before' ? BUILD : `${BUILD} + mockup ${side}`, file, pair, visibleItems: items, formRows: { method: 'side-by-side pairs: top and height within 1px', misaligned }, enlargeFit: fit, textFit };
  writeFileSync(join(OUT, 'frames', `${side}-${shot}.json`), `${JSON.stringify(frame, null, 1)}\n`);
  if (side === 'before') return;
  expect.soft(misaligned, `${side} ${shot}: form row off by more than 1px`).toEqual([]);
  expect.soft(fit, `${side} ${shot}: enlarged flier does not fit the viewport`).toEqual([]);
  expect.soft(textFit, `${side} ${shot}: text outside its box`).toEqual([]);
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
