import type { LineKey, Rect } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import { el } from './dom';

const PAD = 4;
const INSET = 2;
const MIN_INSET_H = 12;
const UNDERLAY = 4;
const TOUCH_MS = 2000;
const DESKTOP_MIN = 1024;
const PEEK_H = 108;
const PEEK_PAD = 12;
const PEEK_SHARE = 0.55;
const STROKE = 2;
const DASH: number[] = [6, 4];
const LINE_HEIGHT = 1.2;
const BOXES = new WeakMap<HTMLCanvasElement, Readonly<Record<LineKey, Rect | undefined>>>();
const now = { lines: [] as readonly LineKey[], name: '', until: 0, timer: 0, quiet: false, over: '' };
const CONTROL = 'button, select, input, .role-row';

const px = (n: number): string => `${String(Math.round(n))}px`;
const figures = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('figure[data-testid^="preview-"]')];
const selectedFigure = (): HTMLElement | undefined => document.querySelector<HTMLElement>('figure.selected[data-testid^="preview-"]') ?? figures()[0];

/** Keeps the line boxes poster-render reported for a preview canvas. */
export function rememberBoxes(canvas: HTMLCanvasElement, boxes: Readonly<Record<LineKey, Rect | undefined>>): void {
  BOXES.set(canvas, boxes);
}

/** The line boxes of a preview canvas, if it has been drawn. */
export function boxesOf(canvas: HTMLCanvasElement): Readonly<Record<LineKey, Rect | undefined>> | undefined {
  return BOXES.get(canvas);
}

function found(figure: HTMLElement | undefined, lines: readonly LineKey[]): { canvas: HTMLCanvasElement; rects: Rect[] } | null {
  const canvas = figure?.querySelector('canvas') ?? null;
  const boxes = canvas === null ? undefined : BOXES.get(canvas);
  if (canvas === null || boxes === undefined || canvas.width === 0) return null;
  return { canvas, rects: lines.map((k) => boxes[k]).filter((b): b is Rect => b !== undefined) };
}

function union(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return { x, y, w: Math.max(...rects.map((r) => r.x + r.w)) - x, h: Math.max(...rects.map((r) => r.y + r.h)) - y };
}

function outlineFigure(figure: HTMLElement, lines: readonly LineKey[]): void {
  const hit = found(figure, lines);
  if (hit === null) return;
  const { canvas } = hit;
  const k = canvas.clientWidth / canvas.width;
  canvas.after(...hit.rects.filter((b) => b.w > 0 && b.h > 0).map((b) => {
    const box = el('div', { class: 'text-outline', 'aria-hidden': 'true' });
    const inset = b.h * k >= MIN_INSET_H ? INSET : -STROKE;
    Object.assign(box.style, { left: px(canvas.offsetLeft + b.x * k - PAD), top: px(canvas.offsetTop + b.y * k + inset), width: px(b.w * k + 2 * PAD), height: px(b.h * k - 2 * inset) });
    return box;
  }));
}

function peekCanvas(source: HTMLCanvasElement, area: Rect): HTMLCanvasElement {
  const src = { x: area.x - PEEK_PAD, y: area.y - PEEK_PAD, w: area.w + 2 * PEEK_PAD, h: area.h + 2 * PEEK_PAD };
  const scale = Math.min(PEEK_H / src.h, (innerWidth * PEEK_SHARE) / src.w);
  const view = el('canvas');
  view.width = Math.round(src.w * scale);
  view.height = Math.round(src.h * scale);
  const ctx = view.getContext('2d');
  if (ctx === null) return view;
  ctx.drawImage(source, src.x, src.y, src.w, src.h, 0, 0, view.width, view.height);
  const css = getComputedStyle(document.documentElement);
  const rect = [PEEK_PAD * scale, PEEK_PAD * scale, area.w * scale, area.h * scale] as const;
  ctx.lineWidth = UNDERLAY;
  ctx.strokeStyle = css.getPropertyValue('--surface');
  ctx.strokeRect(...rect);
  ctx.setLineDash(DASH);
  ctx.lineWidth = STROKE;
  ctx.strokeStyle = css.getPropertyValue('--text');
  ctx.strokeRect(...rect);
  return view;
}

