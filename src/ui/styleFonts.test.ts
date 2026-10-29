import { describe, expect, it } from 'vitest';
import { FONT_FACES } from './fonts';
import { STYLE_FONTS } from './styleFonts';

const SCRIPTS = ['Sofia', 'Satisfy', 'Montez', 'Style Script', 'Dancing Script', 'Sacramento'];

describe('STYLE_FONTS', () => {
  it('with the D39 script faces, offers every one to each text', () => {
    const missing = SCRIPTS.filter((font) => !STYLE_FONTS.includes(font));

    expect(missing).toEqual([]);
  });

  it('with every offered face, loads it before drawing', () => {
    const unloaded = STYLE_FONTS.filter((font) => !FONT_FACES.some((face) => face.endsWith(`"${font}"`)));

    expect(unloaded).toEqual([]);
  });
});
