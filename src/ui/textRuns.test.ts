import { describe, expect, it } from 'vitest';
import { lineBox, type TextRun } from './textRuns';

describe('lineBox', () => {
  it('with centred text on a middle baseline, centres the box on x and y', () => {
    const line: TextRun = { text: 'Intermediates', x: 200, y: 100, font: '600 40px Inter', align: 'center', baseline: 'middle', width: 120 };

    const box = lineBox(line);

    expect(box).toEqual({ x: 140, y: 80, width: 120, height: 40 });
  });

  it('with left text on the alphabetic baseline, puts the box top one ascent above y', () => {
    const line: TextRun = { text: 'Intermediates', x: 200, y: 100, font: '600 40px Inter', align: 'left', baseline: 'alphabetic', width: 120 };

    const box = lineBox(line);

    expect(box).toEqual({ x: 200, y: 68, width: 120, height: 40 });
  });
});
