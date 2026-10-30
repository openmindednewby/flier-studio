import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const RUN = process.env.CAPTURE_AC44 === '1';
const OUT = join('docs', 'design', 'FLIER-2-AC44-45', 'build');
const SCHEMES = ['light', 'dark'] as const;

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

const SEEN: Record<string, string[]> = {};

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  SEEN[name] = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-testid]')].filter((n) => {
    const r = n.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  }).map((n) => n.dataset.testid ?? ''));
}

async function framed(page: Page, testId: string, name: string): Promise<void> {
  await page.getByTestId(testId).first().scrollIntoViewIfNeeded();
  await shot(page, name);
}

test.describe('AC-44/45/46 build captures', () => {
  test.skip(!RUN, 'captures run only with CAPTURE_AC44=1');

  for (const scheme of SCHEMES) {
    test(`captures ${scheme}`, async ({ page, isMobile }) => {
      mkdirSync(OUT, { recursive: true });
      const width = isMobile ? '360' : '1280';
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/');
      await rendered(page);
      await openPanel(page, Panel.All);
      await page.getByTestId('text-roles').scrollIntoViewIfNeeded();
      await shot(page, `A-build-${width}-${scheme}-closed`);

      await page.getByTestId('role-prices').click();
      await page.getByTestId('role-editor').getByTestId('style-wider').scrollIntoViewIfNeeded();
      await shot(page, `A-build-${width}-${scheme}-open`);

      await page.getByTestId('role-title').scrollIntoViewIfNeeded();
      if (isMobile) await page.getByTestId('role-title').focus();
      else await page.getByTestId('role-title').hover();
      await shot(page, `A-build-${width}-${scheme}-${isMobile ? 'peek' : 'hover'}`);

      await page.getByTestId('role-prices').click();
      await framed(page, 'shared-fields', `A-build-${width}-${scheme}-shared`);
      await framed(page, 'all-custom-layouts', `A-build-${width}-${scheme}-card-end`);
      await framed(page, 'add-flier', `A-build-${width}-${scheme}-add`);
      await page.getByTestId('replace-find').first().fill('Kizomba');
      await framed(page, 'replace-bar', `A-build-${width}-${scheme}-replace-typed`);
      await page.getByTestId('all-fliers-toggle').click();
      await framed(page, 'all-fliers', `A-build-${width}-${scheme}-folded`);
      await page.getByTestId('all-fliers-toggle').click();
      writeFileSync(join(OUT, `seen-${width}-${scheme}.json`), `${JSON.stringify(SEEN, null, 1)}
`);
    });
  }
});
