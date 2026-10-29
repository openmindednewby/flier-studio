import { describe, expect, it } from 'vitest';
import type { AiSettings } from './aiSettings';
import { outcomeFor } from './aiGenerator';
import { settingsFromPrompt } from './keywordTier';

describe('outcomeFor', () => {
  it('with no model settings, fills the flier from the keyword match', () => {
    const prompt = 'Tango milonga on Saturday 21 November 21:00 - 01:00';

    const outcome = outcomeFor(prompt, undefined);

    expect([outcome.byModel, outcome.doc.blocks.title, outcome.doc.blocks.script]).toEqual([false, 'TANGO', 'Saturday 21 November']);
  });

  it('with model settings, takes the model palette and the keyword title it left open', () => {
    const prompt = 'Milonga on Saturday 21 November';
    const settings = { ...settingsFromPrompt(''), palette: 'rose', title: 'KIZOMBA' } as AiSettings;

    const outcome = outcomeFor(prompt, settings);

    expect([outcome.byModel, outcome.doc.palette, outcome.doc.blocks.title]).toEqual([true, 'rose', 'MILONGA']);
  });
});
