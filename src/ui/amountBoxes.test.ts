import { describe, expect, it, vi } from 'vitest';
import { amountBoxes } from './amountBoxes';
import * as runs from './textRuns';

const CHAR_PX = 10;

function canvasMeasuringByLength(): HTMLCanvasElement {
  const ctx = { font: '', save: vi.fn(), restore: vi.fn(), measureText: (t: string) => ({ width: t.length * CHAR_PX }) };
  return { getContext: () => ctx } as unknown as HTMLCanvasElement;
}

describe('amountBoxes', () => {
  it('with a list item price "Party pass 20€", keeps only the "20€" end of its box', () => {
    const text = 'Party pass 20€';
    const width = text.length * CHAR_PX;
    vi.spyOn(runs, 'textRunsOf').mockReturnValue([{ text, x: 100, y: 240, font: '20px x', align: 'left', baseline: 'top', width }]);
    const box = { x: 100, y: 240, w: width, h: 24 };

    const out = amountBoxes(canvasMeasuringByLength(), { 'items.0.price': box } as never);

    expect(out['items.0.price' as never]).toEqual({ x: 100 + width - 3 * CHAR_PX, y: 240, w: 3 * CHAR_PX, h: 24 });
  });

  it('with a price box that is already only the amount, leaves it unchanged', () => {
    vi.spyOn(runs, 'textRunsOf').mockReturnValue([{ text: '5€', x: 0, y: 0, font: '20px x', align: 'left', baseline: 'top', width: 20 }]);
    const box = { x: 0, y: 0, w: 20, h: 24 };

    const out = amountBoxes(canvasMeasuringByLength(), { 'prices.0.amount': box, 'items.1.price': box } as never);

    expect([out['prices.0.amount' as never], out['items.1.price' as never]]).toEqual([box, box]);
  });
});
