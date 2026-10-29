import { BackgroundStyle, FontSetId, FormatId, LayoutId, PaletteId, PictureAnchor } from '@dloizides/poster-render';
import { layoutsFor } from '../form/layoutOptions';
import { defaultLayoutFor } from '@dloizides/poster-render';

export const PICTURE_SCALES: readonly string[] = ['0.8', '1', '1.2', '1.5'];

export const SETTING_CHOICES: Readonly<Record<string, readonly string[]>> = {
  format: Object.values(FormatId),
  layout: Object.values(LayoutId),
  palette: Object.values(PaletteId),
  fonts: Object.values(FontSetId),
  background: Object.values(BackgroundStyle),
  pictureAnchor: Object.values(PictureAnchor),
  pictureScale: PICTURE_SCALES,
};

export const TEXT_KEYS = ['title', 'subtitle', 'date', 'time'] as const;

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

export type ParsedSettings = { ok: true; settings: AiSettings } | { ok: false; errors: string[] };

function readJson(reply: string): Record<string, unknown> | null {
  try {
    const raw: unknown = JSON.parse(reply.trim());
    return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** The AC-41 settings object from a model reply, or the names of the fields that are not valid. */
export function parseSettings(reply: string): ParsedSettings {
  const obj = readJson(reply);
  if (obj === null) return { ok: false, errors: ['json'] };
  const errors = [
    ...Object.entries(SETTING_CHOICES).filter(([key, ids]) => !ids.includes(String(obj[key]))).map(([key]) => key),
    ...TEXT_KEYS.filter((key) => typeof obj[key] !== 'string'),
  ];
  return errors.length === 0 ? { ok: true, settings: obj as unknown as AiSettings } : { ok: false, errors };
}

/** The settings with a layout the format can show; the same step the editor applies on a format change. */
export function fitLayout(s: AiSettings): AiSettings {
  const fits = layoutsFor(s.format).some((entry) => entry.id === s.layout);
  return fits ? s : { ...s, layout: defaultLayoutFor(s.format) };
}
