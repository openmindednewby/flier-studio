const { chromium, devices } = require('../../../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
const build = process.argv[2] || 'before'; const img = process.argv[3];
const views = [['360', devices['Galaxy S5']], ['1280', { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }]];
(async () => {
  const b = await chromium.launch(); const out = { build, pairMethod: 'same-steps', frames: [] };
  for (const [name, dev] of views) {
    const ctx = await b.newContext(dev); const p = await ctx.newPage();
    if (img) await p.route('**/images/flier-studio.png', r => r.fulfill({ path: img, contentType: 'image/png' }));
    await p.goto('https://dloizides.com/', { waitUntil: 'networkidle' });
    const sel = 'img[src*="flier-studio"]';
    await p.waitForFunction(s => { const i = document.querySelector(s); return i && i.complete && i.naturalWidth > 0; }, sel);
    await p.evaluate(s => document.querySelector(s).closest('.card, a, li').scrollIntoView({ block: 'center' }), sel);
    await p.waitForTimeout(400);
    const m = await p.evaluate(s => {
      const i = document.querySelector(s); const card = i.closest('.card') || i.parentElement;
      const r = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width), h: Math.round(q.height) }; };
      const ir = i.getBoundingClientRect(); const cs = getComputedStyle(i);
      const sc = Math.max(ir.width / i.naturalWidth, ir.height / i.naturalHeight);
      const vis = { x0: Math.round((i.naturalWidth - ir.width / sc) / 2), y0: Math.round((i.naturalHeight - ir.height / sc) / 2) };
      vis.x1 = i.naturalWidth - vis.x0; vis.y1 = i.naturalHeight - vis.y0;
      let firstCovered = null;
      for (let y = Math.floor(ir.top); y < ir.bottom; y += 2) { const e = document.elementFromPoint(ir.left + ir.width / 2, y); if (e && e !== i) { firstCovered = Math.round(y - ir.top); break; } }
      const coveredSrcY = firstCovered == null ? null : Math.round(vis.y0 + firstCovered / sc);
      return { card: r(card), img: r(i), objectFit: cs.objectFit, natural: [i.naturalWidth, i.naturalHeight], scale: +sc.toFixed(4), visibleSrc: vis, coveredFromImgY: firstCovered, coveredFromSrcY: coveredSrcY, cardHtml: card.outerHTML.slice(0, 400) };
    }, sel);
    const box = m.card; const shot = path.join(__dirname, `${build}-${name}.png`);
    await p.screenshot({ path: shot, clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.w + 16, height: box.h + 16 } });
    out.frames.push({ view: name, device: name === '360' ? 'Galaxy S5' : 'Desktop Chrome 1280x800', route: 'https://dloizides.com/', anchor: 'flier-studio card scrollIntoView center', file: path.basename(shot), ...m });
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(__dirname, `${build}.json`), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out.frames.map(f => ({ v: f.view, card: f.card, img: f.img, fit: f.objectFit, vis: f.visibleSrc, cov: f.coveredFromImgY, covSrc: f.coveredFromSrcY })), null, 0)); console.log(out.frames[0].cardHtml);
})();
