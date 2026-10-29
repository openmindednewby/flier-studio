import { describe, expect, it } from 'vitest';
import { hasWebGpuAdapter } from '@dloizides/text-generation';

describe('hasWebGpuAdapter', () => {
  it('with navigator.gpu present but no adapter, returns false', async () => {
    const nav = { gpu: { requestAdapter: async () => null } };

    const result = await hasWebGpuAdapter(nav);

    expect(result).toBe(false);
  });

  it('with no navigator.gpu, returns false', async () => {
    const nav = {};

    const result = await hasWebGpuAdapter(nav);

    expect(result).toBe(false);
  });

  it('with requestAdapter throwing, returns false', async () => {
    const nav = { gpu: { requestAdapter: async () => { throw new Error('blocked'); } } };

    const result = await hasWebGpuAdapter(nav);

    expect(result).toBe(false);
  });

  it('with an adapter, returns true', async () => {
    const nav = { gpu: { requestAdapter: async () => ({ name: 'adapter' }) } };

    const result = await hasWebGpuAdapter(nav);

    expect(result).toBe(true);
  });
});
