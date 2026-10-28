import { FLIER_TOKENS } from '@dloizides/design-tokens';
import type { Plugin } from 'vite';

export const THEME_COLOR_SLOT = '<!-- theme-color -->';

const SCHEMES = [
  ['light', FLIER_TOKENS.light.background],
  ['dark', FLIER_TOKENS.dark.background],
] as const;

/** One theme-color meta tag per colour scheme, taken from the light and dark token backgrounds. */
export function themeColorTags(): string {
  return SCHEMES.map(([scheme, colour]) => `<meta name="theme-color" media="(prefers-color-scheme: ${scheme})" content="${colour}" />`).join('\n    ');
}

export function withThemeColor(html: string): string {
  return html.replace(THEME_COLOR_SLOT, themeColorTags());
}

export function themeColorPlugin(): Plugin {
  return { name: 'flier-theme-color', transformIndexHtml: withThemeColor };
}
