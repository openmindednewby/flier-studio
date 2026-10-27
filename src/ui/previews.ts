import { FlierDocError, exportPng, render, type FlierDoc, type PosterAssets, type PosterCanvas } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import { button, downloadBlob, el } from './dom';

export function downloadCanvas(canvas: HTMLCanvasElement, doc: FlierDoc, index: number): void {
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

/** One live canvas per flier with edit and PNG download; returns the canvases in doc order. */
export function renderPreviews(container: HTMLElement, docs: readonly FlierDoc[], assets: PosterAssets, selected: number, select: (i: number) => void): HTMLCanvasElement[] {
  const canvases = docs.map(() => el('canvas', { role: 'img' }));
  const figures = docs.map((doc, i) => {
    const canvas = canvases[i];
    canvas.setAttribute('aria-label', doc.blocks.title);
    const error = draw(doc, assets, canvas);
    const n = String(i + 1);
    return el('figure', { class: i === selected ? 'selected' : '', 'data-testid': `preview-${n}` }, [
      error === null ? canvas : el('p', { class: 'error', role: 'alert', text: FM('form.invalid', error) }),
      el('figcaption', { class: 'row' }, [
        button('previews.edit', `edit-${n}`, () => select(i)),
        button('previews.download', `download-${n}`, () => downloadCanvas(canvas, doc, i)),
      ]),
    ]);
  });
  figures.forEach((f, i) => f.querySelector('button')?.replaceChildren(FM('previews.edit', String(i + 1))));
  container.replaceChildren(...figures);
  return canvases;
}
