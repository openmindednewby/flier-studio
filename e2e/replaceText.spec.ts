import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const HIT = 44;
const CENTRE_SHIFT = 0.5;
const END_SHIFT = 1;
const EDGE_SLACK_PX = 2;
const LINE_SPAN = 1.2;

interface Run { text: string; x: number; y: number; size: number; width: number; align: string }

const contents = (page: Page): Promise<string[]> =>
  page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { content: object }[]).map((f) => JSON.stringify(f.content)));

const count = (text: string, word: string): number => text.split(word).length - 1;

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  await openPanel(page, Panel.All);
}

async function search(page: Page, find: string, replacement: string): Promise<void> {
  await page.getByTestId('replace-with').fill(replacement);
  await page.getByTestId('replace-find').fill(find);
}

test.describe('AC-32 / AC-33 Replace text previews every match before any change', () => {
  test('a case-insensitive search lists each match, counts it and marks it on the fliers, changing nothing', async ({ page }) => {
    await open(page);
    const before = await contents(page);

    await search(page, 'intermediates', 'Improvers');

    const rows = page.getByTestId('replace-matches').getByRole('checkbox');
    await expect(rows.first()).toBeVisible();
    const n = await rows.count();
    expect(n).toBeGreaterThan(1);
    await expect(page.getByTestId('replace-count')).toHaveText(new RegExp(`^${String(n)} matches in \\d fliers?, ${String(n)} ticked$`));
    await expect(page.getByTestId('replace-match-1')).toContainText('Intermediates');
    await expect(page.getByTestId('replace-match-1')).toContainText('Improvers');
    await expect(page.locator('[data-testid^="preview-"] .replace-mark')).toHaveCount(n);
    expect(await contents(page)).toEqual(before);
    expect((await page.getByTestId('replace-apply').boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(HIT);
  });

  test('unticking a match lowers the count and dashes its mark', async ({ page }) => {
    await open(page);
    await search(page, 'Intermediates', 'Improvers');
    await expect(page.getByTestId('replace-tick-1')).toBeVisible();
    const n = await page.getByTestId('replace-matches').getByRole('checkbox').count();

    await page.getByTestId('replace-tick-1').uncheck();

    await expect(page.getByTestId('replace-count')).toContainText(`${String(n - 1)} ticked`);
    await expect(page.getByTestId('replace-apply')).toHaveText(`Replace ${String(n - 1)} ticked`);
    await expect(page.locator('.replace-mark.off')).toHaveCount(1);
  });

  test('Whole word only drops matches inside longer words', async ({ page }) => {
    await open(page);
    await search(page, 'Intermediate', 'Improver');
    await expect(page.getByTestId('replace-tick-1')).toBeVisible();

    await page.getByTestId('replace-word').check();

    await expect(page.getByTestId('replace-matches').getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByTestId('replace-count')).toHaveText('0 matches in 0 fliers, 0 ticked');
  });
});

test('AC-33 each mark outlines its matched line on the flier, not the corner, and the 360 bar counts the marks drawn', async ({ page }, info) => {
  await page.addInitScript(() => {
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function record(this: CanvasRenderingContext2D, text: string, x: number, y: number): void {
      const canvas = this.canvas as HTMLCanvasElement & { runs?: Run[] };
      const size = Number(/(\d+(?:\.\d+)?)px/.exec(this.font)?.[1] ?? '0');
      canvas.runs = [...(canvas.runs ?? []), { text, x, y, size, width: this.measureText(text).width, align: this.textAlign }];
      fill.call(this, text, x, y);
    };
  });
  await open(page);

  await search(page, 'Intermediates', 'Improvers');

  await expect(page.locator('[data-testid="preview-1"] .replace-mark').first()).toBeVisible();
  const where = await page.getByTestId('preview-1').locator('canvas').evaluate((node, k) => {
    const canvas = node as HTMLCanvasElement & { runs?: Run[] };
    const run = (canvas.runs ?? []).find((r) => r.text.toLowerCase().includes('intermediates'));
    const mark = canvas.parentElement?.querySelector('.replace-mark');
    if (run === undefined || mark === null || mark === undefined) return 'no run or mark';
    const c = canvas.getBoundingClientRect();
    const m = mark.getBoundingClientRect();
    const s = c.width / canvas.width;
    const cx = (m.left + m.width / 2 - c.left) / s;
    const cy = (m.top + m.height / 2 - c.top) / s;
    const left = run.x - run.width * (run.align === 'center' ? k.centre : ['right', 'end'].includes(run.align) ? k.end : 0);
    const inside = cx >= left - k.slack && cx <= left + run.width + k.slack && Math.abs(cy - run.y) <= run.size * k.span;
    return inside ? 'inside' : `mark at ${String(cx)},${String(cy)}, line ${JSON.stringify(run)}`;
  }, { centre: CENTRE_SHIFT, end: END_SHIFT, slack: EDGE_SLACK_PX, span: LINE_SPAN });
  expect(where).toBe('inside');
  if (info.project.name !== 'mobile') return;
  const drawn = await page.locator('[data-testid^="preview-"] .replace-mark').count();
  await expect(page.getByTestId('mini-highlighted')).toHaveText(`${String(drawn)} highlighted`);
});

test('AC-33 See in the 360 bar lands the marked flier below the sticky rail', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'the bar and the sticky rail exist only below 1024');
  await open(page);
  await search(page, 'Intermediates', 'Improvers');
  await expect(page.locator('[data-testid="preview-1"] .replace-mark').first()).toBeAttached();

  await page.getByTestId('mini-see-marks').click();

  await expect.poll(async () => {
    const rail = await page.getByTestId('section-nav').boundingBox();
    const flier = await page.getByTestId('preview-1').boundingBox();
    if (rail === null || flier === null) return `rail ${JSON.stringify(rail)}, flier ${JSON.stringify(flier)}`;
    return flier.y >= rail.y + rail.height ? 'below' : `flier top ${String(flier.y)} under rail bottom ${String(rail.y + rail.height)}`;
  }).toBe('below');
});

