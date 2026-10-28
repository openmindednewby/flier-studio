const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'svg', 'jobs.json'), 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const j of jobs) {
    const out = path.join(__dirname, 'png', j.png); fs.mkdirSync(path.dirname(out), { recursive: true });
    const svg = fs.readFileSync(path.join(__dirname, 'svg', j.svg), 'utf8');
    await p.emulateMedia({ reducedMotion: j.reduced ? 'reduce' : 'no-preference' });
    if (j.times) {
      const cells = j.times.map((t) => `<div class="c" data-t="${t}">${svg}</div>`).join('');
      await p.setViewportSize({ width: j.w * j.times.length, height: j.h });
      await p.setContent(`<html><body style="margin:0;display:flex">${cells}</body></html>`);
      await p.evaluate(() => document.querySelectorAll('.c').forEach((c) => {
        c.getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = Number(c.dataset.t); });
      }));
      await p.screenshot({ path: out, clip: { x: 0, y: 0, width: j.w * j.times.length, height: j.h } });
    } else {
      await p.setViewportSize({ width: j.w, height: j.h });
      await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
      await p.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
      await p.screenshot({ path: out, clip: { x: 0, y: 0, width: j.w, height: j.h } });
    }
  }
  await b.close(); console.log('rendered', jobs.length);
})();
