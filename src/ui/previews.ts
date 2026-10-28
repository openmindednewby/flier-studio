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

export interface PreviewView {
  selected: number;
  select: (i: number) => void;
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
    return el('figure', { class: i === selected ? 'selected' : '', 'data-testid': `preview-${n}` }, [
      error === null ? canvas : problem(doc, error),
      el('figcaption', { class: 'row' }, [
        textButton(FM('previews.edit', n), `edit-${n}`, () => select(i)),
        button('previews.download', `download-${n}`, () => void downloadCanvas(canvas, doc, i)),
      ]),
    ]);
  });
  container.replaceChildren(...figures);
  return canvases;
}