function peek(lines: readonly LineKey[], name: string): void {
  if (innerWidth >= DESKTOP_MIN) return;
  const figure = selectedFigure();
  const hit = found(figure, lines);
  const area = hit === null ? null : union(hit.rects);
  if (hit === null || area === null) return;
  const n = figure?.getAttribute('data-testid')?.split('-')[1] ?? '1';
  const strip = el('div', { class: 'outline-peek', 'data-testid': 'outline-peek', 'aria-hidden': 'true' }, [
    el('div', {}, [el('strong', { text: name }), el('small', { class: 'muted', text: FM('roles.onFlier', n) })]),
    peekCanvas(hit.canvas, area),
  ]);
  const bar = document.querySelector('[data-testid="mini-preview"]')?.getBoundingClientRect();
  strip.style.bottom = px(bar !== undefined && bar.height > 1 ? innerHeight - bar.top : 0);
  document.body.append(strip);
}

const removeAll = (): void => { document.querySelectorAll('.text-outline, .outline-peek').forEach((n) => n.remove()); };

/** D45: hides the outline until the pointer enters a control, a row or a poster section again. */
export function hushOutline(): void {
  now.quiet = true;
  now.lines = [];
  removeAll();
}

/** Lets the outline show again. */
export function wakeOutline(): void {
  now.quiet = false;
}

/** Outlines the lines on the one flier holding `node`. */
export function outlineOnly(node: HTMLElement, lines: readonly LineKey[]): void {
  if (now.quiet) return;
  removeAll();
  const figure = node.closest<HTMLElement>('figure');
  if (figure !== null) outlineFigure(figure, lines);
}

/** Outlines the lines on every preview (and a peek strip under 1024 px); never drawn on the canvas. */
export function showOutline(lines: readonly LineKey[], name: string): void {
  if (now.quiet) return;
  removeAll();
  now.lines = lines;
  now.name = name;
  figures().forEach((f) => outlineFigure(f, lines));
  peek(lines, name);
}

/** Clears the outline unless a tap is still holding it. */
export function clearOutline(): void {
  if (Date.now() < now.until) return;
  now.lines = [];
  removeAll();
}

/** The size the lines are drawn at on the selected flier, in poster pixels. */
export function drawnText(lines: readonly LineKey[]): string {
  const hit = found(selectedFigure(), lines);
  const h = hit === null ? 0 : Math.max(0, ...hit.rects.map((r) => r.h));
  return h > 0 ? FM('style.drawnPx', String(Math.round(h / LINE_HEIGHT))) : FM('style.drawnNone');
}

/** After a render: redraws a live outline and every drawn-size readout. */
export function afterRender(): void {
  if (now.lines.length > 0) showOutline(now.lines, now.name);
  document.querySelectorAll<HTMLElement>('[data-drawn-lines]').forEach((n) => { n.textContent = drawnText((n.dataset.drawnLines ?? '').split(' ')); });
}

/** Outlines the lines while the pointer is over the node or focus is inside it; a tap holds it 2 s. */
export function outlineOn(node: HTMLElement, lines: readonly LineKey[], name: string): void {
  const show = (): void => showOutline(lines, name);
  node.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { wakeOutline(); show(); } });
  node.addEventListener('pointerover', (e) => {
    const to = e.target instanceof Element ? e.target.closest(CONTROL) : null;
    const id = to?.getAttribute('data-testid') ?? '';
    if (to === null) now.over = '';
    if (e.pointerType !== 'mouse' || to === null || id === now.over) return;
    now.over = id;
    wakeOutline();
    show();
  });
  node.addEventListener('keydown', (e) => { if (e.key === 'Tab') wakeOutline(); });
  node.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { now.over = ''; clearOutline(); } });
  node.addEventListener('focusin', show);
  node.addEventListener('focusout', (e) => { if (!node.contains(e.relatedTarget as Node | null)) clearOutline(); });
  node.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' && node.matches('.style-panel')) hushOutline();
    if (e.pointerType !== 'touch') return;
    now.until = Date.now() + TOUCH_MS;
    show();
    window.clearTimeout(now.timer);
    now.timer = window.setTimeout(() => { now.until = 0; if (!node.contains(document.activeElement)) clearOutline(); }, TOUCH_MS);
  });
}
