import type { AiSettings } from './aiSettings';
import type { EmbedSettings } from './embedTier';

/** The embedding's settings for each field it matched, with every other field taken from the keyword match. */
export function gapFill(embed: EmbedSettings, keyword: AiSettings): AiSettings {
  const filled: AiSettings = { ...keyword };
  for (const field of embed.matched) Object.assign(filled, { [field]: embed[field] });
  return filled;
}
