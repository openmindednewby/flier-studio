import type { PosterCanvas } from '@dloizides/poster-render';

export interface TextRun {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly font: string;
  readonly align: string;
  readonly baseline: string;
  readonly width: number;
}

export interface LineBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const ALPHABETIC_ASCENT = 0.8;
const FONT_SIZE = /(\d+(?:\.\d+)?)px/;
const ALIGN_SHIFT: Record<string, number | undefined> = { center: 0.5, right: 1, end: 1 };
const BASELINE_SHIFT: Record<string, number | undefined> = { top: 0, hanging: 0, middle: 0.5, bottom: 1, ideographic: 1 };
const RUNS = new WeakMap<HTMLCanvasElement, TextRun[]>();

/** The box a recorded fillText line occupies, in canvas pixels. */
export function lineBox(run: TextRun): LineBox {
  const size = Number(FONT_SIZE.exec(run.font)?.[1] ?? '0');
  const top = run.y - size * (BASELINE_SHIFT[run.baseline] ?? ALPHABETIC_ASCENT);
  return { x: run.x - run.width * (ALIGN_SHIFT[run.align] ?? 0), y: top, width: run.width, height: size };
}

/** The text lines last drawn on `canvas` through `recordingCanvas`. */
export function textRunsOf(canvas: HTMLCanvasElement): readonly TextRun[] {
  return RUNS.get(canvas) ?? [];
}

/** Wraps `canvas` so every fillText it receives is recorded with its position, font and width. */
export function recordingCanvas(canvas: HTMLCanvasElement): PosterCanvas {
  const runs: TextRun[] = [];
  RUNS.set(canvas, runs);
  const ctx = canvas.getContext('2d');
  const record = (text: string, x: number, y: number): void => {
    if (ctx === null) return;
    runs.push({ text, x, y, font: ctx.font, align: ctx.textAlign, baseline: ctx.textBaseline, width: ctx.measureText(text).width });
    ctx.fillText(text, x, y);
  };
  const context = ctx === null ? null : new Proxy(ctx, {
    get: (t, k) => (k === 'fillText' ? record : bound(t, k)),
    set: (t, k, v) => Reflect.set(t, k, v, t),
  });
  return new Proxy(canvas, {
    get: (t, k) => (k === 'getContext' ? () => context : bound(t, k)),
    set: (t, k, v) => Reflect.set(t, k, v, t),
  }) as unknown as PosterCanvas;
}

function bound(target: object, key: string | symbol): unknown {
  const value: unknown = Reflect.get(target, key, target);
  return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(target) : value;
}
