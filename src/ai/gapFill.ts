import type { AiSettings } from './aiSettings';
import { EMBED_FALLBACKS } from './embedTier';

const MODEL_FIELDS = ['format', 'layout', 'palette', 'fonts', 'title', 'subtitle'] as const;

/** The embedding's settings, with each field it could not match (left at its fallback) taken from the keyword match. */
export function gapFill(embed: AiSettings, keyword: AiSettings): AiSettings {
  const filled: AiSettings = { ...keyword };
  for (const field of MODEL_FIELDS) {
    const matched = embed[field] !== EMBED_FALLBACKS[field];
    if (matched) Object.assign(filled, { [field]: embed[field] });
  }
  return filled;
}
