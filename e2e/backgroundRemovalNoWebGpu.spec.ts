import { expect, test } from '@playwright/test';

const CUT_TIMEOUT_MS = 90_000;
const HIDE_WORKER_GPU = 'delete WorkerNavigator.prototype.gpu;';

test('Remove picture background still cuts on the WASM runtime and only fetches the versioned jsep runtime', async ({ page, context }) => {
  test.setTimeout(CUT_TIMEOUT_MS * 2);
  const runtime: { url: string; status: number }[] = [];
  page.on('response', (r) => { if (r.url().includes('.wasm') || r.url().includes('/bg-removal/')) runtime.push({ url: r.url(), status: r.status() }); });
  let workersWithoutGpu = 0;
  await context.route(/\/assets\/worker-[^/]*\.js$/, async (route) => {
    const response = await route.fetch();
    workersWithoutGpu += 1;
    await route.fulfill({ response, body: `${HIDE_WORKER_GPU}\n${await response.text()}` });
  });
  await page.goto('/');
  await page.locator('canvas').first().waitFor();

  await page.getByTestId('remove-background').click();

  await expect(page.getByTestId('cutout-use')).toBeEnabled({ timeout: CUT_TIMEOUT_MS });
  expect(workersWithoutGpu).toBeGreaterThan(0);
  expect(runtime.filter((r) => r.status !== 200)).toEqual([]);
  expect(runtime.filter((r) => r.url.includes('/assets/'))).toEqual([]);
  expect(runtime.some((r) => r.url.endsWith('/ort-wasm-simd-threaded.jsep.wasm'))).toBe(true);
});
