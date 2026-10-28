import { attachRefineBrush, encodeCutout, type BrushMode, type CutResult } from '@dloizides/background-removal';
import { FM } from '../i18n/fm';
import { button, el } from './dom';

export interface CutoutDialogActions {
  cut(): Promise<CutResult | undefined>;
  use(png: Blob): void;
}

const TITLE_ID = 'cutout-title';
const BRUSH = { min: '4', max: '64', start: '16' };
const MS_PER_S = 1000;
const KEEP = 'keep' as BrushMode;
const ERASE = 'erase' as BrushMode;

interface Tools {
  row: HTMLElement;
  mode(): BrushMode;
  radiusCss(): number;
}

function modeToggle(onPick: (mode: BrushMode) => void): HTMLButtonElement[] {
  const pick = (picked: HTMLButtonElement, mode: BrushMode): void => {
    for (const b of toggles) b.setAttribute('aria-pressed', String(b === picked));
    onPick(mode);
  };
  const keep: HTMLButtonElement = button('cutout.keep', 'cutout-keep', () => pick(keep, KEEP));
  const erase: HTMLButtonElement = button('cutout.erase', 'cutout-erase', () => pick(erase, ERASE));
  const toggles = [keep, erase];
  keep.setAttribute('aria-pressed', 'false');
  erase.setAttribute('aria-pressed', 'true');
  return toggles;
}

function brushTools(): Tools {
  let mode = ERASE;
  const size = el('input', { type: 'range', min: BRUSH.min, max: BRUSH.max, 'data-testid': 'cutout-brush', 'aria-description': FM('hint.field', FM('cutout.brush')) });
  size.value = BRUSH.start;
  const label = el('label', {}, [el('span', { text: FM('cutout.brush') }), size]);
  const row = el('div', { class: 'row tools', hidden: '' }, [...modeToggle((m) => { mode = m; }), label]);
  return { row, mode: () => mode, radiusCss: () => Number(size.value) };
}

function showCut(canvas: HTMLCanvasElement, tools: Tools, cut: CutResult): () => void {
  canvas.width = cut.mask.width;
  canvas.height = cut.mask.height;
  canvas.hidden = false;
  tools.row.hidden = false;
  const scale = (): number => cut.mask.width / Math.max(1, canvas.clientWidth);
  return attachRefineBrush(canvas, { mask: cut.mask, image: cut.image, getMode: tools.mode, getRadius: () => tools.radiusCss() * scale() });
}

/** Cuts the flier picture on this device; focus is on Cancel while cutting, then on Use cut-out. */
export function openCutoutDialog(actions: CutoutDialogActions): HTMLDialogElement {
  const dialog = el('dialog', { class: 'import-dialog cutout-dialog', 'data-testid': 'cutout-dialog', 'aria-labelledby': TITLE_ID });
  const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'cutout-status', text: FM('cutout.cutting') });
  const canvas = el('canvas', { class: 'cutout-canvas', 'data-testid': 'cutout-canvas', 'aria-label': FM('cutout.canvas'), hidden: '' });
  const tools = brushTools();
  let cut: CutResult | undefined;
  let detach = (): void => undefined;
  const use = button('cutout.use', 'cutout-use', () => {
    if (cut === undefined) return;
    void encodeCutout(cut.image, cut.mask).then((png) => { actions.use(png); dialog.close(); });
  }, 'primary');
  use.disabled = true;
  const cancel = button('cutout.cancel', 'cutout-cancel', () => dialog.close());
  dialog.addEventListener('close', () => { detach(); dialog.remove(); });
  dialog.append(el('h2', { id: TITLE_ID, text: FM('cutout.title') }), status, canvas, tools.row, el('div', { class: 'row' }, [use, cancel]));
  document.body.append(dialog);
  dialog.showModal();
  cancel.focus();
  actions.cut().then((result) => {
    if (result === undefined) { status.textContent = FM('cutout.noPicture'); return; }
    cut = result;
    detach = showCut(canvas, tools, result);
    status.textContent = FM('cutout.ready', (result.elapsedMs / MS_PER_S).toFixed(1));
    use.disabled = false;
    use.focus();
  }).catch((error: unknown) => { status.textContent = FM('cutout.failed', error instanceof Error ? error.message : String(error)); });
  return dialog;
}
