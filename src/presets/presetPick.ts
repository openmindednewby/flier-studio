import { PresetChoice } from './PresetChoice';

/** True when fliers are on screen, so the preset must ask before it changes them. */
export function asksFirst(count: number): boolean {
  return count > 0;
}

/** True when the choice swaps out existing fliers, which must be saved as a draft first. */
export function savesDraftFirst(choice: PresetChoice, count: number): boolean {
  return choice === PresetChoice.Replace && count > 0;
}

/** The fliers after the choice: Add appends the preset, Replace swaps it in, Cancel keeps the current set. */
export function presetFliers<T>(current: readonly T[], preset: readonly T[], choice: PresetChoice): T[] {
  if (choice === PresetChoice.Add) return [...current, ...preset];
  if (choice === PresetChoice.Replace) return [...preset];
  return [...current];
}

/** Index of the flier to select after the choice: the first added flier for Add, else the first flier. */
export function firstShown(choice: PresetChoice, countBefore: number): number {
  return choice === PresetChoice.Add ? countBefore : 0;
}

/** The status message key for a choice, or null when nothing changed. */
export function presetStatusKey(choice: PresetChoice, countBefore: number): string | null {
  if (choice === PresetChoice.Cancel) return null;
  if (choice === PresetChoice.Add) return 'config.presetAdded';
  return countBefore > 0 ? 'config.presetReplaced' : 'config.presetLoaded';
}
