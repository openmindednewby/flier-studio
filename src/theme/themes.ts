import { BackgroundStyle, FontSetId, LayoutId, PaletteId, PictureAnchor, RowIcon, defaultLayoutFor, kizombaWorkshopDocs } from '@dloizides/poster-render';
import { layoutsFor } from '../form/layoutOptions';
import { splitDoc, type FlierContent, type FlierStyle } from './flierTheme';
import { ThemeId } from './ThemeId';

/** A poster theme: only style, chosen per flier from that flier's content. */
export interface FlierTheme {
  id: string;
  nameKey: string;
  styleFor(content: FlierContent): FlierStyle;
}

const EVENT_DOC = 0;
const LIST_DOC = 3;
const GOLDEN_HEADER_GAP = 64;
const GOLDEN_DATE_SCALE = 1.15;

function classicStyle(content: FlierContent): FlierStyle {
  const { style } = splitDoc(kizombaWorkshopDocs[content.items === undefined ? EVENT_DOC : LIST_DOC]);
  const fits = layoutsFor(content.format).some((entry) => entry.id === style.layout);
  return { ...style, layout: fits ? style.layout : defaultLayoutFor(content.format) };
}

export const KIZOMBA_CLASSIC: FlierTheme = { id: ThemeId.KizombaClassic, nameKey: 'themes.kizombaClassic', styleFor: classicStyle };

function goldenStyle(content: FlierContent): FlierStyle {
  const classic = classicStyle(content);
  const fits = classic.layout !== LayoutId.List && layoutsFor(content.format).some((entry) => entry.id === LayoutId.PictureRight);
  return {
    ...classic,
    layout: fits ? LayoutId.PictureRight : classic.layout,
    palette: PaletteId.GoldenHorizon,
    fonts: FontSetId.Coastal,
    background: BackgroundStyle.Horizon,
    picture: { imageId: 'couple', anchor: PictureAnchor.Bottom, scale: 1 },
    tuning: content.items === undefined ? { headerGap: GOLDEN_HEADER_GAP } : { itemDateScale: GOLDEN_DATE_SCALE },
  };
}

export const GOLDEN_HOUR: FlierTheme = { id: ThemeId.GoldenHour, nameKey: 'themes.goldenHour', styleFor: goldenStyle };

const SAMPLE_HEADER = { headerTop: 113, titleScriptGap: -40, scriptTitleGap: 8, titleScale: 0.68, titleBottomScale: 1.1, titleSpacing: -0.03, scriptScale: 1, headerTextWidth: 715, bodyTop: 595, headerHeight: 600 };
const SAMPLE_ROWS = { icons: { schedule: [RowIcon.Person, RowIcon.People], prices: [RowIcon.Ticket], size: 106 }, dividers: { thickness: 5, lengths: [668, 572, 480, 390, 366] }, priceLabelScale: 0.62, venue: { body: true, bare: true, oneLine: true, pinSize: 91, pinGap: 16, pinShift: -8, centred: true }, priceGap: -17, labelScale: 0.92, timeScale: 0.95, timeWeight: 500, textWidth: 660 };
const SAMPLE_LIST = { tuning: { scriptTitleGap: 24, bodyTop: 523, headerHeight: 507 }, rows: { dividers: { thickness: 5 }, venue: { body: true, bare: true, oneLine: true }, textWidth: 640 } };

function sampleStyle(content: FlierContent): FlierStyle {
  const classic = classicStyle(content);
  const fits = classic.layout !== LayoutId.List && layoutsFor(content.format).some((entry) => entry.id === LayoutId.PictureRight);
  const picture = { imageId: 'couple', anchor: PictureAnchor.Bottom, scale: 1 };
  const base: FlierStyle = {
    ...classic,
    layout: fits ? LayoutId.PictureRight : classic.layout,
    palette: PaletteId.KizombaSample,
    fonts: FontSetId.KizombaSample,
    background: BackgroundStyle.Solid,
    picture,
  };
  if (!fits) return { ...base, ...SAMPLE_LIST };
  return { ...base, tuning: SAMPLE_HEADER, rows: SAMPLE_ROWS };
}

export const KIZOMBA_SAMPLE: FlierTheme = { id: ThemeId.KizombaSample, nameKey: 'themes.kizombaSample', styleFor: sampleStyle };

export const THEMES: readonly FlierTheme[] = [KIZOMBA_CLASSIC, GOLDEN_HOUR, KIZOMBA_SAMPLE];

export function themeById(id: string, themes: readonly FlierTheme[] = THEMES): FlierTheme | undefined {
  return themes.find((theme) => theme.id === id);
}
