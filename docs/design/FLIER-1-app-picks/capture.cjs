const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '../../..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(__dirname, 'img');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.txt': 'text/plain', '.xml': 'application/xml' };

const PALETTES = {
  'P-A': { primary: '#4a423c', 'on-brand': '#ffffff', background: '#f5f4f2', surface: '#fbfaf8', 'surface-elevated': '#ffffff', text: '#2f2925', 'text-secondary': '#6f655c', border: '#ddd6cd', ring: '#4a423c', mark: '#e9b47f' },
  'P-B': { primary: '#e9b47f', 'on-brand': '#2f2925', background: '#f5f4f2', surface: '#fbfaf8', 'surface-elevated': '#ffffff', text: '#2f2925', 'text-secondary': '#6f655c', border: '#ddd6cd', ring: '#9a5a26', mark: '#e9b47f' },
  'P-C': { primary: '#9a5a26', 'on-brand': '#ffffff', background: '#f5f4f2', surface: '#fbfaf8', 'surface-elevated': '#ffffff', text: '#2f2925', 'text-secondary': '#6f655c', border: '#ddd6cd', ring: '#9a5a26', mark: '#d9a06a' },
};

function paletteCss(p) {
  const vars = ['primary', 'on-brand', 'background', 'surface', 'surface-elevated', 'text', 'text-secondary', 'border'].map((k) => `--${k}:${p[k]} !important;`).join('');
  return `:root{${vars}}
  figure.selected canvas{outline-color:${p.ring} !important}
  input[type=range]{accent-color:${p.ring} !important}
  .group>h3{text-decoration:underline;text-decoration-color:${p.mark};text-decoration-thickness:3px;text-underline-offset:6px}
  input:focus-visible,select:focus-visible,textarea:focus-visible,button:focus-visible{outline:3px solid ${p.ring} !important;outline-offset:2px}`;
}

const LAYOUT_JS = {
  'L-A': () => {
    if (innerWidth >= 1024) return;
    const sel = document.querySelector('figure.selected canvas') || document.querySelector('figure canvas');
    const bar = document.createElement('div');
    bar.setAttribute('data-testid', 'mini-preview'); bar.setAttribute('data-injected', '1');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:10;display:flex;align-items:center;gap:12px;padding:8px 16px calc(8px + env(safe-area-inset-bottom));background:var(--surface-elevated);border-top:1px solid var(--border);box-shadow:0 -4px 16px rgba(0,0,0,.08)';
    const thumb = document.createElement('canvas');
    const h = 72; const w = Math.round(h * sel.width / sel.height);
    thumb.width = w * 2; thumb.height = h * 2; thumb.style.cssText = `width:${w}px;height:${h}px;border-radius:4px;border:1px solid var(--border);flex:0 0 auto`;
    thumb.getContext('2d').drawImage(sel, 0, 0, thumb.width, thumb.height);
    const txt = document.createElement('div');
    txt.style.cssText = 'flex:1 1 auto;min-width:0;font-size:.85rem;line-height:1.3';
    txt.innerHTML = '<strong style="display:block">Flier 1 of 4</strong><span style="color:var(--text-secondary)">Live preview</span>';
    const btn = document.createElement('button');
    btn.textContent = 'See all 4';
    btn.style.cssText = 'flex:0 0 auto;width:auto;min-height:44px;padding:0 16px';
    bar.append(thumb, txt, btn);
    document.body.append(bar);
    document.body.style.paddingBottom = '104px';
  },
  'L-B': (tab) => {
    if (innerWidth >= 1024) return;
    const main = document.querySelector('main');
    const controls = document.querySelector('.controls');
    const previews = document.querySelector('[data-testid=previews]');
    const bar = document.createElement('div');
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('data-testid', 'edit-preview-tabs'); bar.setAttribute('data-injected', '1');
    bar.style.cssText = 'position:sticky;top:0;z-index:10;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;margin:0 0 16px;background:var(--surface);border:1px solid var(--border);border-radius:12px';
    const mk = (label, on) => { const b = document.createElement('button'); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(on)); b.textContent = label; b.style.cssText = `min-height:44px;border-radius:9px;border:0;font-weight:600;${on ? 'background:var(--surface-elevated);color:var(--text);box-shadow:inset 0 -2px 0 var(--primary)' : 'background:transparent;color:var(--text-secondary)'}`; return b; };
    const preview = tab === 'preview';
    bar.append(mk('Edit', !preview), mk('Preview (4)', preview));
    main.insertBefore(bar, main.firstChild);
    if (preview) controls.style.display = 'none'; else previews.style.display = 'none';
    previews.style.scrollMarginTop = '64px';
  },
  'L-C': () => {
    if (innerWidth >= 1024) return;
    const main = document.querySelector('main');
    const controls = document.querySelector('.controls');
    const previews = document.querySelector('[data-testid=previews]');
    main.insertBefore(previews, controls);
    previews.style.marginBottom = '16px';
    const grid = previews.querySelector('.preview-grid');
    grid.style.cssText = 'display:grid;grid-auto-flow:column;grid-auto-columns:46%;grid-template-columns:none;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;padding-bottom:8px';
    grid.querySelectorAll('figure').forEach((f) => { f.style.scrollSnapAlign = 'start'; });
  },
};

