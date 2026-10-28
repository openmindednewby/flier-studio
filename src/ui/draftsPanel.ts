import type { Draft } from '../drafts/draftStore';
import { FM } from '../i18n/fm';
import { foldableCard } from './collapsible';
import { el, textButton } from './dom';

const THUMB_WIDTH = 36;
const PIXEL_RATIO = 2;
const JPEG_QUALITY = 0.8;

export interface DraftsActions {
  restore(draft: Draft): void;
  star(draft: Draft, starred: boolean): void;
}

export interface DraftsPanel {
  readonly card: HTMLElement;
  show(drafts: readonly Draft[]): void;
}

export const draftTime = (draft: Draft): string => new Date(draft.at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

/** A small JPEG of the first flier for the drafts list; empty when nothing is drawn yet. */
export function thumbOf(source: HTMLCanvasElement | undefined): string {
  if (source === undefined || source.width === 0) return '';
  const thumb = el('canvas');
  thumb.width = THUMB_WIDTH * PIXEL_RATIO;
  thumb.height = Math.round((thumb.width * source.height) / source.width);
  thumb.getContext('2d')?.drawImage(source, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL('image/jpeg', JPEG_QUALITY);
}

function row(draft: Draft, n: number, actions: DraftsActions): HTMLLIElement {
  const when = draftTime(draft);
  const restore = textButton(FM('drafts.restore'), `draft-restore-${String(n)}`, () => actions.restore(draft));
  restore.setAttribute('aria-label', FM('drafts.restoreAt', when));
  const star = textButton(FM(draft.starred ? 'drafts.starred' : 'drafts.star'), `draft-star-${String(n)}`, () => actions.star(draft, !draft.starred));
  star.setAttribute('aria-label', FM('drafts.starAt', when));
  star.setAttribute('aria-pressed', String(draft.starred));
  return el('li', {}, [
    el('img', { src: draft.thumb, alt: FM('drafts.thumb', when), width: String(THUMB_WIDTH) }),
    el('span', { class: 'draft-when' }, [el('strong', { text: when }), el('span', { class: 'muted', text: FM('drafts.count', String(draft.fliers.length)) })]),
    restore,
    star,
  ]);
}

/** Drafts on this device: All / Favourites filter, and per draft its time, thumbnail, Restore and Star. */
export function draftsPanel(actions: DraftsActions): DraftsPanel {
  const view = { favouritesOnly: false, drafts: [] as readonly Draft[] };
  const list = el('ul', { class: 'drafts', 'data-testid': 'drafts-list' });
  const empty = el('p', { class: 'muted', 'data-testid': 'drafts-empty' });
  const render = (): void => {
    const starred = view.drafts.filter((d) => d.starred);
    const rows = view.favouritesOnly ? starred : view.drafts;
    all.textContent = FM('drafts.all', String(view.drafts.length));
    favourites.textContent = FM('drafts.favourites', String(starred.length));
    all.setAttribute('aria-pressed', String(!view.favouritesOnly));
    favourites.setAttribute('aria-pressed', String(view.favouritesOnly));
    list.replaceChildren(...rows.map((d, i) => row(d, i + 1, actions)));
    empty.textContent = FM(view.favouritesOnly ? 'drafts.noFavourites' : 'drafts.none');
    empty.hidden = rows.length > 0;
  };
  const filter = (favouritesOnly: boolean): void => {
    view.favouritesOnly = favouritesOnly;
    render();
  };
  const all = textButton(FM('drafts.all', '0'), 'drafts-all', () => filter(false));
  const favourites = textButton(FM('drafts.favourites', '0'), 'drafts-favourites', () => filter(true));
  const chips = el('div', { class: 'chips', role: 'group', 'aria-label': FM('drafts.filter') }, [all, favourites]);
  const card = foldableCard('drafts-panel', FM('drafts.heading'), [chips, list, empty]);
  const show = (drafts: readonly Draft[]): void => {
    view.drafts = drafts;
    render();
  };
  render();
  return { card, show };
}
