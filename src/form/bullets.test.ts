import type { FlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { applyText, blocksToText } from './docEdit';
import { withBullets } from './bullets';

const doc = { version: 1, blocks: { title: 'KIZOMBA' } } as unknown as FlierDoc;

describe('withBullets', () => {
  it('with bullets turned off, sets bullets false', () => {
    const on = doc;

    const next = withBullets(on, false);

    expect(next.bullets).toBe(false);
  });

  it('with bullets turned back on, drops the field', () => {
    const off = { ...doc, bullets: false };

    const next = withBullets(off, true);

    expect('bullets' in next).toBe(false);
  });
});

describe('applyText footer', () => {
  it('with a two-line footer, keeps both lines', () => {
    const text = { ...blocksToText(doc), footer: 'with Jimmy\nwww.bailemos.cy\n' };

    const next = applyText(doc, text);

    expect(next.blocks.footer).toBe('with Jimmy\nwww.bailemos.cy');
  });
});
