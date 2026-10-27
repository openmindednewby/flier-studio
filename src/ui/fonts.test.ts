import { describe, expect, it, vi } from 'vitest';
import { FONT_FACES, fontsReady, type FontLoader } from './fonts';

function deferredLoader(): { loader: FontLoader; release: () => void; asked: string[] } {
  const asked: string[] = [];
  let release = (): void => undefined;
  const gate = new Promise<void>((r) => { release = r; });
  return { loader: { load: (font: string) => { asked.push(font); return gate; } }, release: () => release(), asked };
}

describe('fontsReady', () => {
  it('with a fresh loader, asks for every self-hosted face', async () => {
    const loader: FontLoader = { load: vi.fn(() => Promise.resolve([])) };

    await fontsReady(loader);

    expect(vi.mocked(loader.load).mock.calls.map((c) => c[0])).toEqual([...FONT_FACES]);
  });

  it('with faces still downloading, stays pending until they load', async () => {
    const { loader, release } = deferredLoader();
    const done = vi.fn();

    void fontsReady(loader).then(done);
    await Promise.resolve();
    const before = done.mock.calls.length;
    release();
    await fontsReady(loader);

    expect([before, done.mock.calls.length]).toEqual([0, 1]);
  });

  it('with a face that fails to download, still resolves so the flier draws with the fallback', async () => {
    const loader: FontLoader = { load: () => Promise.reject(new Error('offline')) };

    const result = fontsReady(loader);

    await expect(result).resolves.toBeUndefined();
  });
});
