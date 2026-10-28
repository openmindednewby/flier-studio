import type { CutResult } from '@dloizides/background-removal';

/** Encodes the cut-out PNG in a worker: on the main thread Chromium defers the encode for about 7 s after a pointer click. */
export function encodeOffThread(cut: Pick<CutResult, 'image' | 'mask'>): Promise<Blob> {
  const worker = new Worker(new URL('./encodeWorker.ts', import.meta.url), { type: 'module' });
  return new Promise<Blob>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<Blob>) => { worker.terminate(); resolve(event.data); };
    worker.onerror = (event) => { worker.terminate(); reject(new Error(event.message)); };
    worker.postMessage({ image: cut.image, mask: cut.mask });
  }).finally(() => worker.terminate());
}
