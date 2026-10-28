import type { BlockText } from './docEdit';

export interface ReplaceMatch {
  readonly flier: number;
  readonly field: keyof BlockText;
  readonly at: number;
  readonly length: number;
  readonly line: string;
  readonly after: string;
}

const WORD = '[\\p{L}\\p{N}_]';
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function pattern(find: string, wholeWord: boolean): RegExp {
  const core = escape(find);
  return new RegExp(wholeWord ? `(?<!${WORD})${core}(?!${WORD})` : core, 'giu');
}

function lineAround(text: string, at: number, length: number, replacement: string): [string, string] {
  const start = text.lastIndexOf('\n', at - 1) + 1;
  const next = text.indexOf('\n', at + length);
  const end = next === -1 ? text.length : next;
  return [text.slice(start, end), text.slice(start, at) + replacement + text.slice(at + length, end)];
}

/** Every match of `find` in every text field of every flier, capital letters ignored, in flier then field order. */
export function findMatches(texts: readonly BlockText[], find: string, replacement: string, wholeWord: boolean): ReplaceMatch[] {
  if (find === '') return [];
  const re = pattern(find, wholeWord);
  return texts.flatMap((text, flier) => (Object.keys(text) as (keyof BlockText)[]).flatMap((field) =>
    [...text[field].matchAll(re)].map((m) => {
      const at = m.index ?? 0;
      const [line, after] = lineAround(text[field], at, m[0].length, replacement);
      return { flier, field, at, length: m[0].length, line, after };
    })));
}

/** The texts with only the given matches replaced; every other occurrence stays as it is. */
export function applyMatches(texts: readonly BlockText[], ticked: readonly ReplaceMatch[], replacement: string): BlockText[] {
  const out = texts.map((t) => ({ ...t }));
  [...ticked].sort((a, b) => b.at - a.at).forEach((m) => {
    const value = out[m.flier][m.field];
    out[m.flier][m.field] = value.slice(0, m.at) + replacement + value.slice(m.at + m.length);
  });
  return out;
}
