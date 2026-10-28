import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const HIT = 44;
const TOLERANCE_PX = 1;
const MINE = 'MINE ONLY';
const PRESET_SIZE = 4;
const DPAD_RIGHT = 15;
const EAST = 1;

const titles = (page: Page): Promise<string[]> =>
  page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { content: object }[]).map((f) => JSON.stringify(f.content)));

async function openPreset(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('canvas').first().waitFor();
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
  await page.getByTestId('field-title').fill(MINE);
  await expect.poll(async () => (await titles(page))[0]).toContain(MINE);
  await openPanel(page, Panel.Configs);
  await page.getByTestId('config-preset').click();
  await expect(page.getByTestId('preset-dialog')).toBeVisible();
}

const overflowing = (page: Page): Promise<string[]> =>
  page.getByTestId('preset-dialog').evaluate((dialog, tolerance) => {
    const box = dialog.getBoundingClientRect();
    const found: string[] = [];
    for (const node of Array.from(dialog.querySelectorAll('h2, p, button'))) {
      const r = node.getBoundingClientRect();
      const spills = r.left < box.left - tolerance || r.right > box.right + tolerance || node.scrollWidth > node.clientWidth + tolerance;
      if (spills) found.push(node.textContent ?? '');
    }
    if (box.right > window.innerWidth + tolerance || box.bottom > window.innerHeight + tolerance) found.push('dialog leaves the viewport');
    return found;
  }, TOLERANCE_PX);

test.describe('AC-35 the Kizomba preset asks first when fliers exist', () => {
  test('with fliers on screen, the preset asks Replace / Add / Cancel, focuses Add, every button is 44 px and all text fits', async ({ page }) => {
    await openPreset(page);

    await expect(page.getByTestId('preset-add')).toBeFocused();

    for (const id of ['preset-add', 'preset-replace', 'preset-cancel']) {
      const b = await page.getByTestId(id).boundingBox();
      expect(b?.height ?? 0, id).toBeGreaterThanOrEqual(HIT);
      expect(b?.width ?? 0, id).toBeGreaterThanOrEqual(HIT);
    }
    expect(await overflowing(page)).toEqual([]);
  });

  test('Cancel closes the dialog and changes nothing', async ({ page }) => {
    await openPreset(page);
    const before = await titles(page);

    await page.getByTestId('preset-cancel').click();

    await expect(page.getByTestId('preset-dialog')).toHaveCount(0);
    expect(await titles(page)).toEqual(before);
  });

  test('Add appends the sample fliers after the existing ones', async ({ page }) => {
    await openPreset(page);
    const before = await titles(page);

    await page.getByTestId('preset-add').click();

    await expect.poll(async () => (await titles(page)).length).toBe(before.length + PRESET_SIZE);
    expect((await titles(page)).slice(0, before.length)).toEqual(before);
    await expect(page.getByTestId('status')).toContainText('Added 4 sample fliers');
  });

  test('Replace saves a draft first, then swaps the set, and Drafts brings the old set back', async ({ page }) => {
    await openPreset(page);

    await page.getByTestId('preset-replace').click();

    await expect.poll(async () => (await titles(page)).some((t) => t.includes(MINE))).toBe(false);
    expect(await titles(page)).toHaveLength(PRESET_SIZE);
    await openPanel(page, Panel.Drafts);
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(3);
    await page.getByTestId('draft-restore-2').click();
    await expect.poll(async () => (await titles(page))[0]).toContain(MINE);
  });

  test('when the draft cannot be saved first, Replace changes nothing and the page says why', async ({ page }) => {
    await page.addInitScript(() => {
      IDBObjectStore.prototype.add = function full(): IDBRequest {
        throw new DOMException('full', 'QuotaExceededError');
      };
    });
    await openPreset(page);
    const before = await titles(page);

    await page.getByTestId('preset-replace').click();

    await expect(page.getByTestId('status')).toContainText('Storage on this device is full');
    expect(await titles(page)).toEqual(before);
  });

  test('arrow keys walk Add, Replace and Cancel, and Escape closes without a change', async ({ page }) => {
    await openPreset(page);
    const before = await titles(page);

    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('preset-replace')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('preset-cancel')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('preset-replace')).toBeFocused();
    await page.keyboard.press('Escape');

    await expect(page.getByTestId('preset-dialog')).toHaveCount(0);
    expect(await titles(page)).toEqual(before);
  });

  test('a controller d-pad moves focus and its back button closes without a change', async ({ page }) => {
    await page.addInitScript(() => {
      const pad = { connected: true, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) };
      Object.assign(window, { testPad: pad });
      Object.defineProperty(navigator, 'getGamepads', { value: () => [pad], configurable: true });
    });
    await openPreset(page);
    const before = await titles(page);
    const tap = async (index: number): Promise<void> => {
      await page.evaluate((i) => { (window as unknown as { testPad: { buttons: { pressed: boolean }[] } }).testPad.buttons[i].pressed = true; }, index);
      await page.waitForTimeout(100);
      await page.evaluate((i) => { (window as unknown as { testPad: { buttons: { pressed: boolean }[] } }).testPad.buttons[i].pressed = false; }, index);
      await page.waitForTimeout(100);
    };

    await tap(DPAD_RIGHT);
    await expect(page.getByTestId('preset-replace')).toBeFocused();
    await tap(EAST);

    await expect(page.getByTestId('preset-dialog')).toHaveCount(0);
    expect(await titles(page)).toEqual(before);
  });
});
