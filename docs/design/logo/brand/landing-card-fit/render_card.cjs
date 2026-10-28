const { chromium } = require('../../../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1, viewport: { width: 1280, height: 800 } });
  await p.setContent(`<html><body style="margin:0">${fs.readFileSync(path.join(__dirname, '_card.svg'), 'utf8')}</body></html>`);
  await p.screenshot({ path: path.join(__dirname, '..', 'exports', 'landing-card-1280x800.png'), clip: { x: 0, y: 0, width: 1280, height: 800 } });
  const ink = await p.evaluate(() => { const r = document.querySelector('svg').getBBox(); return document.querySelectorAll('text').length; });
  await b.close(); console.log('rendered, live <text>:', ink);
})();
