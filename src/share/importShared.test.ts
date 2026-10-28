import { MemoryKeyValueStore } from '@dloizides/save-state';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { ConfigStore } from '../store/configStore';
import { importShared } from './importShared';

describe('importShared', () => {
  it('with 4 shared fliers and one saved config, adds 4 new configs and keeps the old one byte-identical', () => {
    const kv = new MemoryKeyValueStore();
    const store = new ConfigStore(kv);
    store.save('My set', kizombaPreset().slice(0, 1));
    const oldJson = store.exportJson('My set');

    const names = importShared(store, kizombaPreset());

    expect(names).toEqual(['KIZOMBA - Saturday 31 October', 'KIZOMBA - Saturday 7 November', 'KIZOMBA - Sunday 29 November', 'UPCOMING - Kizomba']);
    expect(store.list().map((e) => e.name)).toEqual(['My set', ...names]);
    expect(store.exportJson('My set')).toBe(oldJson);
  });

  it('with a name already taken, adds a numbered copy instead of overwriting', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    const docs = kizombaPreset().slice(0, 1);
    importShared(store, docs);

    const names = importShared(store, docs);

    expect(names).toEqual(['KIZOMBA - Saturday 31 October (2)']);
  });
});
