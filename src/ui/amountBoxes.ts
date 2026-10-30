import type { LineKey, Rect } from '@dloizides/poster-render';
import { lineBox, textRunsOf, type TextRun } from './textRuns';

const ITEM_PRICE = /^items\.\d+\.price$/;
const AMOUNT = /\S*\d\S*$/;

type Boxes = Readonly<Record<LineKey, Rect | undefined>>;

function runIn(runs: readonly TextRun[], box: Rect): TextRun | undefined {
  return runs.find((run) => {
    const r = lineBox(run);
    const midY = r.y + r.height / 2;
    const midX = r.x + r.width / 2;
    return midY >= box.y && midY <= box.y + box.h && midX >= box.x && midX <= box.x + box.w;
  });
}

function amountOnly(ctx: CanvasRenderingContext2D, run: TextRun, box: Rect): Rect {
  const amount = AMOUNT.exec(run.text)?.[0] ?? run.text;
  if (amount === run.text || run.width <= 0) return box;
  ctx.save();
  ctx.font = run.font;
  const w = (ctx.measureText(amount).width / run.width) * box.w;
  ctx.restore();
  return { ...box, x: box.x + box.w - w, w };
}

/** Trims a list item's price box to its trailing amount, so "Party pass 20€" boxes only "20€". */
export function amountBoxes(canvas: HTMLCanvasElement, boxes: Boxes): Boxes {
  const ctx = canvas.getContext('2d');
  if (ctx === null) return boxes;
  const runs = textRunsOf(canvas);
  return Object.fromEntries(Object.entries(boxes).map(([key, box]) => {
    const run = box !== undefined && ITEM_PRICE.test(key) ? runIn(runs, box) : undefined;
    return [key, run === undefined || box === undefined ? box : amountOnly(ctx, run, box)];
  })) as Boxes;
}
