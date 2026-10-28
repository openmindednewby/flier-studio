import { defaultLayoutFor, kizombaWorkshopDocs } from '@dloizides/poster-render';
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

export const THEMES: readonly FlierTheme[] = [KIZOMBA_CLASSIC];

export function themeById(id: string, themes: readonly FlierTheme[] = THEMES): FlierTheme | undefined {
  return themes.find((theme) => theme.id === id);
}
