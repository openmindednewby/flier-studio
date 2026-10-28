import type { BackgroundRemover, CutResult } from '@dloizides/background-removal';

export interface CutoutDeps {
  sourceOf(imageId: string): Promise<Blob | ImageBitmap | undefined>;
  remover(): Promise<BackgroundRemover>;
}

/** Wraps a factory so the value is built on the first call only. */
export function lazy<T>(make: () => Promise<T>): () => Promise<T> {
  let value: Promise<T> | undefined;
  return () => (value ??= make());
}

/** Cuts the background out of the whole stored photo; the flier crops it afterwards. */
export async function cutPicture(imageId: string | undefined, deps: CutoutDeps): Promise<CutResult | undefined> {
  if (imageId === undefined) return undefined;
  const photo = await deps.sourceOf(imageId);
  if (photo === undefined) return undefined;
  return (await deps.remover()).removeBackground(photo);
}

export function cutoutFile(png: Blob): File {
  return new File([png], 'cutout.png', { type: 'image/png' });
}
