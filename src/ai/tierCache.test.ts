import { describe, expect, it } from 'vitest';
import { tierCache } from './tierCache';

describe('tierCache', () => {
  it('after a failed load, loads again on the next call', async () => {
    const cache = tierCache<string, number>();
    let loads = 0;
    const load = (): Promise<number> => {
      loads += 1;
      return loads === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(loads);
    };
    await cache('embed', load).catch(() => undefined);

    const value = await cache('embed', load);

    expect([value, loads]).toEqual([2, 2]);
  });

  it('after a good load, reuses it without loading again', async () => {
    const cache = tierCache<string, number>();
    let loads = 0;
    const load = (): Promise<number> => Promise.resolve((loads += 1));
    await cache('embed', load);

    const value = await cache('embed', load);

    expect([value, loads]).toEqual([1, 1]);
  });
});
