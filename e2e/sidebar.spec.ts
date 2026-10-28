import { expect, test, type Locator, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const HIT = 44;
const ACCENT_PX = 3;
const ONE_ROW_MAX = 64;
const RAIL_MAX = 88;
const PANELS = ['all-fliers', 'flier-form', 'drafts-panel', 'generate', 'saved-configs'];

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
}

async function box(target: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const found = await target.boundingBox();
  expect(found).not.toBeNull();
  return found ?? { x: 0, y: 0, width: 0, height: 0 };
}

const visiblePanels = async (page: Page): Promise<string[]> => {
  const shown: string[] = [];
  for (const id of PANELS) if (await page.getByTestId(id).isVisible()) shown.push(id);
  return shown;
};

test.describe('AC-28 side tools move into the left column', () => {
  test('at 1280 Generate and Saved configs sit left of the fliers and the right column holds only the fliers', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'desktop layout');
    await open(page);
    const grid = await box(page.getByTestId('preview-grid'));

    await openPanel(page, Panel.Generate);
    const generate = await box(page.getByTestId('generate'));
    await openPanel(page, Panel.Configs);
    const configs = await box(page.getByTestId('saved-configs'));

    expect(generate.x + generate.width).toBeLessThanOrEqual(grid.x);
    expect(configs.x + configs.width).toBeLessThanOrEqual(grid.x);
    await expect(page.getByTestId('previews').getByTestId('generate')).toHaveCount(0);
    await expect(page.getByTestId('previews').getByTestId('saved-configs')).toHaveCount(0);
  });
});

test.describe('AC-29 the sidebar switches the panel', () => {
  test('on load the Flier panel is the one panel shown and its rail item is current', async ({ page }) => {
    await open(page);

    const shown = await visiblePanels(page);

    expect(shown).toEqual(['flier-form']);
    await expect(page.getByTestId('nav-form')).toHaveAttribute('aria-current', 'page');
  });

  test('a rail item shows only its panel, marks itself current with a 3 px accent bar and is 44 px with a tooltip', async ({ page }) => {
    await open(page);
    const drafts = page.getByTestId('nav-drafts');

    await openPanel(page, Panel.Drafts);

    expect(await visiblePanels(page)).toEqual(['drafts-panel']);
    await expect(drafts).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('nav-form')).not.toHaveAttribute('aria-current', 'page');
    const shadow = await drafts.evaluate((n) => getComputedStyle(n).boxShadow);
    expect(shadow).toContain(`${String(ACCENT_PX)}px`);
    for (const link of await page.getByTestId('section-nav').getByRole('link').all()) {
      const b = await box(link);
      expect(b.height).toBeGreaterThanOrEqual(HIT);
      expect(b.width).toBeGreaterThanOrEqual(HIT);
      expect(await link.getAttribute('title')).toBeTruthy();
    }
  });

  test('the rail is walked from the keyboard: Enter on Generate opens the Generate panel', async ({ page }) => {
    await open(page);
    const link = page.getByTestId('nav-ai');

    await link.focus();
    await page.keyboard.press('Enter');

    expect(await visiblePanels(page)).toEqual(['generate']);
    await expect(page.getByTestId('prompt-text')).toBeInViewport();
  });

  test('the Fliers item brings the fliers into view and keeps the open panel', async ({ page }) => {
    await open(page);

    await page.getByTestId('nav-previews').click();

    await expect(page.getByTestId('preview-1')).toBeInViewport();
    expect(await visiblePanels(page)).toEqual(['flier-form']);
  });

  test('collapsing the rail to icons is remembered after a reload and hides the captions', async ({ page }) => {
    await open(page);
    const toggle = page.getByTestId('rail-toggle');
    expect((await box(toggle)).height).toBeGreaterThanOrEqual(HIT);

    await toggle.click();
    await page.reload();
    await page.locator('canvas').first().waitFor();

    await expect(page.getByTestId('section-nav')).toHaveAttribute('data-collapsed', 'true');
    await expect(page.getByTestId('rail-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByTestId('nav-all').locator('.rail-label')).toBeHidden();
  });

  test('at 1280 the rail is a left sidebar at most 88 px wide; at 360 it is one sticky row', async ({ page }, info) => {
    await open(page);
    const rail = await box(page.getByTestId('section-nav'));

    await page.mouse.wheel(0, 1500);

    if (info.project.name === 'mobile') {
      expect(rail.height).toBeLessThanOrEqual(ONE_ROW_MAX);
      await expect.poll(async () => (await box(page.getByTestId('section-nav'))).y).toBeLessThanOrEqual(1);
    } else {
      expect(rail.x).toBe(0);
      expect(rail.width).toBeLessThanOrEqual(RAIL_MAX);
    }
  });
});

test.describe('AC-30 / AC-31 All fliers says what each setting changes', () => {
  test('All fliers is a settings registry: Theme, Layout, Colours, Fonts, Custom layouts, each with what it changes', async ({ page }) => {
    await open(page);

    await openPanel(page, Panel.All);

    const registry = page.getByTestId('all-fliers-row');
    await expect(registry).toHaveAttribute('data-registry', 'settings');
    for (const id of ['theme-row', 'all-layout-row', 'all-palette-row', 'all-fonts-row', 'all-custom-layouts']) {
      await expect(registry.getByTestId(id).locator('.setting-what')).not.toBeEmpty();
    }
    await expect(page.getByTestId('all-ai-line')).toContainText('on-device AI');
  });

  test('Shared text names its fields with their current values and says whether it is on', async ({ page }) => {
    await open(page);
    await openPanel(page, Panel.All);
    const fields = page.getByTestId('shared-fields');

    await page.getByTestId('pick-scope').selectOption('all');

    await expect(fields.locator('dt')).toHaveText(['Footer', 'Level names', 'Class price']);
    await expect(fields.locator('dd').first()).toHaveText('Classes by Jimmy & Ismini');
    await expect(fields.locator('dd').nth(1)).toContainText('Beginners');
    await expect(page.getByTestId('shared-state')).toContainText('all 4 fliers');
  });

  test('Colours in All fliers puts every flier on the chosen palette', async ({ page }) => {
    await open(page);
    await openPanel(page, Panel.All);
    const pick = page.getByTestId('all-palette');
    const value = await pick.locator('option').nth(2).getAttribute('value');

    await pick.selectOption(value ?? '');

    await expect.poll(() => page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { style: { palette: string } }[]).map((f) => f.style.palette))).toEqual(Array(4).fill(value));
  });
});
