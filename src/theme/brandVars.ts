import { DEFAULT_MOTION, FLIER_TOKENS } from '@dloizides/design-tokens';

const ms = (value: number): string => `${String(value)}ms`;

function motionVars(fast: number, base: number, slow: number): string {
  const { easings } = DEFAULT_MOTION;
  return `--motion-fast: ${ms(fast)}; --motion-base: ${ms(base)}; --motion-slow: ${ms(slow)}; --ease-standard: ${easings.standard.css}; --ease-decelerate: ${easings.decelerate.css}; --ease-accelerate: ${easings.accelerate.css};`;
}

/** CSS custom properties for the brand fill, focus ring and motion table, light and dark. */
export function brandCssVars(): string {
  const { durations } = DEFAULT_MOTION;
  const { dark } = FLIER_TOKENS;
  const still = durations.instant;
  return [
    `:root { --brand-fill: ${FLIER_TOKENS.primary}; --on-brand-fill: ${FLIER_TOKENS.onBrand}; --focus-ring: ${FLIER_TOKENS.primary}; ${motionVars(durations.fast, durations.base, durations.slow)} }`,
    `:root[data-theme="dark"] { --brand-fill: ${dark.brandFill ?? FLIER_TOKENS.primary}; --on-brand-fill: ${dark.onBrandFill ?? FLIER_TOKENS.onBrand}; --focus-ring: ${dark.focusRing ?? FLIER_TOKENS.primary}; }`,
    `@media (prefers-reduced-motion: reduce) { :root { ${motionVars(still, still, still)} } }`,
  ].join('\n');
}
