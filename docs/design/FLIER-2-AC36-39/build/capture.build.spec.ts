import { expect, test, type Page } from '@playwright/test';

const SIZES = [{ name: '360', width: 360, height: 640 }, { name: '1280', width: 1280, height: 800 }] as const;
const SCHEMES = ['light', 'dark'] as const;
const OUT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

async function shot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

async function nav(page: Page, panel: string): Promise<void> {
  await page.getByTestId(`nav-${panel}`).click();
}

async function scrollTop(page: Page, testId: string): Promise<void> {
  await page.evaluate((id) => { const n = document.querySelector(`[data-testid="${id}"]`); if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 16); }, testId);
}

async function scrollEnd(page: Page, testId: string): Promise<void> {
  await page.evaluate((id) => { const n = document.querySelector(`[data-testid="${id}"]`); if (n) window.scrollTo(0, n.getBoundingClientRect().bottom + scrollY - innerHeight + 16); }, testId);
}

async function centre(page: Page, testId: string): Promise<void> {
  await page.evaluate((id) => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center' }), testId);
}

for (const size of SIZES) {
  for (const scheme of SCHEMES) {
    test(`B build ${size.name} ${scheme}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2, colorScheme: scheme, hasTouch: size.width < 1024 });
      const page = await context.newPage();
      const tag = `B-${size.name}-${scheme}`;
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await shot(page, `${tag}-top`);
      await nav(page, 'drafts');
      await page.getByTestId('drafts-favourites').click();
      await scrollTop(page, 'drafts-panel');
      await shot(page, `${tag}-drafts-empty`);
      await page.getByTestId('drafts-all').click();
      await nav(page, 'form');
      for (const [i, title] of ['KIZOMBA NIGHT', 'Friday class', 'Bachata social', 'Salsa on the beach', 'Zouk workshop weekend'].entries()) {
        await page.getByTestId('field-title').fill(title);
        await expect(page.getByTestId('drafts-all')).toHaveText(`All (${String(i + 2)})`);
      }
      await scrollTop(page, 'flier-form');
      await shot(page, `${tag}-form`);
      await centre(page, 'field-includesHeading');
      await shot(page, `${tag}-form-mid`);
      await scrollEnd(page, 'flier-form');
      await shot(page, `${tag}-form-end`);
      await centre(page, 'preview-1');
      await shot(page, `${tag}-flier`);
      await nav(page, 'drafts');
      await page.getByTestId('draft-star-2').click();
      await scrollTop(page, 'drafts-panel');
      await shot(page, `${tag}-drafts`);
      await scrollEnd(page, 'drafts-panel');
      await shot(page, `${tag}-drafts-end`);
      await scrollTop(page, 'drafts-panel');
      await page.getByTestId('draft-more-1').click();
      await shot(page, `${tag}-menu`);
      await page.getByTestId('draft-menu-rename').click();
      await shot(page, `${tag}-rename`);
      await page.keyboard.press('Escape');
      await page.getByTestId('draft-more-1').click();
      await page.getByTestId('draft-menu-delete').click();
      await shot(page, `${tag}-toast`);
      await page.getByTestId('drafts-undo').click();
      await page.getByTestId('drafts-cleanup').click();
      await shot(page, `${tag}-confirm`);
      await page.getByTestId('drafts-confirm-keep').click();
      await nav(page, 'form');
      await page.getByTestId('line-same-width').click();
      await page.getByTestId('line-sizes').evaluate((n) => n.scrollIntoView({ block: 'center' }));
      await shot(page, `${tag}-lines`);
      await page.getByTestId('line-same-size').click();
      await centre(page, 'preview-1');
      await shot(page, `${tag}-size`);
      await centre(page, 'field-titleBottom');
      await page.getByTestId('style-titleBottom').click();
      await shot(page, `${tag}-style`);
      await page.getByTestId('style-font').evaluate((select: HTMLSelectElement) => { select.size = select.options.length; select.scrollIntoView({ block: 'center' }); });
      await shot(page, `${tag}-fonts-open`);
      await page.getByTestId('style-font').evaluate((select: HTMLSelectElement) => { select.size = 0; });
      await page.getByTestId('style-done').click();
      await nav(page, 'ai');
      await shot(page, `rail-${size.name}-${scheme}-generate-after`);
      await nav(page, 'configs');
      await shot(page, `rail-${size.name}-${scheme}-configs-after`);
      await nav(page, 'ai');
      await page.evaluate(() => {
        for (const sheet of [...document.styleSheets]) {
          const rules = [...sheet.cssRules];
          const i = rules.findIndex((r) => r instanceof CSSMediaRule && r.conditionText.includes('399px') && r.cssText.includes('.rail a'));
          if (i >= 0) { sheet.deleteRule(i); sheet.insertRule('.rail-label { overflow-wrap: anywhere; }', sheet.cssRules.length); }
        }
      });
      await shot(page, `rail-${size.name}-${scheme}-generate-before`);
      await context.close();
    });
  }
}
