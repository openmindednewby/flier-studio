import { validateFlierDoc, type FlierDoc } from '@dloizides/poster-render';
import { defaultKeyValueStore, readJson, writeJson, type KeyValueStore } from '@dloizides/save-state';

const KEY = 'flier-studio:working';

/** The unsaved working docs, written on every change so a reload keeps them. */
export class WorkingDocStore {
  private readonly kv: KeyValueStore;

  public constructor(kv: KeyValueStore = defaultKeyValueStore()) {
    this.kv = kv;
  }

  public save(docs: readonly FlierDoc[]): void {
    writeJson(this.kv, KEY, docs);
  }

  public load(): FlierDoc[] | null {
    const docs = readJson<FlierDoc[]>(this.kv, KEY);
    const valid = Array.isArray(docs) && docs.length > 0 && docs.every((doc) => validateFlierDoc(doc).ok);
    return valid ? docs : null;
  }
}
