export interface Labelled {
  readonly label: string;
  readonly vectors: readonly (readonly number[])[];
}

/** Cosine similarity of two equal-length vectors. */
export function cosine(a: readonly number[], b: readonly number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  a.forEach((x, i) => {
    dot += x * b[i];
    na += x * x;
    nb += b[i] * b[i];
  });
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

/** The label whose closest example beats the threshold by the most, or the fallback when none does. */
export function pickLabel(vec: readonly number[], labelled: readonly Labelled[], threshold: number, fallback: string): string {
  let best = fallback;
  let bestScore = threshold;
  for (const entry of labelled) {
    const score = Math.max(...entry.vectors.map((v) => cosine(vec, v)));
    if (score > bestScore) {
      best = entry.label;
      bestScore = score;
    }
  }
  return best;
}
