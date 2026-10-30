import { expect, test, type Locator, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const TITLE = 'KIZOMBA';
const SIZE_CLICKS = 14;
const WIDTH_CLICKS = 10;
const GROWN = 1.1;

interface Size { w: number; h: number }
interface Drawn extends Size { flier: number }

function spyOnTitle(title: string): void {
  const drawn = new WeakMap<HTMLCanvasElement, Size>();
  const orig = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, ...args: [string, number, number, number?]): void {
    if (args[0] === title) {
      const m = this.getTransform();
      const px = Number(/(\d+(?:\.\d+)?)px/.exec(this.font)?.[1] ?? 0);
      const fit = args[3] ?? Infinity;
      drawn.set(this.canvas, { w: Math.min(this.measureText(args[0]).width, fit) * Math.abs(m.a), h: px * Math.abs(m.d) });
    }
    if (args[3] === undefined) orig.call(this, args[0], args[1], args[2]);
    else orig.call(this, args[0], args[1], args[2], args[3]);
  };
  Object.assign(window, { titleDrawn: (): Drawn[] => [...document.querySelectorAll<HTMLElement>('figure[data-testid^="preview-"]')].flatMap((f) => {
    const size = drawn.get(f.querySelector('canvas') ?? document.createElement('canvas'));
    return size === undefined ? [] : [{ flier: Number(f.getAttribute('data-testid')?.split('-')[1] ?? 0), ...size }];
  }) });
}

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

async function lastDrawn(page: Page): Promise<Map<number, Drawn>> {
  const all = await page.evaluate(() => (window as unknown as { titleDrawn: () => Drawn[] }).titleDrawn());
  return new Map(all.map((d) => [d.flier, d]));
}

async function press(page: Page, button: Locator, times: number): Promise<void> {
  for (let i = 0; i < times; i++) {
    await button.click();
    await rendered(page);
  }
}

async function scaleUp(page: Page, editor: Locator): Promise<void> {
  await press(page, editor.getByTestId('style-larger'), SIZE_CLICKS);
  await press(page, editor.getByTestId('style-wider'), WIDTH_CLICKS);
  await expect(editor.getByTestId('style-size')).toHaveText('170%');
  await expect(editor.getByTestId('style-width')).toHaveText('150%');
}

function expectGrown(before: Map<number, Drawn>, after: Map<number, Drawn>, fliers: readonly number[]): void {
  for (const n of fliers) {
    const b = before.get(n);
    const a = after.get(n);
    expect(b, `flier ${String(n)} drew the title before`).toBeDefined();
    expect(a, `flier ${String(n)} drew the title after`).toBeDefined();
    expect(a?.h ?? 0, `flier ${String(n)} height`).toBeGreaterThan((b?.h ?? 0) * GROWN);
    expect(a?.w ?? 0, `flier ${String(n)} width`).toBeGreaterThan((b?.w ?? 0) * GROWN);
  }
}

test.describe('Size and Width scale the drawn line (owner bug, FLIER-2 "Flier Studio follow-ups")', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(spyOnTitle, TITLE);
    await page.goto('/');
    await rendered(page);
    await openPanel(page, Panel.All);
  });

  test('a role at Size 170% and Width 150% draws its line taller and wider on every flier', async ({ page }) => {
    const before = await lastDrawn(page);
    expect(before.size).toBeGreaterThan(1);
    await page.getByTestId('role-title').click();

    await scaleUp(page, page.getByTestId('role-editor'));

    expectGrown(before, await lastDrawn(page), [...before.keys()]);
  });

  test('a per-field Style at Size 170% and Width 150% draws that flier\'s line taller and wider', async ({ page }) => {
    await openPanel(page, Panel.Form);
    const before = await lastDrawn(page);
    await page.getByTestId('style-title').click();

    await scaleUp(page, page.getByTestId('style-panel'));

    expectGrown(before, await lastDrawn(page), [1]);
  });
});
