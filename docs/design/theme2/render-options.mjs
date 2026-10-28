import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const spec = JSON.parse(readFileSync(join(HERE, 'options.json'), 'utf8'));
const lib = readFileSync(join(APP, 'node_modules/@dloizides/poster-render/dist/index.mjs'), 'utf8')
  .replace(/export \{([^}]*)\};?\s*$/m, (_, names) => `window.PR = {${names}};`);
const dataUrl = (p, mime) => `data:${mime};base64,${readFileSync(p).toString('base64')}`;
const assets = {
  dancers: dataUrl(join(APP, 'public/img/dancers.png'), 'image/png'),
  logo: dataUrl(join(APP, 'public/img/logo.png'), 'image/png'),
  cutout: dataUrl(join(HERE, 'assets/couple-cutout.png'), 'image/png'),
  photo: dataUrl(join(HERE, 'assets/couple-sea.jpg'), 'image/jpeg'),
};
const FONTS = 'https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Sacramento&family=Fredoka:wght@300..700'
  + '&family=Bebas+Neue&family=Great+Vibes&family=Montserrat:wght@100..900&family=Playfair+Display:wght@400..900'
  + '&family=Allura&family=Lato:wght@300;400;700;900&family=Fraunces:opsz,wght@9..144,100..900&family=Jost:wght@100..900&display=block';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<html><head><link rel="stylesheet" href="${FONTS}"></head><body></body></html>`, { waitUntil: 'networkidle' });
await page.addScriptTag({ content: lib });
const out = await page.evaluate(async ({ spec, assets }) => {
  const fams = ['Oswald', 'Sacramento', 'Fredoka', 'Bebas Neue', 'Great Vibes', 'Montserrat', 'Playfair Display', 'Allura', 'Lato', 'Fraunces', 'Jost'];
  for (const f of fams) for (const w of [400, 500, 600, 700, 800]) await document.fonts.load(`${w} 40px "${f}"`);
  const img = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
  const imgs = {}; for (const [k, v] of Object.entries(assets)) imgs[k] = await img(v);
  const PR = window.PR;
  const drawn = [];
  const orig = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, x, y) { drawn.push(String(t)); return orig.call(this, t, x, y); };
  const LEVELS = { 'Level 1': 'Beginners', 'Level 2': 'Intermediates' };
  const preset = () => {
    const docs = JSON.parse(JSON.stringify(PR.kizombaWorkshopDocs));
    for (const d of docs) {
      d.blocks.footer = 'Classes by Jimmy & Ismini';
      for (const r of d.blocks.schedule ?? []) r.label = LEVELS[r.label] ?? r.label;
      for (const it of d.items ?? []) for (const r of it.schedule) r.label = LEVELS[r.label] ?? r.label;
    }
    return docs;
  };
  const words = (s) => s.split(/\s+/).filter(Boolean);
  const has = (bag, s) => words(s).every((w) => bag.has(w));
  const inventory = (doc, report, bag) => {
    const b = doc.blocks; const items = [];
    const add = (id, ok) => { if (ok) items.push(id); };
    add('title', has(bag, b.title));
    if (b.titleBottom) add('titleBottom', has(bag, b.titleBottom));
    if (b.script) add('script', has(bag, b.script));
    if (b.venue) add('venue', b.venue.every((v) => has(bag, v)));
    if (b.schedule) add('schedule', b.schedule.every((r) => has(bag, r.label) && has(bag, r.time)));
    if (b.prices) add('prices', b.prices.every((p) => has(bag, p.amount) && has(bag, p.label)));
    if (b.includes) add('includes', has(bag, b.includes.heading) && b.includes.items.every((i) => has(bag, i)));
    if (b.footer) add('footer', has(bag, b.footer));
    if (doc.items) add('listItems', doc.items.every((it) => has(bag, it.date) && it.schedule.every((r) => has(bag, r.label) && has(bag, r.time)) && (!it.price || has(bag, it.price))));
    add('picture', report.picture !== null);
    add('logo', report.logo !== null);
    return items;
  };
  const results = [];
  const sides = [{ id: 'before', ...spec.before }, ...spec.options.map((o) => ({ ...o }))];
  for (const side of sides) {
    const savedP = { ...PR.PALETTES[side.paletteSlot ?? 'sand'] }; const savedF = { ...PR.FONT_SETS[side.fontSlot ?? 'classic'] };
    if (side.palette) Object.assign(PR.PALETTES[side.paletteSlot], side.palette);
    if (side.fonts) Object.assign(PR.FONT_SETS[side.fontSlot], side.fonts);
    for (const [i, doc] of preset().entries()) {
      if (side.paletteSlot) doc.palette = side.paletteSlot;
      if (side.fontSlot) doc.fonts = side.fontSlot;
      if (side.background) doc.background = side.background;
      if (side.picture) doc.picture = { ...side.picture };
      if (side.layout && doc.layout !== 'list') doc.layout = side.layout;
      drawn.length = 0;
      const layer = document.createElement('canvas');
      const report = PR.render(doc, imgs, layer);
      const bag = new Set(drawn.flatMap(words));
      const canvas = document.createElement('canvas'); canvas.width = layer.width; canvas.height = layer.height;
      const ctx = canvas.getContext('2d');
      if (side.horizon) {
        const h = side.horizon; const H = canvas.height; const textBottom = Math.max(...report.textBoxes.map((t) => t.y + t.h)); const seaY = Math.round(Math.max(H * h.seaFrom, textBottom + H * h.gapBelowText));
        const g = ctx.createLinearGradient(0, 0, 0, seaY);
        h.sky.forEach(([stop, c]) => g.addColorStop(stop, c));
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, seaY);
        const s = ctx.createLinearGradient(0, seaY, 0, H);
        h.sea.forEach(([stop, c]) => s.addColorStop(stop, c));
        ctx.fillStyle = s; ctx.fillRect(0, seaY, canvas.width, H - seaY);
      }
      if (side.horizon) {
        const key = side.palette.background.match(/[0-9a-f]{2}/gi).map((x) => parseInt(x, 16));
        const lctx = layer.getContext('2d'); const data = lctx.getImageData(0, 0, layer.width, layer.height); const px = data.data;
        for (let p = 0; p < px.length; p += 4) if (px[p] === key[0] && px[p + 1] === key[1] && px[p + 2] === key[2]) px[p + 3] = 0;
        lctx.putImageData(data, 0, 0);
      }
      ctx.drawImage(layer, 0, 0);
      const small = document.createElement('canvas'); small.width = 540; small.height = Math.round(540 * canvas.height / canvas.width);
      small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height);
      results.push({ side: side.id, flier: i, png: canvas.toDataURL('image/png'), jpg: small.toDataURL('image/jpeg', 0.86),
        items: inventory(doc, report, bag), layout: doc.layout,
        hiddenText: report.picture ? report.textBoxes.filter((t) => t.x < report.picture.x + report.picture.w && report.picture.x < t.x + t.w && t.y < report.picture.y + report.picture.h && report.picture.y < t.y + t.h).length : 0,
        offCanvas: report.textBoxes.filter((t) => t.x < 0 || t.y < 0 || t.x + t.w > report.width || t.y + t.h > report.height).length });
    }
    if (side.palette) Object.assign(PR.PALETTES[side.paletteSlot], savedP);
    if (side.fonts) Object.assign(PR.FONT_SETS[side.fontSlot], savedF);
  }
  return results;
}, { spec, assets });
await browser.close();

const NAMES = ['workshop-20261031', 'workshop-20261107', 'workshop-20261129', 'upcoming-workshops'];
mkdirSync(join(HERE, 'frames'), { recursive: true });
mkdirSync(join(HERE, 'full'), { recursive: true });
const b64 = (u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64');
for (const r of out) {
  const name = `${r.side}-${NAMES[r.flier]}`;
  writeFileSync(join(HERE, 'full', `${name}.png`), b64(r.png));
  writeFileSync(join(HERE, 'frames', `${name}.jpg`), b64(r.jpg));
}
const pair = (i) => ({ route: 'poster-render render() of the flier (Flier Studio preview and download path)', state: `flier ${i + 1} of 4, preset text, no edits`,
  fixture: 'kizombaPreset(): 31 Oct / 7 Nov / 29 Nov / Upcoming, footer "Classes by Jimmy & Ismini", levels Beginners / Intermediates (D4)',
  viewport: 'story 1080x1920', scrollAnchor: 'poster origin 0,0', crop: 'full poster' });
const frames = []; const options = {};
for (const o of spec.options) {
  const before = []; const after = [];
  for (const i of NAMES.keys()) {
    const b = out.find((r) => r.side === 'before' && r.flier === i); const a = out.find((r) => r.side === o.id && r.flier === i);
    const tag = (r) => r.items.map((x) => `${NAMES[i]}:${x}`);
    const seen = (x) => (x.hiddenText + x.offCanvas === 0 ? tag(x) : []);
    before.push(...seen(b)); after.push(...seen(a));
    for (const [side, r] of [['before', b], ['after', a]]) frames.push({ option: o.id, shot: NAMES[i], side,
      build: side === 'before' ? 'theme 1 "Kizomba classic" (sand, classic, solid, dancers)' : `theme 2 option ${o.id} (mocked palette/fonts/background)`,
      file: `frames/${side === 'before' ? 'before' : o.id}-${NAMES[i]}.jpg`, pair: pair(i), textUnderPicture: r.hiddenText, textOffCanvas: r.offCanvas, visibleItems: { before: seen(b), after: seen(a) }, formRows: { misaligned: [] } });
  }
  options[o.id] = { inventory: `${before.filter((x) => after.includes(x)).length}/${before.length}`, items: { before, after },
    lost: before.filter((x) => !after.includes(x)), added: after.filter((x) => !before.includes(x)), formRowsMisaligned: [] };
}
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify({ countMethod: 'visible-in-frame', rowsMethod: 'auto',
  pairMethod: 'same-steps', note: 'Written by render-options.mjs: every frame is one render() of the same preset doc; only the style fields differ. Item visible = every word of the block drawn by fillText inside the poster with no text box under the picture rect or off canvas (else the frame counts 0); picture/logo = RenderReport rect not null. Rows: posters have no form controls, so auto discovery finds no side-by-side rows.',
  options, frames }, null, 1)}\n`);
console.log(Object.entries(options).map(([k, v]) => `${k} ${v.inventory} lost=${v.lost.join(',')}`).join('\n'));
console.log('before items per flier', out.filter((r) => r.side === 'before').map((r) => r.items.join('|')).join('\n'));
