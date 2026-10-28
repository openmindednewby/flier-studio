import type { FlierDoc } from '@dloizides/poster-render';
import { cloneFlier, toThemed, type ThemedFlier } from '../theme/flierTheme';

/** The working fliers plus a generated flier at the end; a generated flier never replaces the set. */
export function withGenerated(fliers: readonly ThemedFlier[], doc: FlierDoc): ThemedFlier[] {
  return [...fliers.map((f) => cloneFlier(f)), toThemed(doc)];
}
