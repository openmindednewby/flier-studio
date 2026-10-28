import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, type Download, type Page } from '@playwright/test';

const DIR = join(process.cwd(), 'docs/design/FLIER-1-qa/final-2');
const APP = process.cwd();
let LOG = '';
const log = (s: string): void => { LOG += s + '\n'; };

async function audit(page: Page, tag: string): Promise<void> {
  const r = await page.evaluate(() => {
    const vis = (e: Element): boolean => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const name = (e: Element): string => e.getAttribute('data-testid') || e.tagName + ':' + (e.textContent || '').trim().slice(0, 20);
    const small = [...document.querySelectorAll('button,select,input,textarea,a,[role=button],label')].filter(vis)
      .filter((e) => { const b = e.getBoundingClientRect(); return (b.width < 44 || b.height < 44) && !(e.tagName === 'LABEL' && !e.querySelector('input[type=file]')); })
      .map((e) => { const b = e.getBoundingClientRect(); return name(e) + '=' + Math.round(b.width) + 'x' + Math.round(b.height); });
    const spill = [...document.querySelectorAll('body *')].filter(vis)
      .filter((e) => e.children.length === 0 && (e.textContent || '').trim() !== '' && !['SELECT', 'TEXTAREA', 'INPUT', 'OPTION'].includes(e.tagName))
      .filter((e) => { const h = e as HTMLElement; const b = e.getBoundingClientRect(); const pb = e.parentElement?.getBoundingClientRect(); return h.scrollWidth > h.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible' || b.right > innerWidth + 1 || (pb !== undefined && b.right > pb.right + 1); })
      .map(name);
    const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const selFit = [...document.querySelectorAll('select')].filter(vis).flatMap((s) => {
      const st = getComputedStyle(s); ctx.font = st.font;
      const room = s.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight) - 28;
      return [...s.options].filter((o) => ctx.measureText(o.text).width > room).map((o) => (s.getAttribute('data-testid') || 'select') + ':"' + o.text + '"');
    });
    const groups = [...document.querySelectorAll('h2,h3,legend')].filter(vis).map((e) => (e.textContent || '').trim());
    const main = document.querySelector('main')?.getBoundingClientRect();
    const cpl = Math.max(0, ...[...document.querySelectorAll('p')].filter(vis).map((p) => { const st = getComputedStyle(p); ctx.font = st.font; return Math.round(p.clientWidth / (ctx.measureText('abcdefghijklmnopqrstuvwxyz').width / 26)); }));
    return { sw: document.documentElement.scrollWidth, vw: innerWidth, small, spill, selFit, groups, main: main ? [Math.round(main.left), Math.round(main.right)] : null, maxCpl: cpl };
  });
  log(`${tag} AUDIT ${JSON.stringify(r)}`);
}

const hash = (page: Page, n: string): Promise<number | null> => page.getByTestId(`preview-${n}`).locator('canvas')
  .evaluate((c: HTMLCanvasElement) => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; })
  .catch(() => null);
const status = (page: Page): Promise<string> => page.locator('[role=status]').allTextContents().then((t) => t.join(' | ').replace(/\s+/g, ' ').slice(0, 200));
const opts = (page: Page): Promise<string[]> => page.getByTestId('config-pick').locator('option').allTextContents();

