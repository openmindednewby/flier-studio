import { kizombaWorkshopDocs, render } from '@dloizides/poster-render';
import { describe, expect, it, vi } from 'vitest';
import type { FontLoader } from './fonts';
import { renderPreviews } from './previews';

vi.mock('@dloizides/poster-render', async (original) => ({ ...(await original<object>()), render: vi.fn() }));

describe('renderPreviews', () => {
  it('with the fonts still loading, does not draw any canvas until they have loaded', async () => {
    let release = (): void => undefined;
    const gate = new Promise<void>((r) => { release = r; });
    const loader: FontLoader = { load: () => gate };
    const container = document.createElement('div');

    const drawn = renderPreviews(container, kizombaWorkshopDocs, {}, { selected: 0, select: () => undefined, fonts: loader });
    await Promise.resolve();
    const callsBeforeFonts = vi.mocked(render).mock.calls.length;
    release();
    await drawn;

    expect([callsBeforeFonts, vi.mocked(render).mock.calls.length]).toEqual([0, kizombaWorkshopDocs.length]);
  });
});
