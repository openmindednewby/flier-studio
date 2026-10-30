import { describe, expect, it } from 'vitest';
import { fieldOf, sectionAt } from './posterSections';

describe('sectionAt', () => {
  it('with a point inside two boxes, returns the smaller box', () => {
    const boxes = { title: { x: 0, y: 0, w: 100, h: 100 }, script: { x: 10, y: 10, w: 20, h: 20 } };

    const line = sectionAt(boxes, 15, 15);

    expect(line).toBe('script');
  });

  it('with a point outside every box, returns undefined', () => {
    const boxes = { title: { x: 0, y: 0, w: 10, h: 10 }, footer: undefined };

    const line = sectionAt(boxes, 50, 50);

    expect(line).toBeUndefined();
  });
});

describe('fieldOf', () => {
  it('with the title line, returns the title field', () => {
    const line = 'title';

    const field = fieldOf(line);

    expect(field).toBe('title');
  });

  it('with no line, returns undefined', () => {
    const field = fieldOf(undefined);

    expect(field).toBeUndefined();
  });
});
