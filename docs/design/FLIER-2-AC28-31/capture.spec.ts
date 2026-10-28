import { devices, expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mockup } from './mockups';
import { registry } from './registry';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-AC28-31');
const BUILD = 'ffd9a68';
const CLOCK = new Date('2026-10-28T15:00:00Z');
const FIXTURE = 'kizomba preset, 4 fliers, fresh browser storage, clock frozen 2026-10-28 15:00Z';
const ALL = ['top', 'allfliers', 'scope', 'form', 'hint', 'editing', 'drafts', 'generate', 'configs', 'pictures', 'text', 'fliers', 'rail'];
const DESK = { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } };
const RUNS = [
  { name: '360', scheme: 'light', use: devices['Galaxy S5'], size: '360x640', shots: ALL },
  { name: '1280', scheme: 'light', use: DESK, size: '1280x800', shots: ALL },
  { name: '360', scheme: 'dark', use: devices['Galaxy S5'], size: '360x640', shots: ['top', 'allfliers'] },
  { name: '1280', scheme: 'dark', use: DESK, size: '1280x800', shots: ['top', 'allfliers'] },
] as const;
const SIDES = ['before', 'A', 'B', 'C'];
const PANEL: Record<string, string> = { allfliers: 'all', scope: 'all', form: 'form', editing: 'form', pictures: 'form', text: 'form', drafts: 'drafts', generate: 'ai', configs: 'configs' };
const CENTER: Record<string, string> = { scope: 'pick-scope', hint: 'select-hint', editing: 'field-items', generate: 'prompt-generate', configs: 'config-save', pictures: 'pick-anchor', text: 'field-venue', fliers: 'download-1' };
const ANCHOR: Record<string, string> = {
  top: 'window.scrollTo(0, 0)',
  allfliers: 'window.scrollTo(all-fliers top - 16)',
  form: 'window.scrollTo(flier-form top - 16)',
  drafts: 'window.scrollTo(drafts-panel top - 16)',
  ...Object.fromEntries(Object.entries(CENTER).map(([k, v]) => [k, `${v} scrollIntoView block center`])),
};

async function scan(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const box = (n: Element): DOMRect => n.getBoundingClientRect();
    const tid = (n: Element): string => n.getAttribute('data-testid') ?? '';
    const seen = (n: Element | null): boolean => { if (!n) return false; const r = box(n); return r.width > 1 && r.height > 1; };
    const inView = (n: Element | null): boolean => { if (!seen(n)) return false; const r = box(n as Element); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const all = [...document.querySelectorAll('[data-testid]')];
    const inViewport = [...new Set(all.filter(inView).map(tid))].sort();
    const name = (n: Element): string => tid(n) || `${n.tagName}:${(n.textContent ?? '').trim().slice(0, 24)}`;
    const controls = (row: Element): Element[] => [...row.children]
      .map((c) => (c.matches('input, select, textarea, button') ? c : c.querySelector('select, button, input, textarea')))
      .filter((c): c is Element => c !== null && box(c).height > 1);
    const sameLine = (a: DOMRect, b: DOMRect): boolean => a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const off = (a: DOMRect, b: DOMRect): boolean => Math.abs(a.top - b.top) > 1 || Math.abs(a.height - b.height) > 1;
    const say = (n: Element): string => `${name(n)} top ${box(n).top.toFixed(0)} h ${box(n).height.toFixed(0)}`;
    const misaligned = [...document.querySelectorAll('main .row, header .top-row')].map(controls).filter((cs) => cs.length > 1)
      .flatMap((cs) => cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => sameLine(box(a), box(b)) && off(box(a), box(b))).map((b) => [say(a), say(b)])));
    const textFit = [...document.querySelectorAll('header button, header a, nav a, nav button, main button, main h2, main h3, main label > span, main dt, main dd, main small')]
      .filter((n) => seen(n) && ((n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflowX !== 'auto' && !n.closest('[data-collapsed]')) || box(n).right > innerWidth + 0.5))
      .map(name);
    const under44 = [...document.querySelectorAll('nav a, nav button, .fold-toggle, header button')].filter((n) => seen(n) && (box(n).height < 44 || box(n).width < 44)).map(name);
    const previewBeside = inView(document.querySelector('[data-testid="field-items"]')) && (inView(document.querySelector('[data-testid="preview-1"]')) || inView(document.querySelector('[data-testid="mini-preview"]')));
    const dl = document.querySelector('[data-testid="download-all"]');
    const brand = document.querySelector('[data-testid="brand"]');
    const previews = document.querySelector('[data-testid="previews"]');
    const rightKids = previews ? [...previews.children].filter(seen).map(tid) : [];
    const nav = document.querySelector('[data-testid="section-nav"]');
    const f = document.querySelector('[data-testid="preview-1"]');
    return {
      inViewport, misaligned, textFit, under44, previewBeside,
      dlOnHeader: !!dl && !!brand && sameLine(box(dl), box(brand)),
      rightOnlyFliers: rightKids.every((k) => k === 'preview-grid' || k === 'select-hint'), rightKids,
      railWidth: nav ? Math.round(box(nav).width) : null, railCollapsed: !!nav?.hasAttribute('data-collapsed'),
      draftsInView: inView(document.querySelector('[data-testid="drafts-panel"]')), hscroll: document.documentElement.scrollWidth > innerWidth,
      flier1Top: f ? Math.round(box(f).top + scrollY) : null, titleTop: (() => { const t = document.querySelector('[data-testid="field-title"]'); return t && seen(t) ? Math.round(box(t).top + scrollY) : null; })(), pageHeight: document.documentElement.scrollHeight,
    };
  });
}

