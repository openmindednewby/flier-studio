import { FormatId, LayoutId, PaletteId, kizombaWorkshopDocs, type FlierDoc, type FontSetId } from '@dloizides/poster-render';
import { cloneDocs } from '../presets/kizomba';

const STYLES = ['kizomba', 'salsa', 'bachata', 'tango', 'zouk', 'swing', 'hip hop', 'yoga', 'milonga'];
const LIST_DOC_INDEX = 3;

const FORMATS: readonly [RegExp, FormatId][] = [
  [/desktop|laptop|computer/i, FormatId.Desktop],
  [/phone|lock ?screen|wallpaper/i, FormatId.Phone],
  [/square/i, FormatId.Square],
  [/\bpost\b|instagram|feed/i, FormatId.Post],
];
const PALETTES: readonly [RegExp, PaletteId][] = [
  [/night|dark|black|milonga/i, PaletteId.Night],
  [/\bsea\b|blue|beach|summer/i, PaletteId.Sea],
  [/rose|pink|valentine|love/i, PaletteId.Rose],
];
const LAYOUTS: readonly [RegExp, LayoutId][] = [
  [/upcoming|\blist\b|schedule|socials/i, LayoutId.List],
  [/\bleft\b/i, LayoutId.PictureLeft],
  [/bottom|text on top/i, LayoutId.PictureBottom],
];
const SUBTITLES: readonly [RegExp, string][] = [
  [/masterclass|bootcamp/i, 'MASTERCLASS'],
  [/party|social|night|milonga/i, 'PARTY'],
  [/class|session|taster/i, 'CLASS'],
];
export const DATE = /\b(?:mon|tues|wednes|thurs|fri|satur|sun)day\s+\d{1,2}\s+[a-z]+/i;
export const TIME = /\b\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?/;

function pick<T>(prompt: string, table: readonly [RegExp, T][], fallback: T): T {
  return table.find(([re]) => re.test(prompt))?.[1] ?? fallback;
}

function titleFor(prompt: string): string {
  const style = STYLES.find((s) => prompt.toLowerCase().includes(s));
  return (style ?? 'kizomba').toUpperCase();
}

export interface Picks {
  layout: LayoutId;
  format: FormatId;
  palette: PaletteId;
  fonts?: FontSetId;
  title: string;
  subtitle: string;
}

/** Deterministic prompt-to-flier match used when no model can run or the model fails to load. */
export function docFromPrompt(prompt: string): FlierDoc {
  return docWith(prompt, {
    layout: pick(prompt, LAYOUTS, LayoutId.PictureRight),
    format: pick(prompt, FORMATS, FormatId.Story),
    palette: pick(prompt, PALETTES, PaletteId.Sand),
    title: titleFor(prompt),
    subtitle: pick(prompt, SUBTITLES, 'WORKSHOP'),
  });
}

/** The sample flier with the picked settings and the prompt's date and time. */
export function docWith(prompt: string, picks: Picks): FlierDoc {
  const { layout } = picks;
  const presets = cloneDocs(kizombaWorkshopDocs);
  const doc = layout === LayoutId.List ? presets[LIST_DOC_INDEX] : presets[0];
  doc.layout = layout;
  doc.format = picks.format;
  doc.palette = picks.palette;
  if (picks.fonts !== undefined) doc.fonts = picks.fonts;
  doc.blocks.title = picks.title;
  doc.blocks.titleBottom = picks.subtitle;
  const date = DATE.exec(prompt)?.[0];
  if (date !== undefined) doc.blocks.script = date;
  const time = TIME.exec(prompt)?.[0];
  if (time !== undefined && layout !== LayoutId.List) doc.blocks.schedule = [{ label: 'Class', time }];
  return doc;
}
