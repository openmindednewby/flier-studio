import type { FlierDoc } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import { SHARE_PARAM, encodeShare } from '../share/shareCodec';
import { button, el, labelled } from './dom';

function copy(text: string): Promise<boolean> {
  return navigator.clipboard === undefined ? Promise.resolve(false) : navigator.clipboard.writeText(text).then(() => true, () => false);
}

/** The Share row: builds a link holding the flier set in its fragment, shows it and copies it. */
export function shareRow(current: () => FlierDoc[], status: (message: string) => void): HTMLElement {
  const link = el('input', { type: 'text', readonly: '', 'data-testid': 'share-url' });
  const share = async (): Promise<void> => {
    const docs = current();
    const { fragment, dropped } = await encodeShare(docs);
    const url = `${location.origin}${location.pathname}#${SHARE_PARAM}=${fragment}`;
    link.value = url;
    const copied = await copy(url);
    const note = dropped > 0 ? ` ${FM('share.droppedNote', String(dropped))}` : '';
    status(FM(copied ? 'share.copied' : 'share.ready', String(docs.length), String(url.length)) + note);
  };
  return el('div', { class: 'row' }, [labelled('share.link', link), button('config.share', 'config-share', () => void share())]);
}
