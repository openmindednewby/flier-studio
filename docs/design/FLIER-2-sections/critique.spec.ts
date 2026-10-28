import { devices, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'docs/design/FLIER-2-sections/critique');
const CLOCK = new Date('2026-10-28T15:00:00Z');
const DEVICES = [
  { name: '360', use: devices['Galaxy S5'] },
  { name: '1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
];
mkdirSync(OUT, { recursive: true });
for (const d of DEVICES) for (const scheme of ['light', 'dark'] as const) {
  test(`live ${d.name} ${scheme}`, async ({ browser }) => {
    const { defaultBrowserType: _b, ...use } = d.use;
    const ctx = await browser.newContext({ ...use, colorScheme: scheme });
    const page = await ctx.newPage();
    await page.clock.setFixedTime(CLOCK);
    await page.goto('/');
    await page.locator('[data-testid="preview-grid"][data-render="done"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(OUT, `live-${d.name}-${scheme}-fold.png`) });
    await page.screenshot({ path: join(OUT, `live-${d.name}-${scheme}-full.png`), fullPage: true });
    const m = await page.evaluate(() => {
      const r = (s: string): string => { const n = document.querySelector(s); if (!n) return 'absent'; const b = n.getBoundingClientRect(); return `x${b.left.toFixed(0)} y${(b.top + scrollY).toFixed(0)} w${b.width.toFixed(0)} h${b.height.toFixed(0)}`; };
      const card = document.querySelector('[data-testid="all-fliers"]');
      const parts = card ? [...card.querySelectorAll('h2,p,label,select,button,input')].map((n) => `${n.tagName}${n.getAttribute('data-testid') ? '#' + n.getAttribute('data-testid') : ''} "${(n.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60)}" ${(() => { const b = n.getBoundingClientRect(); return `y${(b.top + scrollY).toFixed(0)} w${b.width.toFixed(0)} h${b.height.toFixed(0)}`; })()}`) : [];
      const h = [...document.querySelectorAll('h1,h2,h3')].map((n) => `${n.tagName} "${(n.textContent ?? '').trim().slice(0, 40)}" y${(n.getBoundingClientRect().top + scrollY).toFixed(0)}`);
      return { page: `${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`, allFliers: r('[data-testid="all-fliers"]'), flier1: r('[data-testid="preview-1"]'), form: r('[data-testid="flier-form"]'), prompt: r('[data-testid="prompt-text"]'), drafts: r('[data-testid="drafts-panel"]'), downloadAll: r('[data-testid="download-all"]'), mini: r('[data-testid="mini-preview"]'), parts, h, font: getComputedStyle(document.body).fontFamily, bg: getComputedStyle(document.body).backgroundColor };
    });
    writeFileSync(join(OUT, `live-${d.name}-${scheme}.json`), `${JSON.stringify(m, null, 1)}\n`);
    await ctx.close();
  });
}
