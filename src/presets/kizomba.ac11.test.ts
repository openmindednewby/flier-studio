import { kizombaWorkshopDocs } from '@dloizides/poster-render';
import { MemoryKeyValueStore } from '@dloizides/save-state';
import { describe, expect, it } from 'vitest';
import { WorkingDocStore } from '../store/workingDocStore';
import { cloneDocs, kizombaPreset } from './kizomba';

describe('kizombaPreset', () => {
  it('with every event flier, names the levels Beginners and Intermediates', () => {
    const docs = kizombaPreset();

    const labels = docs.slice(0, 3).map((d) => d.blocks.schedule?.map((r) => r.label));

    expect(labels).toEqual([['Beginners', 'Intermediates'], ['Beginners', 'Intermediates'], ['Beginners', 'Intermediates']]);
  });

  it('with the list flier, names the levels Beginners and Intermediates on every row', () => {
    const list = kizombaPreset()[3];

    const labels = list.items?.map((i) => i.schedule.map((r) => r.label));

    expect(labels).toEqual([['Beginners', 'Intermediates'], ['Beginners', 'Intermediates'], ['Beginners', 'Intermediates']]);
  });

  it('with all 4 fliers, shows the footer "Classes by Jimmy & Ismini"', () => {
    const docs = kizombaPreset();

    const footers = docs.map((d) => d.blocks.footer);

    expect(footers).toEqual(Array(4).fill('Classes by Jimmy & Ismini'));
  });

  it('with an autosave from before the change, loads it back unchanged', () => {
    const kv = new MemoryKeyValueStore();
    const old = cloneDocs(kizombaWorkshopDocs);
    new WorkingDocStore(kv).save(old);

    const loaded = new WorkingDocStore(kv).load();

    expect(loaded?.[0].blocks.schedule?.[0].label).toBe('Level 1');
    expect(loaded?.[0].blocks.footer).toBe('with Jimmy & Ismini');
  });
});
