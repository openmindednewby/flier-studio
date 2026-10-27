import { validateFlierDoc } from '@dloizides/poster-render';

export interface MeasureResult {
  valid: number;
  total: number;
  invalid: { prompt: string; errors: string[] }[];
  msPerPrompt: number[];
}

/** Runs each prompt through a generator and counts schema-valid docs (AC-07 needs at least 18 of 20). */
export async function measurePrompts(prompts: readonly string[], gen: (p: string) => Promise<unknown>): Promise<MeasureResult> {
  const result: MeasureResult = { valid: 0, total: prompts.length, invalid: [], msPerPrompt: [] };
  for (const prompt of prompts) {
    const started = performance.now();
    const check = validateFlierDoc(await gen(prompt));
    result.msPerPrompt.push(Math.round(performance.now() - started));
    if (check.ok) result.valid++;
    else result.invalid.push({ prompt, errors: check.errors });
  }
  return result;
}
