import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const PHOTO = process.env.RECUT_PHOTO ?? '';
const STROKES = process.env.RECUT_STROKES ?? '';
const DUMP = process.env.RECUT_DUMP ?? '';
const SHOTS = process.env.RECUT_SHOTS ?? '';
const TALL = process.env.RECUT_TALL === '1';
const CUT_TIMEOUT_MS = 180_000;
const MIN_BRUSH = 4;
const PHOTO_WIDTH = Number(process.env.RECUT_PHOTO_WIDTH ?? '0');
const UPLOAD_SETTLE_MS = 3000;
const MAX_BRUSH = 64;

interface Stroke {
  mode: 'keep' | 'erase';
  radius: number;
  points: [number, number][];
}

test.use(TALL ? { viewport: { width: 760, height: 3000 } } : {});

async function shoot(page: Page, state: string, project: string): Promise<void> {
  if (SHOTS === '') return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: join(SHOTS, `dialog-${state}-${project}.png`) });
}

async function brush(page: Page, strokes: Stroke[]): Promise<void> {
  const canvas = page.getByTestId('cutout-canvas');
  const geo = await canvas.evaluate((c: HTMLCanvasElement) => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, mw: c.width, mh: c.height }; });
  const toClient = ([mx, my]: [number, number]): [number, number] => [geo.x + (mx / geo.mw) * geo.w, geo.y + (my / geo.mh) * geo.h];
  const scale = geo.mw / geo.w;
  let set = '';
  for (const s of strokes) {
    const css = Math.min(MAX_BRUSH, Math.max(MIN_BRUSH, Math.round(s.radius / scale)));
    if (set !== `${s.mode}${css}`) {
      await page.getByTestId(s.mode === 'keep' ? 'cutout-keep' : 'cutout-erase').click();
      await page.getByTestId('cutout-brush').evaluate((el: HTMLInputElement, v) => { el.value = String(v); }, css);
      set = `${s.mode}${css}`;
    }
    const [first, ...rest] = s.points.map(toClient);
    await page.mouse.move(first[0], first[1]);
    await page.mouse.down();
    for (const p of rest) await page.mouse.move(p[0], p[1], { steps: 8 });
    await page.mouse.up();
  }
}

test('cuts the uploaded photo through the dialog, erase-brushes the listed strokes and keeps the result', async ({ page }, info) => {
  test.skip(PHOTO === '' || PHOTO_WIDTH === 0, 'set RECUT_PHOTO to the photo to cut');
  test.setTimeout(Number(process.env.RECUT_TIMEOUT_MS ?? String(CUT_TIMEOUT_MS * 2)));
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await page.getByTestId('upload-picture').setInputFiles(PHOTO);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  await page.waitForTimeout(UPLOAD_SETTLE_MS);

  await page.getByTestId('remove-background').click();
  await expect(page.getByTestId('cutout-cancel')).toBeFocused();
  await shoot(page, 'cutting', info.project.name);
  await expect(page.getByTestId('cutout-use')).toBeEnabled({ timeout: CUT_TIMEOUT_MS });
  await expect(page.getByTestId('cutout-use')).toBeFocused();
  expect(await page.getByTestId('cutout-canvas').evaluate((c: HTMLCanvasElement) => c.width)).toBe(PHOTO_WIDTH);
  await shoot(page, 'cut', info.project.name);
  const strokes: Stroke[] = STROKES === '' ? [] : JSON.parse(readFileSync(STROKES, 'utf8')) as Stroke[];
  await brush(page, strokes);
  if (strokes.length > 0) await shoot(page, 'brushed', info.project.name);
  if (DUMP !== '') writeFileSync(DUMP, Buffer.from((await page.getByTestId('cutout-canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL('image/png'))).split(',')[1] ?? '', 'base64'));
  await page.getByTestId('cutout-use').click();

  await expect(page.getByTestId('cutout-dialog')).toHaveCount(0);
});
