import { describe, expect, it } from 'vitest';
import { FM } from './fm';
import { plural } from './plural';

describe('plural', () => {
  it('with one match, uses the singular form', () => {
    const n = 1;

    const text = plural('replace.matches', n);

    expect(text).toBe('1 match');
  });

  it('with zero fliers, uses the plural form', () => {
    const n = 0;

    const text = plural('replace.fliers', n);

    expect(text).toBe('0 fliers');
  });

  it('with one replaced match, the done message says 1 match', () => {
    const n = 1;

    const text = FM('replace.done', plural('replace.matches', n));

    expect(text).toBe('Replaced 1 match. Drafts can undo it.');
  });
});
