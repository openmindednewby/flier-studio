import { describe, expect, it } from 'vitest';
import type { AiSettings } from './aiSettings';
import { gapFill } from './gapFill';
import { settingsFromPrompt } from './keywordTier';

const base = settingsFromPrompt('');

describe('gapFill', () => {
  it('with a field the embedding matched, keeps the embedding value', () => {
    const embed = { ...base, palette: 'night', title: 'KIZOMBA' } as AiSettings;
    const keyword = { ...base, palette: 'sea', title: 'KIZOMBA' } as AiSettings;

    const s = gapFill(embed, keyword);

    expect(s.palette).toBe('night');
  });

  it('with a field the embedding left at its fallback, takes the keyword value', () => {
    const embed = { ...base, title: 'KIZOMBA' } as AiSettings;
    const keyword = { ...base, title: 'MILONGA' } as AiSettings;

    const s = gapFill(embed, keyword);

    expect(s.title).toBe('MILONGA');
  });

  it('with a date and time only the keyword match reads, keeps the keyword date and time', () => {
    const embed = { ...base, date: '', time: '' } as AiSettings;
    const keyword = { ...base, date: 'Saturday 21 November', time: '21:00' } as AiSettings;

    const s = gapFill(embed, keyword);

    expect([s.date, s.time]).toEqual(['Saturday 21 November', '21:00']);
  });
});
