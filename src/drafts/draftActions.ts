import { FM } from '../i18n/fm';
import type { DraftsActions } from '../ui/draftRow';
import { undoToast } from '../ui/undoToast';
import { draftName } from './draftName';
import type { Draft, DraftStore } from './draftStore';

export interface DraftsHost {
  restore(draft: Draft): void;
  refresh(): void;
  failed(message: string): void;
}

/** Wires the Drafts panel to the store: star, rename, delete with a 5 s Undo, and clean up of the non-favourites. */
export function draftActions(store: DraftStore, host: DraftsHost): DraftsActions {
  const fail = (e: unknown): void => host.failed(FM('drafts.saveFailed', String(e)));
  return {
    restore: (draft) => host.restore(draft),
    star: (draft, on) => void store.star(draft.id, on).then(host.refresh, (e: unknown) => host.failed(FM('drafts.starFailed', String(e)))),
    rename: (draft, name) => void store.rename(draft.id, name).then(host.refresh, fail),
    remove: (draft, refocus) => void store.remove(draft.id).then(() => {
      host.refresh();
      undoToast(FM('drafts.deleted', draftName(draft)), () => { refocus(true); void store.put(draft).then(host.refresh, fail); }, () => refocus(false));
    }, fail),
    cleanUp: () => void store.removeUnstarred().then(host.refresh, fail),
  };
}
