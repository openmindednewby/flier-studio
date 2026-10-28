const { chromium } = require('../../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'jobs.json'), 'utf8'));
  const b = await chromium.launch(); const out = {};
  for (const j of jobs) {
    const p = await b.newPage({ deviceScaleFactor: 1, viewport: { width: j.w, height: j.h } });
    const svg = fs.readFileSync(path.join(__dirname, 'exports', j.svg), 'utf8');
    const bg = j.transparent ? 'transparent' : (j.bg || 'transparent');
    await p.setContent(`<html><body style="margin:0;background:${bg}">${svg}</body></html>`);
    await p.screenshot({ path: path.join(__dirname, 'exports', j.png), omitBackground: !!j.transparent, clip: { x: 0, y: 0, width: j.w, height: j.h } });
    out[j.png] = await p.evaluate(() => {
      const s = document.querySelector('svg').getBoundingClientRect();
      return { w: s.width, h: s.height, liveText: document.querySelectorAll('text').length };
    });
    await p.close();
  }
  await b.close();
  fs.writeFileSync(path.join(__dirname, 'render-result.json'), JSON.stringify(out, null, 1));
  console.log('rendered', jobs.length);
})();
