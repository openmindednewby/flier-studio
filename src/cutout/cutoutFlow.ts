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

export interface InFlight {
  track<T>(work: Promise<T>): Promise<T>;
  settled(): Promise<void>;
}

/** Remembers unfinished work so a cut waits for the picture the user just uploaded. */
export function inFlight(): InFlight {
  const pending = new Set<Promise<unknown>>();
  return {
    track: (work) => {
      pending.add(work);
      work.then(() => pending.delete(work), () => pending.delete(work));
      return work;
    },
    settled: async () => { await Promise.allSettled([...pending]); },
  };
}

export function cutoutFile(png: Blob): File {
  return new File([png], 'cutout.png', { type: 'image/png' });
}
