import { attachRefineBrush, BrushMode, encodeCutout, type CutResult } from '@dloizides/background-removal';
import { BRUSH_CSS, brushRadiusPx, nextZoom, ZOOM } from '../cutout/brushScale';
import { FM } from '../i18n/fm';
import { button, el } from './dom';

export interface CutoutDialogActions {
  cut(): Promise<CutResult | undefined>;
  use(png: Blob): void;
}

const TITLE_ID = 'cutout-title';
const MS_PER_S = 1000;

interface ToolState {
  mode: BrushMode;
  moving: boolean;
}

interface Tools {
  row: HTMLElement;
  controls: (HTMLButtonElement | HTMLInputElement)[];
  state: ToolState;
  radiusCss(): number;
}

function toolToggles(state: ToolState): HTMLButtonElement[] {
  const toggles: HTMLButtonElement[] = [];
  const pick = (picked: HTMLButtonElement, mode: BrushMode | undefined): void => {
    for (const b of toggles) b.setAttribute('aria-pressed', String(b === picked));
    state.moving = mode === undefined;
    if (mode !== undefined) state.mode = mode;
  };
  const keep: HTMLButtonElement = button('cutout.keep', 'cutout-keep', () => pick(keep, BrushMode.Keep));
  const erase: HTMLButtonElement = button('cutout.erase', 'cutout-erase', () => pick(erase, BrushMode.Erase));
  const move: HTMLButtonElement = button('cutout.move', 'cutout-move', () => pick(move, undefined));
  toggles.push(keep, erase, move);
  for (const b of toggles) b.setAttribute('aria-pressed', String(b === erase));
  return toggles;
}

function zoomControls(canvas: HTMLCanvasElement): [HTMLButtonElement, HTMLOutputElement, HTMLButtonElement] {
  let zoom: number = ZOOM.min;
  const shown = el('output', { 'data-testid': 'cutout-zoom', 'aria-live': 'polite', text: FM('cutout.zoom', String(zoom)) });
  const apply = (step: number): void => {
    const base = canvas.clientWidth / zoom;
    zoom = nextZoom(zoom, step);
    canvas.style.width = zoom === ZOOM.min ? '' : `${base * zoom}px`;
    canvas.classList.toggle('zoomed', zoom > ZOOM.min);
    shown.textContent = FM('cutout.zoom', String(zoom));
  };
  return [button('cutout.zoomOut', 'cutout-zoom-out', () => apply(-1)), shown, button('cutout.zoomIn', 'cutout-zoom-in', () => apply(1))];
}

function brushTools(canvas: HTMLCanvasElement): Tools {
  const state: ToolState = { mode: BrushMode.Erase, moving: false };
  const size = el('input', { type: 'range', min: String(BRUSH_CSS.min), max: String(BRUSH_CSS.max), 'data-testid': 'cutout-brush', 'aria-description': FM('hint.field', FM('cutout.brush')) });
  size.value = String(BRUSH_CSS.start);
  const toggles = toolToggles(state);
  const [zoomOut, zoomShown, zoomIn] = zoomControls(canvas);
  const row = el('div', { class: 'row tools' }, [...toggles, zoomOut, zoomShown, zoomIn, el('label', {}, [el('span', { text: FM('cutout.brush') }), size])]);
  return { row, controls: [...toggles, zoomOut, zoomIn, size], state, radiusCss: () => Number(size.value) };
}

function panWhenMoving(stage: HTMLElement, state: ToolState): void {
  let from: { x: number; y: number; left: number; top: number } | undefined;
  const swallow = (event: PointerEvent): boolean => { if (state.moving) event.stopPropagation(); return state.moving; };
  stage.addEventListener('pointerdown', (e) => { if (swallow(e)) from = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop }; }, true);
  stage.addEventListener('pointermove', (e) => {
    if (!swallow(e) || from === undefined) return;
    stage.scrollLeft = from.left - (e.clientX - from.x);
    stage.scrollTop = from.top - (e.clientY - from.y);
  }, true);
  const end = (e: PointerEvent): void => { swallow(e); from = undefined; };
  stage.addEventListener('pointerup', end, true);
  stage.addEventListener('pointercancel', end, true);
}

function showCut(canvas: HTMLCanvasElement, tools: Tools, cut: CutResult): () => void {
  canvas.width = cut.mask.width;
  canvas.height = cut.mask.height;
  canvas.hidden = false;
  for (const c of tools.controls) c.disabled = false;
  const radius = (): number => brushRadiusPx(tools.radiusCss(), cut.mask.width, canvas.clientWidth);
  return attachRefineBrush(canvas, { mask: cut.mask, image: cut.image, getMode: () => tools.state.mode, getRadius: radius });
}

function cutoutParts(): { dialog: HTMLDialogElement; status: HTMLElement; progress: HTMLProgressElement; stage: HTMLElement; canvas: HTMLCanvasElement } {
  const dialog = el('dialog', { class: 'import-dialog cutout-dialog', 'data-testid': 'cutout-dialog', 'aria-labelledby': TITLE_ID });
  const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'cutout-status', text: FM('cutout.cutting') });
  const progress = el('progress', { class: 'cutout-progress', 'data-testid': 'cutout-progress', 'aria-label': FM('cutout.progress') });
  const canvas = el('canvas', { class: 'cutout-canvas', 'data-testid': 'cutout-canvas', 'aria-label': FM('cutout.canvas'), hidden: '' });
  const stage = el('div', { class: 'cutout-stage', 'data-testid': 'cutout-stage' }, [canvas]);
  return { dialog, status, progress, stage, canvas };
}

/** Cuts the flier picture on this device; focus is on Cancel while cutting, then on Use cut-out. */
export function openCutoutDialog(actions: CutoutDialogActions): HTMLDialogElement {
  const { dialog, status, progress, stage, canvas } = cutoutParts();
  const tools = brushTools(canvas);
  panWhenMoving(stage, tools.state);
  let cut: CutResult | undefined;
  let detach = (): void => undefined;
  const use = button('cutout.use', 'cutout-use', () => {
    if (cut !== undefined) void encodeCutout(cut.image, cut.mask).then((png) => { actions.use(png); dialog.close(); });
  }, 'primary');
  for (const c of [...tools.controls, use]) c.disabled = true;
  const cancel = button('cutout.cancel', 'cutout-cancel', () => dialog.close());
  dialog.addEventListener('close', () => { detach(); dialog.remove(); });
  dialog.append(el('h2', { id: TITLE_ID, text: FM('cutout.title') }), status, progress, stage, tools.row, el('div', { class: 'row' }, [use, cancel]));
  document.body.append(dialog);
  dialog.showModal();
  cancel.focus();
  actions.cut().then((result) => {
    progress.hidden = true;
    if (result === undefined) { status.textContent = FM('cutout.noPicture'); return; }
    cut = result;
    detach = showCut(canvas, tools, result);
    status.textContent = FM('cutout.ready', (result.elapsedMs / MS_PER_S).toFixed(1));
    use.disabled = false;
    use.focus();
  }).catch((error: unknown) => { progress.hidden = true; status.textContent = FM('cutout.failed', error instanceof Error ? error.message : String(error)); });
  return dialog;
}
