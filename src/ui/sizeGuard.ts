import { render, type FlierDoc, type LineKey, type PosterAssets } from '@dloizides/poster-render';
import { recordingCanvas } from './textRuns';

const book: { assets: PosterAssets | undefined } = { assets: undefined };

/** Keeps the assets of the last preview render for size checks. */
export function rememberAssets(assets: PosterAssets): void {
  book.assets = assets;
}

/** The tallest box of the lines when the doc is drawn, in poster pixels; 0 when it cannot be drawn. */
export function drawnHeight(doc: FlierDoc, lines: readonly LineKey[]): number {
  if (book.assets === undefined) return 0;
  try {
    const boxes = render(doc, book.assets, recordingCanvas(document.createElement('canvas'))).lineBoxes;
    return Math.max(0, ...lines.map((k) => boxes[k]?.h ?? 0));
  } catch {
    return 0;
  }
}

/** False when the step would draw the lines smaller than they are now. */
export function neverShrinks(before: FlierDoc, after: FlierDoc, lines: readonly LineKey[], measure = drawnHeight): boolean {
  const now = measure(before, lines);
  return now === 0 || measure(after, lines) >= now;
}