test('final sighting', async ({ page, context }, info) => {
  const p = info.project.name;
  const errs: string[] = [];
  const ext: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ':' + m.text().slice(0, 140)); });
  page.on('pageerror', (e) => errs.push('pageerror:' + e.message));
  page.on('requestfailed', (r) => errs.push('reqfail:' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ':' + r.url()); });
  page.on('dialog', (d) => { void d.accept('qa-dialog'); });
  await context.route(/huggingface\.co|hf\.co|cdn-lfs|analytics\.dloizides\.com/, (r) => { ext.push(r.request().url()); return r.abort(); });

  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await page.waitForTimeout(800);
  log(`${p} START resources: ${await page.evaluate(() => performance.getEntriesByType('resource').map((e) => e.name.split('/').pop()).join(','))}`);
  await audit(page, `${p} initial`);
  await page.screenshot({ path: join(DIR, `${p}-01-initial.png`), fullPage: true });
  const ink = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement); const v = (n: string): string => cs.getPropertyValue(n).trim();
    const lum = (c: string): number => { const m = c.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
    const bs = getComputedStyle(document.body); const cr = (a: string, b: string): number => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.round(((x + 0.05) / (y + 0.05)) * 10) / 10; };
    const muted = document.querySelector('.muted'); const btn = document.querySelector('button.primary, button');
    return { vars: { bg: v('--background') || v('--bg'), surface: v('--surface'), text: v('--text'), accent: v('--accent') || v('--primary'), border: v('--border') }, bodyBg: bs.backgroundColor, bodyColor: bs.color, textContrast: cr(bs.color, bs.backgroundColor), mutedContrast: muted ? cr(getComputedStyle(muted).color, bs.backgroundColor) : null, btn: btn ? [getComputedStyle(btn).backgroundColor, getComputedStyle(btn).color, cr(getComputedStyle(btn).color, getComputedStyle(btn).backgroundColor)] : null, theme: document.querySelector('meta[name=theme-color]')?.getAttribute('content'), scaleName: (() => { const s = document.querySelector('[data-testid=pick-scale]') as HTMLInputElement | null; return s ? (s.getAttribute('aria-label') || s.labels?.[0]?.textContent?.trim() || s.getAttribute('aria-labelledby') || 'NONE') : 'absent'; })() };
  });
  log(`${p} INK ${JSON.stringify(ink)}`);
  const bar = page.getByTestId('mini-preview');
  const barVis = await bar.isVisible();
  log(`${p} MINI visible=${barVis}`);
  if (barVis) {
    const geo = await page.evaluate(() => { const r = (id: string): string => { const b = document.querySelector(`[data-testid=${id}]`)!.getBoundingClientRect(); return `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`; }; const c = document.querySelector('[data-testid=mini-open] canvas') as HTMLCanvasElement; return { bar: r('mini-preview'), open: r('mini-open'), seeAll: r('mini-see-all'), thumb: c ? `${c.width}x${c.height} css ${c.style.width}x${c.style.height}` : 'none', pos: document.querySelector('[data-testid=mini-position]')?.textContent, seeTxt: document.querySelector('[data-testid=mini-see-all]')?.textContent, openName: document.querySelector('[data-testid=mini-open]')?.getAttribute('aria-label'), textFit: [...document.querySelectorAll('.mini-preview *')].filter((e) => e.children.length === 0 && (e as HTMLElement).scrollWidth > (e as HTMLElement).clientWidth + 1).map((e) => e.tagName) }; });
    log(`${p} MINI geo ${JSON.stringify(geo)}`);
    const th0 = await page.locator('[data-testid=mini-open] canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL().length);
    await page.getByTestId('pick-layout').selectOption({ index: 2 }); await page.waitForTimeout(500);
    const th1 = await page.locator('[data-testid=mini-open] canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL().length);
    log(`${p} MINI thumb live: before=${th0} afterLayoutChange=${th1} changed=${th0 !== th1}`);
    await page.getByTestId('pick-layout').selectOption({ index: 0 }); await page.waitForTimeout(400);
    await page.getByTestId('mini-open').click(); await page.waitForTimeout(400);
    const sheet = await page.evaluate(() => { const d = document.querySelector('[data-testid=mini-sheet]') as HTMLDialogElement; const c = d.querySelector('canvas')!; const b = c.getBoundingClientRect(); const cl = document.querySelector('[data-testid=mini-close]')!.getBoundingClientRect(); const a = document.activeElement as HTMLElement; const s = getComputedStyle(a); return { open: d.open, name: d.getAttribute('aria-label'), canvas: `${c.width}x${c.height} disp ${Math.round(b.width)}x${Math.round(b.height)} top=${Math.round(b.top)} bottom=${Math.round(b.bottom)}`, close: `${Math.round(cl.width)}x${Math.round(cl.height)} bottom=${Math.round(cl.bottom)}`, focus: a.getAttribute('data-testid'), ring: s.outlineStyle !== 'none' && s.outlineWidth !== '0px' || s.boxShadow !== 'none', vh: innerHeight }; });
    log(`${p} SHEET ${JSON.stringify(sheet)}`);
    await page.screenshot({ path: join(DIR, `${p}-05-sheet.png`) });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    log(`${p} SHEET after Esc open=${await page.getByTestId('mini-sheet').evaluate((d: HTMLDialogElement) => d.open)} focus=${await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))}`);
    await page.getByTestId('mini-see-all').click(); await page.waitForTimeout(900);
    log(`${p} SEEALL ${JSON.stringify(await page.evaluate(() => { const pv = document.querySelector('.previews, [data-testid=previews]') as HTMLElement | null; const b = pv?.getBoundingClientRect(); return { scrollY: Math.round(scrollY), previewsTop: b ? Math.round(b.top) : null, focus: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName }; }))}`);
    await page.screenshot({ path: join(DIR, `${p}-06-seeall.png`) });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(400);
    log(`${p} BOTTOM ${JSON.stringify(await page.evaluate(() => { const top = document.querySelector('[data-testid=mini-preview]')!.getBoundingClientRect().top; const ctl = [...document.querySelectorAll('main button, main input, main select, main textarea, main a, main canvas')].filter((e) => !e.closest('.mini-preview') && e.getBoundingClientRect().height > 0); const last = ctl[ctl.length - 1]; const lb = last.getBoundingClientRect(); const covered = ctl.filter((e) => { const b = e.getBoundingClientRect(); return b.bottom > top + 1 && b.top < innerHeight; }).map((e) => e.getAttribute('data-testid') || e.tagName); return { barTop: Math.round(top), last: last.getAttribute('data-testid') || last.tagName, lastBottom: Math.round(lb.bottom), coveredNow: covered, sw: document.documentElement.scrollWidth }; }))}`);
    await page.screenshot({ path: join(DIR, `${p}-07-bottom.png`) });
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  const formats = await page.getByTestId('pick-format').locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
  const seen = new Set<string>();
  for (const f of formats) {
    await page.getByTestId('pick-format').selectOption(f);
    await page.waitForTimeout(300);
    const layouts = await page.getByTestId('pick-layout').locator('option').evaluateAll((os) => os.map((o) => [(o as HTMLOptionElement).value, o.textContent ?? '']));
    for (const [v, t] of layouts) {
      await page.getByTestId('pick-layout').selectOption(v);
      await page.waitForTimeout(450);
      seen.add(v);
      const fig = page.locator('figure.selected');
      const r = await fig.evaluate((el) => {
        const c = el.querySelector('canvas'); const b = c?.getBoundingClientRect();
        return { c: c ? c.width + 'x' + c.height : null, disp: b ? Math.round(b.width) + 'x' + Math.round(b.height) : null, hint: el.querySelector('[data-testid=list-hint]')?.textContent?.slice(0, 80) ?? null, err: (el.textContent || '').match(/Not drawn[^.]*/)?.[0] ?? null };
      }).catch((e) => ({ fail: String(e).slice(0, 80) }));
      log(`${p} LAYOUT ${f}/${v}=${t} -> ${JSON.stringify(r)}`);
      if (p === 'desktop') await fig.screenshot({ path: join(DIR, `${p}-layout-${f}-${v}.png`) }).catch(() => undefined);
    }
    await audit(page, `${p} format=${f}`);
  }
  log(`${p} distinct layouts: ${seen.size} [${[...seen].join(',')}]`);

  await page.getByTestId('config-preset').click();
  await page.waitForTimeout(800);
  await audit(page, `${p} preset`);
  const figs = await page.locator('figure').count();
  const dl1 = page.waitForEvent('download');
  await page.getByTestId('download-1').click();
  const d1 = await dl1;
  const f1 = join(DIR, 'test-output', `${p}-${d1.suggestedFilename()}`);
  await d1.saveAs(f1);
  const b = readFileSync(f1);
  log(`${p} DOWNLOAD single ${d1.suggestedFilename()} ${b.readUInt32BE(16)}x${b.readUInt32BE(20)} sig=${b.subarray(1, 4).toString()}`);
  const names: string[] = [];
  const on = (d: Download): void => { names.push(d.suggestedFilename()); };
  page.on('download', on);
  await page.getByTestId('download-all').click();
  await page.waitForTimeout(4000);
  page.off('download', on);
  log(`${p} DOWNLOAD-ALL figures=${figs} downloads=${names.length} [${names.join(',')}]`);

  await page.getByTestId('config-name').fill('qa-one');
  await page.getByTestId('config-save').click();
  log(`${p} SAVE ${await status(page)} options=${(await opts(page)).join(',')}`);
  await page.getByTestId('config-name').fill('qa-two');
  await page.getByTestId('config-rename').click();
  log(`${p} RENAME ${await status(page)} options=${(await opts(page)).join(',')}`);
  await page.getByTestId('field-title').fill('CHANGED');
  await page.getByTestId('config-load').click();
  await page.waitForTimeout(300);
  log(`${p} LOAD ${await status(page)} title=${await page.getByTestId('field-title').inputValue()}`);

  await page.getByTestId('field-title').fill('AUTOSAVED');
  await page.waitForTimeout(400);
  const h0 = await hash(page, '1');
  await page.getByTestId('upload-picture').setInputFiles(join(APP, 'public', 'img', 'logo.png'));
  await page.waitForTimeout(1500);
  const h1 = await hash(page, '1');
  await page.reload();
  await page.locator('canvas').first().waitFor();
  await page.waitForTimeout(1500);
  const h2 = await hash(page, '1');
  log(`${p} RELOAD title=${await page.getByTestId('field-title').inputValue()} hash before-upload=${h0} uploaded=${h1} after-reload=${h2} kept=${h1 === h2 && h0 !== h1} options=${(await opts(page)).join(',')}`);
  await page.screenshot({ path: join(DIR, `${p}-02-after-reload.png`), fullPage: true });
  await page.getByTestId('config-pick').selectOption({ label: 'qa-two' }).catch(() => undefined);
  await page.getByTestId('config-delete').click();
  await page.waitForTimeout(300);
  log(`${p} DELETE ${await status(page)} options=${(await opts(page)).join(',')}`);

  await page.getByTestId('prompt-text').fill('Salsa night Friday 21:00 at Kafeneio, Nicosia');
  await page.getByTestId('prompt-generate').click();
  await page.waitForFunction(() => /could|fail|not |unavail|form/i.test(document.querySelector('[data-testid=prompt-status]')?.textContent || ''), null, { timeout: 30000 }).catch(() => undefined);
  log(`${p} PROMPT status="${await page.getByTestId('prompt-status').textContent()}" title=${await page.getByTestId('field-title').inputValue()}`);
  await audit(page, `${p} prompt`);
  await page.screenshot({ path: join(DIR, `${p}-03-prompt.png`), fullPage: true });

  await page.evaluate(() => { window.scrollTo(0, 0); (document.activeElement as HTMLElement | null)?.blur(); });
  const tab: string[] = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    tab.push(await page.evaluate(() => { const a = document.activeElement as HTMLElement; const s = getComputedStyle(a); return (a.getAttribute('data-testid') || a.tagName) + (s.outlineStyle !== 'none' && s.outlineWidth !== '0px' || s.boxShadow !== 'none' ? '+ring' : '-noring'); }));
  }
  log(`${p} TAB ${tab.join(' > ')}`);
  log(`${p} UNNAMED ${JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('button,select,input,textarea')].filter((e) => !e.getAttribute('aria-label') && !(e as HTMLInputElement).labels?.length && !(e.textContent || '').trim()).map((e) => e.getAttribute('data-testid') || e.tagName)))}`);

  const man = await (await page.request.get('/manifest.json')).json();
  const head = await page.evaluate(() => ({ link: document.querySelector('link[rel=manifest]')?.getAttribute('href'), theme: document.querySelector('meta[name=theme-color]')?.getAttribute('content'), apple: !!document.querySelector('link[rel=apple-touch-icon]') }));
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 }).catch(() => undefined);
  const icons = await Promise.all(man.icons.map(async (i: { src: string }) => i.src + ':' + (await page.request.get(i.src)).status()));
  log(`${p} PWA manifest name=${man.name} display=${man.display} start=${man.start_url} icons=${icons.join(',')} head=${JSON.stringify(head)} swScope=${scope}`);
  await context.setOffline(true);
  await page.reload();
  await page.waitForTimeout(1200);
  const offOk = await page.getByTestId('flier-form').isVisible().catch(() => false);
  log(`${p} OFFLINE reload formVisible=${offOk} canvases=${await page.locator('canvas').count()} title=${await page.getByTestId('field-title').inputValue().catch(() => 'n/a')}`);
  await page.screenshot({ path: join(DIR, `${p}-04-offline.png`) });
  await context.setOffline(false);
  log(`${p} EXT-aborted: ${[...new Set(ext)].join(' ')}`);
  log(`${p} CONSOLE: ${[...new Set(errs)].join(' || ')}`);
  writeFileSync(join(DIR, `final-log-${p}.txt`), LOG);
});
