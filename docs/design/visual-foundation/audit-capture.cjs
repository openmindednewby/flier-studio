const path = require('path');
const { chromium, devices } = require(path.resolve(__dirname, '../../../node_modules/playwright'));
const URL = process.env.FLIER_URL || 'https://fliers.dloizides.com/';
const OUT = path.join(__dirname, 'audit');
const VIEWS = [
  { id: '360', ctx: { ...devices['Galaxy S5'] } },
  { id: '1280', ctx: { viewport: { width: 1280, height: 800 } } },
];
(async () => {
  const browser = await chromium.launch();
  for (const v of VIEWS) for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ ...v.ctx, colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const tag = `${v.id}-${scheme}`;
    await page.screenshot({ path: path.join(OUT, `form-top-${tag}.png`) });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(tag, 'scrollWidth', sw);
    if (scheme === 'light') {
      const prev = page.locator('[data-testid=previews]');
      if (await prev.count()) { await prev.scrollIntoViewIfNeeded(); await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, `previews-${tag}.png`) }); }
      const cfg = page.locator('.config-panel, [data-testid=config-panel]').first();
      if (await cfg.count()) { await cfg.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await page.screenshot({ path: path.join(OUT, `configs-${tag}.png`) }); }
    }
    await ctx.close();
  }
  await browser.close();
})();
