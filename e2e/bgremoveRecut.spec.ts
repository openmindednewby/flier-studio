import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const PHOTO = process.env.RECUT_PHOTO ?? '';
const STROKES = process.env.RECUT_STROKES ?? '';
const DUMP = process.env.RECUT_DUMP ?? '';
const SHOTS = process.env.RECUT_SHOTS ?? '';
const TALL = process.env.RECUT_TALL === '1';
const CUT_TIMEOUT_MS = 180_000;
const MIN_BRUSH = 1;
const PHOTO_WIDTH = Number(process.env.RECUT_PHOTO_WIDTH ?? '0');
const MAX_BRUSH = 64;
const ZOOM_STEPS = Number(process.env.RECUT_ZOOM ?? '1') - 1;

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

async function canvasGeo(page: Page): Promise<{ x: number; y: number; w: number; h: number; mw: number; mh: number; view: DOMRect }> {
  return page.getByTestId('cutout-canvas').evaluate((c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, mw: c.width, mh: c.height, view: (c.parentElement ?? c).getBoundingClientRect().toJSON() as DOMRect };
  });
}

async function brush(page: Page, strokes: Stroke[]): Promise<void> {
  for (let i = 0; i < ZOOM_STEPS; i++) await page.getByTestId('cutout-zoom-in').click();
  let geo = await canvasGeo(page);
  const toClient = ([mx, my]: [number, number]): [number, number] => [geo.x + (mx / geo.mw) * geo.w, geo.y + (my / geo.mh) * geo.h];
  const inView = ([cx, cy]: [number, number]): boolean => cx > geo.view.x + MAX_BRUSH && cx < geo.view.x + geo.view.width - MAX_BRUSH && cy > geo.view.y + MAX_BRUSH && cy < geo.view.y + geo.view.height - MAX_BRUSH;
  let set = '';
  for (const s of strokes) {
    if (!inView(toClient(s.points[0]))) {
      await page.getByTestId('cutout-stage').evaluate((st, [fx, fy]) => { st.scrollLeft = fx * st.scrollWidth - st.clientWidth / 2; st.scrollTop = fy * st.scrollHeight - st.clientHeight / 2; }, [s.points[0][0] / geo.mw, s.points[0][1] / geo.mh]);
      geo = await canvasGeo(page);
    }
    const css = Math.min(MAX_BRUSH, Math.max(MIN_BRUSH, Math.round(s.radius / (geo.mw / geo.w))));
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
