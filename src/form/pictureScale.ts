const PERCENT = 100;

/** The picture scale as the whole percent shown beside the slider. */
export function scalePercent(scale: number): string {
  return `${Math.round(scale * PERCENT)}%`;
}
