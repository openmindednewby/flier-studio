import { describe, expect, it } from 'vitest';
import { p50 } from './tierStats';

describe('p50', () => {
  it('with an odd count, returns the middle value', () => {
    const ms = [3000, 1000, 2000];

    const median = p50(ms);

    expect(median).toBe(2000);
  });

  it('with an even count, returns the mean of the two middle values', () => {
    const ms = [4000, 1000, 3000, 2000];

    const median = p50(ms);

    expect(median).toBe(2500);
  });
});
