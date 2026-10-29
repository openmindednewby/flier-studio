import { describe, expect, it } from 'vitest';
import { FIXED_PROMPTS } from '../llm/fixedPrompts';
import type { AiSettings } from './aiSettings';
import { GRADED_KEY, gradeSettings } from './gradedKey';

const BASE = { format: 'phone', layout: 'phone-arch', palette: 'rose', fonts: 'classic', background: 'tint', pictureAnchor: 'center', pictureScale: '1', title: 'TANGO', subtitle: '', date: '', time: '' } as AiSettings;

describe('GRADED_KEY', () => {
  it('with the fixed prompts, grades the same 20 prompts in the same order', () => {
    const prompts = GRADED_KEY.map((row) => row.prompt);

    const same = prompts.join('|') === FIXED_PROMPTS.join('|');

    expect([prompts.length, same]).toEqual([20, true]);
  });
});

describe('gradeSettings', () => {
  it('with every keyed field accepted, is right with no misses', () => {
    const key = { format: ['phone'], layout: ['phone-arch', 'phone-clock-safe'], title: ['TANGO'] };

    const grade = gradeSettings(key, BASE);

    expect(grade).toEqual({ right: true, misses: [] });
  });

  it('with a layout outside the accepted list, misses layout', () => {
    const key = { layout: ['phone-clock-safe'] };

    const grade = gradeSettings(key, BASE);

    expect(grade).toEqual({ right: false, misses: ['layout'] });
  });

  it('with a date that differs only in case and outer spaces, is right', () => {
    const key = { date: ['Saturday 21 November'] };

    const grade = gradeSettings(key, { ...BASE, date: ' saturday 21 november ' });

    expect(grade.right).toBe(true);
  });
});
