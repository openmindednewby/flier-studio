import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it, vi } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { toThemed } from '../theme/flierTheme';
import { KEEP_UNSTARRED, prunable } from './draftRetention';
import { DraftAutosave } from './draftAutosave';
import { DraftStore, type NewDraft } from './draftStore';

const fliers = kizombaPreset().map((d) => toThemed(d));
const draftAt = (at: number): NewDraft => ({ at, thumb: '', fliers });
const meta = (id: number, starred = false): { id: number; at: number; starred: boolean } => ({ id, at: id * 1000, starred });

describe('prunable', () => {
  it('with 3 unstarred drafts and keep 2, returns the oldest one', () => {
    const drafts = [meta(1), meta(2), meta(3)];

    const gone = prunable(drafts, 2);

    expect(gone).toEqual([1]);
  });

  it('with the oldest draft starred, never returns it', () => {
    const drafts = [meta(1, true), meta(2), meta(3), meta(4)];

    const gone = prunable(drafts, 2);

    expect(gone).toEqual([2]);
  });
});

describe('DraftStore', () => {
  it('with 3 drafts added, lists them newest first', async () => {
    const store = new DraftStore(new IDBFactory());
    for (const at of [1, 3, 2]) await store.add(draftAt(at));

    const drafts = await store.list();

    expect(drafts.map((d) => d.at)).toEqual([3, 2, 1]);
  });

  it('with 2 more unstarred drafts than the cap after a starred one, keeps the starred one and the newest cap', async () => {
    const keep = KEEP_UNSTARRED;
    const newestAt = keep + 3;
    const store = new DraftStore(new IDBFactory());
    await store.add(draftAt(1));
    await store.star((await store.list())[0].id, true);
    for (let at = 2; at <= newestAt; at++) await store.add(draftAt(at));

    const drafts = await store.list();

    expect(drafts).toHaveLength(keep + 1);
    expect(drafts.filter((d) => d.starred).map((d) => d.at)).toEqual([1]);
    expect(Math.min(...drafts.filter((d) => !d.starred).map((d) => d.at))).toBe(newestAt - keep + 1);
  });

  it('with no IndexedDB on the device, constructs and every call rejects', async () => {
    const store = new DraftStore(null);

    const listing = store.list();

    await expect(listing).rejects.toThrow();
    await expect(store.add(draftAt(1))).rejects.toThrow();
    await expect(store.star(1, true)).rejects.toThrow();
  });

  it('with an IndexedDB open that throws, constructs and list rejects', async () => {
    const factory = new IDBFactory();
    vi.spyOn(factory, 'open').mockImplementation(() => { throw new DOMException('blocked', 'SecurityError'); });
    const store = new DraftStore(factory);

    const listing = store.list();

    await expect(listing).rejects.toThrow('blocked');
  });

  it('with pruning failing after a save, resolves the add and keeps the draft', async () => {
    const store = new DraftStore(new IDBFactory());
    vi.spyOn(store as unknown as { prune: () => Promise<void> }, 'prune').mockRejectedValue(new Error('prune'));

    await store.add(draftAt(7));

    expect((await store.list()).map((d) => d.at)).toEqual([7]);
  });
});

describe('DraftAutosave', () => {
  it('with the same fliers saved twice, stores one draft', async () => {
    const store = new DraftStore(new IDBFactory());
    const saved = vi.fn();
    const autosave = new DraftAutosave(store, { saved, full: vi.fn(), failed: vi.fn() });

    await autosave.save(fliers, '', 1);
    await autosave.save(fliers, '', 2);

    expect(await store.list()).toHaveLength(1);
    expect(saved).toHaveBeenCalledTimes(1);
  });

  it('with a QuotaExceededError on add, reports full and not failed', async () => {
    const store = new DraftStore(new IDBFactory());
    vi.spyOn(store, 'add').mockRejectedValue(new DOMException('full', 'QuotaExceededError'));
    const events = { saved: vi.fn(), full: vi.fn(), failed: vi.fn() };
    const autosave = new DraftAutosave(store, events);

    await autosave.save(fliers, '', 1);

    expect(events.full).toHaveBeenCalledTimes(1);
    expect(events.failed).not.toHaveBeenCalled();
  });

  it('with a different error on add, reports failed and not full', async () => {
    const store = new DraftStore(new IDBFactory());
    vi.spyOn(store, 'add').mockRejectedValue(new DOMException('gone', 'InvalidStateError'));
    const events = { saved: vi.fn(), full: vi.fn(), failed: vi.fn() };
    const autosave = new DraftAutosave(store, events);

    await autosave.save(fliers, '', 1);

    expect(events.failed).toHaveBeenCalledTimes(1);
    expect(events.full).not.toHaveBeenCalled();
  });

  it('with a QuotaExceededError on add, resolves false', async () => {
    const store = new DraftStore(new IDBFactory());
    vi.spyOn(store, 'add').mockRejectedValue(new DOMException('full', 'QuotaExceededError'));
    const autosave = new DraftAutosave(store, { saved: vi.fn(), full: vi.fn(), failed: vi.fn() });

    const ok = await autosave.save(fliers, '', 1);

    expect(ok).toBe(false);
  });

  it('with a failed add, retries the same fliers on the next save instead of skipping them', async () => {
    const store = new DraftStore(new IDBFactory());
    const add = vi.spyOn(store, 'add').mockRejectedValueOnce(new DOMException('gone', 'InvalidStateError'));
    const autosave = new DraftAutosave(store, { saved: vi.fn(), full: vi.fn(), failed: vi.fn() });
    await autosave.save(fliers, '', 1);

    const ok = await autosave.save(fliers, '', 2);

    expect(ok).toBe(true);
    expect(add).toHaveBeenCalledTimes(2);
  });

  it('with unchanged fliers already saved, resolves true without adding', async () => {
    const store = new DraftStore(new IDBFactory());
    const autosave = new DraftAutosave(store, { saved: vi.fn(), full: vi.fn(), failed: vi.fn() });
    await autosave.save(fliers, '', 1);

    const ok = await autosave.save(fliers, '', 2);

    expect(ok).toBe(true);
    expect(await store.list()).toHaveLength(1);
  });
});
