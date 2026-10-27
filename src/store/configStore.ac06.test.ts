import { MemoryKeyValueStore } from '@dloizides/save-state';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { ConfigStore } from './configStore';

const docs = kizombaPreset().slice(0, 1);

describe('ConfigStore', () => {
  it('with a saved config, loads the same docs from a new store over the same storage (reload)', () => {
    const kv = new MemoryKeyValueStore();
    new ConfigStore(kv).save('Autumn', docs);

    const loaded = new ConfigStore(kv).load('Autumn');

    expect(loaded).toEqual(docs);
  });

  it('with two saves under one name, keeps one entry holding the latest docs', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    store.save('Autumn', docs);

    store.save('Autumn', kizombaPreset());

    expect(store.list().map((e) => e.name)).toEqual(['Autumn']);
    expect(store.load('Autumn')).toHaveLength(4);
  });

  it('with a rename, lists the new name and loads under it only', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    store.save('Autumn', docs);

    const renamed = store.rename('Autumn', 'Winter');

    expect(renamed).toBe(true);
    expect(store.list().map((e) => e.name)).toEqual(['Winter']);
    expect(store.load('Autumn')).toBeNull();
  });

  it('with a rename onto an existing name, refuses and keeps both', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    store.save('A', docs);
    store.save('B', docs);

    const renamed = store.rename('A', 'B');

    expect(renamed).toBe(false);
    expect(store.list().map((e) => e.name)).toEqual(['A', 'B']);
  });

  it('with a delete, removes the entry and its data', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    store.save('Autumn', docs);

    store.remove('Autumn');

    expect(store.list()).toEqual([]);
    expect(store.load('Autumn')).toBeNull();
  });

  it('with an exported config, imports it into another browser under the same name', () => {
    const json = (() => {
      const source = new ConfigStore(new MemoryKeyValueStore());
      source.save('Autumn', docs);
      return source.exportJson('Autumn') ?? '';
    })();
    const target = new ConfigStore(new MemoryKeyValueStore());

    const result = target.importJson(json);

    expect(result.ok).toBe(true);
    expect(target.load('Autumn')).toEqual(docs);
  });

  it('with an import whose name exists, saves it under a numbered name', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    store.save('Autumn', docs);
    const json = store.exportJson('Autumn') ?? '';

    store.importJson(json);

    expect(store.list().map((e) => e.name)).toEqual(['Autumn', 'Autumn (2)']);
  });

  it('with an import holding an invalid flier, rejects it with the schema path and stores nothing', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    const json = JSON.stringify({ version: 1, name: 'Bad', docs: [{ ...docs[0], format: 'poster' }] });

    const result = store.importJson(json);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.error).toContain('format');
    expect(store.list()).toEqual([]);
  });

  it('with a file that is not JSON, rejects it', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());

    const result = store.importJson('not json');

    expect(result.ok).toBe(false);
  });
});
