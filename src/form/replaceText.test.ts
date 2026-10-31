import { describe, expect, it } from 'vitest';
import type { BlockText } from './docEdit';
import { applyMatches, findMatches } from './replaceText';

function texts(schedule: string, footer = ''): BlockText {
  return { title: '', titleBottom: '', script: '', venue: '', schedule, prices: '', includesHeading: '', includesItems: '', footer, itemDates: '', itemPasses: '', itemTimes: '' };
}

describe('findMatches', () => {
  it('with a lower-case search, matches every capitalised occurrence in every flier', () => {
    const all = [texts('Beginners | 19:00\nIntermediates | 20:00'), texts('Intermediates | 21:00', 'Intermediates welcome')];

    const found = findMatches(all, 'intermediates', 'Improvers', false);

    expect(found.map((m) => [m.flier, m.field])).toEqual([[0, 'schedule'], [1, 'schedule'], [1, 'footer']]);
  });

  it('with a match on the second line, reports that line before and after', () => {
    const all = [texts('Beginners | 19:00\nIntermediates | 20:00')];

    const [match] = findMatches(all, 'Intermediates', 'Improvers', false);

    expect([match.line, match.after]).toEqual(['Intermediates | 20:00', 'Improvers | 20:00']);
  });

  it('with Whole word only, skips a match inside a longer word', () => {
    const all = [texts('Intermediates | 20:00\nIntermediate | 21:00')];

    const found = findMatches(all, 'intermediate', 'Improver', true);

    expect(found.map((m) => m.line)).toEqual(['Intermediate | 21:00']);
  });

  it('with an empty search, finds nothing', () => {
    const all = [texts('Intermediates | 20:00')];

    const found = findMatches(all, '', 'x', false);

    expect(found).toEqual([]);
  });

  it('with regex characters in the search, matches them literally', () => {
    const all = [texts('5€ (cash) | hour')];

    const found = findMatches(all, '(cash)', 'card', false);

    expect(found).toHaveLength(1);
  });
});

describe('applyMatches', () => {
  it('with one of two matches in a field ticked, replaces only that one', () => {
    const all = [texts('Intermediates | 20:00\nIntermediates | 21:00')];
    const [, second] = findMatches(all, 'Intermediates', 'Improvers', false);

    const out = applyMatches(all, [second], 'Improvers');

    expect(out[0].schedule).toBe('Intermediates | 20:00\nImprovers | 21:00');
  });

  it('with every match in a field ticked, replaces them all and leaves the input untouched', () => {
    const all = [texts('Intermediates | 20:00\nIntermediates | 21:00')];
    const found = findMatches(all, 'intermediates', 'Improvers', false);

    const out = applyMatches(all, found, 'Improvers');

    expect([out[0].schedule, all[0].schedule]).toEqual(['Improvers | 20:00\nImprovers | 21:00', 'Intermediates | 20:00\nIntermediates | 21:00']);
  });
});
