import { committed, done, openKeyed } from '../store/idb';
import type { ThemedFlier } from '../theme/flierTheme';

export interface Template {
  readonly id: number;
  readonly at: number;
  readonly name: string;
  readonly flier: ThemedFlier;
  readonly thumb: string;
}

export type NewTemplate = Omit<Template, 'id'>;

const DB = 'flier-studio-templates';
const STORE = 'templates';

/** The user's own one-flier templates on this device, newest first; nothing leaves the browser. */
export class TemplateStore {
  private readonly db: Promise<IDBDatabase>;

  public constructor(factory: IDBFactory | null = globalThis.indexedDB ?? null) {
    this.db = Promise.resolve().then(() => openKeyed(factory, DB, STORE));
    this.db.catch(() => undefined);
  }

  public async list(): Promise<Template[]> {
    const all = await done((await this.tx('readonly')).objectStore(STORE).getAll() as IDBRequest<Template[]>, DB);
    return all.sort((a, b) => b.at - a.at || b.id - a.id);
  }

  public async add(template: NewTemplate): Promise<void> {
    const tx = await this.tx('readwrite');
    tx.objectStore(STORE).add(JSON.parse(JSON.stringify(template)) as NewTemplate);
    await committed(tx, DB);
  }

  public async rename(id: number, name: string): Promise<void> {
    const given = name.trim();
    if (given === '') return;
    const tx = await this.tx('readwrite');
    const store = tx.objectStore(STORE);
    const request = store.get(id) as IDBRequest<Template | undefined>;
    request.onsuccess = (): void => {
      if (request.result !== undefined) store.put({ ...request.result, name: given });
    };
    await committed(tx, DB);
  }

  public async remove(id: number): Promise<void> {
    const tx = await this.tx('readwrite');
    tx.objectStore(STORE).delete(id);
    await committed(tx, DB);
  }

  private async tx(mode: IDBTransactionMode): Promise<IDBTransaction> {
    return (await this.db).transaction(STORE, mode);
  }
}
