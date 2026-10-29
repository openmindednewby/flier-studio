import { LineTieKind, sameSize, sameWidth, type FlierDoc, type LineKey, type LineStyle } from '@dloizides/poster-render';

const SIZE_STEP = 0.05;
const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const HUNDRED = 100;
const VENUE_LINES = 3;
const INCLUDES_LINES = 6;
const SCHEDULE_ROWS = 6;
const PRICE_ROWS = 4;
const LIST_ROWS = 8;

export const TITLE_PAIR: readonly [LineKey, LineKey] = ['title', 'titleBottom'];

const rows = (prefix: string, count: number, parts: readonly string[] = ['']): LineKey[] =>
  Array.from({ length: count }, (_, i) => parts.map((part) => `${prefix}.${String(i)}${part}`)).flat();

/** The flier lines each text field of the form draws, by its field key. */
export const FIELD_LINES: Readonly<Record<string, readonly LineKey[]>> = {
  title: ['title'],
  titleBottom: ['titleBottom'],
  script: ['script'],
  includesHeading: ['includes.heading'],
  footer: ['footer'],
  venue: rows('venue', VENUE_LINES),
  schedule: rows('schedule', SCHEDULE_ROWS, ['.label', '.time']),
  prices: rows('prices', PRICE_ROWS, ['.amount', '.label']),
  includesItems: rows('includes.items', INCLUDES_LINES),
  items: rows('items', LIST_ROWS, ['.date', '.price']),
};

type Styles = Record<LineKey, LineStyle | undefined>;

const defined = (style: LineStyle): LineStyle => Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined)) as LineStyle;

function withStyles(doc: FlierDoc, styles: Styles): FlierDoc {
  const kept = Object.entries(styles).filter(([, s]) => s !== undefined && Object.keys(s).length > 0);
  const { lineStyles: _old, ...rest } = doc;
  return { ...rest, lineStyles: kept.length === 0 ? undefined : Object.fromEntries(kept) };
}

export const styleOf = (doc: FlierDoc, key: LineKey): LineStyle => doc.lineStyles?.[key] ?? {};

/** Merges `patch` into the style of every line in `keys`; an undefined value drops that override. */
export function restyle(doc: FlierDoc, keys: readonly LineKey[], patch: LineStyle): FlierDoc {
  const styles: Styles = { ...doc.lineStyles };
  for (const key of keys) styles[key] = defined({ ...styles[key], ...patch });
  return withStyles(doc, styles);
}

/** Drops every override of the lines in `keys`, so they draw in the theme again. */
export function resetLines(doc: FlierDoc, keys: readonly LineKey[]): FlierDoc {
  return withStyles(doc, Object.fromEntries(Object.entries(doc.lineStyles ?? {}).filter(([k]) => !keys.includes(k))));
}

export const scaleOf = (doc: FlierDoc, key: LineKey): number => styleOf(doc, key).sizeScale ?? 1;

/** Moves the size of the lines `steps` steps of 5%, kept inside 25%..300%; 100% drops the override. */
export function stepSize(doc: FlierDoc, keys: readonly LineKey[], steps: number): FlierDoc {
  const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((scaleOf(doc, keys[0]) + steps * SIZE_STEP) * HUNDRED) / HUNDRED));
  return restyle(doc, keys, { sizeScale: next === 1 ? undefined : next });
}

export const percent = (scale: number): string => `${String(Math.round(scale * HUNDRED))}%`;

const isPair = (lines: readonly LineKey[], pair: readonly LineKey[]): boolean => lines.every((l) => pair.includes(l));

export const tieOf = (doc: FlierDoc, pair: readonly [LineKey, LineKey]): LineTieKind | undefined => doc.lineTies?.find((t) => isPair(t.lines, pair))?.kind;

/** Ties the two lines by width or size, or unties them when `kind` is undefined. */
export function setTie(doc: FlierDoc, pair: readonly [LineKey, LineKey], kind: LineTieKind | undefined): FlierDoc {
  const others = (doc.lineTies ?? []).filter((t) => !isPair(t.lines, pair));
  const { lineTies: _old, ...rest } = doc;
  const base: FlierDoc = { ...rest, lineTies: others.length === 0 ? undefined : others };
  if (kind === undefined) return base;
  return kind === LineTieKind.Width ? sameWidth(base, pair[0], pair[1]) : sameSize(base, pair[0], pair[1]);
}
