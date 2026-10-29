import { expect, test } from '@playwright/test';

const UMAMI = 'https://analytics.dloizides.com/script.js';
const HF_API = 'https://huggingface.co/api/models/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF';

test.describe('cross-origin isolation (COOP same-origin + COEP credentialless)', () => {
  test('the page is cross-origin isolated and still registers the service worker', async ({ page }) => {
    await page.goto('/');

    const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);

    expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
    expect(new URL(scope).pathname).toBe('/');
  });

  test('the Umami script still loads under COEP credentialless', async ({ page }) => {
    const umami = page.waitForResponse(UMAMI);

    await page.goto('/');

    expect((await umami).status()).toBe(200);
    await expect.poll(() => page.evaluate(() => 'umami' in window)).toBe(true);
  });

  test('the Hugging Face model lookup still answers a cross-origin fetch', async ({ page }) => {
    await page.goto('/');

    const status = await page.evaluate(async (url) => (await fetch(url)).status, HF_API);

    expect(status).toBe(200);
  });

  test('the measure page shows one live line per prompt and keeps the final JSON', async ({ page }) => {
    await page.goto('/?measure=llm');

    await expect(page.getByTestId('measure-progress')).toContainText('Prompt 20/20: ');
    await expect(page.getByTestId('measure')).toContainText('"total": 20');
  });
});
