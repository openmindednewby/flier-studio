import { devices, expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { draftsMock, readDrafts } from './drafts';
import { lineRender, lineTools } from './lines';
import { styleTools } from './style';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-AC36-39');
const BUILD = process.env.CAPTURE_BUILD ?? 'live';
const CLOCK = new Date('2026-10-29T09:30:00Z');
const SEED: [string, string][] = [['BACHATA NIGHT', '07:05'], ['SALSA SOCIAL', '07:40'], ['BACHATA', '08:10'], ['KIZOMBA NIGHT', '08:45'], ['KIZOMBA', '09:12']];
const FIXTURE = 'kizomba preset, 4 fliers; drafts seeded by typing 5 titles at 07:05-09:12Z (BACHATA NIGHT, SALSA SOCIAL, BACHATA, KIZOMBA NIGHT, KIZOMBA), drafts 2 and 4 starred; clock 2026-10-29 09:30Z';
const DESK = { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } };
const PAIRS = ['top', 'drafts', 'drafts-end', 'form', 'form-mid', 'form-end', 'lines', 'flier', 'size'];
const AFTER_ONLY = ['rename', 'cleanup', 'confirm', 'toast', 'style'];
const RUNS = [
  { name: '360', scheme: 'light', use: devices['Galaxy S5'], size: '360x640', shots: [...PAIRS, ...AFTER_ONLY] },
  { name: '1280', scheme: 'light', use: DESK, size: '1280x800', shots: [...PAIRS, ...AFTER_ONLY] },
  { name: '360', scheme: 'dark', use: devices['Galaxy S5'], size: '360x640', shots: ['drafts', 'lines', ...AFTER_ONLY] },
  { name: '1280', scheme: 'dark', use: DESK, size: '1280x800', shots: ['drafts', 'lines', ...AFTER_ONLY] },
] as const;
const PANEL: Record<string, string> = { top: 'drafts', 'form-mid': 'form', drafts: 'drafts', 'drafts-end': 'drafts', rename: 'drafts', cleanup: 'drafts', confirm: 'drafts', toast: 'drafts', style: 'form', form: 'form', 'form-end': 'form', lines: 'form', flier: 'form', size: 'form' };
const ANCHOR: Record<string, string> = { top: 'window.scrollTo(0, 0)', 'form-mid': 'field-includesHeading scrollIntoView block center', drafts: 'drafts-panel top - 16', 'drafts-end': 'drafts-panel bottom at viewport bottom - 16', rename: 'drafts-panel top - 16', cleanup: 'drafts-panel top - 16', confirm: 'drafts-panel top - 16', style: 'field-titleBottom scrollIntoView block center', toast: 'drafts-panel top - 16', form: 'flier-form top - 16', 'form-end': 'flier-form bottom at viewport bottom - 16', lines: 'field-titleBottom scrollIntoView block center', flier: 'preview-1 scrollIntoView block center', size: 'preview-1 scrollIntoView block center' };

