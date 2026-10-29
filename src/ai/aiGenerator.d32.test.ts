import { describe, expect, it } from 'vitest';
import { outcomeFor } from './aiGenerator';
import { AiStatus } from './AiStatus';
import type { EmbedSettings } from './embedTier';
import { settingsFromPrompt } from './keywordTier';

describe('outcomeFor', () => {
  it('with a failed model, fills the flier from the keyword match and says the model failed', () => {
    const prompt = 'Tango milonga on Saturday 21 November 21:00 - 01:00';

    const outcome = outcomeFor(prompt, AiStatus.Failed);

    expect([outcome.status, outcome.doc.blocks.title, outcome.doc.blocks.script]).toEqual([AiStatus.Failed, 'TANGO', 'Saturday 21 November']);
  });

  it('with model settings, takes the model palette and the keyword title it left open', () => {
    const prompt = 'Milonga on Saturday 21 November';
    const settings = { ...settingsFromPrompt(''), palette: 'rose', title: 'KIZOMBA', matched: ['palette'] } as EmbedSettings;

    const outcome = outcomeFor(prompt, settings);

    expect([outcome.status, outcome.doc.palette, outcome.doc.blocks.title]).toEqual([AiStatus.Model, 'rose', 'MILONGA']);
  });

  it('with model settings that matched no field, says the keywords filled the flier', () => {
    const prompt = 'Milonga on Saturday 21 November';
    const settings: EmbedSettings = { ...settingsFromPrompt(''), matched: [] };

    const outcome = outcomeFor(prompt, settings);

    expect([outcome.status, outcome.doc.blocks.title]).toEqual([AiStatus.KeywordsOnly, 'MILONGA']);
  });
});