const BEFORE_FRAMES = [
  { shot: '1280-top', vp: 'desktop', anchor: 'page-top' },
  { shot: '360-top', vp: 'mobile', anchor: 'page-top' },
  { shot: '360-text', vp: 'mobile', anchor: 'field-title' },
  { shot: '360-previews', vp: 'mobile', anchor: 'previews' },
];
const PLAN = [{ option: 'before', frames: BEFORE_FRAMES }];
for (const id of Object.keys(PALETTES)) PLAN.push({ option: id, frames: BEFORE_FRAMES.slice(0, 2) });
for (const id of Object.keys(LAYOUT_JS)) PLAN.push({ option: id, frames: BEFORE_FRAMES });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const want = (id) => !ONLY || id === 'before' || ONLY.includes(id);


function probeItems() {
  const nodes = [...document.querySelectorAll('main input, main select, main textarea, main button, main canvas')].filter((n) => !n.closest('[data-injected]'));
  const counts = {};
  return nodes.map((n) => {
    const lab = n.closest('label')?.querySelector('span')?.textContent || n.getAttribute('aria-label') || n.textContent || n.tagName;
    const key = `${n.tagName.toLowerCase()}:${lab.trim().slice(0, 40)}`;
    counts[key] = (counts[key] || 0) + 1;
    const r = n.getBoundingClientRect();
    const shown = n.getClientRects().length > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    return { id: `${key}#${counts[key]}`, shown };
  });
}


function seenAndRows() {
  const nodes = [...document.querySelectorAll('main input, main select, main textarea, main button, main canvas')].filter((n) => !n.closest('[data-injected]'));
  const counts = {};
  const visible = (n) => {
    const r = n.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    for (let a = n; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    }
    let box = { t: r.top, b: r.bottom, l: r.left, rr: r.right };
    for (let a = n.parentElement; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(auto|hidden|scroll|clip)/.test(cs.overflowX + cs.overflowY)) {
        const c = a.getBoundingClientRect();
        box = { t: Math.max(box.t, c.top), b: Math.min(box.b, c.bottom), l: Math.max(box.l, c.left), rr: Math.min(box.rr, c.right) };
      }
    }
    box = { t: Math.max(box.t, 0), b: Math.min(box.b, innerHeight), l: Math.max(box.l, 0), rr: Math.min(box.rr, innerWidth) };
    if (box.b - box.t < 4 || box.rr - box.l < 4) return false;
    const hit = document.elementFromPoint((box.l + box.rr) / 2, (box.t + box.b) / 2);
    return !!hit && (hit === n || n.contains(hit) || hit.closest('label') === n.closest('label') && !!n.closest('label'));
  };
  const items = nodes.map((n) => {
    const lab = n.closest('label')?.querySelector('span')?.textContent || n.getAttribute('aria-label') || n.textContent || n.tagName;
    const key = `${n.tagName.toLowerCase()}:${lab.trim().slice(0, 40)}`;
    counts[key] = (counts[key] || 0) + 1;
    return { id: `${key}#${counts[key]}`, shown: visible(n), n };
  });
  const ctl = items.filter((i) => i.shown && i.n.tagName !== 'CANVAS').map((i) => ({ i, r: i.n.getBoundingClientRect() }));
  const rows = []; const off = [];
  for (let a = 0; a < ctl.length; a++) for (let b = a + 1; b < ctl.length; b++) {
    const [x, y] = [ctl[a], ctl[b]];
    const sameLine = Math.min(x.r.bottom, y.r.bottom) - Math.max(x.r.top, y.r.top) > 0 && (x.r.right <= y.r.left || y.r.right <= x.r.left);
    const sameBox = x.i.n.closest('.card, figure, .row') === y.i.n.closest('.card, figure, .row');
    if (!sameLine || !sameBox) continue;
    const dt = Math.abs(x.r.top - y.r.top); const dh = Math.abs(x.r.height - y.r.height);
    rows.push([x.i.id, y.i.id]);
    if (dt > 1 || dh > 1) off.push(`${x.i.id} | ${y.i.id} dTop ${dt.toFixed(1)} dH ${dh.toFixed(1)}`);
  }
  return { all: items.map((i) => i.id), shown: items.filter((i) => i.shown).map((i) => i.id), rows: rows.length, off };
}

