import { expect, test } from '@playwright/test';

const SW_REGISTER = /sw-register\.js/;

test.describe('PWA', () => {
  test('first visit registers the service worker and serves the manifest', async ({ page, request }) => {
    await page.goto('/');

    const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
    const manifest = await (await request.get('/manifest.json')).json();

    expect(new URL(scope).pathname).toBe('/');
    expect(manifest.name).toBe('Flier Studio');
  });

  test('after the first visit, the app shell loads offline', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.reload();
    await expect(page.getByTestId('flier-form')).toBeVisible();
    await context.setOffline(true);

    await page.reload();

    await expect(page.getByTestId('flier-form')).toBeVisible();
  });

  test('an offline load logs no service worker registration error', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.reload();
    await expect(page.getByTestId('flier-form')).toBeVisible();
    await context.setOffline(true);
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`${message.location().url} ${message.text()}`); });
    page.on('requestfailed', (request) => { errors.push(`${request.url()} ${request.failure()?.errorText ?? ''}`); });

    await page.reload();

    await expect(page.getByTestId('flier-form')).toBeVisible();
    await page.waitForTimeout(500);
    expect(errors.filter((text) => SW_REGISTER.test(text))).toEqual([]);
  });
});
