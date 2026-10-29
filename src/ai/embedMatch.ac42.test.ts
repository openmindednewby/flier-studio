import { describe, expect, it } from 'vitest';
import { cosine, pickLabel } from './embedMatch';

describe('cosine', () => {
  it('with two equal vectors, returns 1', () => {
    const v = [0.6, 0.8];

    const c = cosine(v, v);

    expect(c).toBeCloseTo(1);
  });
});

describe('pickLabel', () => {
  it('with one label above the threshold, picks that label', () => {
    const labelled = [{ label: 'night', vectors: [[1, 0]] }, { label: 'sea', vectors: [[0, 1]] }];

    const label = pickLabel([0.9, 0.1], labelled, 0.5, 'sand');

    expect(label).toBe('night');
  });

  it('with no label above the threshold, returns the default', () => {
    const labelled = [{ label: 'night', vectors: [[1, 0]] }];

    const label = pickLabel([0, 1], labelled, 0.5, 'sand');

    expect(label).toBe('sand');
  });
});
