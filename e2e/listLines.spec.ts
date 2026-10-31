import { expect, test, type Page } from '@playwright/test';

const LIST_FLIER = 4;
const INTO_TEXT = 0.85;

interface Drawn { text: string; x: number; y: number }

declare global {
  interface Window { drawnRuns?: Map<HTMLCanvasElement, { text: string; x: number; y: number; w: number; size: number; align: string; baseline: string }[]> }
}

function recordFillText(): void {
  const runs = new Map<HTMLCanvasElement, { text: string; x: number; y: number; w: number; size: number; align: string; baseline: string }[]>();
  window.drawnRuns = runs;
  const fill = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function patched(this: CanvasRenderingContext2D, ...args: Parameters<CanvasRenderingContext2D['fillText']>) {
    const [text, x, y] = args;
    const list = runs.get(this.canvas) ?? [];
    const size = Number(/(\d+(?:\.\d+)?)px/.exec(this.font)?.[1] ?? '0');
    const t = this.getTransform();
    list.push({ text, x: t.a * x + t.e, y: t.d * y + t.f, w: this.measureText(text).width * t.a, size: size * t.d, align: this.textAlign, baseline: this.textBaseline });
    runs.set(this.canvas, list);
    fill.apply(this, args);
  };
}

async function listLines(page: Page): Promise<Drawn[]> {
  return page.getByTestId(`preview-${String(LIST_FLIER)}`).locator('.trim canvas').evaluate((canvas: HTMLCanvasElement, into: number) => {
    const all = window.drawnRuns?.get(canvas) ?? [];
    const latest = new Map(all.map((r) => [r.text, r]));
    const r = canvas.getBoundingClientRect();
    const k = r.width / canvas.width;
    const shift = (align: string): number => (align === 'center' ? 0.5 : align === 'right' || align === 'end' ? 1 : 0);
    const drop = (baseline: string): number => (baseline === 'top' ? 0 : baseline === 'middle' ? 0.5 : baseline === 'bottom' ? 1 : 0.8);
    return [...latest.values()].filter((run) => /\d/.test(run.text)).map((run) => {
      const left = run.x - run.w * shift(run.align);
      const top = run.y - run.size * drop(run.baseline);
      return { text: run.text, x: r.left + (left + run.w * into) * k, y: r.top + (top + run.size / 2) * k };
    });
  }, INTO_TEXT);
}

test.describe('List flier: every drawn line can be pointed at (FLIER-2 "Flier Studio follow-ups")', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(recordFillText);
    await page.goto('/');
    await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  });

  test('every date, party pass and time on the upcoming-workshops list names its form field under the pointer', async ({ page }) => {
    await page.getByTestId(`preview-${String(LIST_FLIER)}`).scrollIntoViewIfNeeded();
    const lines = await listLines(page);
    const missed: string[] = [];

    for (const line of lines) {
      await page.mouse.move(line.x, line.y);
      const section = (await page.getByTestId(`preview-${String(LIST_FLIER)}`).locator('.trim').getAttribute('data-section')) ?? '';
      if (section === '') missed.push(line.text);
    }

    expect(lines.map((l) => l.text)).toContain('Party pass 10€');
    expect(missed).toEqual([]);
  });
});
