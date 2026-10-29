const HALF = 2;

/** The median of a list of timings. */
export function p50(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / HALF);
  return sorted.length % HALF === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / HALF;
}
