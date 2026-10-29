import type { Draft } from '../drafts/draftStore';
import { FM } from '../i18n/fm';
import { foldableCard } from './collapsible';
import { confirmDelete } from './confirmDialog';
import { el, textButton } from './dom';
import { THUMB_WIDTH, draftRow, type DraftsActions, type RowFocus } from './draftRow';
import { plural } from '../i18n/plural';

export { draftDay, draftTime, type DraftsActions } from './draftRow';

const PIXEL_RATIO = 2;
const JPEG_QUALITY = 0.8;

export interface DraftsPanel {
  readonly card: HTMLElement;
  show(drafts: readonly Draft[]): void;
}

/** A small JPEG of the first flier for the drafts list; empty when nothing is drawn yet. */
export function thumbOf(source: HTMLCanvasElement | undefined): string {
  if (source === undefined || source.width === 0) return '';
  const thumb = el('canvas');
  thumb.width = THUMB_WIDTH * PIXEL_RATIO;
  thumb.height = Math.round((thumb.width * source.height) / source.width);
  thumb.getContext('2d')?.drawImage(source, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL('image/jpeg', JPEG_QUALITY);
}

function askCleanUp(others: number, favourites: number, go: () => void): void {
  confirmDelete({ title: plural('drafts.confirmTitle', others), body: plural('drafts.confirmBody', favourites), keep: FM('drafts.keep'), go: plural('drafts.confirmGo', others) }, go);
}

/** Drafts on this device: All / Favourites filter, Clean up, and per draft its name, thumbnail, Restore, Star and More. */
export function draftsPanel(actions: DraftsActions): DraftsPanel {
  const view = { favouritesOnly: false, drafts: [] as readonly Draft[] };
  const list = el('ul', { class: 'drafts', 'data-testid': 'drafts-list' });
  const empty = el('p', { class: 'muted', 'data-testid': 'drafts-empty' });
  let pending: string | undefined;
  const focus: RowFocus = {
    now: (...testIds) => testIds.map((id) => card.querySelector<HTMLElement>(`[data-testid="${id}"]`)).find((node) => node !== null)?.focus(),
    later: (testId) => { pending = testId; },
  };
  const render = (): void => {
    const starred = view.drafts.filter((d) => d.starred);
    const others = view.drafts.length - starred.length;
    const rows = view.favouritesOnly ? starred : view.drafts;
    all.textContent = FM('drafts.all', String(view.drafts.length));
    favourites.textContent = FM('drafts.favourites', String(starred.length));
    all.setAttribute('aria-pressed', String(!view.favouritesOnly));
    favourites.setAttribute('aria-pressed', String(view.favouritesOnly));
    cleanup.disabled = others === 0;
    cleanup.setAttribute('aria-label', plural('drafts.cleanUpLabel', others));
    list.replaceChildren(...rows.map((d, i) => draftRow(d, i + 1, actions, focus)));
    empty.textContent = FM(view.favouritesOnly ? 'drafts.noFavourites' : 'drafts.none');
    empty.hidden = rows.length > 0;
    if (pending !== undefined) focus.now(pending);
    pending = undefined;
  };
  const filter = (favouritesOnly: boolean): void => {
    view.favouritesOnly = favouritesOnly;
    render();
  };
  const all = textButton(FM('drafts.all', '0'), 'drafts-all', () => filter(false));
  const favourites = textButton(FM('drafts.favourites', '0'), 'drafts-favourites', () => filter(true));
  const cleanup = textButton(FM('drafts.cleanUp'), 'drafts-cleanup', () => {
    const starred = view.drafts.filter((d) => d.starred).length;
    askCleanUp(view.drafts.length - starred, starred, () => actions.cleanUp());
  });
  const chips = el('div', { class: 'chips', role: 'group', 'aria-label': FM('drafts.filter') }, [all, favourites]);
  const card = foldableCard('drafts-panel', FM('drafts.heading'), [el('div', { class: 'drafts-top' }, [chips, cleanup]), list, empty]);
  const show = (drafts: readonly Draft[]): void => {
    view.drafts = drafts;
    render();
  };
  render();
  return { card, show };
}
