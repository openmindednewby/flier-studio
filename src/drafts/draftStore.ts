import type { ThemedFlier } from '../theme/flierTheme';
import { newestFirst, prunable } from './draftRetention';

export interface Draft {
  readonly id: number;
  readonly at: number;
  readonly starred: boolean;
  readonly fliers: ThemedFlier[];
  readonly thumb: string;
}

export type NewDraft = Omit<Draft, 'id' | 'starred'>;

const DB = 'flier-studio-drafts';
const STORE = 'drafts';
const VERSION = 1;

function done<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => reject(request.error ?? new Error(DB));
  });
}

function committed(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = (): void => resolve();
    tx.onabort = (): void => reject(tx.error ?? new Error(DB));
  });
}

function open(factory: IDBFactory | null): Promise<IDBDatabase> {
  if (factory === null) return Promise.reject(new Error(DB));
  const request = factory.open(DB, VERSION);
  request.onupgradeneeded = (): void => {
    request.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
  };
  return done(request);
}

/** Every saved version of the fliers on this device, newest first; nothing leaves the browser. */
export class DraftStore {
  private readonly db: Promise<IDBDatabase>;

  public constructor(factory: IDBFactory | null = globalThis.indexedDB ?? null) {
    this.db = Promise.resolve().then(() => open(factory));
    this.db.catch(() => undefined);
  }

  public async list(): Promise<Draft[]> {
    const all = await done((await this.tx('readonly')).objectStore(STORE).getAll() as IDBRequest<Draft[]>);
    return all.sort(newestFirst);
  }

  public async add(draft: NewDraft): Promise<void> {
    const tx = await this.tx('readwrite');
    tx.objectStore(STORE).add({ ...draft, starred: false });
    await committed(tx);
    await this.prune().catch(() => undefined);
  }

  public async star(id: number, starred: boolean): Promise<void> {
    const tx = await this.tx('readwrite');
    const store = tx.objectStore(STORE);
    const request = store.get(id) as IDBRequest<Draft | undefined>;
    request.onsuccess = (): void => {
      if (request.result !== undefined) store.put({ ...request.result, starred });
    };
    await committed(tx);
  }

  private async prune(): Promise<void> {
    const gone = prunable(await this.list());
    if (gone.length === 0) return;
    const pruning = await this.tx('readwrite');
    for (const id of gone) pruning.objectStore(STORE).delete(id);
    await committed(pruning);
  }

  private async tx(mode: IDBTransactionMode): Promise<IDBTransaction> {
    return (await this.db).transaction(STORE, mode);
  }
}
