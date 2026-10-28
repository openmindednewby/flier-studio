import { PaletteId, kizombaWorkshopDocs } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { cloneDocs } from '../presets/kizomba';
import { splitDoc, toDoc, toThemed } from './flierTheme';
import { ThemeId } from './ThemeId';
import { KIZOMBA_CLASSIC, themeById } from './themes';

describe('toThemed', () => {
  it('with a doc saved before themes, stores it as content plus the Kizomba classic theme', () => {
    const old = cloneDocs(kizombaWorkshopDocs)[0];

    const flier = toThemed(old);

    expect(flier.themeId).toBe('kizomba-classic');
    expect(Object.keys(flier.content).sort()).toEqual(['blocks', 'format', 'version']);
    expect(Object.keys(flier.style).sort()).toEqual(['background', 'fonts', 'layout', 'logo', 'palette', 'picture']);
  });

  it('with every preset doc, joins back to a doc equal to the original', () => {
    const docs = cloneDocs(kizombaWorkshopDocs);

    const joined = docs.map((d) => toDoc(toThemed(d)));

    expect(joined).toEqual(docs);
  });

  it('with a doc whose palette the owner changed, keeps that palette', () => {
    const old = { ...cloneDocs(kizombaWorkshopDocs)[1], palette: PaletteId.Night };

    const doc = toDoc(toThemed(old));

    expect(doc.palette).toBe('night');
  });
});

describe('splitDoc', () => {
  it('with a doc without picture or logo, leaves those style keys out', () => {
    const { picture: _p, logo: _l, ...bare } = cloneDocs(kizombaWorkshopDocs)[0];

    const { style } = splitDoc(bare);

    expect('picture' in style || 'logo' in style).toBe(false);
  });
});

describe('KIZOMBA_CLASSIC', () => {
  it('with event and list content, gives the style the preset fliers were drawn with', () => {
    const docs = cloneDocs(kizombaWorkshopDocs);

    const styles = docs.map((d) => KIZOMBA_CLASSIC.styleFor(splitDoc(d).content));

    expect(styles).toEqual(docs.map((d) => splitDoc(d).style));
  });
});

describe('themeById', () => {
  it('with a theme 2 passed in the registry, finds it without any change to the flier shape', () => {
    const golden = { id: 'golden-hour', nameKey: 'themes.goldenHour', styleFor: KIZOMBA_CLASSIC.styleFor };

    const found = themeById('golden-hour', [KIZOMBA_CLASSIC, golden]);

    expect(found).toBe(golden);
    expect(themeById(ThemeId.KizombaClassic)).toBe(KIZOMBA_CLASSIC);
  });
});
