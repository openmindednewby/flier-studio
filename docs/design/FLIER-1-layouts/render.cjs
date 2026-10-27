const { chromium } = require('C:/desktopContents/projects/SaaS/E2ETests/node_modules/playwright');
const fs = require('fs'), path = require('path');
const HERE = __dirname, OUT = path.join(HERE, 'out');
const url = (p) => 'file:///' + path.join(HERE, p).replace(/\\/g, '/');
const ITEMS = {
  title1: (s) => s === 'KIZOMBA', date: (s) => s === 'Saturday 31 October', title2: (s) => s === 'WORKSHOP',
  venue: (s) => s === 'Bailemos' || s === 'Dance School', levels: (s) => /^Level [12]$|^2[01]:00/.test(s),
  classPrice: (s) => /^5€/.test(s), partyPrice: (s) => /^20€/.test(s),
  includes: (s) => /includes$|Salsa & Bachata|Kizomba dedicated|2 drinks/.test(s), footer: (s) => s === 'with Jimmy & Ismini',
};
function classify(log, W, H) {
  const seen = new Set(), overflow = [];
  for (const e of log) {
    if (e.t === 'img') {
      const id = e.ih / e.iw > 1.5 ? 'picture' : 'logo';
      if (e.x < W && e.y < H && e.x + e.w > 0 && e.y + e.h > 0) seen.add(id);
      continue;
    }
    const x0 = e.align === 'right' ? e.x - e.w : e.align === 'center' ? e.x - e.w / 2 : e.x;
    const inY = e.y > 0 && e.y <= H, inX = x0 >= -1 && x0 + e.w <= W + 1;
    if (!(inY && inX)) overflow.push(e.s);
    if (!inY || x0 > W) continue;
    for (const [id, f] of Object.entries(ITEMS)) if (f(e.s)) seen.add(id);
  }
  return { seen: [...seen].sort(), overflow };
}
(async () => {
  const jobs = JSON.parse(process.argv[2]);
  const b = await chromium.launch();
  const res = {};
  for (const j of jobs) {
    const [W, H] = j.size;
    console.error('job', j.name); const page = await b.newPage({ viewport: { width: 1200, height: 900 } });
    await page.goto(url(j.src));
    await page.waitForFunction(() => window.flierReady === true, null, { timeout: 90000 });
    await page.waitForTimeout(300);
    const r = await page.evaluate((sel) => {
      const cv = document.querySelector(sel);
      return { data: cv.toDataURL('image/png'), log: cv.__log || [], report: window.report || null };
    }, j.sel || 'canvas');
    fs.writeFileSync(path.join(OUT, j.name + '.png'), Buffer.from(r.data.split(',')[1], 'base64'));
    res[j.name] = { ...classify(r.log, W, H), report: r.report };
    await page.close();
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(res, null, 1));
  for (const [k, v] of Object.entries(res)) console.log(k, v.seen.length, v.seen.join(','), 'overflow:', v.overflow.join('|') || '-', v.report ? `inside=${v.report.inside} covered=${v.report.covered}/${v.report.opaque}` : '');
})();
