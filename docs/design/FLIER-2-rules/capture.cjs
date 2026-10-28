const { chromium } = require('../../../node_modules/playwright');
const { writeFileSync } = require('fs');
const { join } = require('path');

const builds = { before: process.argv[2], after: process.argv[3] };
const viewports = [[360, 640], [1280, 800]];
const schemes = ['light', 'dark'];
const steps = ['goto /', 'wait preview-grid[data-render=done]', 'wait 900 ms (logo intro)', 'frame top: scroll 0', 'frame previews: scrollIntoView preview-1 block start, focus download-all (focusVisible)'];

(async () => {
  const browser = await chromium.launch();
  const frames = [];
  for (const [w, h] of viewports) for (const scheme of schemes) for (const [build, url] of Object.entries(builds)) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForSelector('[data-testid="preview-grid"][data-render="done"]');
    await page.waitForTimeout(900);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const top = `${build}-${w}x${h}-${scheme}-top.png`;
    await page.screenshot({ path: join(__dirname, top) });
    await page.evaluate(() => {
      document.querySelector('[data-testid="preview-1"]').scrollIntoView({ block: 'start' });
      document.querySelector('[data-testid="download-all"]').focus({ focusVisible: true });
    });
    await page.waitForTimeout(300);
    const previews = `${build}-${w}x${h}-${scheme}-previews.png`;
    await page.screenshot({ path: join(__dirname, previews) });
    const pair = { route: '/', state: 'kizomba preset, flier 1 selected', fixture: 'default preset', viewport: `${w}x${h}`, scheme };
    frames.push({ build, file: top, anchor: 'scroll 0', pair, scrollWidth });
    frames.push({ build, file: previews, anchor: 'preview-1 block start + download-all focused', pair, scrollWidth });
    await context.close();
  }
  await browser.close();
  writeFileSync(join(__dirname, 'result.json'), JSON.stringify({ task: 'FLIER-2 "Flier Studio follow-ups" D3+D8 + LOGO-1 "A logo pipeline that makes beautiful, animatable marks" wiring', pairMethod: 'same-steps', steps, frames }, null, 2));
  console.log(frames.map((f) => `${f.file} sw=${f.scrollWidth}`).join('\n'));
})();
