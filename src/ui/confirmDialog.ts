import { el, textButton } from './dom';

export interface ConfirmText {
  readonly title: string;
  readonly body: string;
  readonly keep: string;
  readonly go: string;
}

/** A modal that opens on the safe "keep" choice; `go` runs only when the destructive button is pressed. */
export function confirmDelete(text: ConfirmText, go: () => void): void {
  const dialog = el('dialog', { class: 'confirm', 'data-testid': 'drafts-confirm', 'aria-labelledby': 'drafts-confirm-title' });
  const keep = textButton(text.keep, 'drafts-confirm-keep', () => dialog.close());
  const remove = textButton(text.go, 'drafts-confirm-delete', () => { dialog.close(); go(); }, 'danger-fill');
  dialog.append(el('h2', { id: 'drafts-confirm-title', text: text.title }), el('p', { text: text.body }), el('div', { class: 'confirm-buttons' }, [keep, remove]));
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  keep.focus();
}