function strip(f) { const { allItems, shownItems, ...rest } = f; return rest; }


async function sweep(browser, vps, base, option, vp) {
  const states = option === 'L-B' ? ['edit', 'preview'] : ['edit'];
  const seenIds = new Set(); let all = []; let rows = 0; const off = []; const parts = [];
  for (const st of states) {
    const ctx = await browser.newContext({ ...vps[vp], serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelectorAll('figure canvas').length >= 4);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    if (PALETTES[option]) await page.addStyleTag({ content: paletteCss(PALETTES[option]) });
    if (LAYOUT_JS[option]) await page.evaluate(`(${LAYOUT_JS[option].toString()})(${JSON.stringify(st)})`);
    const step = await page.evaluate(() => innerHeight - (document.querySelector('[data-testid=mini-preview]')?.offsetHeight || 0) - 80);
    const max = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, k = 1; y < max; y += step, k++) {
      for (let x = 0; x < 3; x++) {
        await page.evaluate(([yy, xx]) => { scrollTo(0, yy); const g = document.querySelector('.preview-grid'); if (g) g.scrollLeft = xx * g.clientWidth; }, [y, x]);
        await page.waitForTimeout(80);
        const r = await page.evaluate(`(${seenAndRows.toString()})()`);
        all = r.all; r.shown.forEach((i) => seenIds.add(i)); rows += r.rows; off.push(...r.off);
        if (x === 0) { const file = `parts/${option}-${vp}-${st}-part${k}.png`; await page.screenshot({ path: path.join(OUT, file) }); parts.push(file); }
      }
    }
    await ctx.close();
  }
  return { all, seen: [...seenIds], rows, off: [...new Set(off)], parts };
}

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      let f = path.join(DIST, p);
      if (!f.startsWith(DIST) || !fs.existsSync(f)) f = path.join(DIST, 'index.html');
      res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'parts'), { recursive: true });
  const srv = await serve();
  const base = `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch();
  const vps = { mobile: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 640 } }, desktop: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } };
  const frames = [];
  try {
    for (const { option, frames: fr } of PLAN.filter((x) => want(x.option))) {
      for (const f of fr) {
        const ctx = await browser.newContext({ ...vps[f.vp], serviceWorkers: 'block' });
        const page = await ctx.newPage();
        await page.goto(base, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => document.querySelectorAll('figure canvas').length >= 4);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1200);
        if (PALETTES[option]) await page.addStyleTag({ content: paletteCss(PALETTES[option]) });
        if (LAYOUT_JS[option]) await page.evaluate(`(${LAYOUT_JS[option].toString()})(${JSON.stringify(option === 'L-B' && f.anchor === 'previews' ? 'preview' : 'edit')})`);
        const anchorTopPx = await page.evaluate((a) => {
          if (a === 'page-top') { scrollTo(0, 0); return 0; }
          const n = document.querySelector(`[data-testid="${a}"]`);
          n.scrollIntoView({ block: 'start' });
          return Math.round(n.getBoundingClientRect().top);
        }, f.anchor);
        await page.waitForTimeout(250);
        const items = await page.evaluate(`(${probeItems.toString()})()`);
        const file = `${option}-${f.shot}.png`;
        await page.screenshot({ path: ONLY && option === 'before' ? path.join(OUT, 'parts', `_scratch-${file}`) : path.join(OUT, file) });
        if (ONLY && option === 'before') fs.rmSync(path.join(OUT, 'parts', `_scratch-${file}`), { force: true });
        frames.push({ allItems: items.map((i) => i.id), shownItems: items.filter((i) => i.shown).map((i) => i.id), option, shot: f.shot, side: option === 'before' ? 'before' : 'after', build: option === 'before' ? 'a959cc8 dist (live build)' : `a959cc8 dist + option ${option} injected (CSS/DOM, app source untouched)`, file, anchorTopPx, pair: { route: '/', state: 'first load, flier 1 of 4 selected, no edits', fixture: 'kizomba preset: 31 Oct / 7 Nov / 29 Nov / Upcoming', viewport: f.vp === 'mobile' ? '360x640' : '1280x800', scrollAnchor: f.anchor, crop: 'viewport' } });
        await ctx.close();
      }
    }
  } catch (e) { await browser.close(); srv.close(); throw e; }
  const sweeps = {};
  for (const id of ['before', ...Object.keys(PALETTES), ...Object.keys(LAYOUT_JS)].filter(want)) for (const vp of ['mobile', 'desktop']) sweeps[`${id}|${vp}`] = await sweep(browser, vps, base, id, vp);
  await browser.close(); srv.close();
  const MOVED = { 'L-A': 'none removed; on phones the fixed bar covers the bottom 88 px of the screen, so the rows there scroll up to be seen',  'L-B': 'all: phones show one tab at a time (Edit = form + configs + prompt; Preview = 4 cards, Edit/Download, Download all)', 'L-C': 'all at 360: previews move above the form' };
  const out = []; const options = {};
  const befores = frames.filter((f) => f.option === 'before');
  for (const id of [...Object.keys(PALETTES), ...Object.keys(LAYOUT_JS)].filter((x) => x !== 'before' && want(x))) {
    const mine = frames.filter((f) => f.option === id);
    const all = new Set(befores[0].allItems);
    const kept = [...all].filter((i) => mine.every((f) => f.allItems.includes(i)));
    const sw = ['mobile', 'desktop'].map((vp) => ({ vp, b: sweeps[`before|${vp}`], a: sweeps[`${id}|${vp}`] }));
    const k = Math.min(...sw.map(({ b, a }) => b.seen.filter((i) => a.seen.includes(i)).length));
    const n = Math.max(...sw.map(({ b }) => b.seen.length));
    options[id] = { inventory: `${k}/${n}`, inventorySweep: sw.map(({ vp, b, a }) => ({ viewport: vp, beforeSeen: b.seen.length, afterSeen: a.seen.length, notSeenAfter: b.seen.filter((i) => !a.seen.includes(i)), rowsChecked: a.rows, rowsOff: a.off, parts: a.parts })), aligned: sw.every(({ a }) => a.off.length === 0) ? 'pass' : 'fail', moved: MOVED[id] || 'none', items: MOVED[id] ? { before: [], after: [] } : { before: [...all], after: [...all] } };
    for (const f of mine) {
      const b = befores.find((x) => x.shot === f.shot);
      const vis = { before: b.shownItems, after: f.shownItems };
      out.push({ ...strip(b), option: id, visibleItems: vis }, { ...strip(f), visibleItems: vis });
    }
  }
  if (ONLY) { const prev = JSON.parse(fs.readFileSync(path.join(__dirname, 'result.json'), 'utf8')); Object.assign(prev.options, options); prev.frames = [...prev.frames.filter((f) => !ONLY.includes(f.option)), ...out]; fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify(prev, null, 1)); console.log(Object.keys(options).join(','), out.length); return; }
  fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify({ task: 'FLIER-1 "Flier Studio" app picks', pairMethod: 'same-steps', countMethod: 'visible-in-frame', rowsMethod: 'auto', build: 'dist/ of apps/flier-studio main', options, frames: out }, null, 1));
  console.log(Object.entries(options).map(([k, v]) => `${k} ${v.inventory} ${v.aligned} ${v.inventorySweep.map((x) => x.rowsOff.length + '/' + x.rowsChecked + ' ' + x.notSeenAfter.join(',')).join(' ; ')}`).join(' | '));
  console.log(`frames ${frames.length}`);
})();
