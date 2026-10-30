import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const RUN = process.env.CAPTURE_AC47_50 === '1';
const OUT = join('docs', 'design', 'FLIER-2-AC47-50', 'build');
const SCHEMES = ['light', 'dark'] as const;
const HOVER_AT = 0.3;

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

const shot = async (page: Page, name: string): Promise<void> => { await page.screenshot({ path: join(OUT, `${name}.png`) }); };

async function hoverSection(page: Page): Promise<void> {
  const canvas = page.getByTestId('preview-1').locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox()) ?? { x: 0, y: 0, width: 0, height: 0 };
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * HOVER_AT);
}

test.describe('AC-47/48/49/50 + D45 build captures', () => {
  test.skip(!RUN, 'captures run only with CAPTURE_AC47_50=1');

  for (const scheme of SCHEMES) {
    test(`captures ${scheme}`, async ({ page, isMobile }) => {
      mkdirSync(OUT, { recursive: true });
      const tag = `${isMobile ? '360' : '1280'}-${scheme}`;
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/');
      await rendered(page);
      if (!isMobile) { await hoverSection(page); await shot(page, `${tag}-1-hover-section`); }
      await openPanel(page, Panel.All);
      await page.getByTestId('role-venue').click();
      await page.getByTestId('role-editor').getByTestId('style-wider').scrollIntoViewIfNeeded();
      await shot(page, `${tag}-2-editor-open`);

      await page.getByTestId('role-editor').getByTestId('style-wider').click();
      await rendered(page);
      await shot(page, `${tag}-3-outline-gone-after-change`);

      await page.getByTestId('section-order').scrollIntoViewIfNeeded();
      await shot(page, `${tag}-4-reorder-before`);
      const last = page.getByTestId('section-order').locator('li').last();
      await last.locator('[data-testid$="-up"]').click();
      await rendered(page);
      await page.getByTestId('section-order').scrollIntoViewIfNeeded();
      await shot(page, `${tag}-5-reorder-after`);
    });
  }
});
