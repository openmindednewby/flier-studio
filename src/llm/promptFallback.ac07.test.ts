import { FormatId, LayoutId, PaletteId, validateFlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { FIXED_PROMPTS } from './fixedPrompts';
import { docFromPrompt } from './promptFallback';

describe('docFromPrompt', () => {
  it('with each of the 20 fixed prompts, returns a schema-valid flier', () => {
    const results = FIXED_PROMPTS.map((p) => validateFlierDoc(docFromPrompt(p)).ok);

    expect(FIXED_PROMPTS).toHaveLength(20);
    expect(results.filter(Boolean)).toHaveLength(20);
  });

  it('with "desktop wallpaper" and "night", picks the desktop format and the night palette', () => {
    const doc = docFromPrompt('A night salsa desktop wallpaper');

    expect([doc.format, doc.palette]).toEqual([FormatId.Desktop, PaletteId.Night]);
  });

  it('with "upcoming" events, picks the list layout with at least one item', () => {
    const doc = docFromPrompt('Upcoming bachata workshops list for Instagram post');

    expect(doc.layout).toBe(LayoutId.List);
    expect(doc.format).toBe(FormatId.Post);
    expect(doc.items?.length).toBeGreaterThan(0);
  });

  it('with a dance style and a date, titles the flier with the style and scripts the date', () => {
    const doc = docFromPrompt('Kizomba workshop on Saturday 14 November at 20:00');

    expect(doc.blocks.title).toBe('KIZOMBA');
    expect(doc.blocks.script).toBe('Saturday 14 November');
    expect(doc.blocks.schedule?.[0].time).toBe('20:00');
  });

  it('with an empty prompt, falls back to the default story flier', () => {
    const doc = docFromPrompt('   ');

    expect([doc.format, doc.layout]).toEqual([FormatId.Story, LayoutId.PictureRight]);
  });
});
