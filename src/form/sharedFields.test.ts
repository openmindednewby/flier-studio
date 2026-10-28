import type { FlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { cloneDocs, kizombaPreset } from '../presets/kizomba';
import { EditScope } from './EditScope';
import { nextDocs } from './sharedFields';

function edit(doc: FlierDoc, change: (d: FlierDoc) => void): FlierDoc {
  const copy = cloneDocs([doc])[0];
  change(copy);
  return copy;
}

describe('nextDocs', () => {
  it('with All and a new footer, sets that footer on every flier', () => {
    const docs = kizombaPreset();
    const edited = edit(docs[1], (d) => { d.blocks.footer = 'Hosted by Bailemos'; });

    const out = nextDocs(EditScope.All, docs, 1, edited);

    expect(out.map((d) => d.blocks.footer)).toEqual(['Hosted by Bailemos', 'Hosted by Bailemos', 'Hosted by Bailemos', 'Hosted by Bailemos']);
  });

  it('with This and a new footer, changes only the edited flier', () => {
    const docs = kizombaPreset();
    const edited = edit(docs[0], (d) => { d.blocks.footer = 'Only here'; });

    const out = nextDocs(EditScope.This, docs, 0, edited);

    expect(out.map((d) => d.blocks.footer)).toEqual(['Only here', docs[1].blocks.footer, docs[2].blocks.footer, docs[3].blocks.footer]);
  });

  it('with All and a renamed first level, renames it on every schedule and every list row', () => {
    const docs = kizombaPreset();
    const edited = edit(docs[0], (d) => { d.blocks.schedule![0].label = 'Starters'; });

    const out = nextDocs(EditScope.All, docs, 0, edited);

    const firsts = [...out.slice(0, 3).map((d) => d.blocks.schedule?.[0].label), ...(out[3].items ?? []).map((i) => i.schedule[0].label)];
    expect(firsts).toEqual(['Starters', 'Starters', 'Starters', 'Starters', 'Starters', 'Starters']);
    expect(out[2].blocks.schedule?.[1].label).toBe(docs[2].blocks.schedule?.[1].label);
  });

  it('with All and a new class price, sets the first price row on every flier and keeps party prices', () => {
    const docs = kizombaPreset();
    const edited = edit(docs[2], (d) => { d.blocks.prices![0] = { amount: '6€', label: 'per class' }; });

    const out = nextDocs(EditScope.All, docs, 2, edited);

    expect(out.map((d) => d.blocks.prices?.[0])).toEqual(Array(4).fill({ amount: '6€', label: 'per class' }));
    expect(out[0].blocks.prices?.[1].amount).toBe('20€');
  });

  it('with All and a new title, changes only the edited flier', () => {
    const docs = kizombaPreset();
    const edited = edit(docs[0], (d) => { d.blocks.title = 'SALSA'; });

    const out = nextDocs(EditScope.All, docs, 0, edited);

    expect(out.map((d) => d.blocks.title)).toEqual(['SALSA', 'KIZOMBA', 'KIZOMBA', 'UPCOMING']);
  });
});
