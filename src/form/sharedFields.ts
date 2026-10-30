import type { FlierDoc, ScheduleRow } from '@dloizides/poster-render';
import { cloneDocs } from '../presets/kizomba';
import { EditScope } from './EditScope';
import { withLinesOf } from './freeLines';

const levelRows = (doc: FlierDoc): ScheduleRow[] => doc.blocks.schedule ?? doc.items?.[0]?.schedule ?? [];

function setLevel(doc: FlierDoc, row: number, label: string): void {
  for (const rows of [doc.blocks.schedule ?? [], ...(doc.items ?? []).map((i) => i.schedule)]) if (rows[row] !== undefined) rows[row].label = label;
}

function setFooter(doc: FlierDoc, footer: string | undefined): void {
  if (footer === undefined) delete doc.blocks.footer;
  else doc.blocks.footer = footer;
}

/** Puts the edited flier at index; with All, footer, level name and class price changes go to every flier. */
export function nextDocs(scope: EditScope, docs: readonly FlierDoc[], index: number, edited: FlierDoc): FlierDoc[] {
  const out = cloneDocs(docs);
  const before = out[index];
  out[index] = cloneDocs([edited])[0];
  if (scope !== EditScope.All) return out;
  const after = edited.blocks;
  if (before.blocks.footer !== after.footer) out.forEach((d) => setFooter(d, after.footer));
  if (JSON.stringify(before.blocks.lines) !== JSON.stringify(after.lines)) out.forEach((d, i) => { out[i] = withLinesOf(d, out[index]); });
  const was = levelRows(before);
  levelRows(edited).forEach((row, i) => {
    if (was[i] !== undefined && was[i].label !== row.label) out.forEach((d) => setLevel(d, i, row.label));
  });
  const [oldPrice, newPrice] = [before.blocks.prices?.[0], after.prices?.[0]];
  const priceChanged = oldPrice !== undefined && newPrice !== undefined && JSON.stringify(oldPrice) !== JSON.stringify(newPrice);
  if (priceChanged) out.forEach((d) => { if (d.blocks.prices?.[0] !== undefined) d.blocks.prices[0] = { ...newPrice }; });
  return out;
}
