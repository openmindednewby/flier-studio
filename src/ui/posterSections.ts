import type { LineKey, Rect } from '@dloizides/poster-render';
import { FIELD_LINES } from '../form/lineEdit';
import { boxesOf, clearOutline, outlineOnly } from './textOutline';

type Boxes = Readonly<Record<LineKey, Rect | undefined>>;

const holds = (r: Rect, x: number, y: number): boolean => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** The line drawn at poster point (x, y): the smallest box holding it. */
export function sectionAt(boxes: Boxes, x: number, y: number): LineKey | undefined {
  const hits = Object.entries(boxes).filter((e): e is [LineKey, Rect] => e[1] !== undefined && holds(e[1], x, y));
  return hits.sort((a, b) => a[1].w * a[1].h - b[1].w * b[1].h)[0]?.[0];
}

/** The form field that owns a drawn line. */
export function fieldOf(line: LineKey | undefined): string | undefined {
  return line === undefined ? undefined : Object.keys(FIELD_LINES).find((k) => FIELD_LINES[k]?.includes(line) === true);
}

/** The form field drawn under a pointer on a preview canvas. */
export function fieldUnder(canvas: HTMLCanvasElement, e: { clientX: number; clientY: number }): string | undefined {
  const boxes = boxesOf(canvas);
  const r = canvas.getBoundingClientRect();
  if (boxes === undefined || r.width === 0) return undefined;
  const k = canvas.width / r.width;
  return fieldOf(sectionAt(boxes, (e.clientX - r.left) * k, (e.clientY - r.top) * k));
}

/** AC-47: outlines the field under the mouse on this flier only; leaving clears it. */
export function trackSections(trim: HTMLElement, canvas: HTMLCanvasElement): void {
  trim.addEventListener('pointermove', (e) => {
    const field = fieldUnder(canvas, e) ?? '';
    if (trim.dataset.section === field) return;
    trim.dataset.section = field;
    if (e.pointerType !== 'mouse') return;
    if (field === '') clearOutline();
    else outlineOnly(trim, FIELD_LINES[field] ?? []);
  });
  trim.addEventListener('pointerleave', () => { trim.dataset.section = ''; clearOutline(); });
}
