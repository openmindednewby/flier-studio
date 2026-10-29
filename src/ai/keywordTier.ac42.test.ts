import { describe, expect, it } from 'vitest';
import { settingsFromPrompt } from './keywordTier';

describe('settingsFromPrompt', () => {
  it('with a rose tango phone wallpaper, picks phone, rose and TANGO', () => {
    const prompt = 'Phone wallpaper, rose colours, tango';

    const s = settingsFromPrompt(prompt);

    expect([s.format, s.palette, s.title]).toEqual(['phone', 'rose', 'TANGO']);
  });

  it('with a date and a time range, keeps both as short texts', () => {
    const prompt = 'Tango milonga on Saturday 21 November 21:00 - 01:00';

    const s = settingsFromPrompt(prompt);

    expect([s.date, s.time]).toEqual(['Saturday 21 November', '21:00 - 01:00']);
  });
});
