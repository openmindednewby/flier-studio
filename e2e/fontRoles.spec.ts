import { expect, test, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const ROLE_COUNT = 11;
const TITLE = 'KIZOMBA';
const FACE = 'Anton';
const OWN_FACE = 'Oswald';
const TOUCH_SHOW_MS = 2000;
const JUST_BEFORE_MS = TOUCH_SHOW_MS - 1;
const PAST_END_MS = 2;

interface Run { text: string; font: string; flier: number }

function spyOnRuns(): void {
  const runs: Run[] = [];
  const orig = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, ...args: [string, number, number, number?]): void {
    const figure = this.canvas.closest('[data-testid^="preview-"]');
    const flier = figure === null ? 0 : Number(figure.getAttribute('data-testid')?.split('-')[1] ?? 0);
    runs.push({ text: String(args[0]), font: this.font, flier });
    if (args[3] === undefined) orig.call(this, args[0], args[1], args[2]);
    else orig.call(this, args[0], args[1], args[2], args[3]);
  };
  Object.assign(window, { titleRuns: (t: string) => runs.filter((r) => r.text === t), clearRuns: () => { runs.length = 0; } });
}

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

async function titleFonts(page: Page): Promise<Run[]> {
  return page.evaluate((t) => (window as unknown as { titleRuns: (k: string) => Run[] }).titleRuns(t), TITLE);
}

async function clearRuns(page: Page): Promise<void> {
  await page.evaluate(() => { (window as unknown as { clearRuns: () => void }).clearRuns(); });
}

async function outlinesNow(page: Page, testId: string): Promise<number[]> {
  return page.evaluate((id) => {
    document.querySelector<HTMLElement>(`[data-testid="${id}"]`)?.focus();
    return [...document.querySelectorAll('[data-testid^="preview-"]')].map((f) => f.querySelectorAll('.text-outline').length);
  }, testId);
}

async function setTitleFace(page: Page, face: string): Promise<void> {
  await page.getByTestId('role-title').click();
  await clearRuns(page);
  await page.getByTestId('role-editor').getByTestId('style-font').selectOption(face);
  await rendered(page);
}

