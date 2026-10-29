import { BackgroundStyle, FontSetId, LayoutId, PaletteId, RowIcon } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { splitDoc } from './flierTheme';
import { KIZOMBA_SAMPLE, themeById } from './themes';

const workshops = (): ReturnType<typeof splitDoc>['content'][] => kizombaPreset().filter((d) => d.items === undefined).map((d) => splitDoc(d).content);

describe('KIZOMBA_SAMPLE.styleFor', () => {
  it('with each Kizomba flier, uses the sample palette, sample fonts, a plain backdrop and the couple picture', () => {
    const contents = kizombaPreset().map((d) => splitDoc(d).content);

    const styles = contents.map((c) => KIZOMBA_SAMPLE.styleFor(c));

    expect(styles.map((s) => [s.palette, s.fonts, s.background, s.picture?.imageId])).toEqual(
      contents.map(() => [PaletteId.KizombaSample, FontSetId.KizombaSample, BackgroundStyle.Solid, 'couple']));
  });

  it('with each Kizomba flier, keeps the poster logo slot', () => {
    const docs = kizombaPreset();

    const logos = docs.map((d) => KIZOMBA_SAMPLE.styleFor(splitDoc(d).content).logo);

    expect(logos).toEqual(docs.map((d) => d.logo));
  });

  it('with the workshop fliers, draws picture right with the measured header, icons and dividers, and the real photo not grown over the text', () => {
    const contents = workshops();

    const styles = contents.map((c) => KIZOMBA_SAMPLE.styleFor(c));

    expect(styles.map((s) => [s.layout, s.tuning, s.rows, s.picture?.overlap])).toEqual(contents.map(() => [
      LayoutId.PictureRight,
      { headerTop: 113, titleScriptGap: 13, scriptTitleGap: 25, titleScale: 0.82, titleBottomScale: 0.82 },
      { icons: { schedule: [RowIcon.Person, RowIcon.People], prices: [RowIcon.Ticket], size: 106 }, dividers: { thickness: 2, toPicture: true }, priceLabelScale: 0.62, venue: { body: true, bare: true } },
      undefined,
    ]));
  });

  it('with the id kizomba-sample, finds the theme', () => {
    const found = themeById('kizomba-sample');

    expect(found?.nameKey).toBe('themes.kizombaSample');
  });
});
