import { BackgroundStyle, FontSetId, LayoutId, PaletteId, type FlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { toDoc, toThemed, type FlierStyle } from '../theme/flierTheme';
import type { FlierTheme } from '../theme/themes';
import { EditScope } from './EditScope';
import { applyTheme, withDocs } from './themeScope';

const night: FlierTheme = {
  id: 'night-test',
  nameKey: 'themes.nightTest',
  styleFor: (): FlierStyle => ({ layout: LayoutId.PictureLeft, palette: PaletteId.Night, fonts: FontSetId.Modern, background: BackgroundStyle.Solid }),
};
const keptOnly: FlierTheme = { id: 'kizomba-classic', nameKey: 'themes.kizombaClassic', styleFor: () => { throw new Error('kept style expected'); } };
const texts = (docs: FlierDoc[]): string[] => docs.map((d) => JSON.stringify({ format: d.format, blocks: d.blocks, items: d.items }));

describe('applyTheme', () => {
  it('with All, restyles every flier and keeps every text byte-identical', () => {
    const fliers = kizombaPreset().map((d) => toThemed(d));

    const out = applyTheme(EditScope.All, fliers, 0, night);

    expect(out.map((f) => f.themeId)).toEqual(Array(4).fill('night-test'));
    expect(out.map((f) => f.style.palette)).toEqual(Array(4).fill('night'));
    expect(texts(out.map(toDoc))).toEqual(texts(fliers.map(toDoc)));
  });

  it('with This, restyles only the selected flier', () => {
    const fliers = kizombaPreset().map((d) => toThemed(d));

    const out = applyTheme(EditScope.This, fliers, 2, night);

    expect(out.map((f) => f.themeId)).toEqual(['kizomba-classic', 'kizomba-classic', 'night-test', 'kizomba-classic']);
  });

  it('with a switch to another theme and back, restores the original docs exactly', () => {
    const docs = kizombaPreset();
    docs[1].palette = PaletteId.Night;
    const fliers = docs.map((d) => toThemed(d));

    const back = applyTheme(EditScope.All, applyTheme(EditScope.All, fliers, 0, night), 0, keptOnly);

    expect(back.map(toDoc)).toEqual(docs);
  });
});

describe('withDocs', () => {
  it('with an edited doc, keeps each flier on its theme and keeps its remembered styles', () => {
    const fliers = applyTheme(EditScope.This, kizombaPreset().map((d) => toThemed(d)), 0, night);
    const docs = fliers.map(toDoc);
    docs[0].blocks.title = 'SALSA';

    const out = withDocs(fliers, docs);

    expect(out[0].themeId).toBe('night-test');
    expect(out[0].content.blocks.title).toBe('SALSA');
    expect(out[0].kept?.['kizomba-classic']?.palette).toBe('sand');
  });
});
