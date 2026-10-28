import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { SHARE_VERSION, decodeShare, encodeShare, packPayload } from './shareCodec';

describe('share link theme ids', () => {
  it('with theme ids encoded, decodes the same theme ids', async () => {
    const themes = ['golden-hour', 'golden-hour', 'kizomba-classic', 'golden-hour'];
    const { fragment } = await encodeShare(kizombaPreset(), themes);

    const decoded = await decodeShare(fragment);

    expect(decoded.ok ? decoded.themes : null).toEqual(themes);
  });

  it('with a v1 link made before themes, opens with no theme ids', async () => {
    const fragment = await packPayload({ v: SHARE_VERSION, dropped: 0, docs: kizombaPreset() });

    const decoded = await decodeShare(fragment);

    expect(decoded.ok ? decoded.themes : 'refused').toBeUndefined();
  });

  it('with fewer theme ids than fliers, refuses the link', async () => {
    const fragment = await packPayload({ v: SHARE_VERSION, dropped: 0, docs: kizombaPreset(), themes: ['golden-hour'] });

    const decoded = await decodeShare(fragment);

    expect(decoded.ok).toBe(false);
  });

  it('with a theme id that is not a short string, refuses the link', async () => {
    const docs = kizombaPreset();
    const fragment = await packPayload({ v: SHARE_VERSION, dropped: 0, docs, themes: docs.map(() => 'x'.repeat(65)) });

    const decoded = await decodeShare(fragment);

    expect(decoded.ok).toBe(false);
  });
});
