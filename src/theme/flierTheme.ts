import type { FlierDoc } from '@dloizides/poster-render';
import { ThemeId } from './ThemeId';

export const STYLE_KEYS = ['layout', 'palette', 'fonts', 'background', 'picture', 'logo', 'tuning', 'rows'] as const;
type StyleKey = (typeof STYLE_KEYS)[number];

export type FlierStyle = Pick<FlierDoc, StyleKey>;
export type FlierContent = Omit<FlierDoc, StyleKey>;

/** One flier as stored: its content, the theme it follows, its current style and the styles it had under other themes. */
export interface ThemedFlier {
  themeId: string;
  content: FlierContent;
  style: FlierStyle;
  kept?: Record<string, FlierStyle | undefined>;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Splits a render doc into its content and its style fields. */
export function splitDoc(doc: FlierDoc): { content: FlierContent; style: FlierStyle } {
  const content: Record<string, unknown> = {};
  const style: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(clone(doc))) {
    if ((STYLE_KEYS as readonly string[]).includes(key)) style[key] = value;
    else content[key] = value;
  }
  return { content: content as FlierContent, style: style as FlierStyle };
}

/** A doc saved before themes becomes a flier on Kizomba classic with its own style kept as is. */
export function toThemed(doc: FlierDoc, themeId: string = ThemeId.KizombaClassic): ThemedFlier {
  return { themeId, ...splitDoc(doc) };
}

/** The render doc of a flier: its content drawn in its current style. */
export function toDoc(flier: ThemedFlier): FlierDoc {
  return clone({ ...flier.content, ...flier.style });
}

export function cloneFlier(flier: ThemedFlier): ThemedFlier {
  return clone(flier);
}
