import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, type Page } from '@playwright/test';

const STAGE = process.env.CAPTURE ?? '';
const BUILD = process.env.BUILD ?? '';
const OUT = join('docs', 'design', 'FLIER-1-build');
const FRAMES = join(OUT, 'frames');
const ROUTE = '/';
const STATE = 'first load, flier 1 of 4 selected, no edits';
const FIXTURE = 'kizomba preset: 31 Oct / 7 Nov / 29 Nov / Upcoming';
const PAGE_TOP = 'page-top';
const ROW_TOLERANCE_PX = 1;
const MIN_VISIBLE_PX = 1;
const CONTROL_TAGS = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'];

const enum Crop {
  Viewport = 'viewport',
  FullPage = 'full-page',
}

interface Shot {
  readonly name: string;
  readonly anchor: string;
  readonly crop: Crop;
}

interface Box {
  readonly id: string;
  readonly top: number;
  readonly left: number;
  readonly height: number;
  readonly control: boolean;
}

async function scrollToAnchor(page: Page, anchor: string): Promise<number> {
  if (anchor === PAGE_TOP) {
    await page.evaluate(() => window.scrollTo(0, 0));
    return 0;
  }
  return page.getByTestId(anchor).evaluate((node) => {
    node.scrollIntoView({ block: 'start' });
    return Math.round(node.getBoundingClientRect().top);
  });
}

async function measureBoxes(page: Page, crop: Crop): Promise<Box[]> {
  const args = { wholePage: crop === Crop.FullPage, minPx: MIN_VISIBLE_PX, tags: CONTROL_TAGS };
  return page.getByTestId('flier-form').evaluate((form, { wholePage, minPx, tags }) => {
    const inFrame = (r: DOMRect): boolean => wholePage || (r.bottom > 0 && r.top < window.innerHeight);
    return [...form.querySelectorAll<HTMLElement>('[data-testid]')]
      .map((node) => ({ node, r: node.getBoundingClientRect() }))
      .filter(({ r }) => r.width > minPx && r.height > minPx && inFrame(r))
      .map(({ node, r }) => ({
        id: node.dataset.testid ?? '',
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left),
        height: Math.round(r.height),
        control: tags.includes(node.tagName),
      }));
  }, args);
}

function sideBySideRows(boxes: Box[]): { rows: string[][]; misaligned: string[][] } {
  const controls = boxes.filter((b) => b.control);
  const sameRow = (a: Box, b: Box): boolean => b.left !== a.left && Math.abs(b.top - a.top) < Math.min(a.height, b.height) / 2;
  const rows = controls.flatMap((a, i) => controls.slice(i + 1).filter((b) => sameRow(a, b)).map((b) => [a, b]));
  const isOff = ([a, b]: Box[]): boolean => Math.abs(a.top - b.top) > ROW_TOLERANCE_PX || Math.abs(a.height - b.height) > ROW_TOLERANCE_PX;
  return { rows: rows.map((r) => r.map((b) => b.id)), misaligned: rows.filter(isOff).map((r) => r.map((b) => b.id)) };
}

async function captureShot(page: Page, viewport: string, shot: Shot): Promise<void> {
  const anchorTopPx = await scrollToAnchor(page, shot.anchor);
  const file = `app-${STAGE}-${shot.name}.png`;
  await page.screenshot({ path: join(OUT, file), fullPage: shot.crop === Crop.FullPage });
  const boxes = await measureBoxes(page, shot.crop);
  const ids = [...new Set(boxes.map((b) => b.id))].sort();
  const record = {
    option: 'app', shot: shot.name, side: STAGE, build: BUILD, file, anchorTopPx,
    pair: { route: ROUTE, state: STATE, fixture: FIXTURE, viewport, scrollAnchor: shot.anchor, crop: shot.crop },
    visibleItems: { before: ids, after: ids },
    formRows: sideBySideRows(boxes),
  };
  mkdirSync(FRAMES, { recursive: true });
  writeFileSync(join(FRAMES, `${STAGE}-${shot.name}.json`), `${JSON.stringify(record, null, 1)}\n`);
}

const MOBILE_SHOTS: readonly Shot[] = [
  { name: '360-form-top', anchor: 'flier-form', crop: Crop.Viewport },
  { name: '360-previews', anchor: 'previews', crop: Crop.Viewport },
  { name: '360-full', anchor: PAGE_TOP, crop: Crop.FullPage },
];
const DESKTOP_SHOTS: readonly Shot[] = [
  { name: '1280', anchor: 'flier-form', crop: Crop.Viewport },
  { name: '1280-full', anchor: PAGE_TOP, crop: Crop.FullPage },
];

test('capture the app form at the pair anchors', async ({ page }, info) => {
  test.skip(STAGE === '' || BUILD === '', 'set CAPTURE=before|after and BUILD=<sha> to capture');
  await page.goto(ROUTE);
  await page.locator('canvas').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  const size = page.viewportSize();
  const viewport = `${String(size?.width)}x${String(size?.height)}`;

  for (const shot of info.project.name === 'mobile' ? MOBILE_SHOTS : DESKTOP_SHOTS) await captureShot(page, viewport, shot);
});
