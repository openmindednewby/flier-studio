import { BackgroundStyle, PictureAnchor } from '@dloizides/poster-render';
import { DATE, TIME } from '../llm/promptFallback';
import type { AiSettings } from './aiSettings';
import { cosine, type Labelled } from './embedMatch';

type Examples = Readonly<Record<string, readonly string[]>>;

interface FieldSpec {
  readonly field: keyof AiSettings;
  readonly fallback: string;
  readonly examples: Examples;
}

export type Embed = (text: string) => Promise<number[]>;

export interface EmbedSettings extends AiSettings {
  readonly matched: readonly (keyof AiSettings)[];
}

const THRESHOLD = 0.5;
const FRAGMENT = /,| with | for | on | at /i;
const STYLES = ['kizomba', 'salsa', 'bachata', 'tango', 'zouk', 'swing', 'hip hop', 'yoga'];

const FIELDS: readonly FieldSpec[] = [
  { field: 'format', fallback: 'story', examples: {
    post: ['social media feed post', 'instagram feed image'],
    square: ['square image', 'one to one square flyer'],
    phone: ['mobile background', 'smartphone lock screen image', 'mobile wallpaper'],
    desktop: ['computer background image', 'widescreen monitor wallpaper', 'pc screen background'],
    story: ['vertical story format', 'instagram stories'],
  } },
  { field: 'layout', fallback: 'picture-right', examples: {
    list: ['calendar of several upcoming dates', 'timetable of many events', 'list of upcoming events'],
    'picture-left': ['photo placed on the left side', 'image on the left'],
    'picture-bottom': ['image underneath the text', 'photograph at the bottom'],
  } },
  { field: 'palette', fallback: 'sand', examples: {
    night: ['dark black evening colours', 'midnight dark theme'],
    sea: ['blue ocean colours', 'turquoise seaside tones'],
    rose: ['pink romantic colours', 'love hearts theme'],
    sand: ['warm beige neutral tones', 'soft sandy colours'],
    'golden-horizon': ['golden sunset orange colours'],
  } },
  { field: 'fonts', fallback: 'classic', examples: {
    elegant: ['elegant graceful typography', 'classy refined lettering'],
    modern: ['modern clean sans-serif type'],
    coastal: ['relaxed handwritten beach lettering'],
  } },
  { field: 'title', fallback: 'KIZOMBA', examples: Object.fromEntries(STYLES.map((s) => [s.toUpperCase(), [s, `${s} dance`]])) },
  { field: 'subtitle', fallback: 'WORKSHOP', examples: {
    MASTERCLASS: ['intensive masterclass', 'training bootcamp'],
    PARTY: ['party social dance night'],
    CLASS: ['beginner lesson'],
  } },
];

async function labelAll(embed: Embed): Promise<Labelled[][]> {
  const out: Labelled[][] = [];
  for (const spec of FIELDS) {
    const list: Labelled[] = [];
    for (const [label, texts] of Object.entries(spec.examples)) {
      const vectors: number[][] = [];
      for (const text of texts) vectors.push(await embed(text));
      list.push({ label, vectors });
    }
    out.push(list);
  }
  return out;
}

function bestOver(vecs: readonly number[][], labelled: readonly Labelled[]): string | undefined {
  let best: string | undefined;
  let bestScore = THRESHOLD;
  for (const entry of labelled) {
    const score = Math.max(...vecs.flatMap((v) => entry.vectors.map((e) => cosine(v, e))));
    if (score > bestScore) {
      best = entry.label;
      bestScore = score;
    }
  }
  return best;
}

/** Tier 2: a sentence-embedding matcher over labelled examples per setting; no text generation. */
export function createEmbedTier(embed: Embed): { settings(prompt: string): Promise<EmbedSettings> } {
  let labelled: Promise<Labelled[][]> | null = null;
  return {
    async settings(prompt: string): Promise<EmbedSettings> {
      labelled ??= labelAll(embed);
      const lists = await labelled;
      const parts = [prompt, ...prompt.split(FRAGMENT).map((p) => p.trim()).filter((p) => p !== '')];
      const vecs: number[][] = [];
      for (const part of parts) vecs.push(await embed(part));
      const best = lists.map((list) => bestOver(vecs, list));
      const picked = Object.fromEntries(FIELDS.map((spec, i) => [spec.field, best[i] ?? spec.fallback])) as Partial<AiSettings>;
      const matched = FIELDS.filter((_spec, i) => best[i] !== undefined).map((spec) => spec.field);
      const fixed = { background: BackgroundStyle.Tint, pictureAnchor: PictureAnchor.Center, pictureScale: '1' };
      return { ...fixed, ...picked, date: DATE.exec(prompt)?.[0] ?? '', time: TIME.exec(prompt)?.[0] ?? '', matched } as EmbedSettings;
    },
  };
}
