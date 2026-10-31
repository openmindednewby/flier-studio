import { draftClock, draftName } from '../drafts/draftName';
import type { Draft } from '../drafts/draftStore';
import { FM } from '../i18n/fm';
import { el, submitOnEnter, textButton } from './dom';
import { iconButton, iconSvg, type IconName } from './icons';

export const THUMB_WIDTH = 36;
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric' };

export interface DraftsActions {
  restore(draft: Draft): void;
  star(draft: Draft, starred: boolean): void;
  rename(draft: Draft, name: string): void;
  remove(draft: Draft, refocus: (afterRefresh: boolean) => void): void;
  cleanUp(): void;
}

/** Moves focus to a test id now, or once the list is drawn again. */
export interface RowFocus {
  now(...testIds: string[]): void;
  later(testId: string): void;
}

interface RowContext {
  readonly n: string;
  readonly actions: DraftsActions;
  readonly focus: RowFocus;
}

export const draftTime = (draft: Draft): string => new Date(draft.at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

/** The short date of a draft, without the year when it was saved this year. */
export function draftDay(at: number, now: number = Date.now()): string {
  const sameYear = new Date(at).getFullYear() === new Date(now).getFullYear();
  return new Date(at).toLocaleDateString([], sameYear ? DAY_MONTH : { dateStyle: 'short' });
}

function renameInPlace(title: HTMLElement, draft: Draft, row: RowContext): void {
  const input = el('input', { type: 'text', class: 'draft-name-input', 'data-testid': `draft-name-input-${row.n}`, 'aria-label': FM('drafts.renameLabel'), 'aria-description': FM('drafts.renameHint') });
  input.value = title.textContent ?? '';
  let open = true;
  const finish = (save: boolean): void => {
    if (!open) return;
    open = false;
    input.remove();
    title.hidden = false;
    const more = `draft-more-${row.n}`;
    if (save && input.value.trim() !== title.textContent) {
      row.focus.later(more);
      row.actions.rename(draft, input.value);
    } else row.focus.now(more);
  };
  submitOnEnter(input, () => finish(true));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
  title.hidden = true;
  title.after(input);
  input.focus();
  input.select();
}

function menuItem(label: string, testId: string, icon: IconName, onClick: () => void): HTMLButtonElement {
  const item = textButton(label, testId, onClick, icon === 'trash' ? 'danger' : '');
  item.insertAdjacentHTML('afterbegin', iconSvg(icon));
  return item;
}

function refocusAfterDelete(row: RowContext): (afterRefresh: boolean) => void {
  const index = Number(row.n);
  return (afterRefresh) => {
    if (afterRefresh) row.focus.later(`draft-more-${row.n}`);
    else row.focus.now(`draft-more-${row.n}`, `draft-more-${String(index - 1)}`, 'drafts-all');
  };
}

function moreMenu(title: HTMLElement, draft: Draft, row: RowContext): HTMLElement {
  const wrap = el('div', { class: 'draft-more' });
  const menuId = `draft-menu-${row.n}`;
  let shown: HTMLElement | undefined;
  const close = (): void => {
    const menu = shown;
    if (menu === undefined) return;
    shown = undefined;
    more.setAttribute('aria-expanded', 'false');
    menu.remove();
  };
  const open = (): void => {
    const menu = el('div', { id: menuId, class: 'draft-menu', 'data-testid': 'draft-menu' }, [
      menuItem(FM('drafts.rename'), 'draft-menu-rename', 'pen', () => { close(); renameInPlace(title, draft, row); }),
      menuItem(FM('drafts.delete'), 'draft-menu-delete', 'trash', () => { close(); row.actions.remove(draft, refocusAfterDelete(row)); }),
    ]);
    menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); more.focus(); } });
    shown = menu;
    wrap.append(menu);
    more.setAttribute('aria-expanded', 'true');
    menu.querySelector<HTMLElement>('button')?.focus();
  };
  const more = iconButton(FM('drafts.more', title.textContent ?? ''), `draft-more-${row.n}`, 'more', () => (more.getAttribute('aria-expanded') === 'true' ? close() : open()));
  more.setAttribute('aria-controls', menuId);
  more.setAttribute('aria-expanded', 'false');
  wrap.addEventListener('focusout', (e) => { if (!wrap.contains(e.relatedTarget as Node | null)) close(); });
  wrap.append(more);
  return wrap;
}

function starButton(draft: Draft, n: string, actions: DraftsActions): HTMLButtonElement {
  const when = draftTime(draft);
  const star = iconButton(FM(draft.starred ? 'drafts.starredAt' : 'drafts.starAt', when), `draft-star-${n}`, 'star', () => actions.star(draft, !draft.starred));
  star.innerHTML = iconSvg('star', draft.starred);
  star.setAttribute('aria-pressed', String(draft.starred));
  star.classList.add('draft-star');
  return star;
}

/** One draft: thumbnail, name with date and count, Restore, a star and a More list with Rename and Delete. */
export function draftRow(draft: Draft, index: number, actions: DraftsActions, focus: RowFocus): HTMLLIElement {
  const row: RowContext = { n: String(index), actions, focus };
  const count = FM('drafts.count', String(draft.fliers.length));
  const sub = FM(draft.starred ? 'drafts.subStarred' : 'drafts.sub', draftDay(draft.at), draftClock(draft.at), count);
  const title = el('span', { class: 'draft-name', 'data-testid': `draft-name-${row.n}`, text: draftName(draft) });
  const restore = textButton(FM('drafts.restore'), `draft-restore-${row.n}`, () => actions.restore(draft));
  restore.setAttribute('aria-label', FM('drafts.restoreAt', draftTime(draft)));
  return el('li', { 'data-testid': `draft-row-${row.n}` }, [
    el('img', { src: draft.thumb, alt: FM('drafts.thumb', draftTime(draft)), width: String(THUMB_WIDTH) }),
    el('div', { class: 'draft-main' }, [
      el('span', { class: 'draft-when' }, [title, el('span', { class: 'muted draft-sub', text: sub })]),
      el('span', { class: 'draft-actions' }, [restore, starButton(draft, row.n, actions), moreMenu(title, draft, row)]),
    ]),
  ]);
}
