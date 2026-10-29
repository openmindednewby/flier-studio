import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const TOP = 'KIZOMBA NIGHTS';
const BOTTOM = 'CLASS';
const ONE_PX = 1;
const HALF_PX = 0.5;

interface Drawn { w: number; px: number; font: string }

function spyOnText(): void {
  const drawn: Record<string, { w: number; px: number; font: string } | undefined> = {};
  const orig = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, ...args: [string, number, number, number?]): void {
    const [text, x, y, max] = args;
    const px = Number((/(\d+(?:\.\d+)?)px/.exec(this.font) ?? [])[1] ?? 0);
    drawn[String(text).toUpperCase()] = { w: this.measureText(text).width, px, font: this.font };
    if (max === undefined) orig.call(this, text, x, y);
    else orig.call(this, text, x, y, max);
  };
  Object.assign(window, { drawnText: (t: string) => drawn[t] });
}

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

async function drawn(page: Page, text: string): Promise<Drawn> {
  return page.evaluate((t) => (window as unknown as { drawnText: (k: string) => Drawn }).drawnText(t), text);
}

async function switchTheme(page: Page): Promise<void> {
  await openPanel(page, Panel.All);
  const theme = page.getByTestId('pick-theme');
  await theme.selectOption((await theme.locator('option:not(:checked)').first().getAttribute('value')) ?? '');
  await rendered(page);
  await openPanel(page, Panel.Form);
}

test.describe('line sizes and per-field style (AC-38, AC-39, AC-40)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(spyOnText);
    await page.goto('/');
    await openPanel(page, Panel.Form);
    await page.getByTestId('field-title').fill(TOP);
    await page.getByTestId('field-titleBottom').fill(BOTTOM);
    await rendered(page);
  });

  test('AC-38 Same width draws both title lines at one width within 1 px, and a theme switch keeps it', async ({ page }) => {
    await page.getByTestId('line-same-width').click();
    await rendered(page);
    const top = await drawn(page, TOP);
    const bottom = await drawn(page, BOTTOM);
    await switchTheme(page);

    expect(Math.abs(top.w - bottom.w)).toBeLessThanOrEqual(ONE_PX);
    await expect(page.getByTestId('line-same-width')).toHaveAttribute('aria-pressed', 'true');
    expect(Math.abs((await drawn(page, TOP)).w - (await drawn(page, BOTTOM)).w)).toBeLessThanOrEqual(ONE_PX);
  });

  test('AC-39 Same size draws both title lines at one font size, and the size steppers show the scale', async ({ page }) => {
    await page.getByTestId('line-same-size').click();
    await rendered(page);
    await page.getByTestId('line-larger-title').click();

    await expect(page.getByTestId('line-size-title')).toHaveText('105%');
    expect(Math.abs((await drawn(page, TOP)).px - (await drawn(page, BOTTOM)).px)).toBeLessThanOrEqual(HALF_PX);
  });

  test('AC-40 Style opens on Font, the font draws on the flier, a theme switch keeps it, and Reset brings the theme back', async ({ page }) => {
    await page.getByTestId('style-title').click();
    await expect(page.getByTestId('style-panel')).toContainText('Style: Title');
    await expect(page.getByTestId('style-font')).toBeFocused();
    await page.getByTestId('style-font').selectOption('Allura');
    await rendered(page);
    const styled = await drawn(page, TOP);
    await page.getByTestId('style-done').click();
    await switchTheme(page);
    const afterTheme = await drawn(page, TOP);
    await page.getByTestId('style-title').click();
    await page.getByTestId('style-reset').click();
    await rendered(page);

    expect(styled.font).toContain('Allura');
    expect(afterTheme.font).toContain('Allura');
    expect((await drawn(page, TOP)).font).not.toContain('Allura');
  });

  test('AC-40 the Done button closes the style panel and gives focus back to its Style button', async ({ page }) => {
    await page.getByTestId('style-venue').click();
    await expect(page.getByTestId('style-done')).toBeInViewport();

    await page.getByTestId('style-done').click();

    await expect(page.getByTestId('style-panel')).toHaveCount(0);
    await expect(page.getByTestId('style-venue')).toBeFocused();
  });
});
