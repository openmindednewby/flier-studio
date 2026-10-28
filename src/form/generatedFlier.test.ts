import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { toThemed } from '../theme/flierTheme';
import { ThemeId } from '../theme/ThemeId';
import { withGenerated } from './generatedFlier';

describe('withGenerated', () => {
  it('with four working fliers and a generated flier, keeps all four and adds the new one last', () => {
    const working = kizombaPreset().map((d) => toThemed(d, ThemeId.GoldenHour));
    const preset = kizombaPreset()[0];
    const generated = { ...preset, blocks: { ...preset.blocks, script: 'Friday 13 November' } };

    const next = withGenerated(working, generated);

    expect(next.map((f) => f.content.blocks.script)).toEqual([...working.map((f) => f.content.blocks.script), 'Friday 13 November']);
  });

  it('with working fliers that have a theme, leaves their theme and stored styles untouched', () => {
    const working = [toThemed(kizombaPreset()[0], ThemeId.GoldenHour)];

    const next = withGenerated(working, kizombaPreset()[1]);

    expect(next[0]).toEqual(working[0]);
  });
});