async function scan(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const box = (n: Element): DOMRect => n.getBoundingClientRect();
    const tid = (n: Element): string => n.getAttribute('data-testid') ?? '';
    const seen = (n: Element | null): boolean => { if (!n) return false; const r = box(n); return r.width > 1 && r.height > 1; };
    const inView = (n: Element | null): boolean => { if (!seen(n)) return false; const r = box(n as Element); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const inViewport = [...new Set([...document.querySelectorAll('[data-testid]')].filter(inView).map(tid))].sort();
    const name = (n: Element): string => tid(n) || `${n.tagName}:${(n.textContent ?? '').trim().slice(0, 24)}`;
    const controls = (row: Element): Element[] => [...row.children].map((c) => (c.matches('input, select, textarea, button') ? c : c.querySelector('select, button, input, textarea'))).filter((c): c is Element => c !== null && box(c).height > 1);
    const sameLine = (a: DOMRect, b: DOMRect): boolean => a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const off = (a: DOMRect, b: DOMRect): boolean => Math.abs(a.top - b.top) > 1 || Math.abs(a.height - b.height) > 1;
    const say = (n: Element): string => `${name(n)} top ${box(n).top.toFixed(0)} h ${box(n).height.toFixed(0)}`;
    const misaligned = [...document.querySelectorAll('main .row, .mk-seg, .mk-acts, .mk-r-acts, .mk-link, .mk-bar, .mk-btns, .mk-selbar, .mk-srow, .mk-sseg, .mk-step, .mk-sw, .mk-sfoot')].map(controls).filter((cs) => cs.length > 1)
      .flatMap((cs) => cs.flatMap((a, i) => cs.slice(i + 1).filter((b) => sameLine(box(a), box(b)) && off(box(a), box(b))).map((b) => [say(a), say(b)])));
    const textFit = [...document.querySelectorAll('main button, main h2, main h3, main label > span, .mk-name, .mk-sub, .mk-lt p, .mk-toast span, .mk-dlg h2, .mk-dlg p, .mk-dlg button, .drafts li span, .mk-sp h4, .mk-sf > span, .mk-sty')]
      .filter((n) => inView(n) && ((n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflowX !== 'auto') || box(n).right > innerWidth + 0.5))
      .map(name);
    const under44 = [...document.querySelectorAll('.drafts button, .mk-seg button, .mk-ls button, .mk-bar button, .mk-dlg button, .mk-toast button, .mk-selbar button, .mk-foot button, .mk-top button, .mk-menu button, .mk-nameinput, .mk-sp button, .mk-sty')]
      .filter((n) => inView(n) && (box(n).height < 43.5 || box(n).width < 43.5)).map(name);
    const midWord = [...document.querySelectorAll('.mk-name, .mk-sub, .draft-stamp > span, .mk-lt p, .mk-toast span, .mk-dlg p, .mk-dlg h2, .mk-bar button, .drafts button, .mk-selbar button')].filter(inView).filter((n) => {
      const walk = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
      for (let t = walk.nextNode(); t; t = walk.nextNode()) {
        for (const m of (t.textContent ?? '').matchAll(/\S+/g)) {
          const r = document.createRange(); r.setStart(t, m.index ?? 0); r.setEnd(t, (m.index ?? 0) + m[0].length);
          if (new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size > 1) return true;
        }
      }
      return false;
    }).map((n) => `mid-word ${name(n)}`);
    const clipped = [...document.querySelectorAll('.drafts input, .drafts li span, .mk-name, .mk-edit')].filter(inView).filter((n) => n.clientWidth > 0 && (n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1)).map((n) => `clipped ${name(n)}`);
    const covered = [...document.querySelectorAll('.mk-toast span, .mk-toast button, .mk-bar button, .mk-selbar button, .mk-sheet button, .mk-sheet select')].filter(seen).filter((n) => {
      const r = box(n); const x = r.left + r.width / 2; const y = r.top + r.height / 2;
      if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return n.closest('.mk-toast, .mk-sheet') !== null;
      const sheet = n.closest('.mk-sheet'); if (sheet) { const sr = box(sheet); if (y < sr.top || y > sr.bottom) return false; } const hit = document.elementFromPoint(x, y); if (hit && hit.closest('.mk-dlg')) return false; if (n.closest('.mk-bar') && hit && hit.closest('[data-testid=mini-preview]')) return false; if (n.closest('.mk-selbar') && (y > innerHeight || y < 0)) return false; return !hit || !(n === hit || n.contains(hit));
    }).map((n) => `covered ${name(n)}`);
    const pen = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const selClip = [...document.querySelectorAll('.mk-sp select, .mk-lt select, .drafts select')].filter(inView).filter((n) => {
      const sel = n as HTMLSelectElement; const cs = getComputedStyle(sel);
      pen.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const room = sel.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 18;
      return pen.measureText(sel.selectedOptions[0]?.text ?? '').width > room;
    }).map((n) => `clipped select ${name(n)}`);
    const overlap = [...document.querySelectorAll('.mk-step, .mk-seg, .mk-sseg, .mk-srow, .mk-acts, .mk-r-acts, .mk-bar, .mk-sw, .mk-selbar, .mk-sfoot')].filter(inView).flatMap((g) => {
      const kids = [...g.children].filter(seen);
      const hit = (r1: DOMRect, r2: DOMRect): boolean => r1.left < r2.right - 1 && r2.left < r1.right - 1 && r1.top < r2.bottom - 1 && r2.top < r1.bottom - 1;
      return kids.flatMap((k1, i) => kids.slice(i + 1).filter((k2) => hit(box(k1), box(k2))).map((k2) => `overlap ${name(k1)} / ${name(k2)}`));
    });
    const doubled = [...document.querySelectorAll('.drafts li')].filter((li) => li.querySelectorAll(':scope > .mk-check').length > 1).map((li) => `doubled checkbox ${name(li)}`);
    const cv = document.querySelector('[data-testid="preview-1"] canvas');
    const drawn = (window as unknown as { __mkDrawn?: Map<Element, { text: string; w: number; px: number }[]> }).__mkDrawn?.get(cv as Element) ?? [];
    const pick = (t: string[]): { text: string; w: number; px: number } | undefined => drawn.find((r) => t.includes(r.text));
    const a = pick(['KIZOMBA', 'UPCOMING']);
    const b = pick(['WORKSHOP', 'WORKSHOPS']);
    const ae = document.activeElement;
    return {
      inViewport, misaligned, textFit: [...textFit, ...midWord, ...clipped, ...covered, ...selClip, ...overlap, ...doubled], under44, hscroll: document.documentElement.scrollWidth > innerWidth,
      line: a && b ? { first: a.text, second: b.text, firstW: Math.round(a.w), secondW: Math.round(b.w), firstPx: Math.round(a.px), secondPx: Math.round(b.px), canvasW: (cv as HTMLCanvasElement).width } : null,
      focused: ae && ae !== document.body ? (tid(ae) || `${ae.tagName}:${(ae.getAttribute('aria-label') ?? ae.textContent ?? '').trim().slice(0, 30)}`) : '',
    };
  });
}

