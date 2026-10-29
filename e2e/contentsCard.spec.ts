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

const MAX_TASK_MS = 200;
const MODEL_RUN_MS = 180_000;
const MODEL_HOSTS = /huggingface|\.gguf|wllama/;

async function watchLongTasks(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { longTasks: number[] };
    w.longTasks = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) w.longTasks.push(e.duration);
    }).observe({ type: 'longtask', buffered: true });
  });
}

async function longestTask(page: Page): Promise<number> {
  return page.evaluate(() => Math.max(0, ...(window as unknown as { longTasks: number[] }).longTasks));
}

test.describe('D32 Generate runs the on-device AI with keyword gap fill', () => {
  test('the Generate card carries the On-device AI badge and names the 24 MB download', async ({ page }) => {
    await open(page);

    await openPanel(page, Panel.Generate);
    const card = page.getByTestId('generate');

    await expect(card.getByRole('heading', { level: 2 })).toContainText('On-device AI');
    await expect(card.locator('.badge')).toHaveText('On-device AI');
    await expect(card.getByTestId('ai-note')).toHaveText('On-device AI reads your words in this browser (about a 24 MB download, once); keywords fill anything it misses. Your text never leaves the browser.');
  });

  test('when the model cannot load, the keyword match still fills the flier without blocking the page', async ({ page }) => {
    await watchLongTasks(page);
    await page.route(MODEL_HOSTS, (route) => route.abort());
    await open(page);
    await openPanel(page, Panel.Generate);
    await page.getByTestId('prompt-text').fill('Tango milonga on Saturday 21 November 21:00 - 01:00');

    await page.getByTestId('prompt-generate').click();

    await expect(page.getByTestId('prompt-status')).toHaveText('The on-device AI could not load here, so a keyword match filled the flier', { timeout: MODEL_RUN_MS });
    expect(await longestTask(page)).toBeLessThanOrEqual(MAX_TASK_MS);
  });

  test('with the model, Generate fills the flier off the main thread', async ({ page }) => {
    test.skip(process.env.AI_MODEL !== '1', 'downloads the ~24 MB embedding model: run with AI_MODEL=1');
    test.setTimeout(MODEL_RUN_MS * 2);
    await watchLongTasks(page);
    await open(page);
    await openPanel(page, Panel.Generate);
    await page.getByTestId('prompt-text').fill('Tango milonga on Saturday 21 November 21:00 - 01:00');

    await page.getByTestId('prompt-generate').click();

    await expect(page.getByTestId('prompt-status')).toHaveText('Filled by the on-device AI; keywords filled the gaps', { timeout: MODEL_RUN_MS });
    expect(await longestTask(page)).toBeLessThanOrEqual(MAX_TASK_MS);
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
