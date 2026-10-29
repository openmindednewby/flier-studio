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
      { headerTop: 113, titleScriptGap: -40, scriptTitleGap: 8, titleScale: 0.68, titleBottomScale: 1.1, titleSpacing: -0.03, scriptScale: 1, headerTextWidth: 715, bodyTop: 595, headerHeight: 600 },
      { icons: { schedule: [RowIcon.Person, RowIcon.People], prices: [RowIcon.Ticket], size: 106 }, dividers: { thickness: 5, lengths: [668, 572, 480, 390, 366] }, priceLabelScale: 0.62, venue: { body: true, bare: true, oneLine: true, pinSize: 91, pinGap: 16, pinShift: -8, centred: true }, priceGap: -17, labelScale: 0.92, timeScale: 0.95, timeWeight: 500, textWidth: 660 },
      undefined,
    ]));
  });

  it('with the upcoming workshops list, sets 5px dividers, the body-face venue with a bare pin and room under the script', () => {
    const list = kizombaPreset().filter((d) => d.items !== undefined).map((d) => splitDoc(d).content);

    const styles = list.map((c) => KIZOMBA_SAMPLE.styleFor(c));

    expect(styles.map((s) => ({ tuning: s.tuning, rows: s.rows }))).toEqual(list.map(() => ({ tuning: { scriptTitleGap: 24, bodyTop: 523, headerHeight: 507 }, rows: { dividers: { thickness: 5 }, venue: { body: true, bare: true, oneLine: true }, textWidth: 640 } })));
  });

  it('with the id kizomba-sample, finds the theme', () => {
    const found = themeById('kizomba-sample');

    expect(found?.nameKey).toBe('themes.kizombaSample');
  });
});