test('every Replace mark badge stays inside the viewport', async ({ page }) => {
  await open(page);

  await search(page, 'Intermediates', 'Improvers');

  await expect(page.locator('[data-testid="preview-1"] .replace-mark').first()).toBeVisible();
  const width = page.viewportSize()?.width ?? 0;
  const out = await page.locator('.replace-mark > b').evaluateAll((badges, vw) => badges.flatMap((b) => {
    const r = b.getBoundingClientRect();
    const inside = r.left >= 0 && r.right <= vw;
    return inside ? [] : [`${b.textContent ?? ''} at ${String(r.left)}..${String(r.right)}`];
  }), width);
  expect(out).toEqual([]);
});

test.describe('AC-34 Replace applies only the ticked matches after saving a draft', () => {
  test('Replace changes the ticked matches in one step, keeps the unticked one and saves a draft first', async ({ page }) => {
    await open(page);
    await search(page, 'Intermediates', 'Improvers');
    await expect(page.getByTestId('replace-tick-1')).toBeVisible();
    const n = await page.getByTestId('replace-matches').getByRole('checkbox').count();
    await page.getByTestId('replace-tick-1').uncheck();

    await page.getByTestId('replace-apply').click();

    await expect.poll(async () => count((await contents(page)).join(','), 'Improvers')).toBe(n - 1);
    expect(count((await contents(page)).join(','), 'Intermediates')).toBe(1);
    await openPanel(page, Panel.Drafts);
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(2);
    await page.getByTestId('draft-restore-2').click();
    await expect.poll(async () => count((await contents(page)).join(','), 'Improvers')).toBe(0);
  });

  test('when the draft cannot be saved first, Replace changes nothing and the page keeps saying why', async ({ page }) => {
    await page.addInitScript(() => {
      IDBObjectStore.prototype.add = function full(): IDBRequest {
        throw new DOMException('full', 'QuotaExceededError');
      };
    });
    await open(page);
    const before = await contents(page);
    await search(page, 'Intermediates', 'Improvers');
    await expect(page.getByTestId('replace-tick-1')).toBeVisible();

    await page.getByTestId('replace-apply').click();

    await expect(page.getByTestId('status')).toContainText('Storage on this device is full');
    expect(await contents(page)).toEqual(before);
    await expect(page.getByTestId('status')).not.toContainText('Replaced');
  });
});
