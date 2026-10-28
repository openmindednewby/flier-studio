import { describe, expect, it } from 'vitest';
import { anchorOptions } from './schemaOptions';
import { FM } from '../i18n/fm';
import { scalePercent } from './pictureScale';

describe('scalePercent', () => {
  it('with a full-size picture, returns "100%"', () => {
    const text = scalePercent(1);

    expect(text).toBe('100%');
  });

  it('with a fractional step, rounds to a whole percent', () => {
    const text = scalePercent(0.55);

    expect(text).toBe('55%');
  });
});

describe('anchor option labels', () => {
  it('for every picture alignment, has a label that says it is within the picture area', () => {
    const labels = anchorOptions().map((o) => FM(`form.anchors.${o}`));

    expect(labels).toEqual(['Top of its area', 'Middle of its area', 'Bottom of its area']);
  });
});
