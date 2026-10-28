import { BackgroundStyle, FontSetId, PaletteId } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { splitDoc } from './flierTheme';
import { GOLDEN_HOUR, themeById } from './themes';

describe('GOLDEN_HOUR.styleFor', () => {
  it('with each Kizomba flier, uses the golden horizon palette, coastal fonts, horizon sky and the couple picture', () => {
    const contents = kizombaPreset().map((d) => splitDoc(d).content);

    const styles = contents.map((c) => GOLDEN_HOUR.styleFor(c));

    expect(styles.map((s) => [s.palette, s.fonts, s.background, s.picture?.imageId])).toEqual(
      contents.map(() => [PaletteId.GoldenHorizon, FontSetId.Coastal, BackgroundStyle.Horizon, 'couple']));
  });

  it('with each Kizomba flier, keeps the poster logo slot of Kizomba classic', () => {
    const docs = kizombaPreset();

    const logos = docs.map((d) => GOLDEN_HOUR.styleFor(splitDoc(d).content).logo);

    expect(logos).toEqual(docs.map((d) => d.logo));
  });

  it('with the id golden-hour, finds the theme', () => {
    const found = themeById('golden-hour');

    expect(found?.nameKey).toBe('themes.goldenHour');
  });
});
