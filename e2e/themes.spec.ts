import { expectFieldsAligned } from '@dloizides/e2e-helpers';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const HIT = 44;
const FLIERS = 4;
const SETTLE_MS = 1500;

async function renders(page: Page): Promise<string[]> {
  await page.locator('[data-testid="previews"] canvas').nth(FLIERS - 1).waitFor();
  await page.waitForTimeout(SETTLE_MS);
  return page.locator('[data-testid="previews"] canvas').evaluateAll((list) => list.map((c) => (c as HTMLCanvasElement).toDataURL()));
}

const contentOf = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const sorted = (v: unknown): unknown => (Array.isArray(v) ? v.map(sorted) : v !== null && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, sorted(x)])) : v);
    return JSON.stringify((JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { content: object }[]).map((f) => sorted(f.content)));
  });

const overflowingText = (page: Page): Promise<string[]> =>
  page.locator('body').evaluate((body) =>
    [...body.querySelectorAll<HTMLElement>('span, label, button, select, h1, h2, option')].filter((e) => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent ?? ''));

const EXPORT_NAMES = ['workshop-20261031', 'workshop-20261107', 'workshop-20261129', 'upcoming-workshops'];

const themeIds = (page: Page): Promise<string[]> =>
  page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { themeId: string }[]).map((f) => f.themeId));

test.describe('poster themes (AC-14, AC-15)', () => {
  test('the Theme control and its scope are labelled, 44 px tall, aligned and their text fits', async ({ page }) => {
    await page.goto('/');
    await page.locator('canvas').first().waitFor();
    const theme = page.getByTestId('pick-theme');
    const scope = page.getByTestId('pick-theme-scope');

    await expect(page.getByRole('combobox', { name: 'Theme', exact: true })).toBeVisible();

    await expect(theme.locator('option:checked')).toHaveText('Kizomba classic');
    await expect(scope.locator('option')).toHaveText(['This flier only', 'All fliers']);
    for (const control of [theme, scope]) expect((await control.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(HIT);
    const overflowing = await page.getByTestId('theme-row').evaluate((row) =>
      [...row.querySelectorAll<HTMLElement>('span, select')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
    expect(overflowing).toEqual([]);
    await expectFieldsAligned(page, '[data-testid="theme-row"]');
  });

  test('an autosave from before themes opens as Kizomba classic and draws pixel-identical', async ({ page }) => {
    await page.goto('/');
    const fresh = await renders(page);
    await page.evaluate(() => {
      const fliers = JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { content: object; style: object }[];
      localStorage.setItem('flier-studio:working', JSON.stringify(fliers.map((f) => ({ ...f.content, ...f.style }))));
      localStorage.removeItem('flier-studio:fliers');
    });

    await page.reload();

    expect(await renders(page)).toEqual(fresh);
    expect(await themeIds(page)).toEqual(Array(FLIERS).fill('kizomba-classic'));
  });

  test('switching all 4 fliers to Golden hour and back keeps the text byte-identical and the render exact', async ({ page }) => {
    await page.goto('/');
    const before = await renders(page);
    const text = await contentOf(page);
    await page.getByTestId('pick-theme-scope').selectOption({ label: 'All fliers' });

    await page.getByTestId('pick-theme').selectOption({ label: 'Golden hour' });

    const golden = await renders(page);
    expect(await themeIds(page)).toEqual(Array(FLIERS).fill('golden-hour'));
    expect(await contentOf(page)).toBe(text);
    expect(golden).not.toEqual(before);
    expect(await overflowingText(page)).toEqual([]);
    const out = process.env.FLIER_EXPORT_DIR;
    if (out !== undefined) golden.forEach((url, i) => writeFileSync(join(out, `${EXPORT_NAMES[i] ?? String(i)}-golden-hour.png`), Buffer.from(url.split(',')[1] ?? '', 'base64')));
    await page.getByTestId('pick-theme').selectOption({ label: 'Kizomba classic' });
    expect(await renders(page)).toEqual(before);
    expect(await contentOf(page)).toBe(text);
  });

  test('on a desktop, the form still opens with the title focused', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');

    await page.goto('/');

    await expect(page.getByTestId('field-title')).toBeFocused();
  });
});
