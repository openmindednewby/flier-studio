import type { FlierDoc, LineStyle } from '@dloizides/poster-render';

export const MAX_FREE_LINES = 6;

const KEY = 'lines.';

const linesOf = (doc: FlierDoc): string[] => [...(doc.blocks.lines ?? [])];

const indices = (count: number): number[] => Array.from({ length: count }, (_, i) => i);

function rebuilt(doc: FlierDoc, order: readonly number[], texts: readonly string[]): FlierDoc {
  const old = doc.lineStyles ?? {};
  const kept = Object.entries(old).filter(([k]) => !k.startsWith(KEY));
  const moved = order.flatMap((from, to): [string, LineStyle | undefined][] => (old[`${KEY}${String(from)}`] === undefined ? [] : [[`${KEY}${String(to)}`, old[`${KEY}${String(from)}`]]]));
  const styles = Object.fromEntries([...kept, ...moved]);
  const next: FlierDoc = { ...doc, blocks: { ...doc.blocks, lines: [...texts] } };
  if (texts.length === 0) delete next.blocks.lines;
  if (Object.keys(styles).length === 0) delete next.lineStyles;
  else next.lineStyles = styles;
  return next;
}

/** The doc with one more empty free line, up to MAX_FREE_LINES. */
export function addLine(doc: FlierDoc): FlierDoc {
  const lines = linesOf(doc);
  return lines.length >= MAX_FREE_LINES ? doc : rebuilt(doc, indices(lines.length), [...lines, '']);
}

export function setLine(doc: FlierDoc, index: number, text: string): FlierDoc {
  const lines = linesOf(doc);
  lines[index] = text;
  return { ...doc, blocks: { ...doc.blocks, lines } };
}

/** Moves a free line by one place (by = -1 up, 1 down); its style moves with it. */
export function moveLine(doc: FlierDoc, index: number, by: number): FlierDoc {
  const lines = linesOf(doc);
  const to = index + by;
  if (to < 0 || to >= lines.length) return doc;
  const order = indices(lines.length);
  [order[index], order[to]] = [order[to], order[index]];
  return rebuilt(doc, order, order.map((i) => lines[i]));
}

export function removeLine(doc: FlierDoc, index: number): FlierDoc {
  const lines = linesOf(doc);
  const order = indices(lines.length).filter((i) => i !== index);
  return rebuilt(doc, order, order.map((i) => lines[i]));
}

/** The target doc with the free lines and their styles of the source doc. */
export function withLinesOf(target: FlierDoc, source: FlierDoc): FlierDoc {
  const own = Object.entries(target.lineStyles ?? {}).filter(([k]) => !k.startsWith(KEY));
  const theirs = Object.entries(source.lineStyles ?? {}).filter(([k]) => k.startsWith(KEY));
  const merged: FlierDoc = { ...target, lineStyles: Object.fromEntries([...own, ...theirs]) };
  return rebuilt({ ...merged, blocks: { ...merged.blocks, lines: linesOf(source) } }, indices(linesOf(source).length), linesOf(source));
}
