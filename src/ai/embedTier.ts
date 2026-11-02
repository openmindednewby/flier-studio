import { createIntentMatcher, DEFAULT_EMBEDDING_MODEL_URL, type IntentMatcher } from '@dloizides/llm-run/intent';
import { BackgroundStyle, PictureAnchor } from '@dloizides/poster-render';
import { DATE, TIME } from '../llm/promptFallback';
import type { AiSettings } from './aiSettings';

type Examples = Readonly<Record<string, readonly string[]>>;

interface FieldSpec {
  readonly field: keyof AiSettings;
  readonly fallback: string;
  readonly examples: Examples;
}

export type Embed = (text: string) => Promise<ArrayLike<number>>;

export interface EmbedSettings extends AiSettings {
  readonly matched: readonly (keyof AiSettings)[];
}

const THRESHOLD = 0.5;
const LONGEST_TIMER_MS = 2_147_483_647;
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

function rememberVectors(embed: Embed): Embed {
  const known = new Map<string, ArrayLike<number>>();
  return async (text) => {
    const hit = known.get(text);
    if (hit !== undefined) return hit;
    const vector = await embed(text);
    known.set(text, vector);
    return vector;
  };
}

async function loadMatchers(embed: Embed): Promise<IntentMatcher[]> {
  const matchers: IntentMatcher[] = [];
  for (const spec of FIELDS) {
    const matcher = createIntentMatcher({
      intents: Object.entries(spec.examples).map(([id, examples]) => ({ id, examples })),
      threshold: THRESHOLD,
      model: DEFAULT_EMBEDDING_MODEL_URL,
      loadRuntime: () => Promise.resolve({ embed }),
    });
    const loaded = await matcher.loadOnDemand({ deadlineMs: LONGEST_TIMER_MS });
    if (!loaded.ok) throw new Error(loaded.message);
    matchers.push(matcher);
  }
  return matchers;
}

async function bestOver(parts: readonly string[], matcher: IntentMatcher): Promise<string | undefined> {
  let best: string | undefined;
  let bestScore = THRESHOLD;
  for (const part of parts) {
    const { id, score } = await matcher.match(part);
    if (id !== null && score !== null && score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best;
}

/** Tier 2: a sentence-embedding matcher over labelled examples per setting; no text generation. */
export function createEmbedTier(embed: Embed): { settings(prompt: string): Promise<EmbedSettings> } {
  const embedOnce = rememberVectors(embed);
  let matchers: Promise<IntentMatcher[]> | null = null;
  return {
    async settings(prompt: string): Promise<EmbedSettings> {
      matchers ??= loadMatchers(embedOnce);
      const loaded = await matchers;
      const parts = [prompt, ...prompt.split(FRAGMENT).map((p) => p.trim()).filter((p) => p !== '')];
      for (const part of parts) await embedOnce(part);
      const best: (string | undefined)[] = [];
      for (const matcher of loaded) best.push(await bestOver(parts, matcher));
      const picked = Object.fromEntries(FIELDS.map((spec, i) => [spec.field, best[i] ?? spec.fallback])) as Partial<AiSettings>;
      const matched = FIELDS.filter((_spec, i) => best[i] !== undefined).map((spec) => spec.field);
      const fixed = { background: BackgroundStyle.Tint, pictureAnchor: PictureAnchor.Center, pictureScale: '1' };
      return { ...fixed, ...picked, date: DATE.exec(prompt)?.[0] ?? '', time: TIME.exec(prompt)?.[0] ?? '', matched } as EmbedSettings;
    },
  };
}
