import { expect, test, type Locator, type Page } from '@playwright/test';

const HIT = 44;
const LEFT_COLUMN = ['section-nav', 'all-fliers', 'flier-form', 'drafts-panel'];
const RIGHT_COLUMN = ['preview-grid', 'generate', 'saved-configs'];
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

test.describe('AC-24 on-device AI is named', () => {
  test('the Generate card carries the On-device AI badge and the keyword fallback note', async ({ page }) => {
    await open(page);

    const card = page.getByTestId('generate');

    await expect(card.getByRole('heading', { level: 2 })).toContainText('On-device AI');
    await expect(card.getByTestId('ai-note')).toHaveText('Runs in this browser with WebGPU; your text never leaves it. Without WebGPU, a keyword match fills the flier.');
  });

  test('a Generate with on-device AI entry sits above the fliers on the first screen and jumps to the Generate card', async ({ page }) => {
    await open(page);
    const entry = page.getByTestId('ai-entry');
    const viewport = page.viewportSize()?.height ?? 0;
    const entryBox = await box(entry);
    const gridBox = await box(page.getByTestId('preview-grid'));

    await entry.click();

    await expect(entry).toHaveText('Generate with on-device AI');
    expect(entryBox.y + entryBox.height).toBeLessThanOrEqual(viewport);
    expect(entryBox.y).toBeLessThan(gridBox.y);
    expect(entryBox.height).toBeGreaterThanOrEqual(HIT);
    await expect(page.getByTestId('prompt-text')).toBeInViewport();
  });

  test('the page title, description and Open Graph description name the on-device AI', async ({ page }) => {
    await open(page);

    const description = await page.locator('meta[name=description]').getAttribute('content');
    const og = await page.locator('meta[property="og:description"]').getAttribute('content');

    await expect(page).toHaveTitle(/on-device AI/);
    expect(description).toContain('on-device AI');
    expect(og).toContain('on-device AI');
  });
});

test.describe('AC-25 left column: contents card, All fliers, Flier, Drafts', () => {
  test('the left column stacks the contents card, All fliers, the form and Drafts in that order', async ({ page }) => {
    await open(page);

    const boxes = await Promise.all(LEFT_COLUMN.map((id) => box(page.getByTestId(id))));

    boxes.slice(1).forEach((b, i) => expect(b.y).toBeGreaterThan(boxes[i].y));
  });

  test('at 1280 the previews, Generate and Saved configs sit right of the form', async ({ page }, info) => {
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

    const [nav, fliers] = await Promise.all([box(page.getByTestId('section-nav')), box(page.getByTestId('all-fliers'))]);

    expect(fliers.y - nav.y).toBeLessThan(viewport);
  });

  test('every contents link is 44 px tall and jumps to its section', async ({ page }) => {
    await open(page);
    const links = page.getByTestId('section-nav').getByRole('link');
    await expect(links).toHaveText(['01All fliers', '02Flier', '03Drafts', '04Generate', '05Previews', '06Saved configs']);

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
