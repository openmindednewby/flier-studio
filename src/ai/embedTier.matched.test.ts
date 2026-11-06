import { describe, expect, it } from 'vitest';
import { createEmbedTier } from './embedTier';

const PROMPT = 'warm';
const SAND_EXAMPLE = 'warm beige neutral tones';
const NEAR = [1, 0];
const FAR = [0, 1];

describe('createEmbedTier', () => {
  it('with a prompt that matches the fallback palette, reports the palette as matched', async () => {
    const tier = createEmbedTier((text) => Promise.resolve(text === PROMPT || text === SAND_EXAMPLE ? NEAR : FAR));

    const s = await tier.config(PROMPT);

    expect([s.palette, s.matched]).toEqual(['sand', ['palette']]);
  });

  it('with no example above the threshold, keeps the fallbacks and matches nothing', async () => {
    const tier = createEmbedTier((text) => Promise.resolve(text === PROMPT ? NEAR : FAR));

    const s = await tier.config(PROMPT);

    expect([s.palette, s.matched]).toEqual(['sand', []]);
  });

  it('with a score exactly at the threshold, does not match', async () => {
    const atThreshold = [1, 1, 0, 0];
    const example = [1, 0, 1, 0];
    const tier = createEmbedTier((text) => Promise.resolve(text === PROMPT ? atThreshold : text === SAND_EXAMPLE ? example : [0, 0, 0, 1]));

    const s = await tier.config(PROMPT);

    expect(s.matched).toEqual([]);
  });

  it('with only one fragment near an example, matches through that fragment', async () => {
    const prompt = `other words, ${PROMPT}`;
    const near = [1, 0, 0];
    const example = [0, 1, 0];
    const unrelated = [0, 0, 1];
    const tier = createEmbedTier((text) => Promise.resolve(text === PROMPT || text === SAND_EXAMPLE ? near : text.startsWith('other') ? unrelated : example));

    const s = await tier.config(prompt);

    expect(s.matched).toEqual(['palette']);
  });

  it('with two labels near the prompt, picks the closer one', async () => {
    const closer = [1, 0];
    const further = [1, 1];
    const vectors: Record<string, number[] | undefined> = { [PROMPT]: [1, 0], 'dark black evening colours': further, 'blue ocean colours': closer };
    const tier = createEmbedTier((text) => Promise.resolve(vectors[text] ?? FAR));

    const s = await tier.config(PROMPT);

    expect(s.palette).toBe('sea');
  });

  it('with an embedding failure on the prompt, rejects so the caller reports the model failed', async () => {
    const tier = createEmbedTier((text) => (text === PROMPT ? Promise.reject(new Error('boom')) : Promise.resolve(FAR)));

    const settings = tier.config(PROMPT);

    await expect(settings).rejects.toThrow('boom');
  });

  it('with an embedding failure on an example, rejects with that failure', async () => {
    const tier = createEmbedTier(() => Promise.reject(new Error('boom')));

    const settings = tier.config(PROMPT);

    await expect(settings).rejects.toThrow('boom');
  });
});
