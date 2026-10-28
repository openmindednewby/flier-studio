export interface DraftMeta {
  readonly id: number;
  readonly at: number;
  readonly starred: boolean;
}

export const KEEP_UNSTARRED = 50;

export const newestFirst = (a: DraftMeta, b: DraftMeta): number => (b.at !== a.at ? b.at - a.at : b.id - a.id);

/** Ids of the unstarred drafts past the newest `keep`, oldest first; starred drafts are never pruned. */
export function prunable(drafts: readonly DraftMeta[], keep: number = KEEP_UNSTARRED): number[] {
  return drafts.filter((d) => !d.starred).sort(newestFirst).slice(keep).map((d) => d.id).reverse();
}
