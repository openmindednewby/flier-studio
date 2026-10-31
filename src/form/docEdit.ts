import type { FlierBlocks, FlierDoc, PriceRow, ScheduleRow } from '@dloizides/poster-render';
import { columnsToItems, itemsToColumns, type ListColumns } from './listText';

const SEP = '|';
export const NL = '\n';

const lines = (text: string): string[] => text.split(NL).map((l) => l.trim()).filter((l) => l !== '');
const nonEmpty = <T>(list: T[]): T[] | undefined => (list.length > 0 ? list : undefined);
const opt = (text: string): string | undefined => (text.trim() === '' ? undefined : text.trim());
const split = (line: string, sep: string): string[] => line.split(sep).map((s) => s.trim());

export function pairsToText(rows: readonly (ScheduleRow | PriceRow)[] | undefined): string {
  return (rows ?? []).map((r) => ('time' in r ? `${r.label} | ${r.time}` : `${r.amount} | ${r.label}`)).join(NL);
}

export function textToSchedule(text: string): ScheduleRow[] | undefined {
  return nonEmpty(lines(text).map((l) => { const [label, time = ''] = split(l, SEP); return { label, time }; }));
}

export function textToPrices(text: string): PriceRow[] | undefined {
  return nonEmpty(lines(text).map((l) => { const [amount, label = ''] = split(l, SEP); return { amount, label }; }));
}

export interface BlockText extends ListColumns {
  title: string;
  titleBottom: string;
  script: string;
  venue: string;
  schedule: string;
  prices: string;
  includesHeading: string;
  includesItems: string;
  footer: string;
}

export function blocksToText(doc: FlierDoc): BlockText {
  const b = doc.blocks;
  return {
    title: b.title, titleBottom: b.titleBottom ?? '', script: b.script ?? '', venue: (b.venue ?? []).join(NL),
    schedule: pairsToText(b.schedule), prices: pairsToText(b.prices), includesHeading: b.includes?.heading ?? '',
    includesItems: (b.includes?.items ?? []).join(NL), footer: b.footer ?? '', ...itemsToColumns(doc.items),
  };
}

/** Rebuilds the doc from the form text; empty optional fields are dropped so the schema sees them absent. */
export function applyText(doc: FlierDoc, t: BlockText): FlierDoc {
  const items = nonEmpty(lines(t.includesItems));
  const blocks: FlierBlocks = {
    title: t.title.trim(), titleBottom: opt(t.titleBottom), script: opt(t.script), venue: nonEmpty(lines(t.venue)),
    schedule: textToSchedule(t.schedule), prices: textToPrices(t.prices),
    includes: items ? { heading: t.includesHeading.trim(), items } : undefined, footer: opt(t.footer), lines: doc.blocks.lines,
  };
  const next: FlierDoc = { ...doc, blocks: JSON.parse(JSON.stringify(blocks)) as FlierBlocks };
  const list = columnsToItems(t);
  if (list === undefined) delete next.items;
  else next.items = list;
  return next;
}