async function ready(page: Page, side: string): Promise<void> {
  await page.clock.setFixedTime(CLOCK);
  await page.goto('/');
  await page.locator('[data-testid="preview-grid"][data-render="done"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (side === 'before') return;
  await page.evaluate(registry, side);
  await page.evaluate(mockup, side);
  await page.waitForTimeout(300);
}

async function place(page: Page, side: string, shot: string): Promise<void> {
  if (side === 'B' && PANEL[shot]) await page.evaluate((k) => (window as unknown as { mkShow: (k: string) => void }).mkShow(k), PANEL[shot]);
  if (shot === 'top' || shot === 'rail') await page.evaluate(() => window.scrollTo(0, 0));
  if (shot === 'rail') await page.locator('[data-testid="rail-toggle"]').click();
  for (const [s, id] of [['form', 'flier-form'], ['allfliers', 'all-fliers'], ['drafts', 'drafts-panel']]) {
    if (shot === s) await page.evaluate((x) => { const n = document.querySelector(`[data-testid="${x}"]`); if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 16); }, id);
  }
  if (CENTER[shot]) await page.evaluate((id) => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center' }), CENTER[shot]);
  await page.waitForTimeout(300);
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
          if (shot === 'rail' && side === 'before') continue;
          await place(page, side, shot);
          const file = `${side}-${r.name}-${r.scheme}-${shot}.png`;
          await page.screenshot({ path: join(OUT, file) });
          const s = await scan(page);
          const pair = shot === 'rail' ? null : { route: '/', state: `first load, flier 1 of 4 selected, every card open; ${shot}`, fixture: FIXTURE, viewport: r.size, colorScheme: r.scheme, scrollAnchor: ANCHOR[shot], crop: 'viewport' };
          const frame = { option: side, side: side === 'before' ? 'before' : 'after', shot, build: side === 'before' ? BUILD : `${BUILD} + mockup ${side}`, file, pair, focusedOnLoad, ...s };
          writeFileSync(join(OUT, 'frames', file.replace('.png', '.json')), `${JSON.stringify(frame, null, 1)}\n`);
          if (side === 'before') continue;
          expect.soft(s.misaligned, file).toEqual([]);
          expect.soft(s.textFit, file).toEqual([]);
          expect.soft(s.hscroll, file).toBe(false);
          expect.soft(s.under44, `${file} under 44`).toEqual([]);
          expect.soft(s.rightOnlyFliers, `${file} right column = fliers`).toBe(true);
          if (shot === 'top') expect.soft(s.dlOnHeader, `${file} download-all on header row`).toBe(true);
          if (shot === 'editing') expect.soft(s.previewBeside, `${file} preview beside the form`).toBe(true);
          if (shot === 'drafts') expect.soft(s.draftsInView, `${file} drafts in view`).toBe(true);
        }
      });
    }
  });
}
