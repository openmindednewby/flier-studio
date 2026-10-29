import type { GenerateOutcome } from './generate';
import type { GenerateSource } from './GenerateSource';
import type { MeasureResult } from './measure';

const REPLY_CAP = 300;

export interface PromptTrace {
  prompt: string;
  source: GenerateSource;
  errors: string[];
  reply?: string;
}

export interface MeasureReport extends MeasureResult {
  mode: 'model';
  at: string;
  webGpu: boolean;
  loadMs: number | null;
  prompts: PromptTrace[];
}

/** Why one prompt ended where it did: its source, errors and, for a fallback, the start of the raw reply. */
export function traceOf(prompt: string, outcome: GenerateOutcome): PromptTrace {
  const trace: PromptTrace = { prompt, source: outcome.source, errors: outcome.errors };
  if (outcome.reply !== undefined) trace.reply = outcome.reply.slice(0, REPLY_CAP);
  return trace;
}

/** The AC-07 measure output: the valid count unchanged, plus WebGPU, model load time and one trace per prompt. */
export function measureReport(result: MeasureResult, prompts: PromptTrace[], env: { at: string; webGpu: boolean; loadMs: number | null }): MeasureReport {
  return { mode: 'model', at: env.at, webGpu: env.webGpu, loadMs: env.loadMs, ...result, prompts };
}
