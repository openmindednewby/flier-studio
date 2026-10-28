import { expect, test, type Request } from '@playwright/test';

const MIN_HIT = 44;
const CUT_TIMEOUT_MS = 90_000;

interface Seen {
  url: string;
  method: string;
  bodyBytes: number;
}

test('Remove background cuts the flier picture on the device, opens on Use cut-out, fits the viewport and sends no image bytes', async ({ page, baseURL }) => {
  test.setTimeout(CUT_TIMEOUT_MS * 2);
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  const seen: Seen[] = [];
  page.on('request', (r: Request) => seen.push({ url: r.url(), method: r.method(), bodyBytes: r.postDataBuffer()?.length ?? 0 }));

  await page.getByTestId('remove-background').click();
  const dialog = page.getByTestId('cutout-dialog');
  await expect(page.getByTestId('cutout-cancel')).toBeFocused();
  await expect(page.getByTestId('cutout-progress')).toBeVisible();
  for (const id of ['cutout-keep', 'cutout-erase', 'cutout-move', 'cutout-zoom-in', 'cutout-brush', 'cutout-use']) await expect(page.getByTestId(id)).toBeDisabled();
  await expect(page.getByTestId('cutout-use')).toBeEnabled({ timeout: CUT_TIMEOUT_MS });
  await expect(page.getByTestId('cutout-progress')).toBeHidden();
  await expect(page.locator('#cutout-title')).toBeInViewport({ ratio: 1 });

  await expect(page.getByTestId('cutout-use')).toBeFocused();
  const small = await dialog.evaluate((d, min) => [...d.querySelectorAll('button, input')]
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width < min || r.height < min; }).map((e) => e.outerHTML.slice(0, 80)), MIN_HIT);
  const clipped = await dialog.evaluate((d) => [d, ...d.querySelectorAll('button, label, h2, p')]
    .filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
  expect(small).toEqual([]);
  expect(clipped).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  const box = await page.getByTestId('cutout-canvas').boundingBox();
  const [x, y] = [(box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2];
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 20, y + 20);
  await page.mouse.up();
  const shownWidth = await page.getByTestId('cutout-canvas').evaluate((c) => c.clientWidth);
  await page.getByTestId('cutout-zoom-in').click();
  await page.getByTestId('cutout-zoom-in').click();
  await expect(page.getByTestId('cutout-zoom')).toHaveText('3x');
  expect(await page.getByTestId('cutout-canvas').evaluate((c) => c.clientWidth)).toBeCloseTo(shownWidth * 3, -1);
  await expect(page.locator('#cutout-title')).toBeInViewport({ ratio: 1 });
  await page.getByTestId('cutout-use').click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');

  const leaks = seen.filter((r) => r.method !== 'GET' || r.bodyBytes > 0 || !r.url.startsWith(baseURL ?? '-'));
  expect(seen.some((r) => r.url.includes('/bg-removal/'))).toBe(true);
  expect(leaks).toEqual([]);
});
