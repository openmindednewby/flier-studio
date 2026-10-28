import { test, type Page, type BrowserContext } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const DIR = 'docs/design/FLIER-2-qa';
type R = Record<string, unknown>;
const storage = (p: Page) => p.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));
const working = (p: Page) => p.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:working') ?? '[]') as { blocks: Record<string, unknown> }[]).map((d) => d.blocks));
function watch(p: Page, errs: string[]) {
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`${m.type()}: ${m.text()}`); });
  p.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  p.on('response', (r) => { if (r.status() >= 400) errs.push(`http ${r.status()} ${r.url()}`); });
}
async function ready(p: Page, path = '/') { await p.goto(path); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(300); }
const small = (p: Page) => p.evaluate(() => [...document.querySelectorAll('button,select,input:not([type=hidden]),a,summary,textarea,[role=button]')]
  .map((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return { id: e.getAttribute('data-testid') ?? e.tagName + ':' + (e.textContent ?? '').trim().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height), vis: r.width > 0 && s.visibility !== 'hidden' && s.display !== 'none' }; })
  .filter((x) => x.vis && (x.w < 44 || x.h < 44)));
const overlap = (p: Page) => p.evaluate(() => {
  const s = document.querySelector('[data-testid=pick-scope]') as HTMLElement;
  const bar = document.querySelector('[data-testid=mini-preview]') as HTMLElement | null;
  const r = s.getBoundingClientRect();
  const cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
  const hit = document.elementFromPoint(r.left + r.width / 2, cy);
  const b = bar?.getBoundingClientRect();
  const barVisible = !!b && b.height > 0 && getComputedStyle(bar as HTMLElement).display !== 'none';
  const covered = barVisible && !!b && b.top < r.bottom && b.bottom > r.top && b.left < r.right && b.right > r.left;
  return { scopeTop: Math.round(r.top), scopeBottom: Math.round(r.bottom), inView: r.top >= 0 && r.bottom <= innerHeight, centerHitsScope: hit === s || s.contains(hit), barTop: b ? Math.round(b.top) : null, barBottom: b ? Math.round(b.bottom) : null, barVisible, covered, active: document.activeElement?.getAttribute('data-testid') };
});

