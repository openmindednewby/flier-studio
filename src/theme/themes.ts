import { BackgroundStyle, FontSetId, LayoutId, PaletteId, PictureAnchor, defaultLayoutFor, kizombaWorkshopDocs } from '@dloizides/poster-render';
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
  };
}

export const GOLDEN_HOUR: FlierTheme = { id: ThemeId.GoldenHour, nameKey: 'themes.goldenHour', styleFor: goldenStyle };

export const THEMES: readonly FlierTheme[] = [KIZOMBA_CLASSIC, GOLDEN_HOUR];

export function themeById(id: string, themes: readonly FlierTheme[] = THEMES): FlierTheme | undefined {
  return themes.find((theme) => theme.id === id);
}
