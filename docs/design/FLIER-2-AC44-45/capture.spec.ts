import { devices, expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fontTools, runRecorder } from './fonts';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-AC44-45');
const BUILD = process.env.CAPTURE_BUILD ?? 'live';
const FIXTURE = 'fresh visitor, default Kizomba preset (4 fliers), flier 1 selected; clock 2026-10-29 09:30Z';
const DESK = { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } };
const PAIRS = ['card', 'fonts', 'card-end', 'fliers', 'card-end-typed', 'card-folded'];
const AFTER_ONLY = ['hover', 'open'];
const RUNS = [
  { name: '360', scheme: 'light', use: devices['Galaxy S5'], size: '360x640', shots: [...PAIRS, ...AFTER_ONLY] },
  { name: '1280', scheme: 'light', use: DESK, size: '1280x800', shots: [...PAIRS, ...AFTER_ONLY] },
  { name: '360', scheme: 'dark', use: devices['Galaxy S5'], size: '360x640', shots: ['fonts', ...AFTER_ONLY] },
  { name: '1280', scheme: 'dark', use: DESK, size: '1280x800', shots: ['fonts', ...AFTER_ONLY] },
] as const;
const ANCHOR: Record<string, string> = { card: 'all-fliers top - 16', fonts: 'all-fonts-row top - 16', 'card-end': 'all-fliers bottom at viewport bottom - 16', fliers: 'preview-1 scrollIntoView block center', 'card-end-typed': 'replace-text bottom at viewport bottom - 16, Find = Kizomba', 'card-folded': 'all-fliers top - 16, card folded' };

async function scan(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const box = (n: Element): DOMRect => n.getBoundingClientRect();
    const tid = (n: Element): string => n.getAttribute('data-testid') ?? '';
    const seen = (n: Element | null): boolean => { if (!n) return false; const r = box(n); return r.width > 1 && r.height > 1; };
    const inView = (n: Element | null): boolean => { if (!seen(n)) return false; const r = box(n as Element); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const TXT: Record<string, string> = { note: 'Every setting here changes', 'look-head': 'Look of every flier', 'shared-head': 'Shared text', 'replace-empty': 'Type a word or phrase' };
    const texts = Object.entries(TXT).filter(([, t]) => [...document.querySelectorAll('main p, main h3')].some((n) => inView(n) && (n.textContent ?? '').trim().startsWith(t))).map(([k]) => `txt:${k}`);
    const fold = [...document.querySelectorAll('[data-testid="all-fliers-toggle"][aria-expanded="false"]')].filter(inView).map(() => 'fold:closed');
    const inViewport = [...new Set([...document.querySelectorAll('[data-testid]')].filter(inView).map(tid)), ...texts, ...fold].sort();
    const name = (n: Element): string => tid(n) || `${n.tagName}:${(n.getAttribute('aria-label') ?? n.textContent ?? '').trim().slice(0, 24)}`;
    const controls = (row: Element): Element[] => [...row.children].map((c) => (c.matches('input, select, textarea, button') ? c : c.querySelector('select, button, input, textarea'))).filter((c): c is Element => c !== null && box(c).height > 1);
    const sameLine = (a: DOMRect, b: DOMRect): boolean => a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const off = (a: DOMRect, b: DOMRect): boolean => Math.abs(a.top - b.top) > 1 || Math.abs(a.height - b.height) > 1;
    const say = (n: Element): string => `${name(n)} top ${box(n).top.toFixed(0)} h ${box(n).height.toFixed(0)}`;
    const misaligned = [...document.querySelectorAll('main .row, .mk-srow, .mk-sseg, .mk-step, .mk-sw, .mk-sfoot, .mk-chips, .mk-c1')].filter(inView).map(controls).filter((cs) => cs.length > 1)
      .flatMap((cs) => cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => sameLine(box(a), box(b)) && off(box(a), box(b))).map((b) => [say(a), say(b)])));
    const pen = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const textFit = [...document.querySelectorAll('main button, main h2, main h3, main label > span, .mk-role b, .mk-role small, .mk-sp h4, .mk-sf > span, .mk-c1 > b, .mk-peek b')]
      .filter((n) => inView(n) && ((n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflowX !== 'auto') || box(n).right > innerWidth + 0.5)).map(name);
    const selClip = [...document.querySelectorAll('.mk-fonts select')].filter(inView).filter((n) => {
      const sel = n as HTMLSelectElement; const cs = getComputedStyle(sel); pen.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      return pen.measureText(sel.selectedOptions[0]?.text ?? '').width > sel.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 18;
    }).map((n) => `clipped select ${name(n)}`);
    const under44 = [...document.querySelectorAll('.mk-fonts button, .mk-fonts select')].filter((n) => inView(n) && (box(n).height < 43.5 || box(n).width < 43.5)).map(name);
    const hi = [...document.querySelectorAll('.mk-hi:not(.mk-hi-tag)')].filter(inView).length;
    const ae = document.activeElement;
    return { inViewport, misaligned, textFit: [...textFit, ...selClip], under44, hscroll: document.documentElement.scrollWidth > innerWidth, highlightBoxesInView: hi, roleConflicts: (window as unknown as { mkConflicts?: () => string[] }).mkConflicts?.() ?? [], focused: ae && ae !== document.body ? name(ae) : '' };
  });
}

