import { PictureAnchor } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { ShareError } from './ShareError';
import { MAX_LINK_CHARS, MAX_PAYLOAD_BYTES, decodeShare, encodeShare, packPayload, shareFragmentOf } from './shareCodec';

const SITE = 'https://fliers.dloizides.com/#share=';
const LINK_LIMIT = 8000;

describe('encodeShare', () => {
  it('with the 4-flier Kizomba set, makes a link under 8,000 characters', async () => {
    const docs = kizombaPreset();

    const { fragment } = await encodeShare(docs);

    expect((SITE + fragment).length).toBeLessThan(LINK_LIMIT);
  });

  it('with an uploaded picture, leaves it out and counts it', async () => {
    const docs = kizombaPreset().slice(0, 1);
    docs[0].picture = { imageId: 'picture-1700000000000', anchor: PictureAnchor.Bottom, scale: 1 };

    const { fragment, dropped } = await encodeShare(docs);

    const decoded = await decodeShare(fragment);
    expect(dropped).toBe(1);
    expect(decoded.ok && decoded.docs[0].picture).toBeUndefined();
  });
});

describe('decodeShare', () => {
  it('with a link made by encodeShare, returns the same fliers', async () => {
    const docs = kizombaPreset();
    const { fragment } = await encodeShare(docs);

    const decoded = await decodeShare(fragment);

    expect(decoded).toEqual({ ok: true, docs, dropped: 0 });
  });

  it('with characters changed in the middle, refuses the link', async () => {
    const { fragment } = await encodeShare(kizombaPreset());
    const middle = Math.floor(fragment.length / 2);
    const tampered = fragment.slice(0, middle) + 'zzzzzz' + fragment.slice(middle + 6);

    const decoded = await decodeShare(tampered);

    expect(decoded.ok).toBe(false);
  });

  it('with a fragment over the length cap, refuses it as too long', async () => {
    const fragment = 'A'.repeat(MAX_LINK_CHARS + 1);

    const decoded = await decodeShare(fragment);

    expect(decoded).toEqual({ ok: false, error: ShareError.TooLong });
  });

  it('with a payload that inflates past the byte cap, refuses it as too long', async () => {
    const fragment = await packPayload({ v: 1, dropped: 0, docs: [], pad: 'x'.repeat(MAX_PAYLOAD_BYTES + 1) });

    const decoded = await decodeShare(fragment);

    expect(decoded).toEqual({ ok: false, error: ShareError.TooLong });
  });

  it('with an older version field, refuses it as another version', async () => {
    const fragment = await packPayload({ v: 0, dropped: 0, docs: kizombaPreset() });

    const decoded = await decodeShare(fragment);

    expect(decoded).toEqual({ ok: false, error: ShareError.Version });
  });

  it('with a flier that breaks the schema, refuses the whole set', async () => {
    const docs: unknown[] = kizombaPreset();
    docs.push({ version: 1, format: 'poster', blocks: {} });
    const fragment = await packPayload({ v: 1, dropped: 0, docs });

    const decoded = await decodeShare(fragment);

    expect(decoded).toEqual({ ok: false, error: ShareError.NotFlier });
  });

  it('with a flier pointing at an uploaded image id, refuses the set', async () => {
    const docs = kizombaPreset();
    docs[0].logo = { imageId: 'logo-1700000000000' };
    const fragment = await packPayload({ v: 1, dropped: 0, docs });

    const decoded = await decodeShare(fragment);

    expect(decoded).toEqual({ ok: false, error: ShareError.NotFlier });
  });
});

describe('shareFragmentOf', () => {
  it('with a share hash, returns the payload; with another hash, returns null', () => {
    const hashes = ['#share=abc', '#other', ''];

    const found = hashes.map(shareFragmentOf);

    expect(found).toEqual(['abc', null, null]);
  });
});
