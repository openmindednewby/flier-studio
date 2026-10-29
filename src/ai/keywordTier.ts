import { PictureAnchor } from '@dloizides/poster-render';
import { DATE, TIME, docFromPrompt } from '../llm/promptFallback';
import type { AiSettings } from './aiSettings';

/** Tier 3: the shipped keyword fallback, read back as an AC-41 settings object. */
export function settingsFromPrompt(prompt: string): AiSettings {
  const doc = docFromPrompt(prompt);
  return {
    format: doc.format,
    layout: doc.layout,
    palette: doc.palette,
    fonts: doc.fonts,
    background: doc.background,
    pictureAnchor: PictureAnchor.Center,
    pictureScale: '1',
    title: doc.blocks.title,
    subtitle: doc.blocks.titleBottom ?? '',
    date: DATE.exec(prompt)?.[0] ?? '',
    time: TIME.exec(prompt)?.[0] ?? '',
  };
}
