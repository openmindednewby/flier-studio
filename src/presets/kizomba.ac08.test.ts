import { LayoutId, validateFlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { KIZOMBA_ASSET_URLS, kizombaPreset } from './kizomba';

describe('kizombaPreset', () => {
  it('with the 2026-10-27 workshops, holds 3 event fliers and 1 list flier, all schema-valid', () => {
    const docs = kizombaPreset();

    expect(docs.map((d) => d.layout)).toEqual([LayoutId.PictureRight, LayoutId.PictureRight, LayoutId.PictureRight, LayoutId.List]);
    expect(docs.every((d) => validateFlierDoc(d).ok)).toBe(true);
  });

  it('with each workshop, carries its date, both level times and its party price', () => {
    const expected = [
      ['Saturday 31 October', '20:00 - 21:00', '21:00 - 22:00', '20€'],
      ['Saturday 7 November', '20:00 - 21:00', '21:00 - 22:00', '15€'],
      ['Sunday 29 November', '17:00 - 18:00', '18:00 - 19:00', '10€'],
    ];

    const actual = kizombaPreset().slice(0, 3).map((d) => [d.blocks.script, d.blocks.schedule?.[0].time, d.blocks.schedule?.[1].time, d.blocks.prices?.[1].amount]);

    expect(actual).toEqual(expected);
  });

  it('with every flier, shows 5€ per hour and the three party-pass items', () => {
    const docs = kizombaPreset();

    const events = docs.slice(0, 3);

    expect(events.every((d) => d.blocks.prices?.[0].amount === '5€' && d.blocks.prices[0].label === 'per hour')).toBe(true);
    expect(docs.every((d) => d.blocks.includes?.items.join('|') === 'Salsa & Bachata room|Kizomba dedicated room|2 drinks')).toBe(true);
  });

  it('with the list flier, lists the three dates with their party prices', () => {
    const list = kizombaPreset()[3];

    const rows = list.items?.map((i) => [i.date, i.price]);

    expect(rows).toEqual([['Sat 31 Oct', 'Party pass 20€'], ['Sat 7 Nov', 'Party pass 15€'], ['Sun 29 Nov', 'Party pass 10€']]);
  });

  it('with the bundled assets, names the dancers picture and the logo the docs reference', () => {
    const doc = kizombaPreset()[0];

    const urls = [KIZOMBA_ASSET_URLS[doc.picture?.imageId ?? ''], KIZOMBA_ASSET_URLS[doc.logo?.imageId ?? '']];

    expect(urls).toEqual(['/img/dancers.png', '/img/logo.png']);
  });

  it('with two calls, returns independent copies so edits never leak into the preset', () => {
    const first = kizombaPreset();
    first[0].blocks.title = 'SALSA';

    const second = kizombaPreset();

    expect(second[0].blocks.title).toBe('KIZOMBA');
  });
});
