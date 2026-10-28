const { chromium } = require('../../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'svg', 'jobs.json'), 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const j of jobs) {
    const out = path.join(__dirname, 'png', j.png); fs.mkdirSync(path.dirname(out), { recursive: true });
    const svg = fs.readFileSync(path.join(__dirname, 'svg', j.svg), 'utf8');
    await p.setViewportSize({ width: j.w, height: j.h });
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: j.w, height: j.h } });
  }
  await b.close(); console.log('rendered', jobs.length);
})();
