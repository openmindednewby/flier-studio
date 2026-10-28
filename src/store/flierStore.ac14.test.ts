import { MemoryKeyValueStore, writeJson } from '@dloizides/save-state';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { toDoc, toThemed } from '../theme/flierTheme';
import { FlierStore } from './flierStore';
import { WorkingDocStore } from './workingDocStore';

describe('FlierStore', () => {
  it('with only an autosave from before themes, loads it as Kizomba classic with the same docs', () => {
    const kv = new MemoryKeyValueStore();
    const old = kizombaPreset();
    new WorkingDocStore(kv).save(old);

    const loaded = new FlierStore(kv).load();

    expect(loaded?.map((f) => f.themeId)).toEqual(Array(old.length).fill('kizomba-classic'));
    expect(loaded?.map(toDoc)).toEqual(old);
  });

  it('with themed fliers saved, loads them back with their theme', () => {
    const kv = new MemoryKeyValueStore();
    const fliers = kizombaPreset().map((d) => ({ ...toThemed(d), themeId: 'golden-hour' }));
    new FlierStore(kv).save(fliers);

    const loaded = new FlierStore(kv).load();

    expect(loaded).toEqual(fliers);
  });

  it('with a broken themed save and no old autosave, loads nothing', () => {
    const kv = new MemoryKeyValueStore();
    writeJson(kv, 'flier-studio:fliers', [{ themeId: 'kizomba-classic', content: {}, style: {} }]);

    const loaded = new FlierStore(kv).load();

    expect(loaded).toBeNull();
  });

  it('with a remembered style that is not a valid style, loads nothing', () => {
    const kv = new MemoryKeyValueStore();
    const flier = toThemed(kizombaPreset()[0]);
    writeJson(kv, 'flier-studio:fliers', [{ ...flier, kept: { 'golden-hour': { palette: 42 } } }]);

    const loaded = new FlierStore(kv).load();

    expect(loaded).toBeNull();
  });

  it('with a valid remembered style, loads the flier with it', () => {
    const kv = new MemoryKeyValueStore();
    const flier = toThemed(kizombaPreset()[0]);
    const fliers = [{ ...flier, themeId: 'golden-hour', kept: { 'kizomba-classic': flier.style } }];
    new FlierStore(kv).save(fliers);

    const loaded = new FlierStore(kv).load();

    expect(loaded).toEqual(fliers);
  });
});
