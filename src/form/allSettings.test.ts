import type { FlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { EACH_OWN, SETTINGS, applySetting, sharedSummary, sharedValue } from './allSettings';
import { layoutsFor } from './layoutOptions';
import { SettingId } from './SettingId';

describe('applySetting', () => {
  it('with a palette, puts every flier on it', () => {
    const docs = kizombaPreset();
    const palette = SETTINGS.find((s) => s.id === SettingId.Palette)?.options(docs)[1] ?? '';

    const out = applySetting(docs, SettingId.Palette, palette);

    expect(out.map((d) => d.palette)).toEqual(Array(docs.length).fill(palette));
  });

  it('with a layout that does not fit a flier format, leaves that flier on its own layout', () => {
    const docs = kizombaPreset();
    const misfit = docs.findIndex((d) => !layoutsFor(d.format).some((e) => e.id === 'arch'));

    const out = applySetting(docs, SettingId.Layout, 'arch');

    expect(misfit === -1 || out[misfit].layout === docs[misfit].layout).toBe(true);
    expect(out.filter((d) => layoutsFor(d.format).some((e) => e.id === 'arch')).every((d) => d.layout === 'arch')).toBe(true);
  });

  it("with Each flier's own, changes nothing", () => {
    const docs = kizombaPreset();

    const out = applySetting(docs, SettingId.Fonts, EACH_OWN);

    expect(out).toEqual(docs);
  });
});

describe('sharedValue', () => {
  it("with fliers on different fonts, returns Each flier's own; with one font, returns it", () => {
    const docs = kizombaPreset();
    const mixed: FlierDoc[] = [{ ...docs[0], fonts: 'a' } as unknown as FlierDoc, { ...docs[1], fonts: 'b' } as unknown as FlierDoc];
    const same: FlierDoc[] = [{ ...docs[0], fonts: 'a' } as unknown as FlierDoc, { ...docs[1], fonts: 'a' } as unknown as FlierDoc];

    const values = [sharedValue(mixed, SettingId.Fonts), sharedValue(same, SettingId.Fonts)];

    expect(values).toEqual([EACH_OWN, 'a']);
  });
});

describe('sharedSummary', () => {
  it('with a footer, four levels and a price, returns the footer, the first three levels and amount plus label', () => {
    const doc = { ...kizombaPreset()[0] };
    doc.blocks = { title: 'T', footer: 'By Jimmy', schedule: [{ label: 'A', time: '1' }, { label: 'B', time: '2' }, { label: 'C', time: '3' }, { label: 'D', time: '4' }], prices: [{ amount: '5€', label: 'per hour' }] };

    const summary = sharedSummary(doc);

    expect(summary).toEqual({ footer: 'By Jimmy', levels: 'A, B, C', price: '5€ per hour' });
  });
});
