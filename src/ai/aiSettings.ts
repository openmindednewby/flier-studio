import { BackgroundStyle, FontSetId, FormatId, LayoutId, PaletteId, PictureAnchor } from '@dloizides/poster-render';
import type { ConfigSchema } from '@dloizides/prompt-to-config';
import { layoutsFor } from '../form/layoutOptions';
import { defaultLayoutFor } from '@dloizides/poster-render';

export const PICTURE_SCALES: readonly string[] = ['0.8', '1', '1.2', '1.5'];

export interface AiSettings {
  format: FormatId;
  layout: LayoutId;
  palette: PaletteId;
  fonts: FontSetId;
  background: BackgroundStyle;
  pictureAnchor: PictureAnchor;
  pictureScale: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
}

export const AI_SCHEMA: ConfigSchema<AiSettings> = {
  choices: {
    format: Object.values(FormatId),
    layout: Object.values(LayoutId),
    palette: Object.values(PaletteId),
    fonts: Object.values(FontSetId),
    background: Object.values(BackgroundStyle),
    pictureAnchor: Object.values(PictureAnchor),
    pictureScale: PICTURE_SCALES,
  },
  textKeys: ['title', 'subtitle', 'date', 'time'],
};

/** The settings with a layout the format can show; the same step the editor applies on a format change. */
export function fitLayout(s: AiSettings): AiSettings {
  const fits = layoutsFor(s.format).some((entry) => entry.id === s.layout);
  return fits ? s : { ...s, layout: defaultLayoutFor(s.format) };
}
