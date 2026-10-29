import { describe, expect, it } from 'vitest';
import { createEmbedTier } from './embedTier';

const PROMPT = 'warm';
const SAND_EXAMPLE = 'warm beige neutral tones';
const NEAR = [1, 0];
const FAR = [0, 1];

describe('createEmbedTier', () => {
  it('with a prompt that matches the fallback palette, reports the palette as matched', async () => {
    const tier = createEmbedTier((text) => Promise.resolve(text === PROMPT || text === SAND_EXAMPLE ? NEAR : FAR));

    const s = await tier.settings(PROMPT);

    expect([s.palette, s.matched]).toEqual(['sand', ['palette']]);
  });
});
