import { FM } from './fm';

/** `n` with the singular or plural form under `key` (`key.one` / `key.other`). */
export function plural(key: string, n: number): string {
  return FM(`${key}.${n === 1 ? 'one' : 'other'}`, String(n));
}
