import { hasWebGpuAdapter } from '@dloizides/text-generation';
import { GenerateSource } from '../llm/GenerateSource';
import { FIXED_PROMPTS } from '../llm/fixedPrompts';
import { browserDeps, createGenerator } from '../llm/generate';
import { measurePrompts } from '../llm/measure';
import { createMeasureProgress } from '../llm/measureProgress';
import { measureReport, traceOf, type PromptTrace } from '../llm/measureReport';

/** Browser-only AC-07 run (?measure=llm): live lines in `live`; in `out` the valid count of the 20 prompts and each trace. */
export async function runModelMeasure(out: HTMLElement, live: HTMLElement): Promise<void> {
  const progress = createMeasureProgress((text) => { live.textContent = text; });
  const generator = createGenerator(browserDeps((e) => progress.download(e)));
  const traces: PromptTrace[] = [];
  const result = await measurePrompts(FIXED_PROMPTS, async (p) => {
    const outcome = await generator.generate(p);
    traces.push(traceOf(p, outcome));
    return outcome.source === GenerateSource.Model ? outcome.doc : null;
  }, (k, ms) => progress.prompt(k, FIXED_PROMPTS.length, ms, traces[k - 1].source));
  const webGpu = await hasWebGpuAdapter();
  out.textContent = JSON.stringify(measureReport(result, traces, { at: new Date().toISOString(), webGpu, loadMs: generator.loadMs() }), null, 2);
}
