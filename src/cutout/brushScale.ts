export const BRUSH_CSS = { min: 1, max: 64, start: 16 } as const;
export const MIN_BRUSH_PX = 4;
export const ZOOM = { min: 1, max: 4 } as const;

/** Brush radius in mask pixels for a radius in screen pixels, never below MIN_BRUSH_PX. */
export function brushRadiusPx(cssRadius: number, maskWidth: number, shownWidth: number): number {
  return Math.max(MIN_BRUSH_PX, (cssRadius * maskWidth) / Math.max(1, shownWidth));
}

/** Next zoom level one step in or out, kept between ZOOM.min and ZOOM.max. */
export function nextZoom(current: number, step: number): number {
  return Math.min(ZOOM.max, Math.max(ZOOM.min, current + step));
}
