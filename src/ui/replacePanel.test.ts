import { describe, expect, it } from 'vitest';
import type { ReplaceMatch } from '../form/replaceText';
import { MARKS_EVENT, drawMarks } from './replacePanel';

describe('drawMarks', () => {
  it('with a match whose flier is not on the grid, reports 0 highlighted, not the match count', () => {
    const grid = document.createElement('div');
    const match: ReplaceMatch = { flier: 0, field: 'title', at: 0, length: 13, line: 'Intermediates', after: 'Improvers' };
    let highlighted = -1;
    document.addEventListener(MARKS_EVENT, (e) => { highlighted = (e as CustomEvent<number>).detail; });

    drawMarks(grid, [match], () => true, 'Intermediates');

    expect(highlighted).toBe(0);
  });
});
