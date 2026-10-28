import { DEFAULT_MOTION } from '@dloizides/design-tokens';
import type { LogoTimeline } from '@dloizides/ui-motion/logo';
import { describe, expect, it } from 'vitest';
import { LOGO_INTRO, LOGO_MICRO, claimIntro } from './logoMotion';

const memoryStorage = (): Pick<Storage, 'getItem' | 'setItem'> => {
  const items = new Map<string, string>();
  return { getItem: (k) => items.get(k) ?? null, setItem: (k, v) => void items.set(k, v) };
};

const endOf = (beats: LogoTimeline): number =>
  Math.max(...beats.map((b) => (typeof b.duration === 'number' ? b.duration : DEFAULT_MOTION.durations[b.duration]) + (b.delay ?? 0)));

describe('claimIntro', () => {
  it('with a fresh session then a second call, plays once', () => {
    const storage = memoryStorage();

    const calls = [claimIntro(storage), claimIntro(storage)];

    expect(calls).toEqual([true, false]);
  });
});

describe('logo timelines', () => {
  it('with the brand motion file, the intro ends within 1200 ms and the micro within 300 ms', () => {
    const introCap = 1200;
    const microCap = 300;

    const ends = [endOf(LOGO_INTRO), endOf(LOGO_MICRO)];

    expect([ends[0] <= introCap, ends[1] <= microCap]).toEqual([true, true]);
  });
});
