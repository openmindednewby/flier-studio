import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const SHOTS = 'docs/design/FLIER-2-bullets-spacing';
const FOOTER = 'with Jimmy & Ismini\nwww.bailemos.cy';

function spy(): void {
  const seen: Record<string, { x: number; y: number; px: number; w: number } | undefined> = {};
  const state = { arcs: 0 };
  const fill = CanvasRenderingContext2D.prototype.fillText;
  const arc = CanvasRenderingContext2D.prototype.arc;
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, ...args: Parameters<CanvasRenderingContext2D['fillText']>): void {
    const [text, x, y] = args;
    const w = this.canvas.width;
    const old = seen[String(text)];
    if (old === undefined || w >= old.w) seen[String(text)] = { x, y, w, px: Number((/(\d+(?:\.\d+)?)px/.exec(this.font) ?? [])[1] ?? 0) };
    fill.apply(this, args);
  };
  CanvasRenderingContext2D.prototype.arc = function countedArc(this: CanvasRenderingContext2D, ...args: Parameters<CanvasRenderingContext2D['arc']>): void {
    state.arcs += 1;
    arc.apply(this, args);
  };
  Object.assign(window, { drawn: (t: string) => seen[t], arcs: () => state.arcs, resetArcs: () => { state.arcs = 0; } });
}

interface Drawn { x: number; y: number; px: number }

const drawn = async (page: Page, t: string): Promise<Drawn> => (await page.evaluate((k) => (window as unknown as { drawn: (s: string) => Drawn | undefined }).drawn(k), t)) ?? { x: 0, y: 0, px: 1 };

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

const drawnY = async (page: Page, t: string): Promise<number | undefined> => (await page.evaluate((k) => (window as unknown as { drawn: (s: string) => Drawn | undefined }).drawn(k), t))?.y;

async function noOverflow(page: Page): Promise<void> {
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(wide).toBeLessThanOrEqual(0);
}

test.describe('Bullets on/off, line spacing and a multi-line footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(spy);
    await page.goto('/');
    await openPanel(page, Panel.Form);
    await page.getByTestId('field-includesHeading').fill('Party pass includes');
    await page.getByTestId('field-includesItems').fill('2 drinks\nKizomba room');
    await rendered(page);
  });

  test('bullets off draws fewer dots than bullets on', async ({ page }) => {
    const arcsAfter = async (on: boolean): Promise<number> => {
      await page.evaluate(() => (window as unknown as { resetArcs: () => void }).resetArcs());
      await page.getByTestId('field-bullets').setChecked(on);
      await rendered(page);
      return page.evaluate(() => (window as unknown as { arcs: () => number }).arcs());
    };
    const off = await arcsAfter(false);

    const on = await arcsAfter(true);

    expect(on).toBeGreaterThan(off);
    await expect(page.getByTestId('field-bullets')).toBeChecked();
  });

  test('space above Large moves the second includes item down', async ({ page }) => {
    const gap = async (): Promise<number> => {
      const [first, second] = await Promise.all([drawn(page, '2 drinks'), drawn(page, 'Kizomba room')]);
      return (second.y - first.y) / second.px;
    };
    const before = await gap();
    await page.getByTestId('style-includesItems').click();
    await page.getByTestId('style-space-above').selectOption('large');
    await rendered(page);

    const after = await gap();

    expect(after).toBeGreaterThan(before + 0.5);
    await noOverflow(page);
  });

  test('a two-line footer draws both lines and nothing overflows', async ({ page }, info) => {
    await page.getByTestId('field-footer').fill(FOOTER);
    await rendered(page);

    const ys = await Promise.all(FOOTER.split('\n').map((t) => drawnY(page, t)));

    expect(ys.every((y) => y !== undefined)).toBe(true);
    expect(ys[1] ?? 0).toBeGreaterThan(ys[0] ?? 0);
    await noOverflow(page);
    await page.getByTestId('field-bullets').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOTS}/after-form-${info.project.name}.png` });
    await page.getByTestId('style-footer').click();
    await page.getByTestId('style-space-above').evaluate((node) => node.scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: `${SHOTS}/after-style-${info.project.name}.png` });
    await noOverflow(page);
  });
});
