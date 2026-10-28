import { BackgroundStyle, FontSetId, PaletteId } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { splitDoc } from './flierTheme';
import { GOLDEN_HOUR, KIZOMBA_CLASSIC, themeById } from './themes';

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

  it('with the workshop fliers, closes the gap under the header by 64 and leaves the date script size alone', () => {
    const workshops = kizombaPreset().filter((d) => d.items === undefined).map((d) => splitDoc(d).content);

    const tunings = workshops.map((c) => GOLDEN_HOUR.styleFor(c).tuning);

    expect(tunings).toEqual(workshops.map(() => ({ headerGap: 64 })));
  });

  it('with the upcoming list flier, sets the date scripts 15% larger', () => {
    const list = kizombaPreset().filter((d) => d.items !== undefined).map((d) => splitDoc(d).content);

    const tunings = list.map((c) => GOLDEN_HOUR.styleFor(c).tuning);

    expect(tunings).toEqual([{ itemDateScale: 1.15 }]);
  });

  it('with Kizomba classic, carries no tuning', () => {
    const contents = kizombaPreset().map((d) => splitDoc(d).content);

    const tunings = contents.map((c) => KIZOMBA_CLASSIC.styleFor(c).tuning);

    expect(tunings).toEqual(contents.map(() => undefined));
  });

  it('with the id golden-hour, finds the theme', () => {
    const found = themeById('golden-hour');

    expect(found?.nameKey).toBe('themes.goldenHour');
  });
});
