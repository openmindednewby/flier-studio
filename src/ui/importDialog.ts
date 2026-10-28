import type { FlierDoc } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import type { ShareDecoded } from '../share/shareCodec';
import { button, el } from './dom';

export interface ImportDialogActions {
  accept(docs: FlierDoc[]): void;
  closed(): void;
}

const TITLE_ID = 'import-title';

function content(result: ShareDecoded, accept: () => void, close: () => void): HTMLElement[] {
  if (!result.ok) {
    return [
      el('h2', { id: TITLE_ID, 'data-testid': 'import-title', text: FM('share.rejectTitle') }),
      el('p', { class: 'error', 'data-testid': 'import-error', text: FM(`share.errors.${result.error}`) }),
      el('div', { class: 'row' }, [button('share.close', 'import-dismiss', close, 'primary')]),
    ];
  }
  const count = String(result.docs.length);
  const notice = result.dropped > 0 ? [el('p', { class: 'muted', 'data-testid': 'import-dropped', text: FM('share.droppedNotice', String(result.dropped)) })] : [];
  return [
    el('h2', { id: TITLE_ID, 'data-testid': 'import-title', text: FM('share.importTitle', count) }),
    el('p', { class: 'muted', text: FM('share.importBody', count) }),
    ...notice,
    el('div', { class: 'row' }, [button('share.import', 'import-confirm', accept, 'primary'), button('share.dismiss', 'import-dismiss', close)]),
  ];
}

/** Modal for a shared flier set; Import has focus on open and nothing is written unless it is pressed. */
export function openImportDialog(result: ShareDecoded, actions: ImportDialogActions): HTMLDialogElement {
  const dialog = el('dialog', { class: 'import-dialog', 'data-testid': 'import-dialog', 'aria-labelledby': TITLE_ID });
  const close = (): void => dialog.close();
  const accept = (): void => {
    if (result.ok) actions.accept(result.docs);
    close();
  };
  dialog.addEventListener('close', () => { dialog.remove(); actions.closed(); });
  dialog.append(...content(result, accept, close));
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('button')?.focus();
  return dialog;
}
