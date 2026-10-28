const { KATALOGOS_TOKENS } = require('@dloizides/design-tokens');

module.exports = {
  serviceWorker: {
    apiCacheName: 'flier-studio-api-v1',
    staticCacheName: 'flier-studio-static-v1',
    publicApiPathMatchers: [],
    staticOnly: true,
    staticExtensions: ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff2', '.ico'],
  },
  manifest: {
    name: 'Flier Studio',
    shortName: 'Fliers',
    description: 'Make event fliers and phone or desktop wallpapers in your browser. Pick a layout, fill the form, download PNGs.',
    themeColor: KATALOGOS_TOKENS.dark.background,
    backgroundColor: KATALOGOS_TOKENS.dark.background,
    startUrl: '/',
    scope: '/',
    display: 'standalone',
    lang: 'en',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
};
