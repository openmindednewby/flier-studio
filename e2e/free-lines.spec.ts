import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const SAVE_MS = 3000;

function spy(): void {
  const seen: Record<string, { y: number; font: string; w: number } | undefined> = {};
  const fill = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, ...args: Parameters<CanvasRenderingContext2D['fillText']>): void {
    const [text, , y] = args;
    const w = this.canvas.width;
    const old = seen[String(text)];
    if (old === undefined || w >= old.w) seen[String(text)] = { y: y / w, font: this.font, w };
    fill.apply(this, args);
  };
  Object.assign(window, { drawn: (t: string) => seen[t], forget: () => { Object.keys(seen).forEach((k) => { seen[k] = undefined; }); } });
}

interface Drawn { y: number; font: string }

const drawn = async (page: Page, t: string): Promise<Drawn | undefined> => page.evaluate((k) => (window as unknown as { drawn: (s: string) => Drawn | undefined }).drawn(k), t);

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

async function addLine(page: Page, text: string, index: number): Promise<void> {
  await page.getByTestId('add-line').click();
  await expect(page.getByTestId(`field-line-${String(index)}`)).toBeFocused();
  await page.getByTestId(`field-line-${String(index)}`).fill(text);
  await rendered(page);
}

test.describe('D-LINES-1 Free text lines', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(spy);
    await page.goto('/');
    await openPanel(page, Panel.Form);
    await addLine(page, 'Free parking', 0);
    await addLine(page, 'Bring friends', 1);
  });

  test('added lines draw on the flier in their order, with 44px tools and no horizontal scroll', async ({ page }, info) => {
    await page.getByTestId('free-lines').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `docs/design/FLIER-2-free-lines/after-form-${info.project.name}.png` });
    const first = await drawn(page, 'Free parking');
    const second = await drawn(page, 'Bring friends');
    const boxes = await page.getByTestId('free-line-0').locator('button').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect()).map((r) => Math.min(r.width, r.height)));
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

    expect(first?.y ?? 1).toBeLessThan(second?.y ?? 0);
    expect(Math.min(...boxes)).toBeGreaterThanOrEqual(44);
    expect(wide).toBeLessThanOrEqual(0);
  });

  test('Style on an added line draws it in the chosen font', async ({ page }) => {
    await page.getByTestId('style-line-1').click();
    await expect(page.getByTestId('style-panel')).toContainText('Your line 2');
    await page.getByTestId('style-font').selectOption('Allura');
    await rendered(page);
    await page.getByTestId('style-done').click();

    expect((await drawn(page, 'Bring friends'))?.font).toContain('Allura');
    expect((await drawn(page, 'Free parking'))?.font).not.toContain('Allura');
  });

  test('move down puts the first line below the second, remove takes it off the flier', async ({ page }) => {
    await page.getByTestId('line-down-0').click();
    await rendered(page);
    const moved = [await drawn(page, 'Free parking'), await drawn(page, 'Bring friends')];
    await page.evaluate(() => (window as unknown as { forget: () => void }).forget());
    await page.getByTestId('line-remove-1').click();
    await rendered(page);

    expect(moved[0]?.y ?? 0).toBeGreaterThan(moved[1]?.y ?? 1);
    await expect(page.getByTestId('field-line-0')).toHaveValue('Bring friends');
    await expect(page.getByTestId('field-line-1')).toHaveCount(0);
    expect(await drawn(page, 'Free parking')).toBeUndefined();
  });

  test('a reload keeps the added lines', async ({ page }) => {
    await page.waitForTimeout(SAVE_MS);
    await page.reload();
    await openPanel(page, Panel.Form);

    await expect(page.getByTestId('field-line-0')).toHaveValue('Free parking');
    await expect(page.getByTestId('field-line-1')).toHaveValue('Bring friends');
  });
});
