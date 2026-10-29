import { hasWebGpuAdapter } from '@dloizides/text-generation';
import { GenerateSource } from '../llm/GenerateSource';
import { FIXED_PROMPTS } from '../llm/fixedPrompts';
import { browserDeps, createGenerator } from '../llm/generate';
import { measurePrompts } from '../llm/measure';
import { measureReport, traceOf, type PromptTrace } from '../llm/measureReport';

/** Browser-only AC-07 run (?measure=llm): the valid count of the 20 fixed prompts and why each ended where it did. */
export async function runModelMeasure(out: HTMLElement): Promise<void> {
  const generator = createGenerator(browserDeps());
  const traces: PromptTrace[] = [];
  const result = await measurePrompts(FIXED_PROMPTS, async (p) => {
    const outcome = await generator.generate(p);
    traces.push(traceOf(p, outcome));
    return outcome.source === GenerateSource.Model ? outcome.doc : null;
  });
  const webGpu = await hasWebGpuAdapter(navigator as never);
  out.textContent = JSON.stringify(measureReport(result, traces, { at: new Date().toISOString(), webGpu, loadMs: generator.loadMs() }), null, 2);
}
