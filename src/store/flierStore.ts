import { validateFlierDoc } from '@dloizides/poster-render';
import { defaultKeyValueStore, readJson, writeJson, type KeyValueStore } from '@dloizides/save-state';
import { toDoc, toThemed, type ThemedFlier } from '../theme/flierTheme';
import { WorkingDocStore } from './workingDocStore';

const KEY = 'flier-studio:fliers';

const keptValid = (f: ThemedFlier): boolean => {
  if (f.kept === undefined) return true;
  if (typeof f.kept !== 'object' || f.kept === null || Array.isArray(f.kept)) return false;
  return Object.values(f.kept).every((style) => style === undefined || (typeof style === 'object' && style !== null && validateFlierDoc(toDoc({ ...f, style })).ok));
};

const isFlier = (f: ThemedFlier): boolean =>
  typeof f === 'object' && f !== null && typeof f.themeId === 'string' && typeof f.content === 'object' && validateFlierDoc(toDoc(f)).ok && keptValid(f);

/** The unsaved working fliers as content + theme; reads an autosave from before themes as Kizomba classic. */
export class FlierStore {
  private readonly kv: KeyValueStore;

  public constructor(kv: KeyValueStore = defaultKeyValueStore()) {
    this.kv = kv;
  }

  public save(fliers: readonly ThemedFlier[]): void {
    writeJson(this.kv, KEY, fliers);
  }

  public load(): ThemedFlier[] | null {
    const fliers = readJson<ThemedFlier[]>(this.kv, KEY);
    if (Array.isArray(fliers) && fliers.length > 0 && fliers.every(isFlier)) return fliers;
    return new WorkingDocStore(this.kv).load()?.map((doc) => toThemed(doc)) ?? null;
  }
}
