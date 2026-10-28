import { DEFAULT_MOTION, FLIER_TOKENS } from '@dloizides/design-tokens';
import { describe, expect, it } from 'vitest';
import { brandCssVars } from './brandVars';

const block = (css: string, selector: string): string => css.split('\n').find((line) => line.startsWith(selector)) ?? '';

describe('brandCssVars', () => {
  it('with the flier preset, dark theme fills and rings with brandFill, not primary', () => {
    const fill = String(FLIER_TOKENS.dark.brandFill);
    const ring = String(FLIER_TOKENS.dark.focusRing);

    const dark = block(brandCssVars(), ':root[data-theme="dark"]');

    expect([dark.includes(`--brand-fill: ${fill}`), dark.includes(`--focus-ring: ${ring}`), dark.includes(FLIER_TOKENS.primary)]).toEqual([true, true, false]);
  });

  it('with the default motion table, light root carries fast, base and slow durations', () => {
    const { fast, base, slow } = DEFAULT_MOTION.durations;

    const light = block(brandCssVars(), ':root {');

    expect([`--motion-fast: ${String(fast)}ms`, `--motion-base: ${String(base)}ms`, `--motion-slow: ${String(slow)}ms`].every((v) => light.includes(v))).toBe(true);
  });

  it('with reduced motion, sets every duration to instant', () => {
    const still = `${String(DEFAULT_MOTION.durations.instant)}ms`;

    const reduced = block(brandCssVars(), '@media (prefers-reduced-motion');

    expect(reduced.match(/--motion-\w+: \d+ms/g)?.map((m) => m.split(': ')[1])).toEqual([still, still, still]);
  });
});

describe('brandCssVars mark ink', () => {
  it('with the dark theme, keeps the light root mark ink and halo', () => {
    const ink = `--mark-ink: ${FLIER_TOKENS.primary}`;
    const halo = `--mark-halo: ${FLIER_TOKENS.onBrand}`;

    const css = brandCssVars();

    expect([block(css, ':root {').includes(ink), block(css, ':root {').includes(halo), block(css, ':root[data-theme="dark"]').includes('--mark-')]).toEqual([true, true, false]);
  });
});