async function rendered(page: Page): Promise<void> {
  await page.locator('[data-testid="preview-grid"][data-render="done"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function panel(page: Page, key: string): Promise<void> {
  await page.locator(`[data-testid="nav-${key}"]`).click();
  await page.waitForTimeout(250);
}

async function seed(page: Page): Promise<void> {
  await panel(page, 'form');
  for (const [title, hm] of SEED) {
    await page.clock.setFixedTime(new Date(`2026-10-29T${hm}:00Z`));
    const before = (await page.locator('[data-testid="drafts-all"]').textContent()) ?? '';
    await page.locator('[data-testid="field-title"]').fill(title);
    await page.waitForFunction((b) => document.querySelector('[data-testid="drafts-all"]')?.textContent !== b, before, { timeout: 8000 }).catch(() => undefined);
    await rendered(page);
  }
  await page.clock.setFixedTime(CLOCK);
  await panel(page, 'drafts');
  for (const n of [4, 2]) {
    await page.locator(`[data-testid="draft-star-${n}"]`).click();
    await page.waitForTimeout(400);
  }
}

async function apply(page: Page, side: string): Promise<void> {
  if (side === 'before') return;
  const drafts = await page.evaluate(readDrafts);
  await page.evaluate(draftsMock, { side, drafts });
  await page.evaluate(lineTools, side);
  await page.evaluate(styleTools, side);
  await page.waitForTimeout(250);
}

async function place(page: Page, shot: string): Promise<void> {
  await page.evaluate(() => { document.querySelectorAll('.mk-dlg, .mk-toast, .mk-menu, .mk-selbar, .mk-check, .mk-sheet, .mk-pop, .mk-sp').forEach((n) => n.remove()); document.querySelectorAll('.mk-sel-mode').forEach((n) => n.classList.remove('mk-sel-mode')); });
  await panel(page, PANEL[shot]);
  const top = shot === 'form' ? 'flier-form' : PANEL[shot] === 'drafts' && shot !== 'drafts-end' && shot !== 'top' ? 'drafts-panel' : '';
  if (top) await page.evaluate((x) => { const n = document.querySelector(`[data-testid="${x}"]`); if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 16); }, top);
  if (shot === 'drafts-end' || shot === 'form-end') await page.evaluate((id) => { const n = document.querySelector(`[data-testid="${id}"]`); if (n) window.scrollTo(0, n.getBoundingClientRect().bottom + scrollY - innerHeight + 16); }, shot === 'drafts-end' ? 'drafts-panel' : 'flier-form');
  if (shot === 'top') await page.evaluate(() => window.scrollTo(0, 0));
  const centre = shot === 'form-mid' ? 'field-includesHeading' : shot === 'lines' || shot === 'style' ? 'field-titleBottom' : shot === 'flier' || shot === 'size' ? 'preview-1' : '';
  if (centre) await page.evaluate((id) => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center' }), centre);
  await page.waitForTimeout(300);
}

mkdirSync(join(OUT, 'frames'), { recursive: true });
for (const r of RUNS) {
  test.describe(`${r.name} ${r.scheme}`, () => {
    const { defaultBrowserType: _b, ...use } = r.use;
    test.use({ ...use, colorScheme: r.scheme });
    for (const side of ['before', 'A', 'B', 'C']) {
      test(side, async ({ page }) => {
        await page.addInitScript((s) => { if (sessionStorage.getItem('mkLine') === null) sessionStorage.setItem('mkLine', s === 'before' ? '' : 'width'); }, side);
        await page.addInitScript(lineRender);
        await page.clock.setFixedTime(new Date('2026-10-29T07:00:00Z'));
        await page.goto('/');
        await rendered(page);
        await seed(page);
        await page.reload();
        await rendered(page);
        await apply(page, side);
        const focusedOnLoad = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? '');
        for (const shot of r.shots) {
          if (AFTER_ONLY.includes(shot) && side === 'before') continue;
          if (shot === 'size') {
            await page.evaluate((s) => sessionStorage.setItem('mkLine', s === 'before' ? '' : 'size'), side);
            await page.reload();
            await rendered(page);
            await apply(page, side);
          }
          await place(page, shot);
          if (AFTER_ONLY.includes(shot)) {
            await page.evaluate((s) => { const w = window as unknown as { mkDraftState: (x: string) => void; mkStyleOpen: (k: string) => void }; if (s === 'style') w.mkStyleOpen('titleBottom'); else w.mkDraftState(s); }, shot);
            await page.waitForTimeout(200);
          }
          const file = `${side}-${r.name}-${r.scheme}-${shot}.png`;
          await page.screenshot({ path: join(OUT, file) });
          const s = await scan(page);
          const applied = shot === 'size' ? ' (Same size applied where a line tool exists)' : shot === 'lines' || shot === 'flier' ? ' (Same width applied where a line tool exists)' : '';
          const pair = AFTER_ONLY.includes(shot) ? null : { route: '/', state: `${PANEL[shot]} panel open, flier 1 of 4 selected; ${shot}${applied}`, fixture: FIXTURE, viewport: r.size, colorScheme: r.scheme, scrollAnchor: ANCHOR[shot], crop: 'viewport' };
          const frame = { option: side, side: side === 'before' ? 'before' : 'after', shot, build: side === 'before' ? BUILD : `${BUILD} + mockup ${side}`, file, pair, focusedOnLoad, ...s };
          writeFileSync(join(OUT, 'frames', file.replace('.png', '.json')), `${JSON.stringify(frame, null, 1)}\n`);
          if (side === 'before') continue;
          expect.soft(s.misaligned, file).toEqual([]);
          expect.soft(s.textFit, file).toEqual([]);
          expect.soft(s.hscroll, file).toBe(false);
          expect.soft(s.under44, `${file} under 44`).toEqual([]);
        }
      });
    }
  });
}
