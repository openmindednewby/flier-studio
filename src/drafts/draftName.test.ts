import { describe, expect, it } from 'vitest';
import type { ThemedFlier } from '../theme/flierTheme';
import { draftClock, draftName } from './draftName';

const AT = Date.UTC(2026, 9, 29, 9, 12);
const flier = (title: string): ThemedFlier => ({ themeId: 'kizomba-classic', content: { blocks: { title } }, style: {} }) as unknown as ThemedFlier;

describe('draftName', () => {
  it('with no given name, joins the first title and the saved time', () => {
    const draft = { at: AT, fliers: [flier('Bachata night'), flier('Other')] };

    const name = draftName(draft);

    expect(name).toBe(`Bachata night, ${draftClock(AT)}`);
  });

  it('with a given name, shows it as typed', () => {
    const draft = { name: 'Friday class', at: AT, fliers: [flier('Bachata night')] };

    const name = draftName(draft);

    expect(name).toBe('Friday class');
  });

  it('with a blank name and an empty title, falls back to the untitled draft and its time', () => {
    const draft = { name: '  ', at: AT, fliers: [flier('')] };

    const name = draftName(draft);

    expect(name).toBe(`Draft, ${draftClock(AT)}`);
  });
});
