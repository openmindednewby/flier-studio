import { GenerateSource } from '../llm/GenerateSource';
import { FIXED_PROMPTS } from '../llm/fixedPrompts';
import { browserDeps, createGenerator } from '../llm/generate';
import { measurePrompts } from '../llm/measure';

/** Browser-only AC-07 run: opens with ?measure=llm and prints the valid count of the 20 fixed prompts as JSON. */
export async function runModelMeasure(out: HTMLElement): Promise<void> {
  const generator = createGenerator(browserDeps());
  const result = await measurePrompts(FIXED_PROMPTS, async (p) => {
    const outcome = await generator.generate(p);
    return outcome.source === GenerateSource.Model ? outcome.doc : null;
  });
  out.textContent = JSON.stringify({ mode: 'model', at: new Date().toISOString(), ...result }, null, 2);
}
