import { FlierDocError, exportPng, render, type FlierDoc, type PosterAssets, type PosterCanvas } from '@dloizides/poster-render';
import { listHint } from '../form/listHint';
import { FM } from '../i18n/fm';
import { button, downloadBlob, el, textButton } from './dom';
import { fontsReady, type FontLoader } from './fonts';

export async function downloadCanvas(canvas: HTMLCanvasElement, doc: FlierDoc, index: number, fonts: FontLoader = document.fonts): Promise<void> {
  await fontsReady(fonts);
  downloadBlob(exportPng(canvas), `flier-${String(index + 1)}-${doc.format}.png`);
}

function draw(doc: FlierDoc, assets: PosterAssets, canvas: HTMLCanvasElement): string | null {
  try {
    render(doc, assets, canvas as unknown as PosterCanvas);
    return null;
  } catch (e) {
    return e instanceof FlierDocError ? e.errors.join('; ') : String(e);
  }
}

function problem(doc: FlierDoc, error: string): HTMLParagraphElement {
  const hint = listHint(doc);
  if (hint !== null) return el('p', { class: 'muted', role: 'status', 'data-testid': 'list-hint', text: hint });
  return el('p', { class: 'error', role: 'alert', text: FM('form.invalid', error) });
}

const DOUBLE_TAP_MS = 300;

function selectable(trim: HTMLElement, i: number, view: PreviewView): HTMLElement {
  const tap = { last: 0 };
  trim.addEventListener('click', () => view.select(i));
  trim.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    view.select(i);
  });
  trim.addEventListener('dblclick', () => view.enlarge(i, trim));
  trim.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch') return;
    const twice = e.timeStamp - tap.last < DOUBLE_TAP_MS;
    tap.last = twice ? 0 : e.timeStamp;
    if (twice) view.enlarge(i, trim);
  });
  return trim;
}

/** Marks flier `index` selected (crop marks + aria-selected) without redrawing. */
export function markSelected(container: HTMLElement, index: number): void {
  container.querySelectorAll('figure').forEach((figure, i) => {
    figure.classList.toggle('selected', i === index);
    figure.querySelector('[role="option"]')?.setAttribute('aria-selected', String(i === index));
  });
}

export interface PreviewView {
  selected: number;
  select: (i: number) => void;
  enlarge: (i: number, from: HTMLElement) => void;
  fonts?: FontLoader;
}

/** One live canvas per flier with edit and PNG download; returns the canvases in doc order. */
export async function renderPreviews(container: HTMLElement, docs: readonly FlierDoc[], assets: PosterAssets, view: PreviewView): Promise<HTMLCanvasElement[]> {
  const { selected, select, fonts = document.fonts } = view;
  await fontsReady(fonts);
  const canvases = docs.map(() => el('canvas', { role: 'img' }));
  const figures = docs.map((doc, i) => {
    const canvas = canvases[i];
    canvas.setAttribute('aria-label', doc.blocks.title);
    const error = draw(doc, assets, canvas);
    const n = String(i + 1);
    const trim = el('div', { class: 'trim', role: 'option', tabindex: '0', 'aria-selected': String(i === selected), 'aria-label': FM('previews.flier', n, doc.blocks.title) }, [canvas]);
    return el('figure', { class: i === selected ? 'selected' : '', role: 'none', 'data-testid': `preview-${n}` }, [
      error === null ? selectable(trim, i, view) : problem(doc, error),
      el('figcaption', { class: 'row' }, [
        textButton(FM('previews.edit', n), `edit-${n}`, () => select(i)),
        button('previews.download', `download-${n}`, () => void downloadCanvas(canvas, doc, i)),
      ]),
    ]);
  });
  container.replaceChildren(...figures);
  return canvases;
}
