import { MemoryKeyValueStore } from '@dloizides/save-state';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { ConfigStore } from './configStore';

describe('ConfigStore.themesOf', () => {
  it('with a config saved with theme ids, returns them after a reload', () => {
    const kv = new MemoryKeyValueStore();
    const themes = ['golden-hour', 'kizomba-classic', 'golden-hour', 'golden-hour'];
    new ConfigStore(kv).save('Both', kizombaPreset(), themes);

    const read = new ConfigStore(kv).themesOf('Both');

    expect(read).toEqual(themes);
  });

  it('with a config saved before themes, returns null', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    store.save('Old', kizombaPreset());

    const read = store.themesOf('Old');

    expect(read).toBeNull();
  });

  it('with an exported config re-imported, keeps its theme ids', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    store.save('Gold', kizombaPreset().slice(0, 1), ['golden-hour']);
    const json = store.exportJson('Gold') ?? '';

    const outcome = store.importJson(json);

    expect(outcome.ok ? store.themesOf(outcome.name) : null).toEqual(['golden-hour']);
  });
});
