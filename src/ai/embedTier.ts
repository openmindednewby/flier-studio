import { BackgroundStyle, PictureAnchor } from '@dloizides/poster-render';
import { createEmbedTier as createConfigEmbedTier, type Embed, type EmbedTier, type MatchedConfig, type PresetField } from '@dloizides/prompt-to-config';
import { DATE, TIME } from '../llm/promptFallback';
import type { AiSettings } from './aiSettings';

export type EmbedSettings = MatchedConfig<AiSettings>;

const STYLES = ['kizomba', 'salsa', 'bachata', 'tango', 'zouk', 'swing', 'hip hop', 'yoga'];

const BASE = {
  format: 'story', layout: 'picture-right', palette: 'sand', fonts: 'classic', title: 'KIZOMBA', subtitle: 'WORKSHOP',
  background: BackgroundStyle.Tint, pictureAnchor: PictureAnchor.Center, pictureScale: '1', date: '', time: '',
} as AiSettings;

const CORPUS: readonly PresetField<AiSettings>[] = [
  { field: 'format', examples: {
    post: ['social media feed post', 'instagram feed image'],
    square: ['square image', 'one to one square flyer'],
    phone: ['mobile background', 'smartphone lock screen image', 'mobile wallpaper'],
    desktop: ['computer background image', 'widescreen monitor wallpaper', 'pc screen background'],
    story: ['vertical story format', 'instagram stories'],
  } },
  { field: 'layout', examples: {
    list: ['calendar of several upcoming dates', 'timetable of many events', 'list of upcoming events'],
    'picture-left': ['photo placed on the left side', 'image on the left'],
    'picture-bottom': ['image underneath the text', 'photograph at the bottom'],
  } },
  { field: 'palette', examples: {
    night: ['dark black evening colours', 'midnight dark theme'],
    sea: ['blue ocean colours', 'turquoise seaside tones'],
    rose: ['pink romantic colours', 'love hearts theme'],
    sand: ['warm beige neutral tones', 'soft sandy colours'],
    'golden-horizon': ['golden sunset orange colours'],
  } },
  { field: 'fonts', examples: {
    elegant: ['elegant graceful typography', 'classy refined lettering'],
    modern: ['modern clean sans-serif type'],
    coastal: ['relaxed handwritten beach lettering'],
  } },
  { field: 'title', examples: Object.fromEntries(STYLES.map((s) => [s.toUpperCase(), [s, `${s} dance`]])) },
  { field: 'subtitle', examples: {
    MASTERCLASS: ['intensive masterclass', 'training bootcamp'],
    PARTY: ['party social dance night'],
    CLASS: ['beginner lesson'],
  } },
];

/** Tier 2: the Flier preset corpus over the shared embedding tier; date and time read by the prompt regexes. */
export function createEmbedTier(embed: Embed): EmbedTier<AiSettings> {
  return createConfigEmbedTier({ embed, corpus: CORPUS, base: BASE, extractors: { date: DATE, time: TIME } });
}
