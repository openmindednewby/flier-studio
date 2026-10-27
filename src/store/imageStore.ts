const STORE = 'images';

interface StoredImage {
  type: string;
  data: ArrayBuffer;
}

function done<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

/** Uploaded pictures and logos in IndexedDB, keyed by the image id the FlierDoc references. */
export class ImageStore {
  private readonly dbName: string;

  public constructor(dbName = 'flier-studio-images') {
    this.dbName = dbName;
  }

  public async put(id: string, blob: Blob): Promise<void> {
    const value: StoredImage = { type: blob.type, data: await blob.arrayBuffer() };
    await this.run('readwrite', (s) => s.put(value, id));
  }

  public async get(id: string): Promise<Blob | undefined> {
    const value = (await this.run('readonly', (s) => s.get(id))) as StoredImage | undefined;
    return value === undefined ? undefined : new Blob([value.data], { type: value.type });
  }

  public async remove(id: string): Promise<void> {
    await this.run('readwrite', (s) => s.delete(id));
  }

  public async ids(): Promise<string[]> {
    const keys = await this.run('readonly', (s) => s.getAllKeys());
    return keys.map(String);
  }

  private async run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const open = indexedDB.open(this.dbName, 1);
    open.onupgradeneeded = (): void => {
      open.result.createObjectStore(STORE);
    };
    const db = await done(open);
    try {
      return await done(op(db.transaction(STORE, mode).objectStore(STORE)));
    } finally {
      db.close();
    }
  }
}
