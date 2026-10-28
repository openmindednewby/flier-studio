import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const HIT = 44;
const TOLERANCE_PX = 1;
const MINE = 'MINE ONLY';
const PRESET_SIZE = 4;
const DPAD_RIGHT = 15;
const EAST = 1;
const FIRST_ROW = 1;
const DRAFTS_ADDED_BY_REPLACE = 1;
const NARROW = { width: 360, height: 640 };
const MIN_CONTRAST = 4.5;
const MAX_BODY_LINES = 3;
const ACTIONS = ['preset-add', 'preset-replace', 'preset-cancel'];

const titles = (page: Page): Promise<string[]> =>
  page.evaluate(() => (JSON.parse(localStorage.getItem('flier-studio:fliers') ?? '[]') as { content: object }[]).map((f) => JSON.stringify(f.content)));

const draftsNewestFirst = (page: Page): Promise<string[]> =>
  page.evaluate(() => new Promise<string[]>((resolve, reject) => {
    const opening = indexedDB.open('flier-studio-drafts');
    opening.onerror = (): void => reject(opening.error);
    opening.onsuccess = (): void => {
      const db = opening.result;
      const all = db.transaction('drafts', 'readonly').objectStore('drafts').getAll() as IDBRequest<{ id: number; at: number; fliers: unknown }[]>;
      all.onerror = (): void => reject(all.error);
      all.onsuccess = (): void => {
        db.close();
        resolve(all.result.sort((a, b) => (b.at !== a.at ? b.at - a.at : b.id - a.id)).map((d) => JSON.stringify(d.fliers)));
      };
    };
  }));

const nextFrames = (page: Page): Promise<void> =>
  page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

const replaceContrast = (page: Page): Promise<number> =>
  page.getByTestId('preset-replace').evaluate((node) => {
    const rgb = (c: string): number[] => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = (c: string): number => {
      const [r, g, b] = rgb(c).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const style = getComputedStyle(node);
    const [hi, lo] = [lum(style.color), lum(style.backgroundColor)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  });

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

  test('Replace names how many fliers it swaps and its text is the error colour on the neutral fill', async ({ page }) => {
    await openPreset(page);
    const onScreen = (await titles(page)).length;
    const replace = page.getByTestId('preset-replace');

    const colours = await replace.evaluate((node) => {
      const own = getComputedStyle(node);
      const root = getComputedStyle(document.documentElement);
      const probe = document.createElement('i');
      probe.style.color = root.getPropertyValue('--error');
      probe.style.backgroundColor = root.getPropertyValue('--surface-elevated');
      document.body.append(probe);
      const want = getComputedStyle(probe);
      const out = { text: own.color, fill: own.backgroundColor, error: want.color, neutral: want.backgroundColor };
      probe.remove();
      return out;
    });

    await expect(replace).toHaveText(onScreen === 1 ? `Replace ${String(onScreen)}` : `Replace all ${String(onScreen)}`);
    await expect(replace.locator('svg, img')).toHaveCount(0);
    expect(colours.text).toBe(colours.error);
    expect(colours.fill).toBe(colours.neutral);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`in ${colorScheme} mode the Replace label reaches 4.5:1 contrast`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await openPreset(page);

      const ratio = await replaceContrast(page);

      expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });
  }

  test('at 360 px the buttons stack at full width and the body is at most 3 lines', async ({ page }) => {
    await page.setViewportSize(NARROW);
    await openPreset(page);

    const boxes = await Promise.all(ACTIONS.map(async (id) => page.getByTestId(id).boundingBox()));
    const row = await page.getByTestId('preset-add').evaluate((node) => node.parentElement?.getBoundingClientRect().width ?? 0);
    const lines = await page.getByTestId('preset-body').evaluate((node) => Math.round(node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight)));

    for (const [i, b] of boxes.entries()) {
      expect(Math.abs((b?.width ?? 0) - row), ACTIONS[i]).toBeLessThanOrEqual(TOLERANCE_PX);
      if (i > 0) expect(b?.y ?? 0, ACTIONS[i]).toBeGreaterThan((boxes[i - 1]?.y ?? 0) + (boxes[i - 1]?.height ?? 0) - TOLERANCE_PX);
    }
    expect(lines).toBeLessThanOrEqual(MAX_BODY_LINES);
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
    await expect.poll(async () => (await draftsNewestFirst(page))[0] ?? '').toContain(MINE);
    const draftsBefore = await draftsNewestFirst(page);
    const mineRowAfterReplace = draftsBefore.findIndex((d) => d.includes(MINE)) + FIRST_ROW + DRAFTS_ADDED_BY_REPLACE;

    await page.getByTestId('preset-replace').click();

    await expect.poll(async () => (await titles(page)).some((t) => t.includes(MINE))).toBe(false);
    expect(await titles(page)).toHaveLength(PRESET_SIZE);
    await openPanel(page, Panel.Drafts);
    await expect(page.getByTestId('drafts-list').getByRole('listitem')).toHaveCount(draftsBefore.length + DRAFTS_ADDED_BY_REPLACE);
    await page.getByTestId(`draft-restore-${String(mineRowAfterReplace)}`).click();
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
    const setPad = (index: number, pressed: boolean): Promise<void> =>
      page.evaluate(([i, on]) => { (window as unknown as { testPad: { buttons: { pressed: boolean }[] } }).testPad.buttons[i].pressed = on; }, [index, pressed] as const);
    const tap = async (index: number, settled: () => Promise<void>): Promise<void> => {
      await setPad(index, true);
      await settled();
      await setPad(index, false);
      await nextFrames(page);
    };

    await tap(DPAD_RIGHT, () => expect(page.getByTestId('preset-replace')).toBeFocused());
    await tap(EAST, () => expect(page.getByTestId('preset-dialog')).toHaveCount(0));

    await expect(page.getByTestId('preset-dialog')).toHaveCount(0);
    expect(await titles(page)).toEqual(before);
  });
});
