import { KATALOGOS_TOKENS } from '@dloizides/design-tokens';
import type { Plugin } from 'vite';

export const THEME_COLOR_SLOT = '<!-- theme-color -->';

/** The light and dark theme-color meta tags, both read from the design tokens. */
export function themeColorTags(): string {
  return [
    `<meta name="theme-color" content="${KATALOGOS_TOKENS.light.background}" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="${KATALOGOS_TOKENS.dark.background}" media="(prefers-color-scheme: dark)" />`,
  ].join('\n  ');
}

export function withThemeColor(html: string): string {
  return html.replace(THEME_COLOR_SLOT, themeColorTags());
}

export function themeColorPlugin(): Plugin {
  return { name: 'flier-theme-color', transformIndexHtml: withThemeColor };
}
