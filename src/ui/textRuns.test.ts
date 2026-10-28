import { describe, expect, it } from 'vitest';
import { lineBox, type TextRun } from './textRuns';

const run = (align: string, baseline: string): TextRun => ({ text: 'Intermediates', x: 200, y: 100, font: '600 40px Inter', align, baseline, width: 120 });

describe('lineBox', () => {
  it('with centred text on a middle baseline, centres the box on x and y', () => {
    const line = run('center', 'middle');

    const box = lineBox(line);

    expect(box).toEqual({ x: 140, y: 80, width: 120, height: 40 });
  });

  it('with left text on the alphabetic baseline, puts the box top one ascent above y', () => {
    const line = run('left', 'alphabetic');

    const box = lineBox(line);

    expect(box).toEqual({ x: 200, y: 68, width: 120, height: 40 });
  });
});
