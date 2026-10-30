import { expect, test, type Locator, type Page } from '@playwright/test';
import { Panel, openPanel } from './panel';

const MIN_TAP = 44;
const STEPS = 40;
const EDGE = 0.02;
const SECTION_ROLE: Readonly<Record<string, string>> = {
  'order-venue': 'role-venue',
  'order-schedule': 'role-levels',
  'order-prices': 'role-prices',
  'order-includes': 'role-includesHeading',
  'order-footer': 'role-footer',
};

const trim = (page: Page, n: number): Locator => page.getByTestId(`preview-${String(n)}`).locator('.trim');

async function rendered(page: Page): Promise<void> {
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'pending').catch(() => undefined);
  await expect(page.getByTestId('preview-grid')).toHaveAttribute('data-render', 'done');
}

async function sections(page: Page): Promise<string[]> {
  return page.getByTestId('section-order').locator('li').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-testid') ?? ''));
}

async function roles(page: Page): Promise<string[]> {
  return page.locator('.role-row').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-testid') ?? ''));
}

async function rolesFollowSections(page: Page): Promise<void> {
  const order = await sections(page);
  const shown = await roles(page);
  const mapped = order.map((s) => SECTION_ROLE[s]).filter((r): r is string => r !== undefined && shown.includes(r));
  expect(shown.filter((r) => mapped.includes(r))).toEqual(mapped);
  expect(shown[0]).toBe('role-title');
}

const SECTION_FIELD: Readonly<Record<string, string>> = {
  'order-venue': 'venue',
  'order-schedule': 'schedule',
  'order-prices': 'prices',
  'order-includes': 'includesHeading',
  'order-footer': 'footer',
};

async function fieldsFollowSections(page: Page): Promise<void> {
  const order = (await sections(page)).map((s) => SECTION_FIELD[s]).filter((f): f is string => f !== undefined);
  const shown = await page.locator('[data-testid="flier-form"] .row[data-field]').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-field') ?? ''));
  expect(shown.filter((f) => order.includes(f))).toEqual(order);
}

async function selectFlier(page: Page, n: number): Promise<void> {
  await trim(page, n).scrollIntoViewIfNeeded();
  const box = (await trim(page, n).locator('canvas').boundingBox()) ?? { x: 0, y: 0, width: 0, height: 0 };
  for (let row = 0; row < STEPS; row++) {
    const x = box.x + box.width * EDGE;
    const y = box.y + box.height * (EDGE + ((1 - 2 * EDGE) * row) / STEPS);
    await page.mouse.move(x, y);
    if (((await trim(page, n).getAttribute('data-section')) ?? '') === '') { await page.mouse.click(x, y); break; }
  }
  await expect(trim(page, n)).toHaveAttribute('aria-pressed', 'true');
  await openPanel(page, Panel.All);
}

async function moveLastUp(page: Page): Promise<{ before: string[]; moved: string }> {
  const before = await sections(page);
  const moved = before[before.length - 1];
  await page.getByTestId(`${moved}-up`).focus();
  await page.keyboard.press('Enter');
  await rendered(page);
  return { before, moved };
}

test.describe('Text order: role list follows the flier (AC-49), reorder the texts (AC-50)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await rendered(page);
    await openPanel(page, Panel.All);
  });

  test('AC-49: the role list is in the flier\'s top-to-bottom order', async ({ page }) => {
    await expect(page.getByTestId('section-order').locator('li').first()).toBeVisible();

    await rolesFollowSections(page);
    await fieldsFollowSections(page);
  });

  test('AC-50: Move up by keyboard re-lays out the flier and re-sorts both lists', async ({ page }) => {
    const { before, moved } = await moveLastUp(page);

    expect(await sections(page)).toEqual([...before.slice(0, -2), moved, before[before.length - 2]]);
    await rolesFollowSections(page);
    await fieldsFollowSections(page);
    await expect(page.getByTestId(`${moved}-up`)).toBeFocused();
  });

  test('AC-50: Reset restores the layout order', async ({ page }) => {
    const { before } = await moveLastUp(page);

    await page.getByTestId('order-reset').click();
    await rendered(page);

    expect(await sections(page)).toEqual(before);
  });

  test('AC-50: This flier leaves the other fliers in their order', async ({ page }) => {
    const other = await (async (): Promise<string[]> => { await selectFlier(page, 2); const o = await sections(page); await selectFlier(page, 1); return o; })();

    await moveLastUp(page);
    await selectFlier(page, 2);

    expect(await sections(page)).toEqual(other);
  });

  test('AC-50: All fliers moves the block on every flier', async ({ page }) => {
    await page.getByTestId('order-scope-all').click();
    const { moved } = await moveLastUp(page);

    await selectFlier(page, 2);

    expect((await sections(page)).indexOf(moved)).toBeLessThan((await sections(page)).length - 1);
  });

  test('AC-50: the order is kept in the flier after a reload', async ({ page }) => {
    const { before, moved } = await moveLastUp(page);
    const after = await sections(page);

    await page.reload();
    await rendered(page);
    await openPanel(page, Panel.All);

    expect(await sections(page)).toEqual(after);
    expect(after.indexOf(moved)).toBe(before.length - 2);
  });

  test('AC-50: every move button is at least 44 by 44', async ({ page }) => {
    const boxes = await page.getByTestId('section-order').locator('button').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect()).map((r) => [r.width, r.height]));

    const small = boxes.filter(([w, h]) => w < MIN_TAP || h < MIN_TAP);

    expect(boxes.length).toBeGreaterThan(0);
    expect(small).toEqual([]);
  });
});