async function rendered(page: Page): Promise<void> {
  await page.locator('[data-testid="preview-grid"][data-render="done"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

async function place(page: Page, shot: string, side: string): Promise<void> {
  await page.evaluate(() => { (window as unknown as { mkHi?: (r: null) => void }).mkHi?.(null); });
  await page.locator('[data-testid="nav-all"]').click();
  await page.waitForTimeout(250);
  const toggle = page.locator('[data-testid="all-fliers-toggle"]');
  const isOpen = (await toggle.getAttribute('aria-expanded')) !== 'false';
  if (isOpen === (shot === 'card-folded')) { await toggle.click(); await page.waitForTimeout(300); }
  if (shot !== 'card-folded') { await page.locator('[data-testid="replace-find"]').fill(shot === 'card-end-typed' ? 'Kizomba' : ''); await page.waitForTimeout(400); }
  if (side !== 'before') await page.evaluate((s) => (window as unknown as { mkFontOpen: (r: string) => void }).mkFontOpen(s === 'open' ? 'prices' : 'title'), shot);
  await page.evaluate((s) => {
    const at = (id: string): Element | null => document.querySelector(`[data-testid="${id}"]`);
    const topOf = (id: string): void => { const n = at(id); if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 16); };
    if (s === 'card' || s === 'card-folded') topOf('all-fliers');
    if (s === 'card-end-typed') { const n = at('replace-text'); if (n) window.scrollTo(0, n.getBoundingClientRect().bottom + scrollY - innerHeight + 16); }
    if (s === 'fonts' || s === 'hover') topOf('all-fonts-row');
    if (s === 'card-end') { const n = at('all-fliers'); if (n) window.scrollTo(0, n.getBoundingClientRect().bottom + scrollY - innerHeight + 16); }
    if (s === 'fliers') at('preview-1')?.scrollIntoView({ block: 'center' });
    if (s === 'open') topOf('font-role-prices');
  }, shot);
  await page.waitForTimeout(300);
  if (side === 'before' || !AFTER_ONLY.includes(shot)) return;
  const role = shot === 'hover' ? 'title' : 'prices';
  const target = page.locator(side === 'C' ? `[data-testid="font-role-${role}"] select` : `[data-testid="font-role-${role}"]`).first();
  if (shot === 'hover') await target.hover({ timeout: 3000 }).catch(() => undefined);
  await page.evaluate(({ r, n }) => (window as unknown as { mkHi: (a: string, b: string) => number }).mkHi(r, n), { r: role, n: role === 'title' ? 'Title' : 'Prices' });
  await page.waitForTimeout(150);
}

mkdirSync(join(OUT, 'frames'), { recursive: true });
for (const r of RUNS) {
  test.describe(`${r.name} ${r.scheme}`, () => {
    const { defaultBrowserType: _b, ...use } = r.use;
    test.use({ ...use, colorScheme: r.scheme });
    for (const side of ['before', 'A', 'B', 'C']) {
      test(side, async ({ page }) => {
        await page.addInitScript(runRecorder);
        await page.clock.setFixedTime(new Date('2026-10-29T09:30:00Z'));
        await page.goto('/');
        await rendered(page);
        if (side !== 'before') await page.evaluate(fontTools, side);
        await page.waitForTimeout(200);
        for (const shot of r.shots) {
          if (AFTER_ONLY.includes(shot) && side === 'before') continue;
          await place(page, shot, side);
          const file = `${side}-${r.name}-${r.scheme}-${shot}.png`;
          await page.screenshot({ path: join(OUT, file) });
          const s = await scan(page);
          const pair = AFTER_ONLY.includes(shot) ? null : { route: '/', state: `All fliers panel open, flier 1 of 4 selected; ${shot}`, fixture: FIXTURE, viewport: r.size, colorScheme: r.scheme, scrollAnchor: ANCHOR[shot], crop: 'viewport' };
          writeFileSync(join(OUT, 'frames', file.replace('.png', '.json')), `${JSON.stringify({ option: side, side: side === 'before' ? 'before' : 'after', shot, build: side === 'before' ? BUILD : `${BUILD} + mockup ${side}`, file, pair, ...s }, null, 1)}\n`);
          if (side === 'before') continue;
          expect.soft(s.misaligned, file).toEqual([]);
          expect.soft(s.textFit, file).toEqual([]);
          expect.soft(s.hscroll, file).toBe(false);
          expect.soft(s.under44, `${file} under 44`).toEqual([]);
          if (AFTER_ONLY.includes(shot)) expect.soft(s.highlightBoxesInView as number, `${file} highlight`).toBeGreaterThan(0);
          expect.soft(s.roleConflicts, `${file} role conflicts`).toEqual([]);
        }
      });
    }
  });
}
