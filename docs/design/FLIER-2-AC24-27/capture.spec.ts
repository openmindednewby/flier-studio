import { devices, expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mockup } from './mockups';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-AC24-27');
const BUILD = 'ff3b43d';
const CLOCK = new Date('2026-10-28T15:00:00Z');
const FIXTURE = 'kizomba preset, 4 fliers, fresh browser storage, clock frozen 2026-10-28 15:00Z';
const RUNS = [
  { name: '360', scheme: 'light', use: devices['Galaxy S5'], size: '360x640', shots: ['top', 'editing', 'drafts', 'generate', 'configs', 'pictures', 'text', 'fliers', 'folded'] },
  { name: '1280', scheme: 'light', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, size: '1280x800', shots: ['top', 'editing', 'drafts', 'generate', 'configs', 'pictures', 'text', 'fliers'] },
  { name: '1280', scheme: 'dark', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, size: '1280x800', shots: ['top'] },
] as const;
const SIDES = ['before', 'A', 'B', 'C'];
const ANCHOR: Record<string, string> = {
  top: 'window.scrollTo(0, 0)',
  editing: 'field-items scrollIntoView block center (a lower Text field being edited)',
  drafts: 'window.scrollTo(drafts-panel top - 16) (page scroll, no inner scroll)',
  generate: 'prompt-generate scrollIntoView block center',
  configs: 'config-save scrollIntoView block center',
  pictures: 'pick-anchor scrollIntoView block center',
  text: 'field-venue scrollIntoView block center',
  fliers: 'download-1 scrollIntoView block center',
  folded: 'every group toggle folded, then window.scrollTo(flier-form top - 8)',
};

async function scan(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const box = (n: Element): DOMRect => n.getBoundingClientRect();
    const tid = (n: Element): string => n.getAttribute('data-testid') ?? '';
    const seen = (n: Element | null): boolean => { if (!n) return false; const r = box(n); return r.width > 1 && r.height > 1; };
    const inView = (n: Element | null): boolean => { if (!seen(n)) return false; const r = box(n as Element); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const all = [...document.querySelectorAll('[data-testid]')];
    const rendered = [...new Set(all.filter(seen).map(tid))].sort();
    const inViewport = [...new Set(all.filter(inView).map(tid))].sort();
    const name = (n: Element): string => tid(n) || `${n.tagName}:${(n.textContent ?? '').trim().slice(0, 24)}`;
    const controls = (row: Element): Element[] => [...row.children]
      .map((c) => (c.matches('input, select, textarea, button') ? c : c.querySelector('select, button, input, textarea')))
      .filter((c): c is Element => c !== null && box(c).height > 1);
    const sameLine = (a: DOMRect, b: DOMRect): boolean => a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const off = (a: DOMRect, b: DOMRect): boolean => Math.abs(a.top - b.top) > 1 || Math.abs(a.height - b.height) > 1;
    const say = (n: Element): string => `${name(n)} top ${box(n).top.toFixed(0)} h ${box(n).height.toFixed(0)}`;
    const misaligned = [...document.querySelectorAll('main .row, header .mk-top')].map(controls).filter((cs) => cs.length > 1)
      .flatMap((cs) => cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => sameLine(box(a), box(b)) && off(box(a), box(b))).map((b) => [say(a), say(b)])));
    const textFit = [...document.querySelectorAll('header button, header a, nav a, main button, main h2, main h3, main label > span')]
      .filter((n) => seen(n) && ((n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflowX !== 'auto') || (box(n).right > innerWidth + 0.5 && !n.closest('.mk-nav'))))
      .map(name);
    const under44 = [...document.querySelectorAll('nav a, .mk-gt, .fold-toggle, header button')].filter((n) => seen(n) && box(n).height < 44).map(name);
    const editing = document.querySelector('[data-testid="field-items"]');
    const previewBeside = inView(editing) && (inView(document.querySelector('[data-testid="preview-1"]')) || inView(document.querySelector('[data-testid="mini-preview"]')));
    const dl = document.querySelector('[data-testid="download-all"]');
    const brand = document.querySelector('[data-testid="brand"]');
    const dlOnHeader = !!dl && !!brand && sameLine(box(dl), box(brand));
    const d = document.querySelector('[data-testid="drafts-panel"]');
    const f = document.querySelector('[data-testid="preview-1"]');
    return {
      rendered, inViewport, misaligned, textFit, under44, previewBeside, dlOnHeader,
      draftsInView: inView(d), hscroll: document.documentElement.scrollWidth > innerWidth,
      flier1Top: f ? Math.round(box(f).top + scrollY) : null, pageHeight: document.documentElement.scrollHeight,
    };
  });
}

