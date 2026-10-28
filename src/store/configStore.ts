import { validateFlierDoc, type FlierDoc } from '@dloizides/poster-render';
import { SlotStore, defaultKeyValueStore, readJson, writeJson, type KeyValueStore } from '@dloizides/save-state';
import { FM } from '../i18n/fm';
import { cloneDocs } from '../presets/kizomba';

const INDEX_KEY = 'flier-studio:configs';
const PREFIX = 'flier-studio:config:';
const VERSION = 1;
const FIRST_COPY = 2;

interface IndexEntry {
  slot: number;
  name: string;
}

export interface SavedConfig {
  version: 1;
  timestamp: number;
  name: string;
  docs: FlierDoc[];
}

export interface ConfigEntry extends IndexEntry {
  timestamp?: number;
}

export type ImportOutcome = { ok: true; name: string } | { ok: false; error: string };

function readImport(json: string): SavedConfig | string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return FM('errors.configNotJson');
  }
  const raw = parsed as Partial<SavedConfig> | null;
  const hasShape = raw !== null && typeof raw === 'object' && typeof raw.name === 'string' && Array.isArray(raw.docs);
  if (!hasShape || raw.version !== VERSION || raw.docs === undefined || raw.docs.length === 0) {
    return FM('errors.configNotFlier');
  }
  const errors = raw.docs.flatMap((doc, i) => {
    const result = validateFlierDoc(doc);
    return result.ok ? [] : result.errors.map((e) => 'docs[' + String(i) + '].' + e);
  });
  return errors.length > 0 ? errors.join('; ') : (raw as SavedConfig);
}

/** Named flier configs in browser storage, one save-state slot each, plus a name index. */
export class ConfigStore {
  private readonly kv: KeyValueStore;
  private readonly slots: SlotStore<SavedConfig>;

  public constructor(kv: KeyValueStore = defaultKeyValueStore()) {
    this.kv = kv;
    this.slots = new SlotStore<SavedConfig>({ prefix: PREFIX, version: VERSION, store: kv });
  }

  public list(): ConfigEntry[] {
    return this.index().map((e) => ({ ...e, timestamp: this.slots.meta(e.slot).timestamp }));
  }

  public save(name: string, docs: readonly FlierDoc[]): void {
    const index = this.index();
    let entry = index.find((e) => e.name === name);
    if (entry === undefined) {
      entry = { slot: index.reduce((max, e) => Math.max(max, e.slot), 0) + 1, name };
      index.push(entry);
      writeJson(this.kv, INDEX_KEY, index);
    }
    this.slots.save(entry.slot, { version: VERSION, timestamp: Date.now(), name, docs: cloneDocs(docs) });
  }

  public load(name: string): FlierDoc[] | null {
    const entry = this.find(name);
    return entry === undefined ? null : (this.slots.load(entry.slot)?.docs ?? null);
  }

  public rename(from: string, to: string): boolean {
    const index = this.index();
    const entry = index.find((e) => e.name === from);
    if (entry === undefined || to.trim() === '' || index.some((e) => e.name === to)) return false;
    const data = this.slots.load(entry.slot);
    entry.name = to;
    writeJson(this.kv, INDEX_KEY, index);
    if (data !== null) this.slots.save(entry.slot, { ...data, name: to });
    return true;
  }

  public remove(name: string): void {
    const entry = this.find(name);
    if (entry === undefined) return;
    this.slots.delete(entry.slot);
    writeJson(this.kv, INDEX_KEY, this.index().filter((e) => e.slot !== entry.slot));
  }

  public exportJson(name: string): string | null {
    const entry = this.find(name);
    return entry === undefined ? null : this.slots.toJson(entry.slot);
  }

  public importJson(json: string): ImportOutcome {
    const read = readImport(json);
    if (typeof read === 'string') return { ok: false, error: read };
    return { ok: true, name: this.addNew(read.name, read.docs) };
  }

  public addNew(name: string, docs: readonly FlierDoc[]): string {
    const free = this.freeName(name);
    this.save(free, docs);
    return free;
  }

  private index(): IndexEntry[] {
    return readJson<IndexEntry[]>(this.kv, INDEX_KEY) ?? [];
  }

  private find(name: string): IndexEntry | undefined {
    return this.index().find((e) => e.name === name);
  }

  private freeName(name: string): string {
    const taken = new Set(this.index().map((e) => e.name));
    let candidate = name;
    for (let n = FIRST_COPY; taken.has(candidate); n++) candidate = name + ' (' + String(n) + ')';
    return candidate;
  }
}
