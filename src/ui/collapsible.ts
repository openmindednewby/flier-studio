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

export interface FoldOptions {
  id: string;
  title: string;
  testId?: string;
  className?: string;
  store?: FoldStore;
}

/** A 44 px toggle that folds the content and remembers the choice for this viewer. */
export function foldToggle(content: HTMLElement, options: FoldOptions): HTMLButtonElement {
  const { id, title, store = localFoldStore } = options;
  content.id = `${id}-body`;
  const toggle = el('button', { type: 'button', class: options.className ?? 'fold-toggle', 'data-testid': options.testId ?? `${id}-toggle`, 'aria-controls': content.id, 'aria-description': FM('hint.fold', title), text: title });
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
  return toggle;
}

/** A card whose heading is a 44 px toggle that folds its body and remembers the choice for this viewer. */
export function foldableCard(id: string, title: string, body: HTMLElement[], store: FoldStore = localFoldStore): HTMLElement {
  const content = el('div', { class: 'fold-body' }, body);
  const toggle = foldToggle(content, { id, title, store });
  return el('section', { class: 'card', id, 'data-testid': id }, [el('h2', { class: 'fold-head' }, [toggle]), content]);
}
