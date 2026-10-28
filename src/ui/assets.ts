import type { FlierDoc, PosterAssets } from '@dloizides/poster-render';
import { KIZOMBA_ASSET_URLS } from '../presets/kizomba';
import type { ImageStore } from '../store/imageStore';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = (): void => resolve(image);
    image.onerror = (): void => reject(new Error(`image failed: ${url}`));
    image.src = url;
  });
}

/** Image ids used by the docs, resolved from bundled files or uploads kept in IndexedDB. */
export class AssetBook {
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly store: ImageStore;

  public constructor(store: ImageStore) {
    this.store = store;
  }

  public async forDocs(docs: readonly FlierDoc[]): Promise<PosterAssets> {
    const ids = new Set(docs.flatMap((d) => [d.picture?.imageId, d.logo?.imageId]).filter((id): id is string => id !== undefined));
    await Promise.all([...ids].map((id) => this.ensure(id)));
    return Object.fromEntries(this.images);
  }

  public async upload(file: File, prefix: string): Promise<string> {
    const id = `${prefix}-${String(Date.now())}`;
    await this.store.put(id, file);
    await this.ensure(id);
    return id;
  }

  public async sourceOf(id: string): Promise<Blob | ImageBitmap | undefined> {
    const stored = KIZOMBA_ASSET_URLS[id] === undefined ? await this.store.get(id) : undefined;
    if (stored !== undefined) return stored;
    await this.ensure(id);
    const image = this.images.get(id);
    return image === undefined ? undefined : createImageBitmap(image);
  }

  private async ensure(id: string): Promise<void> {
    if (this.images.has(id)) return;
    const bundled = KIZOMBA_ASSET_URLS[id];
    const blob = bundled === undefined ? await this.store.get(id) : undefined;
    const url = bundled ?? (blob ? URL.createObjectURL(blob) : undefined);
    if (url === undefined) return;
    try {
      this.images.set(id, await loadImage(url));
    } catch {
      this.images.delete(id);
    }
  }
}
