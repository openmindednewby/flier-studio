import { describe, expect, it } from 'vitest';
import { presetBodyText } from './presetDialog';

describe('presetBodyText', () => {
  it('with one flier on screen, names it in the singular and never says all 1', () => {
    const counts: [number, number] = [1, 6];

    const text = presetBodyText(counts);

    expect(text).toBe('Add keeps your 1 flier and puts the 6 samples after them. Replace swaps your 1 flier; Drafts keeps a copy.');
  });

  it('with four fliers on screen, says Replace swaps all 4', () => {
    const counts: [number, number] = [4, 6];

    const text = presetBodyText(counts);

    expect(text).toBe('Add keeps your 4 fliers and puts the 6 samples after them. Replace swaps all 4; Drafts keeps a copy.');
  });
});
