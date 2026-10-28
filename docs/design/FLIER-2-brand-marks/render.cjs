// Renders svg/*.svg to png/ at native size with Chromium. Run from this folder: node render.cjs
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'svg', 'jobs.json'), 'utf8'));
  fs.mkdirSync(path.join(__dirname, 'png'), { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const j of jobs) {
    await p.setViewportSize({ width: j.w, height: j.h });
    const svg = fs.readFileSync(path.join(__dirname, 'svg', j.name + '.svg'), 'utf8');
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await p.screenshot({ path: path.join(__dirname, 'png', j.name + '.png'), clip: { x: 0, y: 0, width: j.w, height: j.h } });
  }
  await b.close(); console.log('rendered', jobs.length);
})();
