import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { toThemed } from '../theme/flierTheme';
import { prunable } from './draftRetention';
import { DraftAutosave } from './draftAutosave';
import { DraftStore } from './draftStore';

const fliers = kizombaPreset().map((d) => toThemed(d));
const events = { saved: (): void => undefined, full: (): void => undefined, failed: (): void => undefined };

describe('draft names', () => {
  it('with the newest draft renamed "Friday social", the next autosave keeps that name', async () => {
    const store = new DraftStore(new IDBFactory());
    await store.add({ at: 1, thumb: '', fliers });
    const [first] = await store.list();
    await store.rename(first?.id ?? 0, 'Friday social');
    const autosave = new DraftAutosave(store, events);
    const edited = fliers.map((f, i) => (i === 0 ? { ...f, content: { ...f.content, blocks: { ...f.content.blocks, title: 'Edited' } } } : f));

    await autosave.save(edited, '', 2);

    const [newest] = await store.list();
    expect(newest?.at).toBe(2);
    expect(newest?.name).toBe('Friday social');
  });

  it('with the oldest draft named and keep 2, never returns it', () => {
    const drafts = [{ id: 1, at: 1000, starred: false, name: 'Friday social' }, { id: 2, at: 2000, starred: false }, { id: 3, at: 3000, starred: false }, { id: 4, at: 4000, starred: false }];

    const gone = prunable(drafts, 2);

    expect(gone).toEqual([2]);
  });
});
