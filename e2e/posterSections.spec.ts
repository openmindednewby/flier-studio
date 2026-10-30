import { expect, test, type Locator, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const WITHIN_MS = 100;
const STEPS = 40;
const EDGE = 0.02;
const SLACK = 6;

interface Spot { x: number; y: number; section: string }

const trim = (page: Page, n: number): Locator => page.getByTestId(`preview-${String(n)}`).locator('.trim');

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

async function scan(page: Page, n: number, want: (section: string) => boolean): Promise<Spot> {
  await trim(page, n).scrollIntoViewIfNeeded();
  const seen = new Set<string>();
  const box = (await trim(page, n).locator('canvas').boundingBox()) ?? { x: 0, y: 0, width: 0, height: 0 };
  for (let row = 0; row < STEPS; row++) {
    for (const across of [0.5, EDGE, 1 - EDGE, 0.3, 0.7]) {
      const x = box.x + box.width * across;
      const y = box.y + box.height * (EDGE + ((1 - 2 * EDGE) * row) / STEPS);
      await page.mouse.move(x, y);
      const section = (await trim(page, n).getAttribute('data-section')) ?? '';
      seen.add(section);
      if (want(section)) return { x, y, section };
    }
  }
  throw new Error(`no matching spot on the flier; seen: ${[...seen].join(',')}`);
}

test.describe('Poster sections: hover highlights (AC-47), click edits (AC-48)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await rendered(page);
  });

  test('AC-47: pointing at a text line outlines it on that flier, leaving clears it', async ({ page }) => {
    await scan(page, 1, (s) => s === 'title');

    await expect(page.getByTestId('preview-1').locator('.text-outline').first()).toBeAttached({ timeout: WITHIN_MS });
    await page.getByTestId('download-all').hover();
    await expect(page.getByTestId('preview-1').locator('.text-outline')).toHaveCount(0);
  });

  test('AC-47: the section outline is never part of the exported picture', async ({ page }) => {
    const plain = await trim(page, 1).locator('canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL());
    await scan(page, 1, (s) => s === 'title');

    const outlined = await trim(page, 1).locator('canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL());

    expect(outlined).toBe(plain);
  });

  test('AC-48: clicking a text section selects the flier and opens that field\'s Style editor with focus in it', async ({ page }) => {
    const spot = await scan(page, 2, (s) => s === 'title');

    await page.mouse.click(spot.x, spot.y);

    await expect(trim(page, 2)).toHaveAttribute('aria-pressed', 'true');
    const panel = page.getByTestId('style-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('aria-label', /Title/);
    await expect(panel.getByTestId('style-font')).toBeFocused();
  });

  test('AC-48: clicking where there is no text only selects the flier', async ({ page }) => {
    const spot = await scan(page, 2, (s) => s === '');
    await page.clock.install();

    await page.mouse.click(spot.x, spot.y);

    await expect(trim(page, 2)).toHaveAttribute('aria-pressed', 'true');
    await page.clock.runFor(WITHIN_MS * 5);
    await expect(page.getByTestId('style-panel')).toHaveCount(0);
  });

  test('AC-48: double-clicking a text section still enlarges the flier', async ({ page }) => {
    const spot = await scan(page, 2, (s) => s === 'title');

    await page.mouse.dblclick(spot.x, spot.y);

    await expect(page.getByTestId('mini-sheet')).toBeVisible();
    await expect(page.getByTestId('mini-sheet')).toHaveAttribute('aria-label', 'Flier 2 full size');
  });
  test.fixme('AC-45: with the Venue editor open, the outline sits on the venue line of the flier', async ({ page }) => {
    await openPanel(page, Panel.All);
    await page.getByTestId('role-venue').click();

    const boxes = await page.getByTestId('preview-1').locator('.text-outline').evaluateAll((all) => all.map((b) => {
      const r = b.getBoundingClientRect();
      return { left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY, bottom: r.bottom + scrollY };
    }));

    const spot = await scan(page, 1, (s) => s === 'venue');
    const at = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
    const venue = { x: spot.x + at.x, y: spot.y + at.y };
    const holds = boxes.some((b) => venue.x >= b.left - SLACK && venue.x <= b.right + SLACK && venue.y >= b.top - SLACK && venue.y <= b.bottom + SLACK);
    expect(holds, `venue line at ${String(Math.round(venue.y))}, outlines at ${boxes.map((b) => Math.round(b.top)).join(',')}`).toBe(true);
  });
});
