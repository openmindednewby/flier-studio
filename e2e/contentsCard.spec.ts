import { expect, test, type Locator, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const HIT = 44;
const PANELS: readonly (readonly [Panel, string])[] = [[Panel.All, 'all-fliers'], [Panel.Form, 'flier-form'], [Panel.Drafts, 'drafts-panel'], [Panel.Generate, 'generate'], [Panel.Configs, 'saved-configs']];
const RIGHT_COLUMN = ['preview-grid'];
const GROUPS = ['layout', 'pictures', 'text'];

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
}

async function box(target: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const found = await target.boundingBox();
  expect(found).not.toBeNull();
  return found ?? { x: 0, y: 0, width: 0, height: 0 };
}

test.describe('D31 Generate is a keyword match, not an on-device AI', () => {
  test('the Generate card carries no AI badge and names the keyword match', async ({ page }) => {
    await open(page);

    await openPanel(page, Panel.Generate);
    const card = page.getByTestId('generate');

    await expect(card.getByRole('heading', { level: 2 })).toHaveText('Generate from prompt');
    await expect(card.locator('.badge')).toHaveCount(0);
    await expect(card.getByTestId('ai-note')).toHaveText('A keyword match in this browser fills the flier from your words; your text never leaves it.');
  });

  test('Generate fills the flier from the prompt without downloading any model', async ({ page }) => {
    const modelRequests: string[] = [];
    page.on('request', (r) => {
      if (/huggingface|\.gguf|wllama/.test(r.url())) modelRequests.push(r.url());
    });
    await open(page);
    await openPanel(page, Panel.Generate);
    await page.getByTestId('prompt-text').fill('Tango milonga on Saturday 21 November 21:00 - 01:00');

    await page.getByTestId('prompt-generate').click();

    await expect(page.getByTestId('prompt-status')).toHaveText('Filled from your words with a keyword match');
    expect(modelRequests).toEqual([]);
  });

  test('a Generate entry sits above the fliers on the first screen and jumps to the Generate card', async ({ page }) => {
    await open(page);
    const entry = page.getByTestId('ai-entry');
    const viewport = page.viewportSize()?.height ?? 0;
    const entryBox = await box(entry);
    const gridBox = await box(page.getByTestId('preview-grid'));

    await entry.click();

    await expect(entry).toHaveText('Generate from a description');
    expect(entryBox.y + entryBox.height).toBeLessThanOrEqual(viewport);
    expect(entryBox.y).toBeLessThan(gridBox.y);
    expect(entryBox.height).toBeGreaterThanOrEqual(HIT);
    await expect(page.getByTestId('prompt-text')).toBeInViewport();
  });

  test('the page title, description and Open Graph description no longer claim on-device AI', async ({ page }) => {
    await open(page);

    const description = await page.locator('meta[name=description]').getAttribute('content');
    const og = await page.locator('meta[property="og:description"]').getAttribute('content');

    await expect(page).not.toHaveTitle(/AI/);
    expect(description).not.toContain('AI');
    expect(og).not.toContain('AI');
  });
});

test.describe('AC-25 left column: contents card, All fliers, Flier, Drafts', () => {
  test('the sidebar comes before every panel it opens: above it at 360, left of it at 1280', async ({ page }, info) => {
    await open(page);

    for (const [panel, id] of PANELS) {
      await openPanel(page, panel);
      const [nav, b] = await Promise.all([box(page.getByTestId('section-nav')), box(page.getByTestId(id))]);
      if (info.project.name === 'mobile') expect(b.y).toBeGreaterThan(nav.y);
      else expect(b.x).toBeGreaterThanOrEqual(nav.x + nav.width);
    }
  });

  test('at 1280 the previews sit right of the form', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'desktop layout');
    await open(page);
    const form = await box(page.getByTestId('flier-form'));

    const right = await Promise.all(RIGHT_COLUMN.map((id) => box(page.getByTestId(id))));

    right.forEach((b) => expect(b.x).toBeGreaterThanOrEqual(form.x + form.width));
  });

  test('at 360 All fliers starts within one screen of the contents card', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'mobile layout');
    await open(page);
    const viewport = page.viewportSize()?.height ?? 0;
    await openPanel(page, Panel.All);

    const [nav, fliers] = await Promise.all([box(page.getByTestId('section-nav')), box(page.getByTestId('all-fliers'))]);

    expect(fliers.y - nav.y).toBeLessThan(viewport);
  });

  test('every contents link is 44 px tall and jumps to its section', async ({ page }) => {
    await open(page);
    const links = page.getByTestId('section-nav').getByRole('link');
    await expect(links).toHaveText(['All fliers', 'Flier', 'Drafts', 'Generate', 'Fliers', 'Saved configs']);

    await page.getByTestId('nav-drafts').click();

    for (const link of await links.all()) expect((await box(link)).height).toBeGreaterThanOrEqual(HIT);
    await expect(page.getByTestId('drafts-panel')).toBeInViewport();
  });
});

test.describe('AC-26 every field-group header folds', () => {
  for (const group of GROUPS) {
    test(`the ${group} group header is a 44 px toggle that folds and remembers it after a reload`, async ({ page }) => {
      await open(page);
      const toggle = page.getByTestId(`group-toggle-${group}`);
      expect((await box(toggle)).height).toBeGreaterThanOrEqual(HIT);

      await toggle.click();
      await page.reload();
      await page.locator('canvas').first().waitFor();

      await expect(page.getByTestId(`group-toggle-${group}`)).toHaveAttribute('aria-expanded', 'false');
    });
  }

  test('the Flier header folds the whole form from the keyboard', async ({ page }) => {
    await open(page);
    const toggle = page.getByTestId('flier-form-toggle');

    await toggle.focus();
    await page.keyboard.press('Enter');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByTestId('field-title')).toBeHidden();
  });
});

test.describe('AC-27 Download all on the header row', () => {
  test('Download all PNGs shares the header row with the brand', async ({ page }) => {
    await open(page);

    const [brand, download] = await Promise.all([box(page.getByTestId('brand')), box(page.getByTestId('download-all'))]);

    expect(download.y).toBeLessThan(brand.y + brand.height);
    expect(download.y + download.height).toBeGreaterThan(brand.y);
    await expect(page.locator('header').getByTestId('download-all')).toBeVisible();
  });
});
