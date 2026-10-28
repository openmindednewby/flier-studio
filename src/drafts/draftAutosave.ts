import type { ThemedFlier } from '../theme/flierTheme';
import type { DraftStore } from './draftStore';

export interface AutosaveEvents {
  saved(): void;
  full(): void;
  failed(reason: string): void;
}

const isQuota = (e: unknown): boolean => e instanceof DOMException && e.name === 'QuotaExceededError';

/** Saves a new draft whenever the fliers differ from the newest saved draft. */
export class DraftAutosave {
  private readonly store: DraftStore;
  private readonly events: AutosaveEvents;
  private readonly ready: Promise<void>;
  private last: string | null = null;

  public constructor(store: DraftStore, events: AutosaveEvents) {
    this.store = store;
    this.events = events;
    this.ready = store.list().then(([latest]) => { this.last = latest === undefined ? null : JSON.stringify(latest.fliers); }, () => undefined);
  }

  public async save(fliers: readonly ThemedFlier[], thumb: string, at: number = Date.now()): Promise<void> {
    await this.ready;
    const json = JSON.stringify(fliers);
    if (json === this.last) return;
    this.last = json;
    try {
      await this.store.add({ at, thumb, fliers: JSON.parse(json) as ThemedFlier[] });
      this.events.saved();
    } catch (e) {
      if (isQuota(e)) this.events.full();
      else this.events.failed(String(e));
    }
  }
}
