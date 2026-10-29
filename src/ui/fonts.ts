export interface FontLoader {
  load(font: string): Promise<unknown>;
}

export const FONT_FACES: readonly string[] = [
  '500 48px "Oswald"',
  '700 48px "Oswald"',
  '400 48px "Sacramento"',
  '400 48px "Dancing Script"',
  '400 48px "Style Script"',
  '500 48px "Fredoka"',
  '600 48px "Fredoka"',
  '700 48px "Fredoka"',
  '400 48px "Fraunces"',
  '600 48px "Fraunces"',
  '400 48px "Allura"',
  '400 48px "Jost"',
  '500 48px "Jost"',
  '400 48px "Anton"',
  '500 48px "Barlow Semi Condensed"',
  '700 48px "Barlow Semi Condensed"',
];

const loaded = new WeakMap<FontLoader, Promise<void>>();

/** Resolves once every self-hosted flier face has loaded (or failed), so canvas text never draws in a fallback font. */
export function fontsReady(loader: FontLoader): Promise<void> {
  const known = loaded.get(loader);
  if (known) return known;
  const ready = Promise.allSettled(FONT_FACES.map((face) => loader.load(face))).then(() => undefined);
  loaded.set(loader, ready);
  return ready;
}