test.describe('Fonts by text role (AC-44) and highlight on hover/focus (AC-45)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(spyOnRuns);
    await page.goto('/');
    await rendered(page);
    await openPanel(page, Panel.All);
  });

  test('AC-44: the Fonts card lists every text role', async ({ page }) => {
    await expect(page.getByTestId('all-fliers-row').locator('[data-testid^="role-"][aria-expanded]')).toHaveCount(ROLE_COUNT);
  });

  test('AC-44: a face picked for Title redraws the title of every flier in it', async ({ page }) => {
    await setTitleFace(page, FACE);

    const runs = await titleFonts(page);
    expect(runs.length).toBeGreaterThan(1);
    expect(runs.filter((r) => !r.font.includes(FACE))).toEqual([]);
    await expect(page.getByTestId('role-title')).toContainText(FACE);
  });

  test('AC-44: Reset to theme draws the title in the theme face again', async ({ page }) => {
    await setTitleFace(page, FACE);
    await clearRuns(page);

    await page.getByTestId('role-editor').getByTestId('style-reset').click();
    await rendered(page);

    const runs = await titleFonts(page);
    expect(runs.length).toBeGreaterThan(0);
    expect(runs.some((r) => r.font.includes(FACE))).toBe(false);
  });

  test('AC-44: a flier\'s own per-field Style still overrides the role style', async ({ page }) => {
    await openPanel(page, Panel.Form);
    await page.getByTestId('style-title').click();
    await page.getByTestId('style-panel').getByTestId('style-font').selectOption(OWN_FACE);
    await page.getByTestId('style-done').click();
    await rendered(page);
    await openPanel(page, Panel.All);

    await setTitleFace(page, FACE);

    const runs = await titleFonts(page);
    expect(runs.filter((r) => r.flier === 1).every((r) => r.font.includes(OWN_FACE))).toBe(true);
    expect(runs.filter((r) => r.flier > 1).every((r) => r.font.includes(FACE))).toBe(true);
  });

  test('AC-45: focusing a role outlines its text on every flier at once, leaving clears it', async ({ page }) => {
    const shown = await outlinesNow(page, 'role-title');

    expect(shown.length).toBeGreaterThan(1);
    expect(shown.every((n) => n > 0)).toBe(true);
    const cleared = await outlinesNow(page, 'pick-theme');
    expect(cleared.every((n) => n === 0)).toBe(true);
  });

  test('AC-45: focusing a role editor control outlines that role', async ({ page }) => {
    await page.getByTestId('role-footer').click();

    const shown = await page.evaluate(() => {
      document.querySelector<HTMLElement>('[data-testid="role-editor"] [data-testid="style-font"]')?.focus();
      return document.querySelectorAll('[data-testid="preview-1"] .text-outline').length;
    });

    expect(shown).toBeGreaterThan(0);
  });

  test('AC-45: focusing an AC-40 Style control outlines that field on the flier', async ({ page }) => {
    await openPanel(page, Panel.Form);
    await page.getByTestId('style-title').click();

    const shown = await page.evaluate(() => {
      document.querySelector<HTMLElement>('[data-testid="style-panel"] [data-testid="style-larger"]')?.focus();
      return document.querySelectorAll('[data-testid="preview-1"] .text-outline').length;
    });

    expect(shown).toBeGreaterThan(0);
  });

  test('AC-45: the outline is never part of the exported picture', async ({ page }) => {
    const plain = await page.evaluate(() => document.querySelector<HTMLCanvasElement>('[data-testid="preview-1"] canvas')?.toDataURL());

    const outlined = await page.evaluate(() => {
      document.querySelector<HTMLElement>('[data-testid="role-title"]')?.focus();
      return document.querySelector<HTMLCanvasElement>('[data-testid="preview-1"] canvas')?.toDataURL();
    });

    await expect(page.locator('[data-testid="preview-1"] canvas ~ .text-outline').first()).toBeAttached();
    expect(outlined, 'focusing a role must not change the exported PNG').toBe(plain);
  });

  test('AC-45: hovering a role outlines its text, moving away clears it', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover needs a pointer');
    await page.getByTestId('role-venue').hover();

    await expect(page.locator('[data-testid="preview-1"] .text-outline').first()).toBeVisible();
    await page.getByTestId('pick-theme').hover();
    await expect(page.locator('[data-testid="preview-1"] .text-outline')).toHaveCount(0);
  });

  test('D45: changing a style removes the outline until the pointer enters another control', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover needs a pointer');
    await page.getByTestId('role-venue').click();
    const editor = page.getByTestId('role-editor');
    await editor.getByTestId('style-wider').hover();
    await expect(page.locator('[data-testid="preview-1"] .text-outline').first()).toBeVisible();

    await editor.getByTestId('style-wider').click();
    await rendered(page);

    await expect(page.locator('[data-testid="preview-1"] .text-outline')).toHaveCount(0);
    await editor.getByTestId('style-narrower').hover();
    await expect(page.locator('[data-testid="preview-1"] .text-outline').first()).toBeVisible();
  });

  test('AC-44: every control of the open role editor fits inside the editor card', async ({ page }) => {
    await page.getByTestId('role-prices').click();

    const outside = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="role-editor"]')?.getBoundingClientRect();
      if (card === undefined) return ['no editor'];
      return [...document.querySelectorAll<HTMLElement>('[data-testid="role-editor"] button, [data-testid="role-editor"] select, [data-testid="role-editor"] output, [data-testid="role-editor"] input')]
        .filter((n) => { const r = n.getBoundingClientRect(); return r.left < card.left - 1 || r.right > card.right + 1 || n.scrollWidth > n.clientWidth + 1; })
        .map((n) => n.dataset.testid ?? n.tagName);
    });

    expect(outside).toEqual([]);
  });

  test('AC-45: closing a role and moving the pointer away clears the outline', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover needs a pointer');
    await page.getByTestId('role-prices').click();
    await page.getByTestId('role-prices').click();

    await page.mouse.move(0, 0);

    await expect(page.locator('.text-outline')).toHaveCount(0);
  });

  test('AC-45: the outline is the same 2px dashed ink in light and dark', async ({ page }) => {
    const style = async (): Promise<string> => page.evaluate(() => {
      document.querySelector<HTMLElement>('[data-testid="role-title"]')?.focus();
      const s = getComputedStyle(document.querySelector('.text-outline') ?? document.body);
      return `${s.borderTopStyle} ${s.borderTopWidth} ${s.borderTopColor}`;
    });
    const light = await style();

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); });

    expect([light.startsWith('dashed 2px'), await style()]).toEqual([true, light]);
  });

  test('AC-45: a tap on a role shows the outline and the peek for 2 s', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch only');
    await page.clock.install();
    await page.reload();
    await rendered(page);
    await openPanel(page, Panel.All);
    await page.clock.pauseAt(Date.now() + TOUCH_SHOW_MS);

    await page.getByTestId('role-title').tap();
    await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); });

    await page.clock.fastForward(JUST_BEFORE_MS);
    await expect(page.getByTestId('outline-peek'), 'the peek must still show just before 2 s').toBeVisible();
    await page.clock.fastForward(PAST_END_MS);
    await expect(page.getByTestId('outline-peek'), 'the peek must clear once 2 s have passed').toBeHidden();
  });
});