test('FLIER-2 sighting', async ({ page, browser, context }, info) => {
  const v = info.project.name; const out: R = { viewport: v }; const errs: string[] = []; watch(page, errs);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page);
  out.scroll = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
  out.smallTargets = await small(page);
  await page.screenshot({ path: `${DIR}/${v}-main.png` });
  const scope = page.getByTestId('pick-scope');
  out.scopeBox = await scope.boundingBox();
  await scope.focus(); out.scopeFocused = await overlap(page);
  await scope.selectOption('all');
  await page.getByTestId('field-footer').focus(); out.whileEditingFooter = await overlap(page);
  await page.getByTestId('field-footer').fill('QA ALL FOOTER');
  await page.waitForTimeout(400);
  out.allFooter = (await working(page)).map((b) => b.footer);
  await page.getByTestId('field-schedule').focus(); out.whileEditingSchedule = await overlap(page);
  const sched = await page.getByTestId('field-schedule').inputValue();
  await page.getByTestId('field-schedule').fill(sched.replace('Beginners', 'Starters'));
  await page.waitForTimeout(400);
  out.allLevelNames = await page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:working') ?? '[]') as unknown[]).map((d) => JSON.stringify(d).includes('Starters')));
  await scope.selectOption('this');
  await page.getByTestId('field-footer').fill('QA THIS ONLY');
  await page.waitForTimeout(400);
  out.thisFooter = (await working(page)).map((b) => b.footer);
  await page.getByTestId('edit-2').click(); await page.waitForTimeout(200);
  out.flier2FooterField = await page.getByTestId('field-footer').inputValue();
  await page.getByTestId('field-footer').focus(); out.flier2EditingFooter = await overlap(page);
  await page.screenshot({ path: `${DIR}/${v}-scope-edit.png` });
  await page.keyboard.press('Tab');
  out.focusRing = await page.evaluate(() => { const a = document.activeElement as HTMLElement; const s = getComputedStyle(a); return { id: a.getAttribute('data-testid') ?? a.tagName, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, shadow: s.boxShadow }; });
  await page.getByTestId('config-share').click();
  await page.waitForFunction(() => (document.querySelector('[data-testid=share-url]') as HTMLInputElement).value.includes('#share='));
  const url = await page.getByTestId('share-url').inputValue();
  out.linkLen = url.length;
  out.status = await page.getByTestId('status').textContent().catch(() => null);
  out.clipboardMatches = (await page.evaluate(() => navigator.clipboard.readText())) === url;
  const rc: BrowserContext = await browser.newContext({ viewport: page.viewportSize() ?? undefined, baseURL: 'http://localhost:4179' });
  const other = await rc.newPage(); watch(other, errs); await ready(other);
  await other.getByTestId('field-title').fill('THEIRS'); await other.getByTestId('config-name').fill('Their set'); await other.getByTestId('config-save').click();
  await other.getByTestId('field-title').fill('THEIRS-AUTOSAVE'); await other.waitForTimeout(500);
  const before = await storage(other);
  await other.goto(url); await other.getByTestId('import-dialog').waitFor();
  out.importTitle = await other.getByTestId('import-title').textContent();
  out.importFocus = await other.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  out.importBtns = [await other.getByTestId('import-confirm').boundingBox(), await other.getByTestId('import-dismiss').boundingBox()].map((b) => b && [Math.round(b.width), Math.round(b.height)]);
  out.importScroll = await other.evaluate(() => document.documentElement.scrollWidth);
  await other.screenshot({ path: `${DIR}/${v}-import-dialog.png` });
  await other.getByTestId('import-confirm').click(); await other.waitForTimeout(400);
  const after = await storage(other);
  out.importChangedKeys = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]);
  const arr = (x: unknown): unknown[] => (Array.isArray(x) ? x : Object.values(x as object));
  const cb = arr(JSON.parse(before['flier-studio:configs'] ?? '[]')); const ca = arr(JSON.parse(after['flier-studio:configs'] ?? '[]'));
  out.configsBefore = cb.length; out.configsAfter = ca.length;
  out.existingConfigKept = cb.every((c) => ca.some((d) => JSON.stringify(d) === JSON.stringify(c)));
  out.titleAfterImport = await other.getByTestId('field-title').inputValue();
  out.hashAfter = new URL(other.url()).hash;
  const b2 = await storage(other);
  await other.goto(url); await other.getByTestId('import-dialog').waitFor();
  await other.getByTestId('import-dismiss').click(); await other.waitForTimeout(300);
  out.dismissIdentical = JSON.stringify(await storage(other)) === JSON.stringify(b2);
  const frag = url.split('#share=')[1]; const mid = Math.floor(frag.length / 2);
  const tampered = frag.slice(0, mid) + (frag[mid] === 'A' ? 'B' : 'A') + (frag[mid + 1] === 'Q' ? 'R' : 'Q') + frag.slice(mid + 2);
  const cases: [string, string][] = [['flipped', tampered], ['garbage', '%25%25not-base64%25%25'], ['truncated', frag.slice(0, 40)]];
  for (const [name, f] of cases) {
    const b3 = await storage(other);
    await other.goto(`/#share=${f}`); await other.locator('canvas').first().waitFor(); await other.waitForTimeout(300);
    const dlg = await other.getByTestId('import-dialog').count();
    const msg = dlg ? await other.getByTestId('import-error').textContent().catch(() => null) : null;
    const hasConfirm = await other.getByTestId('import-confirm').count();
    const title = dlg ? await other.getByTestId('import-title').textContent() : null;
    if (name === 'flipped') await other.screenshot({ path: `${DIR}/${v}-tampered.png` });
    if (dlg && (await other.getByTestId('import-dismiss').count())) await other.getByTestId('import-dismiss').click();
    out[`tamper_${name}`] = { dlg, title, msg, hasConfirm, unchanged: JSON.stringify(await storage(other)) === JSON.stringify(b3) };
  }
  out.errors = errs;
  writeFileSync(`${DIR}/${v}-results.json`, JSON.stringify(out, null, 2));
  await rc.close();
});
