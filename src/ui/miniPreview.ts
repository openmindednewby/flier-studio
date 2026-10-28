import { FM } from '../i18n/fm';
import { el, textButton } from './dom';

const THUMB_BOX = { width: 54, height: 70 };
const PIXEL_RATIO = 2;

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface MiniPreviewActions {
  seeAll: () => void;
}

export interface MiniPreview {
  readonly bar: HTMLElement;
  update: (source: HTMLCanvasElement | undefined, index: number, total: number) => void;
}

/** Fits a source size inside the thumbnail box, keeping its aspect ratio. */
export function thumbSize(source: Size, box: Size = THUMB_BOX): Size {
  if (source.width <= 0 || source.height <= 0) return box;
  const scale = Math.min(box.width / source.width, box.height / source.height);
  return { width: Math.round(source.width * scale), height: Math.round(source.height * scale) };
}

function copyInto(target: HTMLCanvasElement, source: HTMLCanvasElement, width: number, height: number): void {
  target.width = width;
  target.height = height;
  target.getContext('2d')?.drawImage(source, 0, 0, width, height);
}

function setLabel(node: HTMLElement, label: string): void {
  node.textContent = label;
  node.setAttribute('aria-description', FM('hint.button', label));
}

function createSheet(): { dialog: HTMLDialogElement; show: (source: HTMLCanvasElement, index: number) => void } {
  const full = el('canvas', { role: 'img' });
  const close = textButton(FM('mini.close'), 'mini-close', () => dialog.close(), 'primary');
  close.setAttribute('autofocus', '');
  const dialog = el('dialog', { class: 'mini-sheet', 'data-testid': 'mini-sheet' }, [full, close]);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  const show = (source: HTMLCanvasElement, index: number): void => {
    copyInto(full, source, source.width, source.height);
    const name = FM('mini.sheet', String(index + 1));
    dialog.setAttribute('aria-label', name);
    full.setAttribute('aria-label', name);
    dialog.showModal();
  };
  return { dialog, show };
}

/** Phone-only bar fixed to the bottom: live thumbnail of the selected flier, tap for full size, jump to all previews. */
export function createMiniPreview(actions: MiniPreviewActions): MiniPreview {
  const thumb = el('canvas', { 'aria-hidden': 'true' });
  const open = el('button', { type: 'button', class: 'mini-thumb', 'data-testid': 'mini-open' }, [thumb]);
  const position = el('strong', { 'data-testid': 'mini-position' });
  const seeAll = textButton('', 'mini-see-all', actions.seeAll);
  const sheet = createSheet();
  const shown = { source: undefined as HTMLCanvasElement | undefined, index: 0 };
  open.addEventListener('click', () => { if (shown.source) sheet.show(shown.source, shown.index); });
  const text = el('div', { class: 'mini-text' }, [position, el('span', { class: 'muted', text: FM('mini.label') })]);
  const bar = el('aside', { class: 'mini-preview', 'data-testid': 'mini-preview', 'aria-label': FM('mini.bar') }, [open, text, seeAll, sheet.dialog]);

  const update = (source: HTMLCanvasElement | undefined, index: number, total: number): void => {
    Object.assign(shown, { source, index });
    position.textContent = FM('mini.position', String(index + 1), String(total));
    setLabel(seeAll, FM('mini.seeAll', String(total)));
    const openLabel = FM('mini.open', String(index + 1));
    open.setAttribute('aria-label', openLabel);
    open.setAttribute('aria-description', FM('hint.button', openLabel));
    if (!source) return;
    const size = thumbSize(source);
    copyInto(thumb, source, size.width * PIXEL_RATIO, size.height * PIXEL_RATIO);
    thumb.style.width = `${String(size.width)}px`;
    thumb.style.height = `${String(size.height)}px`;
  };
  return { bar, update };
}
