import { FM } from '../i18n/fm';
import type { Draft } from './draftStore';

export const draftClock = (at: number): string => new Date(at).toLocaleTimeString([], { timeStyle: 'short' });

/** The name a draft shows: the name it was given, else its first flier's title and the time it was saved. */
export function draftName(draft: Pick<Draft, 'name' | 'at' | 'fliers'>): string {
  const given = draft.name?.trim() ?? '';
  if (given !== '') return given;
  const title = draft.fliers[0]?.content.blocks.title.trim() ?? '';
  return title !== '' ? FM('drafts.name', title, draftClock(draft.at)) : FM('drafts.untitled', draftClock(draft.at));
}
