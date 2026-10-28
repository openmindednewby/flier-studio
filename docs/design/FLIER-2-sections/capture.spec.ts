import { devices, expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mockup } from './mockups';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-sections');
const BUILD = '00f0f12';
const CLOCK = new Date('2026-10-28T15:00:00Z');
const FIXTURE = 'kizomba preset, 4 fliers, fresh browser storage, clock frozen 2026-10-28 15:00Z';
const DEVICES = [
  { name: '360', use: devices['Galaxy S5'], size: '360x640' },
  { name: '1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, size: '1280x800' },
];
const SIDES = ['before', 'A', 'B', 'C'];
const CARD = ['all-fliers', 'all-fliers-toggle', 'theme-row', 'pick-theme', 'pick-scope', 'all-fliers-row', 'add-flier', 'download-all'];

async function scan(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate((ids) => {
    const box = (n: Element): DOMRect => n.getBoundingClientRect();
    const name = (n: Element): string => n.getAttribute('data-testid') ?? `${n.tagName}:${(n.textContent ?? '').trim().slice(0, 24)}`;
    const card = document.querySelector('[data-testid="all-fliers"]') as HTMLElement;
    const inFrame = (n: Element | null): boolean => { if (!n) return false; const r = box(n); return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const present = [...ids, 'sec-theme-toggle', 'sec-scope-toggle'].filter((id) => inFrame(document.querySelector(`[data-testid="${id}"]`)));
    const note = card.querySelector('.fold-body p')?.textContent ?? '';
    const sel = (id: string): HTMLSelectElement => document.querySelector(`[data-testid="${id}"]`) as HTMLSelectElement;
    const labels = { theme: sel('pick-theme').labels?.[0]?.textContent ?? '', scope: sel('pick-scope').labels?.[0]?.textContent ?? '' };
    const controls = (row: Element): Element[] => [...row.children]
      .map((c) => (c.matches('input, select, textarea, button') ? c : c.querySelector('select, button:not(.mk-dis), input')))
      .filter((c): c is Element => c !== null && box(c).height > 1);
    const sameLine = (a: DOMRect, b: DOMRect): boolean => a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const off = (a: DOMRect, b: DOMRect): boolean => Math.abs(a.top - b.top) > 1 || Math.abs(a.height - b.height) > 1;
    const say = (n: Element): string => `${name(n)} top ${box(n).top.toFixed(0)} h ${box(n).height.toFixed(0)}`;
    const misaligned = [...document.querySelectorAll('main .row, main .mk-head')].map(controls).filter((cs) => cs.length > 1)
      .flatMap((cs) => cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => sameLine(box(a), box(b)) && off(box(a), box(b))).map((b) => [say(a), say(b)])));
    const c = box(card);
    const textFit = [...card.querySelectorAll('button, span, h2, h3, p, label, select')]
      .filter((n) => { const r = box(n); return r.width > 1 && (r.right > c.right + 0.5 || r.left < c.left - 0.5 || (n.tagName === 'BUTTON' && n.scrollWidth > n.clientWidth + 1)); })
      .map(name);
    const under44 = [...card.querySelectorAll('button, select')].filter((n) => { const r = box(n); return r.width > 1 && r.height < 44; }).map(name);
    const f = document.querySelector('[data-testid="preview-1"]');
    return { present, note, labels, misaligned, textFit, under44, cardHeight: Math.round(c.height), flier1Top: f ? Math.round(box(f).top + scrollY) : null };
  }, CARD);
}

async function ready(page: Page, side: string): Promise<void> {
  await page.clock.setFixedTime(CLOCK);
  await page.goto('/');
  await page.locator('[data-testid="preview-grid"][data-render="done"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (side !== 'before') { await page.evaluate(mockup, side); await page.waitForTimeout(300); }
}

mkdirSync(join(OUT, 'frames'), { recursive: true });
for (const d of DEVICES) for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${d.name} ${scheme}`, () => {
    const { defaultBrowserType: _b, ...use } = d.use;
    test.use({ ...use, colorScheme: scheme });
    for (const side of SIDES) {
      test(side, async ({ page }) => {
        await ready(page, side);
        const focusedOnLoad = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? '');
        await page.evaluate(() => { const a = document.querySelector('[data-testid="download-all"]') as HTMLElement; const b = document.querySelector('[data-testid="all-fliers"]') as HTMLElement; (a.getBoundingClientRect().top <= b.getBoundingClientRect().top ? a : b).scrollIntoView({ block: 'start' }); });
        await page.waitForTimeout(200);
        const file = `${side}-${d.name}-${scheme}.png`;
        await page.screenshot({ path: join(OUT, file) });
        const s = await scan(page);
        const pair = { route: '/', state: 'first load, flier 1 of 4 selected, All fliers card open', fixture: FIXTURE, viewport: d.size, colorScheme: scheme, scrollAnchor: 'higher of download-all and all-fliers, scrollIntoView block start', crop: 'viewport' };
        const frame = { option: side, side: side === 'before' ? 'before' : 'after', build: side === 'before' ? BUILD : `${BUILD} + mockup ${side}`, file, pair, focusedOnLoad, ...s };
        writeFileSync(join(OUT, 'frames', `${side}-${d.name}-${scheme}.json`), `${JSON.stringify(frame, null, 1)}\n`);
        await page.evaluate(() => { const n = document.querySelector('[data-testid="drafts-panel"]'); if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 16); });
        await page.waitForTimeout(200);
        const endFile = `${side}-${d.name}-${scheme}-drafts.png`;
        await page.screenshot({ path: join(OUT, endFile) });
        const drafts = await page.evaluate(() => { const n = document.querySelector('[data-testid="drafts-panel"]'); if (!n) return { seen: false, top: null }; const r = n.getBoundingClientRect(); return { seen: r.bottom > 0 && r.top < innerHeight, top: Math.round(r.top) }; });
        writeFileSync(join(OUT, 'frames', `${side}-${d.name}-${scheme}-drafts.json`), `${JSON.stringify({ option: side, side: frame.side, build: frame.build, file: endFile, pair: { ...pair, state: 'first load, then the PAGE scrolled to the Drafts card (no inner scroll)', scrollAnchor: 'window.scrollTo(drafts-panel top - 16)' }, draftsReachedByPageScroll: drafts }, null, 1)}
`);
        if (side === 'before') return;
        expect.soft(drafts.seen, `${side}: Drafts not reached by page scroll`).toBe(true);
        expect.soft(s.misaligned).toEqual([]);
        expect.soft(s.textFit).toEqual([]);
        expect.soft((s.present as string[]).length).toBeGreaterThanOrEqual(side === 'B' ? CARD.length - 1 : CARD.length);
      });
    }
  });
}
