import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '@playwright/test';
const DIR = join(process.cwd(), 'docs/design/FLIER-1-qa/final-2');
test.use({ colorScheme: 'dark' });
test('dark + keyboard sheet', async ({ page }, info) => {
  const p = info.project.name; const errs: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route(/analytics\.dloizides\.com/, (r) => r.abort());
  await page.goto('/'); await page.locator('canvas').first().waitFor(); await page.waitForTimeout(800);
  const r: Record<string, unknown> = await page.evaluate(() => { const bs = getComputedStyle(document.body); return { theme: document.documentElement.dataset.theme, meta: [...document.querySelectorAll('meta[name=theme-color]')].map((m) => `${m.getAttribute('media') ?? ''}=${m.getAttribute('content')}`), bodyBg: bs.backgroundColor, color: bs.color, sw: document.documentElement.scrollWidth }; });
  await page.screenshot({ path: join(DIR, `${p}-08-dark.png`), fullPage: p === 'desktop' });
  if (await page.getByTestId('mini-open').isVisible()) {
    await page.getByTestId('mini-open').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    r.sheetKb = await page.evaluate(() => { const a = document.activeElement as HTMLElement; const s = getComputedStyle(a); return `${a.getAttribute('data-testid')} outline=${s.outlineStyle}/${s.outlineWidth} shadow=${s.boxShadow}`; });
    await page.keyboard.press('Tab'); r.tabInSheet = await page.evaluate(() => document.activeElement?.closest('dialog') ? 'trapped' : 'escaped:' + document.activeElement?.getAttribute('data-testid'));
  }
  r.errs = errs; writeFileSync(join(DIR, `dark-log-${p}.txt`), JSON.stringify(r));
});
