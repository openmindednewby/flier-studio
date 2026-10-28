const { chromium } = require('../../node_modules/playwright');
(async () => { const b = await chromium.launch();
 for (const [dir, w, h] of [['FLIER-2-vf-page2',1280,800],['FLIER-2-vf-page2',390,844],['FLIER-2-brand-marks',1280,800],['FLIER-2-brand-marks',390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(require('url').pathToFileURL(require('path').join(__dirname, dir, 'index.html')).href);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: `${__dirname}/${dir}/page-${w}.png`, fullPage: true }); console.log(dir, w, 'scrollWidth', sw); await p.close(); }
 await b.close(); })();
