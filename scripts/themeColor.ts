import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

export const THEME_COLOR_SLOT = '<!-- theme-color -->';

const pwaConfig = createRequire(import.meta.url)('../pwa-sw.config.cjs') as { manifest: { themeColor: string } };

/** The theme-color meta tag, read from the manifest theme colour so the page and the installed app match. */
export function themeColorTags(): string {
  return `<meta name="theme-color" content="${pwaConfig.manifest.themeColor}" />`;
}

export function withThemeColor(html: string): string {
  return html.replace(THEME_COLOR_SLOT, themeColorTags());
}

export function themeColorPlugin(): Plugin {
  return { name: 'flier-theme-color', transformIndexHtml: withThemeColor };
}
