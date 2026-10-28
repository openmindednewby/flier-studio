import { FM } from '../i18n/fm';
import { el } from './dom';

const PREFIX = 'flier-studio:open:';

export interface FoldStore {
  read(key: string): string | null;
  write(key: string, value: string): boolean;
}

export const localFoldStore: FoldStore = {
  read: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};

/** Whether a card is open: open unless this viewer folded it before. */
export function isOpen(store: FoldStore, id: string): boolean {
  return store.read(PREFIX + id) !== 'closed';
}

/** A card whose heading is a 44 px toggle that folds its body and remembers the choice for this viewer. */
export function foldableCard(id: string, title: string, body: HTMLElement[], store: FoldStore = localFoldStore): HTMLElement {
  const bodyId = `${id}-body`;
  const content = el('div', { class: 'fold-body', id: bodyId }, body);
  const toggle = el('button', { type: 'button', class: 'fold-toggle', 'data-testid': `${id}-toggle`, 'aria-controls': bodyId, 'aria-description': FM('hint.fold', title), text: title });
  const set = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    content.hidden = !open;
  };
  set(isOpen(store, id));
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    set(open);
    store.write(PREFIX + id, open ? 'open' : 'closed');
    toggle.scrollIntoView({ block: 'nearest' });
  });
  return el('section', { class: 'card', 'data-testid': id }, [el('h2', { class: 'fold-head' }, [toggle]), content]);
}