const STEPS = 6;

async function drawnPx(page: Page, host: string): Promise<number> {
  return parseInt((await page.getByTestId(host).getByTestId('style-drawn').textContent()) ?? '0', 10);
}

test.describe('Width per text (AC-46)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await rendered(page);
    await openPanel(page, Panel.All);
  });

  test('AC-46: widening the venue lets its larger size draw larger', async ({ page }) => {
    await page.getByTestId('role-venue').click();
    const editor = page.getByTestId('role-editor');
    for (let i = 0; i < STEPS; i += 1) await editor.getByTestId('style-larger').click();
    await rendered(page);
    const capped = await drawnPx(page, 'role-editor');

    for (let i = 0; i < STEPS; i += 1) await editor.getByTestId('style-wider').click();
    await rendered(page);

    expect(await drawnPx(page, 'role-editor')).toBeGreaterThan(capped);
  });

  test('AC-46: the flier Style panel has a width step and Reset restores the theme width', async ({ page }) => {
    await openPanel(page, Panel.Form);
    await page.getByTestId('style-venue').click();
    const panel = page.getByTestId('style-panel');
    await panel.getByTestId('style-wider').click();
    await expect(panel.getByTestId('style-width')).toHaveText('105%');

    await panel.getByTestId('style-reset').click();

    await expect(panel.getByTestId('style-width')).toHaveText('100%');
  });

  test('AC-45: right after a reload with a saved role style, hovering and focusing a role outlines it', async ({ page, isMobile }) => {
    await page.getByTestId('role-title').click();
    await page.getByTestId('role-editor').getByTestId('style-font').selectOption(FACE);
    await rendered(page);
    await page.reload();
    await rendered(page);
    await openPanel(page, Panel.All);

    const shown = await outlinesNow(page, 'role-prices');

    expect(shown[0]).toBeGreaterThan(0);
    test.skip(isMobile, 'hover needs a pointer');
    await page.getByTestId('pick-theme').hover();
    await page.getByTestId('role-title').hover();
    await expect(page.locator('[data-testid="preview-1"] .text-outline').first()).toBeVisible();
  });

  test('AC-46: Larger alone never draws the venue smaller', async ({ page }) => {
    await page.getByTestId('role-venue').click();
    const before = await drawnPx(page, 'role-editor');

    await page.getByTestId('role-editor').getByTestId('style-larger').click();
    await rendered(page);

    expect(await drawnPx(page, 'role-editor')).toBeGreaterThanOrEqual(before);
  });
});
