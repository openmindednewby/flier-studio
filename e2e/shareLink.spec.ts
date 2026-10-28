import { expect, test, type Browser, type Page } from '@playwright/test';
import { kizombaPreset } from '../src/presets/kizomba';
import { packPayload } from '../src/share/shareCodec';

const BASE = 'http://localhost:4178';
const LINK_LIMIT = 8000;
const HIT = 44;
const TINY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

type Storage = Record<string, string | null>;

const storage = (page: Page): Promise<Storage> =>
  page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));

async function ready(page: Page, path = '/'): Promise<void> {
  await page.goto(path);
  await page.locator('canvas').first().waitFor();
}

async function recipient(browser: Browser, page: Page): Promise<Page> {
  const context = await browser.newContext({ baseURL: BASE, viewport: page.viewportSize() ?? undefined });
  const other = await context.newPage();
  await ready(other);
  await other.getByTestId('field-title').fill('MINE');
  await other.getByTestId('config-name').fill('My set');
  await other.getByTestId('config-save').click();
  return other;
}

async function shareLink(page: Page): Promise<string> {
  await page.getByTestId('config-share').click();
  await expect(page.getByTestId('share-url')).toHaveValue(/#share=/);
  return page.getByTestId('share-url').inputValue();
}

test.describe('share link (AC-12)', () => {
  test('the sender shares 4 fliers and the recipient imports them as 4 new configs, keeping everything it had', async ({ page, browser }) => {
    await ready(page);
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    const other = await recipient(browser, page);

    const url = await shareLink(page);

    test.info().annotations.push({ type: 'link-length', description: String(url.length) });
    expect(url.length).toBeLessThan(LINK_LIMIT);
    expect(requests.filter((u) => u.includes('share='))).toEqual([]);
    const before = await storage(other);
    await other.goto(url);
    await expect(other.getByTestId('import-title')).toHaveText('Import 4 templates?');
    await expect(other.getByTestId('import-confirm')).toBeFocused();
    for (const id of ['import-confirm', 'import-dismiss']) expect((await other.getByTestId(id).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(HIT);
    await other.getByTestId('import-confirm').click();
    await expect(other.getByTestId('import-dialog')).toHaveCount(0);
    const after = await storage(other);
    for (const [key, value] of Object.entries(before)) if (key !== 'flier-studio:configs') expect(after[key], key).toBe(value);
    await expect(other.getByTestId('config-pick').locator('option')).toHaveText(['My set', 'KIZOMBA - Saturday 31 October', 'KIZOMBA - Saturday 7 November', 'KIZOMBA - Sunday 29 November', 'UPCOMING - Kizomba']);
    await expect(other.getByTestId('field-title')).toHaveValue('MINE');
    expect(new URL(other.url()).hash).toBe('');
  });

  test('Dismiss leaves the recipient storage byte-identical', async ({ page, browser }) => {
    await ready(page);
    const other = await recipient(browser, page);
    const url = await shareLink(page);
    const before = await storage(other);
    await other.goto(url);

    await other.getByTestId('import-dismiss').click();

    await expect(other.getByTestId('import-dialog')).toHaveCount(0);
    expect(await storage(other)).toEqual(before);
  });

  test('an uploaded picture is left out of the link and the recipient is told', async ({ page, browser }) => {
    await ready(page);
    await page.getByTestId('upload-picture').setInputFiles({ name: 'mine.png', mimeType: 'image/png', buffer: Buffer.from(TINY_PNG, 'base64') });
    const other = await recipient(browser, page);

    const url = await shareLink(page);

    await expect(page.getByTestId('status')).toContainText('left out');
    await other.goto(url);
    await expect(other.getByTestId('import-dropped')).toHaveText('Uploaded images left out of this link: 1');
  });
});

test.describe('safe import (AC-13)', () => {
  const bad: [string, () => Promise<string>][] = [
    ['tampered', async () => {
      await Promise.resolve();
      return 'AAAA-not-a-real-deflate-stream-zzzz';
    }],
    ['oversized', () => Promise.resolve('A'.repeat(17000))],
    ['old version', () => packPayload({ v: 0, dropped: 0, docs: kizombaPreset() })],
  ];
  for (const [name, make] of bad) {
    test(`a ${name} link imports nothing and says why`, async ({ page }) => {
      await ready(page);
      await page.getByTestId('config-name').fill('Mine');
      await page.getByTestId('config-save').click();
      const before = await storage(page);
      const fragment = await make();

      await page.goto(`/#share=${fragment}`);

      await expect(page.getByTestId('import-error')).not.toBeEmpty();
      await expect(page.getByTestId('import-confirm')).toHaveCount(0);
      await expect(page.getByTestId('import-dismiss')).toBeFocused();
      await page.getByTestId('import-dismiss').click();
      expect(await storage(page)).toEqual(before);
    });
  }
});
