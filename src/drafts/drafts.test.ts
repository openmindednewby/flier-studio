import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it, vi } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { toThemed } from '../theme/flierTheme';
import { prunable } from './draftRetention';
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

  it('with 52 unstarred drafts after a starred one, keeps the starred one and the newest 50', async () => {
    const store = new DraftStore(new IDBFactory());
    await store.add(draftAt(1));
    await store.star((await store.list())[0].id, true);
    for (let at = 2; at <= 53; at++) await store.add(draftAt(at));

    const drafts = await store.list();

    expect(drafts).toHaveLength(51);
    expect(drafts.filter((d) => d.starred).map((d) => d.at)).toEqual([1]);
    expect(Math.min(...drafts.filter((d) => !d.starred).map((d) => d.at))).toBe(4);
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
});