async function ready(page: Page, side: string): Promise<void> {
  await page.clock.setFixedTime(CLOCK);
  await page.goto('/');
  await page.locator('[data-testid="preview-grid"][data-render="done"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (side !== 'before') { await page.evaluate(mockup, side); await page.waitForTimeout(300); }
}

async function place(page: Page, shot: string): Promise<void> {
  if (shot === 'folded') await page.evaluate(() => { document.querySelectorAll('.mk-gt').forEach((b) => (b as HTMLElement).click()); });
  if (shot === 'top') await page.evaluate(() => window.scrollTo(0, 0));
  if (shot === 'folded') await page.evaluate(() => { const n = document.querySelector('[data-testid="flier-form"]'); if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 8); });
  if (shot === 'editing') await page.evaluate(() => document.querySelector('[data-testid="field-items"]')?.scrollIntoView({ block: 'center' }));
  if (shot === 'drafts') await page.evaluate(() => { const n = document.querySelector('[data-testid="drafts-panel"]'); if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 16); });
  if (shot === 'generate') await page.evaluate(() => document.querySelector('[data-testid="prompt-generate"]')?.scrollIntoView({ block: 'center' }));
  if (shot === 'configs') await page.evaluate(() => document.querySelector('[data-testid="config-save"]')?.scrollIntoView({ block: 'center' }));
  const center: Record<string, string> = { pictures: 'pick-anchor', text: 'field-venue', fliers: 'download-1' };
  if (center[shot]) await page.evaluate((id) => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center' }), center[shot]);
  await page.waitForTimeout(250);
}

mkdirSync(join(OUT, 'frames'), { recursive: true });
for (const r of RUNS) {
  test.describe(`${r.name} ${r.scheme}`, () => {
    const { defaultBrowserType: _b, ...use } = r.use;
    test.use({ ...use, colorScheme: r.scheme });
    for (const side of SIDES) {
      test(side, async ({ page }) => {
        await ready(page, side);
        const focusedOnLoad = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? '');
        for (const shot of r.shots) {
          if (shot === 'folded' && side === 'before') continue;
          await place(page, shot);
          const file = `${side}-${r.name}-${r.scheme}-${shot}.png`;
          await page.screenshot({ path: join(OUT, file) });
          const s = await scan(page);
          const pair = shot === 'folded' ? null : { route: '/', state: `first load, flier 1 of 4 selected, every card open; ${shot}`, fixture: FIXTURE, viewport: r.size, colorScheme: r.scheme, scrollAnchor: ANCHOR[shot], crop: 'viewport' };
          const frame = { option: side, side: side === 'before' ? 'before' : 'after', shot, build: side === 'before' ? BUILD : `${BUILD} + mockup ${side}`, file, pair, focusedOnLoad, ...s };
          writeFileSync(join(OUT, 'frames', file.replace('.png', '.json')), `${JSON.stringify(frame, null, 1)}\n`);
          if (side === 'before') continue;
          expect.soft(s.misaligned, file).toEqual([]);
          expect.soft(s.textFit, file).toEqual([]);
          expect.soft(s.hscroll, file).toBe(false);
          if (shot === 'top') expect.soft(s.dlOnHeader, `${file} download-all on header row`).toBe(true);
          if (shot === 'editing') expect.soft(s.previewBeside, `${file} preview beside the form`).toBe(true);
          if (shot === 'drafts') expect.soft(s.draftsInView, `${file} drafts by page scroll`).toBe(true);
        }
      });
    }
  });
}
