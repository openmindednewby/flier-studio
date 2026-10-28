import { MemoryKeyValueStore } from '@dloizides/save-state';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { ConfigStore } from './configStore';

const LONGEST_ID = 64;
const configJson = (themes: unknown): string => JSON.stringify({ version: 1, timestamp: 1, name: 'Shared', docs: kizombaPreset().slice(0, 2), themes });

describe('ConfigStore.importJson', () => {
  it.each([
    ['a non-string id', ['golden-hour', 42]],
    ['fewer ids than fliers', ['golden-hour']],
    ['an id over 64 chars', ['golden-hour', 'x'.repeat(LONGEST_ID + 1)]],
    ['themes that are not a list', 'golden-hour'],
  ])('with %s, refuses the file and writes nothing', (_case, themes) => {
    const store = new ConfigStore(new MemoryKeyValueStore());

    const outcome = store.importJson(configJson(themes));

    expect(outcome.ok).toBe(false);
    expect(store.list()).toEqual([]);
  });

  it('with one id of 64 chars per flier, imports the file with its ids', () => {
    const store = new ConfigStore(new MemoryKeyValueStore());
    const themes = ['golden-hour', 'k'.repeat(LONGEST_ID)];

    const outcome = store.importJson(configJson(themes));

    expect(outcome.ok ? store.themesOf(outcome.name) : null).toEqual(themes);
  });
});
