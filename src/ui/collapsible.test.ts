import { describe, expect, it } from 'vitest';
import { foldableCard, isOpen, localFoldStore, type FoldStore } from './collapsible';

const memory = (seed: Record<string, string> = {}): FoldStore & { data: Record<string, string | undefined> } => {
  const data: Record<string, string | undefined> = { ...seed };
  return { data, read: (k) => data[k] ?? null, write: (k, v) => { data[k] = v; return true; } };
};

describe('isOpen', () => {
  it('with nothing stored, is open', () => {
    const store = memory();

    const open = isOpen(store, 'drafts-panel');

    expect(open).toBe(true);
  });

  it('with the card folded before, is closed', () => {
    const store = memory({ 'flier-studio:open:drafts-panel': 'closed' });

    const open = isOpen(store, 'drafts-panel');

    expect(open).toBe(false);
  });
});

describe('foldableCard', () => {
  it('with a toggle click, hides the body and stores closed', () => {
    const store = memory();
    const card = foldableCard('all-fliers', 'All fliers', [document.createElement('p')], store);
    const toggle = card.querySelector('button') as HTMLButtonElement;

    toggle.click();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect((card.querySelector('.fold-body') as HTMLElement).hidden).toBe(true);
    expect(store.data['flier-studio:open:all-fliers']).toBe('closed');
  });
});

describe('localFoldStore', () => {
  it('with storage that throws, reads null and reports the write failed', () => {
    const { setItem, getItem } = Storage.prototype;
    const deny = (): never => { throw new DOMException('denied', 'SecurityError'); };
    Storage.prototype.setItem = deny;
    Storage.prototype.getItem = deny;

    const wrote = localFoldStore.write('k', 'closed');

    const read = localFoldStore.read('k');
    Object.assign(Storage.prototype, { setItem, getItem });
    expect(wrote).toBe(false);
    expect(read).toBeNull();
  });
});
